import styled from 'styled-components';

const StyledButton = styled.button`
  padding: 10px 32px;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.surface};
  background: ${({ theme }) => theme.colors.button.background};
  border: 1px solid ${({ theme }) => theme.colors.button.border};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${({ theme }) => theme.colors.button.hoverBackground};
    border-color: ${({ theme }) => theme.colors.button.hoverBorder};
  }

  &:active {
    background: ${({ theme }) => theme.colors.button.activeBackground};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.button.disabledBackground};
    border-color: ${({ theme }) => theme.colors.button.disabledBackground};
    color: ${({ theme }) => theme.colors.button.disabledText};
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
