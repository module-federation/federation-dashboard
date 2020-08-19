import React from "react";
import Button from "@material-ui/core/Button";
import Input from "@material-ui/core/Input";
export default function Form(props) {
  return (
    <form onSubmit={props.onSubmit} style={{ paddingLeft: 40, marginTop: 16 }}>
      <Input
        type="text"
        value={props.value}
        onChange={props.onChange}
        placeholder="http://"
      />
      <Input
        type="text"
        value={props.name}
        onChange={props.onChangeName}
        placeholder="Baseline Test"
      />
      <Button variant="outlined" type="submit">
        Add Page
      </Button>
      <Button variant="outlined" onClick={props.reRunAllTests}>
        Re-run All
      </Button>
      <Button variant="outlined" onClick={props.getLatest}>
        Get latest Perf
      </Button>
    </form>
  );
}
