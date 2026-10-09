import { useEffect, useState } from "react";
import styled from "styled-components";
import { CodeEditor } from "./components/CodeEditor";
import { MemoryDisplay } from "./components/MemoryDisplay";
import { DisassemblyDisplay } from "./components/DisassemblyDisplay";
import type { DisassemblyLine } from "./components/DisassemblyDisplay";
import { AssembleButton } from "./components/AssembleButton";
import { Chip8Assembler } from "./assembler/Chip8Assembler";

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.appBackground};
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  gap: 16px;
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 24px;
  font-weight: 700;
`;

const Subtitle = styled.p`
  margin: 4px 0 0 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  overflow: hidden;
`;

const EditorsContainer = styled.div`
  flex: 1;
  display: flex;
  gap: 16px;
  min-height: 0;
`;

const EditorWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
`;

const RightPanelWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  min-width: 0;
`;

const DisplayPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const CopyButton = styled.button`
  padding: 10px 32px;
  color: ${({ theme }) => theme.colors.surface};
  background: ${({ theme }) => theme.colors.button.background};
  border: 1px solid ${({ theme }) => theme.colors.button.border};
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.button.hoverBackground};
    border-color: ${({ theme }) => theme.colors.button.hoverBorder};
  }

  &:active:not(:disabled) {
    background: ${({ theme }) => theme.colors.button.activeBackground};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.button.disabledBackground};
    border-color: ${({ theme }) => theme.colors.button.disabledBackground};
    color: ${({ theme }) => theme.colors.button.disabledText};
    cursor: not-allowed;
  }
`;

function App() {
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [assembledRom, setAssembledRom] = useState<Uint8Array | null>(null);
  const [disassembly, setDisassembly] = useState<DisassemblyLine[] | null>(
    null,
  );
  const assembler = new Chip8Assembler();

  // Load initial assembler code from resources/test.asm at initialization
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}resources/test.asm`)
      .then((response) => response.text())
      .then((text) => setCode(text))
      .catch((error) => console.error("Failed to load initial code:", error));
  }, []);

  const handleOnAssemblePress = () => {
    setErrors([]);
    setAssembledRom(null);
    setDisassembly(null);

    const result = assembler.assemble(code);
    if (!result.success) {
      setErrors(result.errors || ["Unknown error occurred"]);
      return;
    }
    if (!result.rom) {
      setErrors(["Failed to generate ROM"]);
      return;
    }
    setAssembledRom(result.rom);
    setDisassembly(result.disassembly || null);
  };

  const handleOnDownloadRomPress = () => {
    if (!assembledRom) return;
    const blob = new Blob([assembledRom as BlobPart], {
      type: "application/octet-stream",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "chip8-program-rom.ch8";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOnCopyRomPress = async () => {
    if (!assembledRom) return;

    if (!navigator.clipboard?.writeText) {
      console.error("This browser does not support copying ROM data.");
      return;
    }

    try {
      const hexBytes = Array.from(assembledRom, (byte) =>
        byte.toString(16).toUpperCase().padStart(2, "0"),
      ).join(" ");
      await navigator.clipboard.writeText(hexBytes);
    } catch (error) {
      console.error("Failed to copy ROM data:", error);
    }
  };

  return (
    <AppContainer>
      <TopBar>
        <TitleSection>
          <Title>CHIP-8 Assembler</Title>
          <Subtitle>
            Write your CHIP-8 assembly code and assemble it into a ROM file
            using the two-pass assembler.
          </Subtitle>
        </TitleSection>
        <ButtonGroup>
          <AssembleButton
            onClick={handleOnAssemblePress}
            disabled={!code.trim()}
          >
            Assemble
          </AssembleButton>
          <AssembleButton
            onClick={handleOnDownloadRomPress}
            disabled={!assembledRom}
          >
            Download ROM
          </AssembleButton>
          <CopyButton
            onClick={handleOnCopyRomPress}
            disabled={!assembledRom}
            title="Copy ROM bytes as space-separated hexadecimal text"
          >
            Copy ROM
          </CopyButton>
        </ButtonGroup>
      </TopBar>

      <ContentWrapper>
        <EditorsContainer>
          <EditorWrapper>
            <CodeEditor
              value={code}
              onChange={setCode}
              placeholder="Enter CHIP-8 assembly code here..."
            />
          </EditorWrapper>

          <RightPanelWrapper>
            <DisplayPanel>
              <MemoryDisplay memory={assembledRom} errors={errors} />
            </DisplayPanel>
            <DisplayPanel>
              <DisassemblyDisplay disassembly={disassembly} />
            </DisplayPanel>
          </RightPanelWrapper>
        </EditorsContainer>
      </ContentWrapper>
    </AppContainer>
  );
}

export default App;
