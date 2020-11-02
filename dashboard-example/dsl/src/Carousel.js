import React from "react";
import { Carousel } from "antd";
alert('this is another version');
const MyCarousel = ({ children, ...props }) => {
  return <Carousel {...props}>{children}</Carousel>;
};

export default MyCarousel;
