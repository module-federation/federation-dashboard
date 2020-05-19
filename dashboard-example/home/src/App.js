import HeroImage from "./HeroImage";
import React from "react";
import SubPage from "./SubPage";
import Page2 from "./Page2";
import Page3 from "./Page3";
import Page4 from "./Page4";

import Header from "nav/Header";
import Footer from "nav/Footer";
import sendMessage from "utils/analytics";

const SearchList = React.lazy(() => import("search/SearchList"));

const App = () => {
  sendMessage("Application loaded");
  return (
    <div>
      <Header />
      <h1>Bi-Directional</h1>
      <h2>App 1</h2>
      <HeroImage />
      <SubPage />
      <Page2 />
      <Page3 />
      <Page4 />
      <React.Suspense fallback="Loading SearchList">
        <SearchList />
      </React.Suspense>
      <Footer />
    </div>
  );
};

export default App;
