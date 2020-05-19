import SearchList from "./SearchList";
import React from "react";

import Header from "nav/Header";
import Footer from "nav/Footer";
import sendMessage from "utils/analytics";

const ProductCarousel = React.lazy(() => import("home/ProductCarousel"));

const App = () => {
  sendMessage("page loaded");
  return (
    <div>
      <Header />
      <h1>Bi-Directional</h1>
      <h2>App 2</h2>
      <SearchList />
      <React.Suspense fallback="Loading ProductCarousel">
        <ProductCarousel />
      </React.Suspense>
      <Footer />
    </div>
  );
};

export default App;
