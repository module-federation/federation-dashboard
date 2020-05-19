import Header from "./Header";
import Footer from "./Footer";
import React from "react";
import sendMessage from "utils/analytics";

const App = () => {
  sendMessage("loaded");
  return (
    <div>
      <Header />
      <Footer />
    </div>
  );
};

export default App;
