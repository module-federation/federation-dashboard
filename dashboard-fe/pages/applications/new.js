import Head from "next/head";
import {
  makeStyles,
  TextField,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Typography,
  Grid,
  Paper,
} from "@material-ui/core";
import { useForm, Controller } from "react-hook-form";
import Layout from "../../components/Layout";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { Code, CodeWrapper, GeneratedCode } from "../../components/Code";
import React from 'react';
import { useFetchUser } from '../../lib/user';

const GET_APPS = gql`
  {
    applications {
      id
      name
      remote
    }
  }
`;

const useStyles = makeStyles({
  container: {},
  configSection: {
    padding: 10,
    marginTop: 20,
  },
  title: {
    marginBottom: 10,
  },
  explanation: {
    marginBottom: 10,
  },
  textField: {
    marginTop: 20,
  },
});

export default () => {
  const { register, watch, control } = useForm({
    defaultValues: {
      name: "test-app",
      files: "./src/Component1,./src/Component2",
      shared: "react,react-dom",
      ignoreVersion: "react,react-dom",
      exclude: "lodash",
      automaticFederation: true,
    },
  });
  const { user, loading } = useFetchUser();
  const [applications, applicationsSet] = React.useState([]);
  const { data } = useQuery(GET_APPS);
  const classes = useStyles();

  const scriptTags = applications
    .map(
      (n) =>
        `<script src="${
          data.applications.find(({ name }) => name === n).remote
        }"></script>`
    )
    .join("\n");
  const remotesCode =
    applications.length > 0
      ? "\n" +
        applications.map((name) => `      "${name}": "${name}"`).join(",\n") +
        "\n    "
      : "";

  const exposesCode = watch("files")
    .split(",")
    .map((file) => {
      const fname = file.trim();
      const mod = fname.replace(/.*\//, "");
      return `      \"${mod}\": "${fname}"`;
    })
    .join(",\n");

  const automaticPreamble = watch("automaticFederation")
    ? `
const AutomaticVendorFederation = require("@module-federation/automatic-vendor-federation");
const packageJson = require("./package.json");
const exclude = [${watch("exclude")
        .split(",")
        .map((n) => `"${n.trim()}"`)}];
const ignoreVersion = [${watch("ignoreVersion")
        .split(",")
        .map((n) => `"${n.trim()}"`)}];
`
    : "";
  const sharedCode = watch("automaticFederation")
    ? `
      AutomaticVendorFederation({
        exclude,
        ignoreVersion,
        packageJson,
        shareFrom: ["dependencies"],
        ignorePatchVersion: true,
      })
    `
    : watch("shared")
        .split(",")
        .map((mod) => `"${mod.trim()}"`)
        .join(", ");

  return (
    <Layout user={user} loading={loading}>
    <Head>
        <title>New Federated Module Application</title>
      </Head>
      {data && (
        <Grid container className={classes.container} spacing={3}>
          <Grid item xs={3}>
            <Typography variant="h5">Export Modules</Typography>
            <TextField
              name="name"
              label="Application Name"
              fullWidth
              variant="outlined"
              inputRef={register({ required: true })}
              className={classes.textField}
            />
            <TextField
              name="files"
              label="Files to export"
              helperText="comma seperated"
              variant="outlined"
              fullWidth
              multiline
              inputRef={register()}
              className={classes.textField}
            />
            <Controller
              as={
                <FormControlLabel
                  control={<Checkbox type="checkbox" />}
                  label="Use automatic federation"
                  key={name}
                />
              }
              control={control}
              name="automaticFederation"
            />
            {!watch("automaticFederation") && (
              <TextField
                name="shared"
                label="Modules to share"
                helperText="comma seperated"
                variant="outlined"
                fullWidth
                multiline
                inputRef={register()}
                className={classes.textField}
              />
            )}
            {watch("automaticFederation") && (
              <TextField
                name="exclude"
                label="Modules to exclude"
                helperText="comma seperated"
                variant="outlined"
                fullWidth
                multiline
                inputRef={register()}
                className={classes.textField}
              />
            )}
            {watch("automaticFederation") && (
              <TextField
                name="ignoreVersion"
                label="Ignore Versions"
                helperText="comma seperated"
                variant="outlined"
                fullWidth
                multiline
                inputRef={register()}
                className={classes.textField}
              />
            )}
          </Grid>
          <Grid item xs={9}>
            <Paper elevation={3} className={classes.configSection}>
              <Typography variant="h5" className={classes.title}>
                Webpack Configuration
              </Typography>
              <Typography variant="body1" className={classes.explanation}>
                Add this code to your Webpack configuration file.
              </Typography>
              <CodeWrapper>
                <GeneratedCode>
                  {`const { ModuleFederationPlugin } = require("webpack").container;`}
                  {automaticPreamble}
                </GeneratedCode>
                <Code>{`plugins: [`}</Code>
                <GeneratedCode>
                  {`  new ModuleFederationPlugin({
    name: "${watch("name")}",
    library: { type: "var", name: "${watch("name")}" },
    filename: "remoteEntry.js",
    remotes: {${remotesCode}},
    exposes: {
${exposesCode}
    },
    shared: [${sharedCode}]
  })  
`}
                </GeneratedCode>
                <Code>{`]`}</Code>
              </CodeWrapper>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="h5">Import Modules</Typography>
            <FormGroup aria-label="Imported applications">
              {data.applications.map(({ name }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      type="checkbox"
                      checked={applications[name]}
                      onChange={(evt, val) => {
                        if (val) {
                          applicationsSet([...applications, name]);
                        } else {
                          applicationsSet(
                            applications.filter((n) => n !== name)
                          );
                        }
                      }}
                    />
                  }
                  label={name}
                  key={name}
                />
              ))}
            </FormGroup>
          </Grid>
          <Grid item xs={9}>
            {applications.length > 0 && (
              <Paper elevation={3} className={classes.configSection}>
                <Typography variant="h5" className={classes.title}>
                  Script Tags
                </Typography>
                <Typography variant="body1" className={classes.explanation}>
                  Add these script tags to your page template.
                </Typography>
                <CodeWrapper>
                  <GeneratedCode>{scriptTags}</GeneratedCode>
                </CodeWrapper>
              </Paper>
            )}
          </Grid>
        </Grid>
      )}
    </Layout>
  );
};
