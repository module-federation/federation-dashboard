import React from "react";
import Link from "next/link";
export default function ListItem(props) {
  const { url, done, dirName } = props.todo;
  return (
    <li style={{ textDecoration: done ? "line-through" : "" }}>
      {url}
      {!done ? <button onClick={props.completed}>Completed</button> : ""}
      <button onClick={props.remove}>Remove</button>
      <button onClick={props.reRun}>Re-run</button>
      <Link href={`performance/reports/${dirName}`}>
        <a>View Reports</a>
      </Link>
    </li>
  );
}
