/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import React from "react";
import { Layout, Row, Col } from "antd";
console.log(import("search/MiniSearch"));
const MiniSearch = React.lazy(() => import("search/MiniSearch"));
const Button = React.lazy(() => import("dsl/Button"));

const Header = ({ children }) => (
  <Layout.Header>
    <Row>
      <Col span={16}>
        <h2
          css={css`
            color: white;
          `}
        >
          {children}
        </h2>
      </Col>
      <Col span={8} style={{ marginTop: 15 }}>
        <React.Suspense fallback={<span />}>
          <MiniSearch
            inputProps={{
              style: {
                width: 200,
              },
            }}
          />
        </React.Suspense>
        <React.Suspense fallback={<span />}>
          <Button>Search</Button>
        </React.Suspense>
      </Col>
    </Row>
  </Layout.Header>
);

export default Header;
