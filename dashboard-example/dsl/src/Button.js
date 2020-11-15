import React from "react";
import { Button } from "antd";
alert("using remote version: " + require("../package.json").version);
const MyButton = ({ children }) => <Button primary>{children}</Button>;

export default MyButton;
