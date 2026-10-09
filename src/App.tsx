import { useEffect, useState } from "react";
import styled from "styled-components";
import { CodeEditor } from "./components/CodeEditor";
import { MemoryDisplay } from "./components/MemoryDisplay";
import { DisassemblyDisplay } from "./components/DisassemblyDisplay";
import type { DisassemblyLine } from "./components/DisassemblyDisplay";
import { AssembleButton } from "./components/AssembleButton";
import { ErrorDisplay } from "./components/ErrorDisplay";
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

const MessageContainer = styled.div`
  margin-top: 12px;
`;

const SuccessMessage = styled.div`
  padding: 12px 16px;
  background-color: #e6f7e6;
  border: 1px solid #a3d9a5;
  color: #2d6e2d;
  font-weight: 600;
`;

function App() {
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
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
    setSuccess(false);
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
    setSuccess(true);
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
              <MemoryDisplay memory={assembledRom} />
            </DisplayPanel>
            <DisplayPanel>
              <DisassemblyDisplay disassembly={disassembly} />
            </DisplayPanel>
          </RightPanelWrapper>
        </EditorsContainer>

        <MessageContainer>
          {success && (
            <SuccessMessage>
              ✓ ROM assembled successfully! Click "Download ROM" to save the
              file.
            </SuccessMessage>
          )}

          <ErrorDisplay errors={errors} />
        </MessageContainer>
      </ContentWrapper>
    </AppContainer>
  );
}

export default App;
