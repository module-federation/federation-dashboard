import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Select,
  MenuItem,
  ListItemSecondaryAction,
  IconButton
} from "@material-ui/core";
import Link from "next/link";
import LockIcon from "@material-ui/icons/Lock";
import ShareIcon from "@material-ui/icons/Share";
import WebIcon from "@material-ui/icons/Web";
import PlusIcon from "@material-ui/icons/Add";
import ExpandMore from "@material-ui/icons/ExpandMore";
import ExpandLess from "@material-ui/icons/ExpandLess";
import WidgetsIcon from "@material-ui/icons/Widgets";
import React from "react";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { observer } from "mobx-react";

import store from "../src/store";
import { ApplicationLink, ModuleLink } from "./links";

const GET_SIDEBAR_DATA = gql`
  query($group: String!, $environment: String!) {
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



const SideBar = ({ restricted }) => {
  const [subListOpen,setSubListOpen] = React.useState(null)
  const { data } = useQuery(GET_SIDEBAR_DATA, {
    variables: {
      group: store.group,
      environment: store.environment,
    },
  });
  const renderSubList = (subList, subListParent, classes) => {
    console.log(subList);
    /*let id = subListParent + new Date().getTime();*/
    return (
      <Collapse
        in={subListOpen == subListParent}
        timeout="auto"
        unmountOnExit
        key={/*id*/ subListParent}
      >
        <List component="div" disablePadding>
          {/*{this.renderListItems(subList, classes)}*/}
          <span>ITEMS</span>
        </List>
      </Collapse>
    );
  };


  const renderSubListButton = subListParent => {
    return (
      <ListItemSecondaryAction>
        <IconButton
          color="inherit"
          aria-label={
            subListOpen == subListParent
              ? "Close Submmenu"
              : "Open Submenu"
          }
          onClick={() => setSubListOpen(subListParent)}
        >
          {subListOpen == subListParent ? (
            <ExpandLess />
          ) : (
            <ExpandMore />
          )}
        </IconButton>
      </ListItemSecondaryAction>
    );
  };


  const group = data && data.groups.length > 0 ? data.groups[0] : null;
  group.applications.map(({ id, name, versions }) => {
    if(versions.length > 0) {
    versions[0].modules.map(({ id: modId, name }) => {

    })
    }
  })

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
        <ListItem>
          <Select
            variant="outlined"
            value={store.group}
            onChange={(evt) => store.setGroup(evt.target.value)}
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
      <ListItem>
        <Select
          variant="outlined"
          value={store.environment}
          onChange={(evt) => store.setEnvironment(evt.target.value)}
          fullWidth
        >
          {store.environments.map((name) => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </ListItem>
      {group && (
        <>
          <ListSubheader inset>Applications</ListSubheader>
          {group.applications.map(({ id, name, versions }) => {
            return (
              <div key={`application:${id}`}>
                <ApplicationLink group={store.group} application={id}>
                  <ListItem button dense>
                    <ListItemIcon>
                      <WebIcon />
                    </ListItemIcon>
                    <ListItemText primary={name} />
                    {versions.length > 0 && renderSubListButton(id)}
                  </ListItem>
                </ApplicationLink>
                {isSub && renderSubList(page[key], key, classes)}
                {/*{versions.length > 0 &&*/}
                {/*  versions[0].modules.map(({ id: modId, name }) => (*/}
                {/*    <ModuleLink*/}
                {/*      group={store.group}*/}
                {/*      application={id}*/}
                {/*      module={name}*/}
                {/*      key={`module:${modId}`}*/}
                {/*    >*/}
                {/*      <ListItem button dense>*/}
                {/*        <ListItemIcon>*/}
                {/*          <WidgetsIcon />*/}
                {/*        </ListItemIcon>*/}
                {/*        <ListItemText primary={name} />*/}
                {/*      </ListItem>*/}
                {/*    </ModuleLink>*/}
                {/*  ))}*/}
              </div>
            );
          })}
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
