import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import { ToastContainer } from "react-toastify";

import { getBaseURL, getSecretKey } from "./util/config";
import Loader from "./util/Loader";
import axios from "axios"
import { CLOSE_LOADER, OPEN_LOADER } from "./redux/slice/loading.type";

axios.defaults.baseURL = getBaseURL();
axios.interceptors.request.use((config) => {
  config.baseURL = getBaseURL();
  config.headers.key = sessionStorage.getItem("key") || getSecretKey();
  config.headers.Authorization = sessionStorage.getItem("token");
  return config;
});



const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <App />
        <ToastContainer style={{ zIndex: "999999" }} 
        />
        <Loader />
      </Provider>
    </BrowserRouter>
    // </React.StrictMode>  

);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
