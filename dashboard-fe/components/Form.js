import React from "react";

export default function Form(props) {
  return (
    <form onSubmit={props.onSubmit} style={{ paddingLeft: 40, marginTop: 16 }}>
      <input
        type="text"
        value={props.value}
        onChange={props.onChange}
        placeholder="http://"
      />
      <input
        type="text"
        value={props.name}
        onChange={props.onChangeName}
        placeholder="Baseline Test"
      />
      <button type="submit">Add Page</button>
    </form>
  );
}
