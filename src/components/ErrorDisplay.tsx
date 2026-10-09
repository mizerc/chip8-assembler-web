import styled from 'styled-components';

const ErrorContainer = styled.div`
  margin-top: 12px;
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.colors.error.background};
  border: 1px solid ${({ theme }) => theme.colors.error.border};
  color: ${({ theme }) => theme.colors.error.text};
  max-height: 150px;
  overflow-y: auto;
`;

const ErrorTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
`;

const ErrorList = styled.ul`
  margin: 0;
  padding-left: 20px;
  list-style-type: disc;
`;

const ErrorItem = styled.li`
  margin: 4px 0;
  font-family: 'Courier New', monospace;
  font-size: 14px;
`;

interface ErrorDisplayProps {
  errors: string[];
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <ErrorContainer>
      <ErrorTitle>Assembly Errors:</ErrorTitle>
      <ErrorList>
        {errors.map((error, index) => (
          <ErrorItem key={index}>{error}</ErrorItem>
        ))}
      </ErrorList>
    </ErrorContainer>
  );
};
