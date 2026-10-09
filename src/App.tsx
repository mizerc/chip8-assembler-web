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
  background: #f5f5f5;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  gap: 16px;
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  margin: 0;
  color: #333;
  font-size: 24px;
  font-weight: 700;
`;

const Subtitle = styled.p`
  margin: 4px 0 0 0;
  color: #666;
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
  color: white;
  background: #4a4a4a;
  border: 1px solid #666666;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: #5a5a5a;
    border-color: #777777;
  }

  &:active:not(:disabled) {
    background: #3a3a3a;
  }

  &:disabled {
    background: #cccccc;
    border-color: #cccccc;
    color: #888888;
    cursor: not-allowed;
  }
`;

function App() {
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [assembledRom, setAssembledRom] = useState<Uint8Array | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
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
    setCopyStatus("");
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
      setCopyStatus("This browser does not support copying ROM data.");
      return;
    }

    try {
      const hexBytes = Array.from(assembledRom, (byte) =>
        byte.toString(16).toUpperCase().padStart(2, "0"),
      ).join(" ");
      await navigator.clipboard.writeText(hexBytes);
      setCopyStatus("ROM bytes copied as hexadecimal text.");
    } catch (error) {
      console.error("Failed to copy ROM data:", error);
      setCopyStatus("Failed to copy ROM data. Check clipboard permissions.");
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
              {copyStatus && <div role="status">{copyStatus}</div>}
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
