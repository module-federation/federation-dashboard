import React from "react";
import { sendMessage } from "./analytics";

const style = {
  background: "#800",
  color: "#fff",
  padding: 12,
};

const HeroImage = () => {
  sendMessage("loaded");
  return (
    <img
      style={style}
      href="https://bingvsdevportalprodgbl.blob.core.windows.net/demo-images/876bb7a8-e8dd-4e36-ab3a-f0b9aba942e5.jpg"
    />
  );
};

export default HeroImage;
