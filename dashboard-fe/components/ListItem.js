import React from "react";
import Link from "next/link";
import ListItem from "@material-ui/core/ListItem";
import Button from "@material-ui/core/Button";
import { makeIDfromURL } from "../lighthouse/utils.js";

export default function Item(props) {
  const { url } = props.todo;
  const dirName = makeIDfromURL(url).id;
  return (
    <ListItem>
      <Link href={`performance/reports/${dirName}`}>
        <a>{url}</a>
      </Link>
      <Button variant="contained" onClick={props.remove}>
        Remove
      </Button>
      <Button variant="contained" onClick={props.reRun}>
        Re-run
      </Button>
      <Button variant="contained" onClick={props.reRunVariants}>
        Re-run All Variants
      </Button>
      <Link href={`performance/reports/${dirName}`}>
        <a>View Reports</a>
      </Link>
    </ListItem>
  );
}
