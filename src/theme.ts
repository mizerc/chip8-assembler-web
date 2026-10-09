export const theme = {
  colors: {
    appBackground: "#14161c",
    surface: "#1b1e26",
    textPrimary: "#d8dce6",
    textSecondary: "#8890a4",
    border: "#2c303c",
    button: {
      background: "#4f9cf9",
      hoverBackground: "#68aaff",
      activeBackground: "#3788e8",
      border: "#4f9cf9",
      hoverBorder: "#68aaff",
      disabledBackground: "#2c303c",
      disabledText: "#8890a4",
    },
    editor: {
      background: "#1b1e26",
      lineNumberBackground: "#14161c",
      lineNumberText: "#8890a4",
      text: "#d8dce6",
      border: "#2c303c",
      divider: "#2c303c",
      selection: "#2c4569",
      placeholder: "#8890a4",
      error: "#ff6b6b",
    },
    error: {
      background: "#2a1d24",
      border: "#5b303b",
      text: "#ff6b6b",
    },
  },
} as const;
