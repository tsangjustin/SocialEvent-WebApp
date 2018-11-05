import * as React from "react";
import "react-dates/initialize";
import { composeWithDevTools } from "redux-devtools-extension";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import { applyMiddleware, createStore } from "redux";

import { App } from "./app/page";
import { store } from "./store";

const reduxStore = createStore(
  store,
  composeWithDevTools(applyMiddleware()),
);

ReactDOM.render(
  <Provider store={reduxStore}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById("app"),
);