import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Select,
  MenuItem,
} from "@material-ui/core";
import Link from "next/link";
import LockIcon from "@material-ui/icons/Lock";
import ShareIcon from "@material-ui/icons/Share";
import WebIcon from "@material-ui/icons/Web";
import PlusIcon from "@material-ui/icons/Add";
import WidgetsIcon from "@material-ui/icons/Widgets";
import React from "react";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { observer } from "mobx-react";

import store from "../src/store";

const GET_SIDEBAR_DATA = gql`
  query($group: String!, $type: String!) {
    groups(name: $group) {
      applications {
        id
        name
        versions(type: $type, latest: true) {
          modules {
            id
            name
          }
        }
      }
    }
  }
`;

const SideBar = ({ restricted }) => {
  const { data } = useQuery(GET_SIDEBAR_DATA, {
    variables: {
      group: store.group,
      type: store.versionType,
    },
  });

  const group = data && data.groups.length > 0 ? data.groups[0] : null;

  if (restricted) {
    return (
      <List>
        <Link href="/api/login">
          <ListItem button>
            <ListItemIcon>
              <LockIcon />
            </ListItemIcon>
            <ListItemText primary="Login" />
          </ListItem>
        </Link>
      </List>
    );
  }

  return (
    <List>
      {store.groups.length && (
        <ListItem dense>
          <Select
            variant="outlined"
            value={store.group}
            onChange={(evt) => (store.group = evt.target.value)}
            fullWidth
          >
            {store.groups.map(({ id, name }) => (
              <MenuItem key={id} value={id}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </ListItem>
      )}
      <ListItem dense>
        <Select
          variant="outlined"
          value={store.versionType}
          onChange={(evt) => (store.versionType = evt.target.value)}
          fullWidth
        >
          {store.versionTypes.map((name) => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </ListItem>
      {group && (
        <>
          <ListSubheader inset>Applications</ListSubheader>
          {group.applications.map(({ id, name, versions }) => (
            <div key={`application:${id}`}>
              <Link href={`/applications/${store.group}/${id}`}>
                <ListItem button dense>
                  <ListItemIcon>
                    <WebIcon />
                  </ListItemIcon>
                  <ListItemText primary={name} />
                </ListItem>
              </Link>
              {versions.length > 0 &&
                versions[0].modules.map(({ id: modId, name }) => (
                  <Link
                    href={`/applications/${store.group}/${id}/${name}`}
                    key={`module:${modId}`}
                  >
                    <ListItem button dense>
                      <ListItemIcon>
                        <WidgetsIcon />
                      </ListItemIcon>
                      <ListItemText primary={name} />
                    </ListItem>
                  </Link>
                ))}
            </div>
          ))}
          <Link href={`/applications/new`}>
            <ListItem button>
              <ListItemIcon>
                <PlusIcon />
              </ListItemIcon>
              <ListItemText primary="New" />
            </ListItem>
          </Link>
        </>
      )}
      <Link href={`/dependencies`}>
        <ListItem button>
          <ListItemIcon>
            <ShareIcon />
          </ListItemIcon>
          <ListItemText primary="Dependencies" />
        </ListItem>
      </Link>
    </List>
  );
};

export default observer(SideBar);
