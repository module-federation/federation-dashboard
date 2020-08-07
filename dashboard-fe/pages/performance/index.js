import React, { useState, useEffect, Fragment } from "react";

import ListItem from "../../components/ListItem";
import Form from "../../components/Form";

const Perfrmance = ({ linkList }) => {
  const [todos, setTodos] = useState(linkList);
  const [inputValue, setInputValue] = useState("");
  const [inputName, setInputNameValue] = useState("Initial Baseline");

  //useEffect works basically as componentDidMount and componentDidUpdate
  useEffect(() => {
    let count = 0;
    todos.map((todo) => (!todo.done ? count++ : null));
  });

  //
  const _handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (inputValue === "") return alert("URL is required");

    const newArr = todos.slice();
    const valueExists = todos.find((item) => {
      return item.url === inputValue;
    });
    if (!valueExists) {
      newArr.splice(0, 0, {
        url: inputValue,
        name: inputName,
        done: false,
        new: true,
      });
      setTodos(newArr);
      setInputValue("");
      setInputNameValue("");
      fetch("/api/add-url", { method: "POST", body: null });
      fetch("/api/add-url", { method: "POST", body: JSON.stringify(newArr) });
    }
  };

  //
  const _handleBntClick = ({ type, index }) => {
    const newArr = todos.slice();
    if (type === "remove") newArr.splice(index, 1);
    else if (type === "completed") newArr[index].done = true;

    setTodos(newArr);
    fetch("/api/add-url", { method: "POST", body: null });
    fetch("/api/add-url", { method: "POST", body: JSON.stringify(newArr) });
  };

  const _handleBntReRun = (index) => {
    const newArr = todos.slice();
    newArr[index].new = true;

    setTodos(newArr);
    fetch("/api/add-url", { method: "POST", body: null });
    fetch("/api/add-url", { method: "POST", body: JSON.stringify(newArr) });
  };

  const reRunAllTests = ({ type, index }) => {
    fetch("/api/add-url", { method: "POST", body: null });
    fetch("/api/add-url", {
      method: "POST",
      body: JSON.stringify(
        todos.map((item) => {
          if (!item.url.includes("stage")) {
            item.new = true;
          }
          return item;
        })
      ),
    });
  };

  //
  return (
    <Fragment>
      <Form
        onSubmit={_handleSubmit}
        value={inputValue}
        name={inputName}
        onChange={(e) => setInputValue(e.target.value)}
        onChangeName={(e) => setInputNameValue(e.target.value)}
      />
      <button onClick={reRunAllTests}>Re-run All</button>
      <ul>
        {todos.map((todo, index) => (
          <ListItem
            key={index}
            todo={todo}
            reRun={() => _handleBntReRun(index)}
            remove={() => _handleBntClick({ type: "remove", index })}
            completed={() => _handleBntClick({ type: "completed", index })}
          />
        ))}
      </ul>
    </Fragment>
  );
};
Perfrmance.getInitialProps = async () => {
  const isProd = process.env.NODE_ENV !== "development";
  const hostname = isProd
    ? "https://lighthouse-perf-compare.vercel.app/"
    : "http://localhost:3000/";

  const urlList = await fetch(hostname + "api/get-url-list").then((res) =>
    res.json()
  );
  debugger;
  const linkList = urlList.map((url) => {
    const urlObj = new URL(url.url);
    let dirName = urlObj.host.replace("www.", "");
    if (urlObj.pathname !== "/") {
      dirName = dirName + urlObj.pathname.replace(/\//g, "_");
    }
    return { ...url, dirName };
  });
  return { linkList };
};
export default Perfrmance;
