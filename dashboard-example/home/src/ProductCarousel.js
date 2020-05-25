import React from "react";
import lodash from "lodash";

// import sendMessage from "utils/analytics";

const Button = React.lazy(() => import("dsl/Button"));
const Carousel = React.lazy(() => import("dsl/Carousel"));

const style = lodash.objectify([
  ["background", "#800"],
  ["color", "#fff"],
  ["padding", 12],
]);

const ProductCarousel = () => {
  // sendMessage("ProductCarousel loaded");
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
