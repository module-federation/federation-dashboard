import SearchList from "./SearchList";
import React from "react";

const ProductCarousel = React.lazy(() => import("home/ProductCarousel"));

const App = () => (
  <div>
    <h1>Bi-Directional</h1>
    <h2>App 2</h2>
    <SearchList />
    <React.Suspense fallback="Loading ProductCarousel">
      <ProductCarousel />
    </React.Suspense>
  </div>
);

export default App;
