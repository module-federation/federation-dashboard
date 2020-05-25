import HeroImage from "./HeroImage";
import React from "react";

// import sendMessage from "utils/analytics";

const SearchList = React.lazy(() => import("search/SearchList"));

const SubPage = () => {
  // sendMessage("SubPage loaded");
  return (
    <div>
      <h1>Bi-Directional</h1>
      <h2>SubPage 1</h2>
      <HeroImage />
      <React.Suspense fallback="Loading SearchList">
        <SearchList />
      </React.Suspense>
    </div>
  );
};

export default SubPage;
