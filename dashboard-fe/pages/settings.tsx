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
  FormControl,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import CreateIcon from "@material-ui/icons/Create";
import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { v4 as uuidv4 } from "uuid";
import Layout from "../components/Layout";

const GET_SETTINGS = gql`
  {
    siteSettings {
      id
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
  mutation ($settings: SiteSettingsInput!) {
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
  "deleteApplicationVersion",
];

const useStyles = makeStyles({
  textField: {
    marginTop: "1em",
  },
  tokenField: {
    minWidth: "450px",
  },
  pizzaImage: {
    width: "100%",
  },
});

export function SettingsForm({ siteSettings }) {
  const { register, errors, handleSubmit, control } = useForm({
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: siteSettings,
  });

  const [setSettings] = useMutation(SET_SETTINGS);

  const [webhookIndexes, setWebhookIndexes] = React.useState<Array<number>>(
    Object.keys(siteSettings.webhooks).map((i) => parseInt(i))
  );
  const classes = useStyles();

  const deleteWebhook = (ind) => {
    setWebhookIndexes(webhookIndexes.filter((i) => i !== ind));
  };
  const addWebhook = () => {
    setWebhookIndexes([...webhookIndexes, Math.max(...webhookIndexes) + 1]);
  };

  const onSubmit = (settings) => {
    setSettings({
      variables: {
        settings,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {webhookIndexes.map((ind) => (
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
                  {EVENTS.map((evt) => (
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
                required: true,
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
  const { register, errors, handleSubmit } = useForm({
    mode: "all",
    defaultValues: Object.assign({
      tokens: [{ value: null }],
      ...siteSettings,
    }),
  });
  const classes = useStyles();

  const [setSettings] = useMutation(SET_SETTINGS);

  const onSubmit = (siteTokens) => {
    const tokens = Object.keys(siteTokens).map((key) => ({
      key: key,
      value: siteTokens[key],
    }));
    const variables = {
      settings: { tokens, webhooks: siteSettings.webhooks },
    };

    setSettings({
      variables,
    });
  };

  const writeTokenFound = siteSettings.tokens?.filter(
    (t) => t.key === "pluginToken"
  )?.[0]?.value;
  const readTokenFound = siteSettings.tokens?.filter(
    (t) => t.key === "readOnlyToken"
  )?.[0]?.value;
  const [writeToken, setWriteToken] = useState(writeTokenFound || "");
  const [readToken, setReadToken] = useState(readTokenFound || "");
  useEffect(() => {
    if (writeTokenFound) {
      setWriteToken(writeTokenFound);
    }
    if (readTokenFound) {
      setReadToken(readTokenFound);
    }
  }, [writeTokenFound, readTokenFound]);
  const generateWriteToken = () => {
    setWriteToken(uuidv4());
  };
  const generateReadToken = () => {
    setReadToken(uuidv4());
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <FormControl>
            <InputLabel htmlFor="pluginToken">Write Token</InputLabel>
            <Input
              className={classes.tokenField}
              name="pluginToken"
              id="pluginToken"
              aria-describedby="my-helper-text"
              inputRef={register({ required: true })}
              value={writeToken}
            />

            <FormHelperText id="my-helper-text">
              We need this so DashboardPlugin can communicate
              <br />
            </FormHelperText>
            {errors.pluginToken && <span>This field is required</span>}
          </FormControl>
          <FormControl>
            <Button
              variant="contained"
              color="primary"
              onClick={generateWriteToken}
            >
              Generate Write Token
            </Button>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl>
            <InputLabel htmlFor="readOnlyToken">Read Only Token</InputLabel>
            <Input
              className={classes.tokenField}
              name="readOnlyToken"
              id="readOnlyToken"
              aria-describedby="read only token"
              inputRef={register({ required: true })}
              value={readToken}
            />

            <FormHelperText id="read-only-reason">
              Needed to bypass auth gates and provide read only access to
              consumers
              <br />
            </FormHelperText>
            {errors.pluginToken && <span>This field is required</span>}
          </FormControl>
          <FormControl>
            <Button
              variant="contained"
              color="primary"
              onClick={generateReadToken}
            >
              Generate Read Token
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
  let { data } = useQuery(GET_SETTINGS);
  const [state, setState] = useState({
    siteSettings: { tokens: [], webhooks: [] },
  });
  useEffect(() => {
    if (data) {
      setState(data);
    }
  }, [data]);
  return (
    <Layout>
      <>
        <h1>Webhooks</h1>
        <SettingsForm siteSettings={state.siteSettings} />
        <h1>Plugin Token</h1>
        <TokenForm siteSettings={state.siteSettings} />
      </>
    </Layout>
  );
}

export default observer(Settings);
