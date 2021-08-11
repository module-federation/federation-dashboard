import React from "react";
import { makeStyles, TextField, alpha } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import gql from "graphql-tag";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { observer } from "mobx-react";

import store from "../src/store";

const GET_SIDEBAR_DATA = gql`
  query ($group: String!, $environment: String!) {
    groups(name: $group) {
      applications {
        id
        name
        versions(environment: $environment, latest: true) {
          modules {
            id
            name
          }
        }
      }
    }
  }
`;

const useStyles = makeStyles((theme) => ({
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: 200,
    color: "white",
    padding: 5,
  },
}));

const SearchBox = () => {
  const { data } = useQuery(GET_SIDEBAR_DATA, {
    variables: {
      group: store.group,
      environment: store.environment,
    },
  });
  const classes = useStyles();
  const router = useRouter();

  const applications = [];
  const modules = [];
  if (data && data.groups.length > 0) {
    data.groups[0].applications.forEach(({ name, versions }) => {
      applications.push({
        type: "Application",
        url: `/applications/${store.group}/${name}`,
        name,
      });
      if (versions && versions.length > 0) {
        versions[0].modules.forEach(({ name: moduleName }) => {
          modules.push({
            type: "Modules",
            url: `/applications/${store.group}/${name}/${moduleName}`,
            name: moduleName,
          });
        });
      }
    });
  }
  const options = [...applications, ...modules].filter((d) => d);

  const onChange = (_, opt, reason) => {
    if (reason === "select-option") {
      router.push(opt.url);
    }
  };

  return (
    <Autocomplete
      onChange={onChange}
      options={options}
      groupBy={(option) => option.type}
      getOptionLabel={(option) => option.name}
      className={classes.searchBox}
      renderInput={(params) => (
        <TextField {...params} className={classes.search} />
      )}
    />
  );
};

export default observer(SearchBox);
