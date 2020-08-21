import React from "react";
import { Delete } from "@material-ui/icons";
import { List, Button, ListItem, IconButton } from "@material-ui/core";

export default function Form(props) {
  return (
    <form onSubmit={props.onSubmit} style={{ paddingLeft: 40, marginTop: 16 }}>
      <input
        type="text"
        value={props.value}
        onChange={props.onChange}
        placeholder="Variation Name"
      />
      <Button variant="contained" type="submit">
        Add Varient
      </Button>
      <List>
        {props.appKeys &&
          props.appKeys.map((i) => {
            return (
              <ListItem>
                {i}
                <IconButton onClick={() => props.onDelete(i)} aria-label={i}>
                  <Delete />
                </IconButton>
              </ListItem>
            );
          })}
      </List>
    </form>
  );
}
