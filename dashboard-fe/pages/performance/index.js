import React, { useState, useEffect, Fragment } from "react";
import List from "@material-ui/core/List";
import Button from "@material-ui/core/Button";
import gql from "graphql-tag";
import { publicConfig } from "../../src/config";
import ListItem from "../../components/ListItem";
import Form from "../../components/Form";
import { useMutation, useQuery } from "@apollo/client";
import store from "../../src/store";
import {
  GET_HEAD_VERSION,
  SET_REMOTE_VERSION,
} from "../../components/application/CurrentVersion";
let prevint;
import { makeIDfromURL, removeMeta } from "../../lighthouse/utils.js";
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

const Performance = ({ groupData }) => {
  const [todos, setTodos] = useState(
    groupData?.groups?.[0]?.settings?.trackedURLs
  );
  const [inputValue, setInputValue] = useState("");
  const [inputName, setInputNameValue] = useState("Latest");

  const { data } = useQuery(GET_TRACKED, {
    variables: {
      group: "default",
    },
  });

  React.useEffect(() => {
    if (data && data.groups[0]) {
      removeMeta(data.groups[0].settings?.trackedURLs || []);
      setTodos(data.groups[0].settings?.trackedURLs || []);
    }
  }, [data]);

  const [setUrl] = useMutation(ADD_URL);

  const _handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (inputValue === "") return alert("URL is required");
    const { url, search } = makeIDfromURL(inputValue);

    const newArr = todos.slice();
    const valueExists = todos.find((item) => {
      return item.url === url;
    });
    if (!valueExists) {
      newArr.splice(0, 0, {
        url: inputValue,
        variants: [
          {
            name: inputName,
            new: true,
            search,
          },
        ],
      });
      setTodos(newArr);
      setInputValue("");
      setInputNameValue("");

      setUrl({
        variables: {
          settings: {
            trackedURLs: newArr,
          },
        },
      });
    } else {
      alert("URL already exists, add variants on the page");
    }
  };

  const _handleBntClick = ({ type, index }) => {
    const newArr = todos.slice();
    if (type === "remove") newArr.splice(index, 1);

    setTodos(newArr);

    setUrl({
      variables: {
        settings: {
          trackedURLs: newArr,
        },
      },
    });
  };

  const _handleBntReRun = ({ index, type }) => {
    const newArr = todos.slice();
    const updated = newArr[index].variants.map((variant) => {
      if (
        type === "variants" &&
        !variant.name.toLowerCase().includes("FROZEN")
      ) {
        variant.new = true;
      } else if (variant.name === "Latest") {
        variant.new = true;
      }
      return variant;
    });
    newArr[index].variants = updated;
    setTodos(newArr);
    setUrl({
      variables: {
        settings: {
          trackedURLs: newArr,
        },
      },
    });
  };

  const reRunAllTests = () => {
    const toRerun = todos.reduce((acc, item) => {
      const updated = item.variants.map((variant) => {
        const isFrozen = variant.name.toLowerCase().includes("frozen");
        if (!isFrozen) {
          variant.new = true;
        }
        return variant;
      });
      item.variants = updated;
      acc.push(item);
      return acc;
    }, []);
    console.log(toRerun);
    setUrl({
      variables: {
        settings: {
          trackedURLs: toRerun,
        },
      },
    });
    setTodos(toRerun);
  };
  useEffect(() => {
    clearInterval(prevint);

    prevint = setInterval(() => {
      console.log("runnning uodate");
      reRunAllTests();
    }, 240000 * 60);
  }, []);
  return (
    <Fragment>
      <Form
        onSubmit={_handleSubmit}
        reRunAllTests={reRunAllTests}
        value={inputValue}
        name={inputName}
        onChange={(e) => setInputValue(e.target.value)}
        onChangeName={(e) => setInputNameValue(e.target.value)}
      />
      <List>
        {todos?.[0] &&
          todos.map((todo, index) => (
            <ListItem
              key={index}
              todo={todo}
              reRun={() => _handleBntReRun({ index })}
              reRunVariants={() => _handleBntReRun({ index, type: "variants" })}
              remove={() => _handleBntClick({ type: "remove", index })}
            />
          ))}
      </List>
    </Fragment>
  );
};
Performance.getInitialProps = async ({ req, res }) => {
  const isProd = process.env.NODE_ENV !== "development";
  const url = isProd
    ? process.browser
      ? publicConfig.EXTERNAL_URL.endsWith("/")
        ? publicConfig.EXTERNAL_URL
        : publicConfig.EXTERNAL_URL + "/"
      : "http://localhost:3000/"
    : "http://localhost:3000/";

  if (!process.browser) {
    const runQuery = async (url) => {
      const fetch = __non_webpack_require__("node-fetch");
      const gql = __non_webpack_require__("graphql-tag");
      const {
        ApolloClient,
        createHttpLink,
        InMemoryCache,
      } = __non_webpack_require__("@apollo/client");
      const cache = new InMemoryCache({ addTypename: false });
      const link = createHttpLink({
        uri: url + "api/graphql",
        fetch,
      });
      const apolloClient = new ApolloClient({
        // Provide required constructor fields
        fetchOptions: { fetch },
        cache: cache,
        link: link,
        queryDeduplication: false,
        defaultOptions: {
          watchQuery: {
            fetchPolicy: "cache-and-network",
          },
        },
      });

      const { data } = await apolloClient.query({
        query: gql`
          {
            groups(name: "default") {
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
        `,
      });

      return data;
    };

    const data = await runQuery(url);
    return { groupData: data };
  }
};
export default Performance;
