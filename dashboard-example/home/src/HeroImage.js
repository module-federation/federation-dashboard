import React from "react";
import sendMessage from "utils/analytics";

const style = {
  background: "#800",
  color: "#fff",
  padding: 12,
};

const HeroImage = () => {
  sendMessage("loaded");
  return <img style={style}>App 1 img</img>;
};

export default HeroImage;
