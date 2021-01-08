import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { useForm, Controller } from "react-hook-form";
import {
  makeStyles,
  TextField,
  Select,
  MenuItem,
  Grid,
  Button,
  InputLabel,
  Input,
  FormHelperText,
  FormControl
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import CreateIcon from "@material-ui/icons/Create";
import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { v4 as uuidv4 } from "uuid";
import TokenGenerator from "token-generator";
import Layout from "../components/Layout";
import withAuth from "../components/with-auth";
import store from "../src/store";

const GET_SETTINGS = gql`
  {
    siteSettings {
      tokens {
        key
        value
      }
      webhooks {
        event
        url
      }
    }
  }
`;

const SET_SETTINGS = gql`
  mutation($settings: SiteSettingsInput!) {
    updateSiteSettings(settings: $settings) {
      tokens {
        key
        value
      }
      webhooks {
        event
        url
      }
    }
  }
`;

const EVENTS = [
  "updateApplication",
  "deleteApplication",
  "updateApplicationVersion",
  "deleteApplicationVersion"
];

const useStyles = makeStyles({
  textField: {
    marginTop: "1em"
  },
  pizzaImage: {
    width: "100%"
  }
});

export function SettingsForm({ siteSettings }) {
  const { register, errors, handleSubmit, control } = useForm({
    mode: "all",
    reValidateMode: "all",
    defaultValues: siteSettings
  });
  const [setSettings] = useMutation(SET_SETTINGS);
  const [webhookIndexes, setWebhookIndexes] = React.useState<Array<number>>(
    Object.keys(siteSettings.webhooks).map(i => parseInt(i))
  );
  const classes = useStyles();

  const deleteWebhook = ind => {
    setWebhookIndexes(webhookIndexes.filter(i => i !== ind));
  };
  const addWebhook = () => {
    setWebhookIndexes([...webhookIndexes, Math.max(...webhookIndexes) + 1]);
  };

  const onSubmit = settings => {
    setSettings({
      variables: {
        settings
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {webhookIndexes.map(ind => (
        <Grid
          container
          className={classes.textField}
          spacing={2}
          key={["webook", ind].join(":")}
        >
          <Grid item xs={3}>
            <Controller
              as={
                <Select
                  label="Event"
                  aria-label="Event type"
                  variant="outlined"
                  fullWidth
                >
                  {EVENTS.map(evt => (
                    <MenuItem value={evt} key={evt}>
                      {evt}
                    </MenuItem>
                  ))}
                </Select>
              }
              defaultValue={EVENTS[0]}
              name={`webhooks[${ind}].event`}
              control={control}
            />
          </Grid>
          <Grid item xs={8}>
            <TextField
              label="URL"
              fullWidth
              variant="outlined"
              type="text"
              error={!!errors.webhooks?.[ind]?.url}
              name={`webhooks[${ind}].url`}
              inputRef={register({
                required: true
              })}
            />
          </Grid>
          <Grid item xs={1}>
            <Button onClick={() => deleteWebhook(ind)}>
              <DeleteIcon />
            </Button>
          </Grid>
        </Grid>
      ))}
      <Grid container justify="flex-end">
        <Grid item>
          <Button
            variant="outlined"
            className={classes.textField}
            onClick={() => addWebhook()}
          >
            <CreateIcon />
            Add Webhook
          </Button>
        </Grid>
      </Grid>
      <Button variant="contained" color="primary" type="submit">
        Save
      </Button>
    </form>
  );
}

const TokenForm = ({ siteSettings }) => {
  const { register, handleSubmit, watch, errors } = useForm();
  const [setSettings] = useMutation(SET_SETTINGS);
  const onSubmit = siteTokens => {
    const tokens = Object.keys(siteTokens).map(key => {
      return {
        key: key,
        value: siteTokens[key]
      };
    });
    setSettings({
      variables: {
        settings: { tokens }
      }
    });
  };

  console.log(watch("example")); // watch input value by passing the name of it

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <FormControl>
            <InputLabel htmlFor="pluginToken">Dashboard Token</InputLabel>
            <Input
              name="pluginToken"
              id="pluginToken"
              aria-describedby="my-helper-text"
              inputRef={register({ required: true })}
            />

            <FormHelperText id="my-helper-text">
              We need this so DashboardPlugin can communicate
              <br />
            </FormHelperText>
            {errors.pluginToken && <span>This field is required</span>}
          </FormControl>
          <FormControl>
            <Button variant="contained" color="primary">
              Generate Token
            </Button>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" type="submit">
            Save
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};
export function Settings() {
  const { data } = useQuery(GET_SETTINGS);
  if (!store.isAuthorized) return null;
  return (
    <Layout>
      {store.isAuthorized && data && (
        <>
          <h1>Webhooks</h1>
          <SettingsForm siteSettings={data.siteSettings} />
          <h1>Plugin Token</h1>
          <TokenForm siteSettings={data.siteSettings} />
        </>
      )}
    </Layout>
  );
}

export default observer(Settings);
