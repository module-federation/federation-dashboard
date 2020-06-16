import React from "react";
import { Carousel } from "antd";

const MyCarousel = ({ children, ...props }) => {
  return <div>  <h1>Using DSL Version 0.2.0</h1>  <Carousel {...props}>{children}</Carousel></div>;
};

export default MyCarousel;
