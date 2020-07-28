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
import { observer } from "mobx-react";
import _ from "lodash";

import store from "../../src/store";

const GET_APPS = gql`
  query($group: String!, $environment: String!) {
    groups(name: $group) {
      applications {
        id
        name
        versions(latest: true, environment: $environment) {
          remote
        }
      }
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

const NewApp = () => {
  const { register, watch, control } = useForm({
    defaultValues: {
      name: "test-app",
      files: "./src/Component1,./src/Component2",
      shared: "react,react-dom",
      singleton: "react,react-dom",
      exclude: "express",
      automaticFederation: true,
    },
  });
  const [applications, applicationsSet] = React.useState([]);
  const { data } = useQuery(GET_APPS, {
    variables: {
      group: store.group,
      environment: store.environment,
    },
  });
  const classes = useStyles();

  const externalApplications = _.get(data, "groups[0].applications", []);

  const scriptTags = applications
    .map(
      (n) =>
        `<script src="${
          externalApplications.find(({ name }) => name === n).versions[0].remote
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
const deps = require("./package.json");

[${watch("exclude")
        .split(",")
        .map((n) => `"${n.trim()}"`)}].forEach((i)=>{delete deps.i})
`
    : "";
  const singleton = watch("singleton")
    .split(",")
    .map((mod) => `{ "${mod.trim()}": { singleton:true } }`)
    .join(",\n      ");

  const sharedCode = [
    watch("automaticFederation") ? "\n      ...deps" : null,
    watch("automaticFederation") ? '' + singleton : "\n      " + singleton,
  ].filter((i) => !!i) .join(",\n      ");

  return (
    <Layout>
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
                name="singleton"
                label="Singletons"
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
    shared: {${sharedCode}}
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
              {externalApplications.map(({ name }) => (
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

export default observer(NewApp);
