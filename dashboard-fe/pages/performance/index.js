import React, { useState, useEffect, Fragment } from "react";
import List from "@material-ui/core/List";
import Button from "@material-ui/core/Button";
import gql from "graphql-tag";

import ListItem from "../../components/ListItem";
import Form from "../../components/Form";
import { useMutation, useQuery } from "@apollo/react-hooks";
import store from "../../src/store";
import {
  GET_HEAD_VERSION,
  SET_REMOTE_VERSION
} from "../../components/application/CurrentVersion";

import { makeIDfromURL, removeMeta } from "../../lighthouse/utils";
const GET_TRACKED = gql`
  query($group: String!) {
    groups(name: $group) {
      settings {
        trackedURLs {
          url
          variants {
            name
            search
            new
          }
        }
      }
    }
  }
`;

const ADD_URL = gql`
  mutation($settings: GroupSettingsInput!) {
    updateGroupSettings(group: "default", settings: $settings) {
      trackedURLs {
        url
        variants {
          name
          search
          new
        }
      }
    }
  }
`;

const Performance = ({ linkList }) => {
  const [todos, setTodos] = useState(linkList);
  const [inputValue, setInputValue] = useState("");
  const [inputName, setInputNameValue] = useState("Latest");

  const { data } = useQuery(GET_TRACKED, {
    variables: {
      group: "default"
    }
  });

  React.useEffect(() => {
    if (data) {
      removeMeta(data.groups[0].settings.trackedURLs);
      setTodos(data.groups[0].settings.trackedURLs);
    }
  }, [data]);

  const [setUrl] = useMutation(ADD_URL);

  const _handleSubmit = e => {
    if (e) e.preventDefault();
    if (inputValue === "") return alert("URL is required");

    const newArr = todos.slice();
    const valueExists = todos.find(item => {
      return item.url === inputValue;
    });
    if (!valueExists) {
      newArr.splice(0, 0, {
        url: inputValue,
        variants: [
          {
            name: inputName,
            new: true,
            search: makeIDfromURL(inputValue).search
          }
        ]
      });
      setTodos(newArr);
      setInputValue("");
      setInputNameValue("");

      setUrl({
        variables: {
          settings: {
            trackedURLs: newArr
          }
        }
      });
      // fetch("/api/add-url", { method: "POST", body: null });
      // fetch("/api/add-url", { method: "POST", body: JSON.stringify(newArr) });
    } else {
      alert("URL already exists, add variants on the page");
    }
  };

  //
  const _handleBntClick = ({ type, index }) => {
    const newArr = todos.slice();
    if (type === "remove") newArr.splice(index, 1);

    setTodos(newArr);

    setUrl({
      variables: {
        settings: {
          trackedURLs: newArr
        }
      }
    });

    // fetch("/api/add-url", { method: "POST", body: null });
    // fetch("/api/add-url", { method: "POST", body: JSON.stringify(newArr) });
  };

  const _handleBntReRun = index => {
    const newArr = todos.slice();
    const updated = newArr[index].variants.map(variant => {
      if (variant.name === "Latest") {
        variant.new = true;
      }
      return variant;
    });
    newArr[index].variants = updated;
    setTodos(newArr);
    setUrl({
      variables: {
        settings: {
          trackedURLs: newArr
        }
      }
    });
    // fetch("/api/add-url", { method: "POST", body: null });
    // fetch("/api/add-url", { method: "POST", body: JSON.stringify(newArr) });
  };

  const reRunAllTests = ({ type, index }) => {
    const toRerun = todos.reduce((acc, item) => {
      const updated = item.variants.map(variant => {
        if (variant.name === "Latest") {
          variant.new = true;
        }
        return variant;
      });
      item.variants = updated;
      acc.push(item);
      return acc;
    }, []);
    setUrl({
      variables: {
        settings: {
          trackedURLs: toRerun
        }
      }
    });
    setTodos(toRerun);

    // fetch("/api/add-url", { method: "POST", body: null });
    // fetch("/api/add-url", {
    //   method: "POST",
    //   body: JSON.stringify(
    //     todos.map((item) => {
    //       if (!item.url.includes("stage")) {
    //         item.new = true;
    //       }
    //       return item;
    //     })
    //   ),
    // });
  };

  return (
    <Fragment>
      <Form
        onSubmit={_handleSubmit}
        reRunAllTests={reRunAllTests}
        value={inputValue}
        name={inputName}
        onChange={e => setInputValue(e.target.value)}
        onChangeName={e => setInputNameValue(e.target.value)}
      />
      <List>
        {todos &&
          todos.map((todo, index) => (
            <ListItem
              key={index}
              todo={todo}
              reRun={() => _handleBntReRun(index)}
              remove={() => _handleBntClick({ type: "remove", index })}
            />
          ))}
      </List>
    </Fragment>
  );
};

export default Performance;
