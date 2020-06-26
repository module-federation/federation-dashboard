import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Divider,
} from "@material-ui/core";
import Link from "next/link";
import LockIcon from "@material-ui/icons/Lock";
import DashboardIcon from "@material-ui/icons/Dashboard";
import ShareIcon from "@material-ui/icons/Share";
import WebIcon from "@material-ui/icons/Web";
import PlusIcon from "@material-ui/icons/Add";
import WidgetsIcon from "@material-ui/icons/Widgets";
import React from "react";

const SideBar = ({ data, restricted }) => {
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
      <Divider />
      <ListSubheader inset>User</ListSubheader>
      <Link href="/api/logout">
        <ListItem button>
          <ListItemIcon>
            <LockIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </Link>
    </List>
  );
};

export default SideBar;
