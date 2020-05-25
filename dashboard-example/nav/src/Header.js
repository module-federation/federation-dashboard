/** @jsx jsx */
import { jsx, css } from "@emotion/core";
import React from "react";

const Button = React.lazy(() => import("dsl/Button"));

const MiniSearch = React.lazy(() => import("search/MiniSearch"));

const style = css({
  background: "#800",
  color: "#fff",
  padding: 12,
});

const Header = () => (
  <header css={style}>
    App 1 <React.Suspense fallback={<div />}></React.Suspense><Button>Foo</Button></React.Suspense>
    <React.Suspense fallback={<div />}>
      <MiniSearch />
    </React.Suspense>
  </header>
);

export default Header;
