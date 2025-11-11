import styled from 'styled-components';

const StyledButton = styled.button`
  padding: 10px 32px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  background: #4a4a4a;
  border: 1px solid #666666;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: #5a5a5a;
    border-color: #777777;
  }

  &:active {
    background: #3a3a3a;
  }

  &:disabled {
    background: #cccccc;
    border-color: #cccccc;
    color: #888888;
    cursor: not-allowed;
  }
`;

interface AssembleButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export const AssembleButton: React.FC<AssembleButtonProps> = ({
  onClick,
  disabled = false,
  children
}) => {
  return (
    <StyledButton onClick={onClick} disabled={disabled}>
      {children}
    </StyledButton>
  );
};

