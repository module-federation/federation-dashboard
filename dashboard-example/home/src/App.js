import HeroImage from "./HeroImage";
import React from "react";
import SubPage from "./SubPage";

const SearchList = React.lazy(() => import("search/SearchList"));

const App = () => (
  <div>
    <h1>Bi-Directional</h1>
    <h2>App 1</h2>
    <HeroImage />
    <SubPage />
    <React.Suspense fallback="Loading SearchList">
      <SearchList />
    </React.Suspense>
  </div>
);

export default App;
