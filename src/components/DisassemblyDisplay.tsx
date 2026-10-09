import { useRef, useEffect, useState } from "react";
import styled from "styled-components";

const DisplayContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  border: 1px solid ${({ theme }) => theme.colors.editor.border};
  overflow: hidden;
  font-family: "Courier New", monospace;
  font-size: 14px;
  background-color: ${({ theme }) => theme.colors.editor.background};
`;

const LineNumbers = styled.div`
  padding: 12px 8px;
  background-color: ${({ theme }) => theme.colors.editor.lineNumberBackground};
  color: ${({ theme }) => theme.colors.editor.lineNumberText};
  text-align: right;
  user-select: none;
  min-width: 50px;
  line-height: 1.5;
  overflow: hidden;
  border-right: 1px solid ${({ theme }) => theme.colors.editor.divider};
`;

const ContentWrapper = styled.div`
  flex: 1;
  position: relative;
  overflow: auto;
`;

const ContentDiv = styled.div`
  width: 100%;
  height: 100%;
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.editor.background};
  color: ${({ theme }) => theme.colors.editor.text};
  font-family: "Courier New", monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre;
  overflow-wrap: normal;
  overflow-x: auto;

  &::selection {
    background-color: ${({ theme }) => theme.colors.editor.selection};
  }
`;

const PlaceholderText = styled.div`
  color: ${({ theme }) => theme.colors.editor.placeholder};
  font-style: italic;
`;

export interface DisassemblyLine {
  lineNumber: number;
  instruction: string;
  hexBytes: string;
  address: number;
}

interface DisassemblyDisplayProps {
  disassembly: DisassemblyLine[] | null;
}

export const DisassemblyDisplay: React.FC<DisassemblyDisplayProps> = ({
  disassembly,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(1);

  // Format disassembly output
  const formatDisassembly = (lines: DisassemblyLine[]): string => {
    if (lines.length === 0) {
      return "";
    }

    return lines
      .map((line) => {
        const addrHex = line.address
          .toString(16)
          .toUpperCase()
          .padStart(4, "0");
        const instruction = line.instruction.padEnd(25);
        return `${addrHex}:  ${line.hexBytes.padEnd(5)}  ${instruction}`;
      })
      .join("\n");
  };

  const content =
    disassembly && disassembly.length > 0 ? formatDisassembly(disassembly) : "";

  // Update line count when content changes
  useEffect(() => {
    if (content) {
      const lines = content.split("\n").length;
      setLineCount(lines);
    } else {
      setLineCount(1);
    }
  }, [content]);

  // Sync scroll between content and line numbers
  const handleScroll = () => {
    if (contentRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = contentRef.current.scrollTop;
    }
  };

  // Generate line numbers
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <DisplayContainer>
      <LineNumbers ref={lineNumbersRef}>
        {lineNumbers.map((num) => (
          <div key={num}>{num}</div>
        ))}
      </LineNumbers>
      <ContentWrapper>
        <ContentDiv ref={contentRef} onScroll={handleScroll}>
          {content || (
            <PlaceholderText>Disassembly will appear here...</PlaceholderText>
          )}
        </ContentDiv>
      </ContentWrapper>
    </DisplayContainer>
  );
};
