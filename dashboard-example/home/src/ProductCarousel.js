import React from "react";

import { sendMessage } from "./analytics";

const Button = React.lazy(() => import("dsl/Button"));
const Carousel = React.lazy(() => import("dsl/Carousel"));

const style = {
  background: "#800",
  color: "#fff",
  padding: 12,
};

const ProductCarousel = () => {
  sendMessage("ProductCarousel loaded");
  return (
    <React.Suspense fallback={<div />}>
      <Carousel style={style}>
        <React.Suspense fallback={<div />}>
          <Button />
        </React.Suspense>
        App 1 ProductCarousel
      </Carousel>
    </React.Suspense>
  );
};

export default ProductCarousel;
