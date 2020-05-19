import HeroImage from "./HeroImage";
import React from "react";

import sendMessage from "utils/analytics";

const SearchList = React.lazy(() => import("search/SearchList"));
const Button = React.lazy(() => import("dsl/Button"));

const Page2 = () => {
  sendMessage("Page2 Loaded");
  return (
    <div>
      <h1>Bi-Directional</h1>
      <h2>Page2 1</h2>
      <HeroImage />
      <Button />
      <React.Suspense fallback="Loading SearchList">
        <SearchList />
      </React.Suspense>
    </div>
  );
};

export default Page2;
