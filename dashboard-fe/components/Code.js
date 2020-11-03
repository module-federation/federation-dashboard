import { withStyles } from "@material-ui/core";

export const CodeWrapper = withStyles({
  wrapper: {
    border: "1px solid #eee",
    padding: 10,
  },
})(({ classes, children }) => (
  <div className={classes.wrapper}>{children}</div>
));

export const Code = withStyles({
  code: {
    fontFamily: "Courier, monospace",
    whiteSpace: "pre",
    fontStyle: "italic",
    paddingTop: 10,
    paddingBottom: 10,
  },
})(({ classes, children }) => <div className={classes.code}>{children}</div>);

export const GeneratedCode = withStyles({
  generatedCode: {
    fontFamily: "Courier, monospace",
    whiteSpace: "pre",
    fontWeight: "bold",
  },
})(({ classes, children }) => (
  <div className={classes.generatedCode}>{children}</div>
));
