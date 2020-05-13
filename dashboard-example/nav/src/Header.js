import React from "react";
import css from "@emotion/core";

import Button from "dsl/Button";
import MiniSearch from "search/MiniSearch";

const style = css({
  background: "#800",
  color: "#fff",
  padding: 12,
});

const Header = () => (
  <Header style={style}>
    App 1 <Button />
    <MiniSearch />
  </Header>
);

export default Header;
