import axios from "axios";
import { apiInstance, apiInstanceFetch } from "../component/api/axiosApi";
import { useEffect } from "react";
import { key } from "./config";

// Set Token In Axios
export function setToken(token) {
  if (token) {
    return (axios.defaults.headers.common["Authorization"] = token);
  } else {
    return delete axios.defaults.headers.common["Authorization"];
  }
}

// Set Key In apiInstance
export function SetDevKey(key) {
  if (key) {
    return (axios.defaults.headers.common["key"] = key);
  } else {
    return delete axios.defaults.headers.common["key"];
  }
} 
