import React from "react";
import Link from "next/link";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from "@material-ui/core";

import DashboardIcon from "@material-ui/icons/Dashboard";
import PlusIcon from "@material-ui/icons/Add";
import WebIcon from "@material-ui/icons/Web";
import ShareIcon from "@material-ui/icons/Share";
import WidgetsIcon from "@material-ui/icons/Widgets";

const SideBar = ({ data }) => {
  return (
    <List>
      <Link href="/">
        <ListItem button>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
      </Link>
      <Link href={`/dependencies`}>
        <ListItem button>
          <ListItemIcon>
            <ShareIcon />
          </ListItemIcon>
          <ListItemText primary="Dependencies" />
        </ListItem>
      </Link>
      {data && (
        <>
          <ListSubheader inset>Applications</ListSubheader>
          {data.applications.map(({ id, name }) => (
            <Link href={`/applications/${id}`} key={`application:${id}`}>
              <ListItem button>
                <ListItemIcon>
                  <WebIcon />
                </ListItemIcon>
                <ListItemText primary={name} />
              </ListItem>
            </Link>
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
      {data && (
        <>
          <ListSubheader inset>Modules</ListSubheader>
          {data.modules.map(({ id, name, application }) => (
            <Link
              href={`/applications/${application.id}/${name}`}
              key={`module:${id}`}
            >
              <ListItem button>
                <ListItemIcon>
                  <WidgetsIcon />
                </ListItemIcon>
                <ListItemText primary={name} />
              </ListItem>
            </Link>
          ))}
        </>
      )}
    </List>
  );
};

export default SideBar;
