import { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';

const DisplayContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  border: 1px solid ${({ theme }) => theme.colors.editor.border};
  overflow: hidden;
  font-family: 'Courier New', monospace;
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

const ContentDiv = styled.div<{ $hasError: boolean }>`
  width: 100%;
  height: 100%;
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.editor.background};
  color: ${({ theme, $hasError }) =>
    $hasError ? theme.colors.editor.error : theme.colors.editor.text};
  font-family: 'Courier New', monospace;
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

interface MemoryDisplayProps {
  memory: Uint8Array | null;
  errors: string[];
}

export const MemoryDisplay: React.FC<MemoryDisplayProps> = ({
  memory,
  errors,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(1);

  // Format memory as hex dump
  const formatMemoryDump = (data: Uint8Array): string => {
    if (data.length === 0) {
      return '';
    }

    const lines: string[] = [];
    const bytesPerLine = 16;
    const startAddress = 0x200;

    for (let i = 0; i < data.length; i += bytesPerLine) {
      const address = startAddress + i;
      const addressHex = address.toString(16).toUpperCase().padStart(4, '0');
      
      // Get bytes for this line
      const lineBytes = data.slice(i, i + bytesPerLine);
      const hexBytes = Array.from(lineBytes)
        .map(byte => byte.toString(16).toUpperCase().padStart(2, '0'))
        .join(' ');
      
      // Pad if incomplete line
      const padding = ' '.repeat((bytesPerLine - lineBytes.length) * 3);
      
      // ASCII representation
      const ascii = Array.from(lineBytes)
        .map(byte => (byte >= 32 && byte <= 126) ? String.fromCharCode(byte) : '.')
        .join('');
      
      lines.push(`${addressHex}:  ${hexBytes}${padding}  |${ascii}|`);
    }

    return lines.join('\n');
  };

  const content = memory && memory.length > 0
    ? formatMemoryDump(memory)
    : '';
  const displayText = errors.length > 0 ? errors.join('\n') : content;

  // Update line count when content changes
  useEffect(() => {
    if (displayText) {
      const lines = displayText.split('\n').length;
      setLineCount(lines);
    } else {
      setLineCount(1);
    }
  }, [displayText]);

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
        {lineNumbers.map(num => (
          <div key={num}>{num}</div>
        ))}
      </LineNumbers>
      <ContentWrapper>
        <ContentDiv
          ref={contentRef}
          onScroll={handleScroll}
          $hasError={errors.length > 0}
          role={errors.length > 0 ? 'alert' : undefined}
        >
          {displayText || (
            <PlaceholderText>
              Assembled memory will appear here...
            </PlaceholderText>
          )}
        </ContentDiv>
      </ContentWrapper>
    </DisplayContainer>
  );
};
