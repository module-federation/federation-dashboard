import React from "react";

// import sendMessage from "utils/analytics";

const Header = React.lazy(() => import("nav/Header"));
const Footer = React.lazy(() => import("nav/Footer"));
// const ProductCarousel = React.lazy(() => import("home/ProductCarousel"));

import SearchList from "./SearchList";

const App = () => {
  // sendMessage("page loaded");
  return (
    <div>
      <React.Suspense fallback={<div />}>
        <Header />
      </React.Suspense>
      <h1>Bi-Directional</h1>
      <h2>App 2</h2>
      <SearchList />
      {/* <React.Suspense fallback="Loading ProductCarousel">
        <ProductCarousel />
      </React.Suspense> */}
      <React.Suspense fallback={<div />}>
        <Footer />
      </React.Suspense>
    </div>
  );
};

export default App;
