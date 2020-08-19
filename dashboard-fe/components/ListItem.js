import React from "react";
import Link from "next/link";
import ListItem from "@material-ui/core/ListItem";
import Button from "@material-ui/core/Button";

export default function Item(props) {
  const { url, dirName } = props.todo;
  return (
    <ListItem style={{ textDecoration: done ? "line-through" : "" }}>
      <Link href={`performance/reports/${dirName}`}>
        <a>{url}</a>
      </Link>
      <Button variant="outlined" onClick={props.remove}>
        Remove
      </Button>
      <Button variant="outlined" onClick={props.reRun}>
        Re-run
      </Button>
      <Link href={`performance/reports/${dirName}`}>
        <a>View Reports</a>
      </Link>
    </ListItem>
  );
}
