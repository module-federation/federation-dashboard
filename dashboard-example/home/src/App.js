import React from "react";

import HeroImage from "./HeroImage";
import SubPage from "./SubPage";
import Page2 from "./Page2";
import Page3 from "./Page3";
import Page4 from "./Page4";

import { sendMessage } from "./analytics";

const Header = React.lazy(() => import("nav/Header"));
const Footer = React.lazy(() => import("nav/Footer"));

const SearchList = React.lazy(() => import("search/SearchList"));

const App = () => {
  sendMessage("Application loaded");
  return (
    <div>
      <React.Suspense fallback="Loading SearchList">
        <Header />
      </React.Suspense>
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
      <React.Suspense fallback="Loading SearchList">
        <Footer />
      </React.Suspense>
    </div>
  );
};

export default App;
