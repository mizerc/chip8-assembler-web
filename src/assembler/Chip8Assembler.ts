/**
 * CHIP-8 Assembler
 * Converts CHIP-8 assembly language to machine code
 */

export interface DisassemblyLine {
  lineNumber: number;
  instruction: string;
  hexBytes: string;
  address: number;
}

export interface AssemblerResult {
  success: boolean;
  rom?: Uint8Array;
  errors?: string[];
  disassembly?: DisassemblyLine[];
}

export class Chip8Assembler {
  private labels: Map<string, number>;

  constructor() {
    this.labels = new Map();
  }

  /**
   * Assemble the source code into ROM
   */
  public assemble(sourceCode: string): AssemblerResult {
    this.labels.clear();
    const errors: string[] = [];

    // Split into lines and filter out empty lines and comments
    const lines = this.preprocessCode(sourceCode);

    // First pass: collect labels and process directives
    let address = 0x200;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.endsWith(':')) {
        const label = line.slice(0, -1);
        this.labels.set(label, address);
      } else if (this.isDirective(line)) {
        // Handle directives that affect addresses
        const parts = line.split(/[\s,]+/).filter(p => p.length > 0);
        const directive = parts[0].toUpperCase();
        
        if (directive === '.ORG') {
          // Change the current address
          try {
            const newAddress = this.parseAddress(parts[1]);
            if (newAddress < 0x200) {
              throw new Error('.ORG address must be >= 0x200 (CHIP-8 ROM starts at 0x200)');
            }
            address = newAddress;
          } catch {
            // Error will be reported in second pass
          }
        } else if (directive === '.BYTE') {
          // Each byte takes 1 byte of space
          address += parts.length - 1;
        }
      } else {
        address += 2; // Each instruction is 2 bytes
      }
    }

    // Second pass: generate machine code
    const rom: number[] = [];
    const disassembly: DisassemblyLine[] = [];
    let lineNumber = 0;
    let currentAddress = 0x200;

    for (const line of lines) {
      lineNumber++;
      const trimmed = line.trim();
      
      if (!trimmed || trimmed.endsWith(':')) {
        continue; // Skip empty lines and labels
      }

      try {
        if (this.isDirective(trimmed)) {
          const bytes = this.assembleDirective(trimmed, currentAddress);
          
          // Add disassembly entry for directives
          if (bytes.length > 0) {
            const hexBytes = bytes.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
            disassembly.push({
              lineNumber,
              instruction: trimmed,
              hexBytes,
              address: currentAddress
            });
          }
          
          rom.push(...bytes);
          currentAddress += bytes.length;
        } else {
          const opcode = this.assembleLine(trimmed);
          const highByte = (opcode >> 8) & 0xFF;
          const lowByte = opcode & 0xFF;
          
          // Add disassembly entry for instructions
          const hexBytes = `${highByte.toString(16).toUpperCase().padStart(2, '0')} ${lowByte.toString(16).toUpperCase().padStart(2, '0')}`;
          disassembly.push({
            lineNumber,
            instruction: trimmed,
            hexBytes,
            address: currentAddress
          });
          
          rom.push(highByte); // High byte
          rom.push(lowByte);  // Low byte
          currentAddress += 2;
        }
      } catch (error) {
        errors.push(`Line ${lineNumber}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return {
      success: true,
      rom: new Uint8Array(rom),
      disassembly
    };
  }

  /**
   * Preprocess code: remove comments and clean up lines
   */
  private preprocessCode(code: string): string[] {
    return code
      .split('\n')
      .map(line => {
        // Remove comments (starting with ;)
        const commentIndex = line.indexOf(';');
        if (commentIndex !== -1) {
          line = line.substring(0, commentIndex);
        }
        return line.trim();
      })
      .filter(line => line.length > 0);
  }

  /**
   * Check if a line is a directive
   */
  private isDirective(line: string): boolean {
    const trimmed = line.trim().toUpperCase();
    return trimmed.startsWith('.ORG') || trimmed.startsWith('.BYTE');
  }

  /**
   * Assemble a directive into bytes
   */
  private assembleDirective(line: string, currentAddress: number): number[] {
    const parts = line.split(/[\s,]+/).filter(p => p.length > 0);
    const directive = parts[0].toUpperCase();
    const args = parts.slice(1);

    switch (directive) {
      case '.ORG': {
        // .ORG changes the assembly address but doesn't generate bytes
        // We need to pad with zeros if the new address is higher than current
        if (args.length !== 1) {
          throw new Error('.ORG requires exactly one argument');
        }
        const newAddress = this.parseAddress(args[0]);
        if (newAddress < 0x200) {
          throw new Error('.ORG address must be >= 0x200 (CHIP-8 ROM starts at 0x200)');
        }
        const padding = newAddress - currentAddress;
        if (padding < 0) {
          throw new Error('.ORG address cannot be before current address');
        }
        return new Array(padding).fill(0);
      }

      case '.BYTE': {
        // .BYTE inserts raw bytes into the ROM
        if (args.length === 0) {
          throw new Error('.BYTE requires at least one argument');
        }
        return args.map(arg => this.parseByte(arg));
      }

      default:
        throw new Error(`Unknown directive: ${directive}`);
    }
  }

  /**
   * Assemble a single line of code into an opcode
   */
  private assembleLine(line: string): number {
    // Parse instruction and operands
    const parts = line.split(/[\s,]+/).filter(p => p.length > 0);
    const instruction = parts[0].toUpperCase();
    const args = parts.slice(1);

    switch (instruction) {
      case 'CLS':
        return 0x00E0;

      case 'RET':
        return 0x00EE;

      case 'JP': {
        if (args.length === 1) {
          // JP addr
          const addr = this.parseAddress(args[0]);
          return 0x1000 | addr;
        } else if (args.length === 2 && args[0].toUpperCase() === 'V0') {
          // JP V0, addr
          const addr = this.parseAddress(args[1]);
          return 0xB000 | addr;
        }
        throw new Error(`Invalid JP instruction: ${line}`);
      }

      case 'CALL': {
        const callAddr = this.parseAddress(args[0]);
        return 0x2000 | callAddr;
      }

      case 'SE':
        return this.assembleSE(args, line);

      case 'SNE':
        return this.assembleSNE(args, line);

      case 'LD':
        return this.assembleLD(args, line);

      case 'ADD':
        return this.assembleADD(args, line);

      case 'OR':
        return this.assembleLogic(0x8001, args, line);

      case 'AND':
        return this.assembleLogic(0x8002, args, line);

      case 'XOR':
        return this.assembleLogic(0x8003, args, line);

      case 'SUB':
        return this.assembleLogic(0x8005, args, line);

      case 'SHR': {
        const xShr = this.parseRegister(args[0]);
        return 0x8006 | (xShr << 8);
      }

      case 'SUBN':
        return this.assembleLogic(0x8007, args, line);

      case 'SHL': {
        const xShl = this.parseRegister(args[0]);
        return 0x800E | (xShl << 8);
      }

      case 'RND': {
        const xRnd = this.parseRegister(args[0]);
        const kk = this.parseByte(args[1]);
        return 0xC000 | (xRnd << 8) | kk;
      }

      case 'DRW': {
        const xDrw = this.parseRegister(args[0]);
        const yDrw = this.parseRegister(args[1]);
        const n = this.parseNibble(args[2]);
        return 0xD000 | (xDrw << 8) | (yDrw << 4) | n;
      }

      case 'SKP': {
        const xSkp = this.parseRegister(args[0]);
        return 0xE09E | (xSkp << 8);
      }

      case 'SKNP': {
        const xSknp = this.parseRegister(args[0]);
        return 0xE0A1 | (xSknp << 8);
      }

      default:
        throw new Error(`Unknown instruction: ${instruction}`);
    }
  }

  /**
   * Assemble SE (Skip if Equal) instruction
   */
  private assembleSE(args: string[], line: string): number {
    if (args.length !== 2) {
      throw new Error(`SE requires 2 arguments: ${line}`);
    }

    const x = this.parseRegister(args[0]);
    
    if (args[1].toUpperCase().startsWith('V')) {
      // SE Vx, Vy
      const y = this.parseRegister(args[1]);
      return 0x5000 | (x << 8) | (y << 4);
    } else {
      // SE Vx, byte
      const byte = this.parseByte(args[1]);
      return 0x3000 | (x << 8) | byte;
    }
  }

  /**
   * Assemble SNE (Skip if Not Equal) instruction
   */
  private assembleSNE(args: string[], line: string): number {
    if (args.length !== 2) {
      throw new Error(`SNE requires 2 arguments: ${line}`);
    }

    const x = this.parseRegister(args[0]);
    
    if (args[1].toUpperCase().startsWith('V')) {
      // SNE Vx, Vy
      const y = this.parseRegister(args[1]);
      return 0x9000 | (x << 8) | (y << 4);
    } else {
      // SNE Vx, byte
      const byte = this.parseByte(args[1]);
      return 0x4000 | (x << 8) | byte;
    }
  }

  /**
   * Assemble LD (Load) instruction
   */
  private assembleLD(args: string[], line: string): number {
    if (args.length !== 2) {
      throw new Error(`LD requires 2 arguments: ${line}`);
    }

    const dest = args[0].toUpperCase();
    const src = args[1].toUpperCase();

    if (dest.startsWith('V')) {
      const x = this.parseRegister(args[0]);
      
      if (src.startsWith('V')) {
        // LD Vx, Vy
        const y = this.parseRegister(args[1]);
        return 0x8000 | (x << 8) | (y << 4);
      } else if (src === 'DT') {
        // LD Vx, DT
        return 0xF007 | (x << 8);
      } else if (src === 'K') {
        // LD Vx, K
        return 0xF00A | (x << 8);
      } else if (src === '[I]') {
        // LD Vx, [I]
        return 0xF065 | (x << 8);
      } else {
        // LD Vx, byte
        const byte = this.parseByte(args[1]);
        return 0x6000 | (x << 8) | byte;
      }
    } else if (dest === 'I') {
      // LD I, addr
      const addr = this.parseAddress(args[1]);
      return 0xA000 | addr;
    } else if (dest === 'DT') {
      // LD DT, Vx
      const x = this.parseRegister(args[1]);
      return 0xF015 | (x << 8);
    } else if (dest === 'ST') {
      // LD ST, Vx
      const x = this.parseRegister(args[1]);
      return 0xF018 | (x << 8);
    } else if (dest === 'F') {
      // LD F, Vx
      const x = this.parseRegister(args[1]);
      return 0xF029 | (x << 8);
    } else if (dest === 'B') {
      // LD B, Vx
      const x = this.parseRegister(args[1]);
      return 0xF033 | (x << 8);
    } else if (dest === '[I]') {
      // LD [I], Vx
      const x = this.parseRegister(args[1]);
      return 0xF055 | (x << 8);
    }

    throw new Error(`Invalid LD instruction: ${line}`);
  }

  /**
   * Assemble ADD instruction
   */
  private assembleADD(args: string[], line: string): number {
    if (args.length !== 2) {
      throw new Error(`ADD requires 2 arguments: ${line}`);
    }

    const dest = args[0].toUpperCase();
    const src = args[1].toUpperCase();

    if (dest.startsWith('V')) {
      const x = this.parseRegister(args[0]);
      
      if (src.startsWith('V')) {
        // ADD Vx, Vy
        const y = this.parseRegister(args[1]);
        return 0x8004 | (x << 8) | (y << 4);
      } else {
        // ADD Vx, byte
        const byte = this.parseByte(args[1]);
        return 0x7000 | (x << 8) | byte;
      }
    } else if (dest === 'I') {
      // ADD I, Vx
      const x = this.parseRegister(args[1]);
      return 0xF01E | (x << 8);
    }

    throw new Error(`Invalid ADD instruction: ${line}`);
  }

  /**
   * Assemble logical operations (OR, AND, XOR, SUB, SUBN)
   */
  private assembleLogic(baseOpcode: number, args: string[], line: string): number {
    if (args.length !== 2) {
      throw new Error(`Logical operation requires 2 arguments: ${line}`);
    }

    const x = this.parseRegister(args[0]);
    const y = this.parseRegister(args[1]);
    return baseOpcode | (x << 8) | (y << 4);
  }

  /**
   * Parse a register name (V0-VF) to its number
   */
  private parseRegister(reg: string): number {
    const upper = reg.toUpperCase();
    if (!upper.startsWith('V') || upper.length < 2) {
      throw new Error(`Invalid register: ${reg}`);
    }

    const regNum = parseInt(upper.substring(1), 16);
    if (isNaN(regNum) || regNum < 0 || regNum > 15) {
      throw new Error(`Invalid register: ${reg}`);
    }

    return regNum;
  }

  /**
   * Parse a byte value (0-255)
   */
  private parseByte(value: string): number {
    const num = this.parseNumber(value);
    if (num < 0 || num > 255) {
      throw new Error(`Byte value out of range: ${value}`);
    }
    return num;
  }

  /**
   * Parse a nibble value (0-15)
   */
  private parseNibble(value: string): number {
    const num = this.parseNumber(value);
    if (num < 0 || num > 15) {
      throw new Error(`Nibble value out of range: ${value}`);
    }
    return num;
  }

  /**
   * Parse an address (0-4095)
   */
  private parseAddress(value: string): number {
    // Check if it's a label
    if (this.labels.has(value)) {
      return this.labels.get(value)!;
    }

    const num = this.parseNumber(value);
    if (num < 0 || num > 0xFFF) {
      throw new Error(`Address out of range: ${value}`);
    }
    return num;
  }

  /**
   * Parse a number (supports decimal, hex with 0x prefix, and binary with 0b prefix)
   */
  private parseNumber(value: string): number {
    if (value.startsWith('0x') || value.startsWith('0X')) {
      return parseInt(value.substring(2), 16);
    } else if (value.startsWith('0b') || value.startsWith('0B')) {
      return parseInt(value.substring(2), 2);
    } else {
      return parseInt(value, 10);
    }
  }
}

