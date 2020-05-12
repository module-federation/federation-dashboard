import HeroImage from "./HeroImage";
import React from "react";
import SubPage from "./SubPage";

import Header from "nav/Header";
import Footer from "nav/Footer";

const SearchList = React.lazy(() => import("search/SearchList"));

const App = () => (
  <div>
    <Header />
    <h1>Bi-Directional</h1>
    <h2>App 1</h2>
    <HeroImage />
    <SubPage />
    <React.Suspense fallback="Loading SearchList">
      <SearchList />
    </React.Suspense>
    <Footer />
  </div>
);

export default App;
