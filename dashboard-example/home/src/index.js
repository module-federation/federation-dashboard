import App from "./App";
import React from "react";
import ReactDOM from "react-dom";

Promise.all([import("utils/analytics")]).then(() => {
  ReactDOM.render(<App />, document.getElementById("root"));
});
