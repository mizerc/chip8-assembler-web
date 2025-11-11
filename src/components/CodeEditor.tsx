import { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';

const EditorContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  border: 1px solid #d0d0d0;
  overflow: hidden;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  background-color: #2b2b2b;
`;

const LineNumbers = styled.div`
  padding: 12px 8px;
  background-color: #3a3a3a;
  color: #888888;
  text-align: right;
  user-select: none;
  min-width: 50px;
  line-height: 1.5;
  overflow: hidden;
  border-right: 1px solid #4a4a4a;
`;

const TextAreaWrapper = styled.div`
  flex: 1;
  position: relative;
  overflow: auto;
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  height: 100%;
  padding: 12px;
  background-color: #2b2b2b;
  color: #e0e0e0;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre;
  overflow-wrap: normal;
  overflow-x: auto;

  &::selection {
    background-color: #555555;
  }
`;

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter CHIP-8 assembly code here...'
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(1);

  // Update line count when value changes
  useEffect(() => {
    const lines = value.split('\n').length;
    setLineCount(lines);
  }, [value]);

  // Sync scroll between textarea and line numbers
  const handleScroll = () => {
    if (textAreaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textAreaRef.current.scrollTop;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // Generate line numbers
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <EditorContainer>
      <LineNumbers ref={lineNumbersRef}>
        {lineNumbers.map(num => (
          <div key={num}>{num}</div>
        ))}
      </LineNumbers>
      <TextAreaWrapper>
        <StyledTextArea
          ref={textAreaRef}
          value={value}
          onChange={handleChange}
          onScroll={handleScroll}
          placeholder={placeholder}
          spellCheck={false}
        />
      </TextAreaWrapper>
    </EditorContainer>
  );
};

