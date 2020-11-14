import React from "react";
import { observer } from "mobx-react";

import Layout from "../components/Layout";
import withAuth from "../components/with-auth";
import store from "../src/store";

export function ProtectedPage() {
  return (
    <Layout>
      <h1>Protected Page</h1>
      {store.isAuthorized && <div>This page is authorized</div>}
    </Layout>
  );
}

export default observer(ProtectedPage);
