import React from "react";
import { observer } from "mobx-react";
import {
  FormControl,
  InputLabel,
  Input,
  FormHelperText
} from "@material-ui/core";
import Layout from "../components/Layout";
import store from "../src/store";

function Profile() {
  return (
    <Layout>
      <h1>Profile</h1>
      {store.user && (
        <>
          <p>Profile:</p>
          <pre>{JSON.stringify(store.user, null, 2)}</pre>
        </>
      )}
    </Layout>
  );
}

export default observer(Profile);
