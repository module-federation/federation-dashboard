import React from "react";
import { Button } from "antd";
import { button } from "./button.css";
console.log(
  "REMOTE FEDERATION MANAGEMENT: using remote version: " +
    require("../package.json").version
);
const MyButton = ({ children }) => (
  <Button primary className={button}>
    {children}
  </Button>
);

export default MyButton;
