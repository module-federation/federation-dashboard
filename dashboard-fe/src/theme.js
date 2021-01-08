import { createMuiTheme } from "@material-ui/core/styles";

const palette = {};
if (
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
) {
  palette.type = "dark";
}

const theme = createMuiTheme({
  palette
});

export default theme;
