import logo from "./logo.svg";
import "./App.css";
import { useDispatch } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import Login from "./component/pages/Login";
import { Route, Routes } from "react-router-dom";
import Admin from "./component/pages/Admin";
import AuthRoute from "./util/authRoute";
import "../src/assets/scss/custom/custom.css";
import "../src/assets/scss/default/default.css";
import "../src/assets/scss/style/style.css";
import "../src/assets/scss/dateRange.css";
import { setOldAdmin } from "./redux/slice/authSlice";
import { setToken } from "./util/setAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
function App() {
  const dispatch = useDispatch();
  const key = sessionStorage.getItem("key");
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const path = window.location.pathname;
    if (/^\/salonPanel/i.test(path) && !path.startsWith("/salonpanel")) {
      const normalized = path.replace(/^\/salonPanel/i, "/salonpanel");
      window.history.replaceState(null, "", normalized + window.location.search + window.location.hash);
    }
  }, []);

  const sessionTimeout = 20 * 60 * 1000; // 5 minutes in milliseconds
  let activityTimeout;

  const resetTimeout = useCallback(() => {
    if (activityTimeout) clearTimeout(activityTimeout);
    activityTimeout = setTimeout(() => {
      window.sessionStorage.clear();
      window.sessionStorage.clear();
      window.location.href = "/salonpanel";
    }, sessionTimeout);
  }, [activityTimeout, sessionTimeout]);

  const handleActivity = () => {
    resetTimeout();
  };

  useEffect(() => {
    if (!token && !key) return;
    
    // Add a small delay to ensure proper state synchronization
    const timer = setTimeout(() => {
      dispatch(setOldAdmin(token));
    }, 50);
    
    return () => clearTimeout(timer);
  }, [dispatch, token, key]);

  const queryClient = new QueryClient();

  useEffect(() => {

    // Set initial timeout
    resetTimeout();

    // Add event listeners to track user activity
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      if (activityTimeout) clearTimeout(activityTimeout);
    };
  }, [resetTimeout]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <Routes>
          <Route path="/salonpanel" element={<Login />} />
          <Route path="/salonpanel/login" element={<Login />} />
          <Route element={<AuthRoute />}>
            <Route path="/salonpanel/*" element={<Admin />} />
          </Route>
        </Routes>
      </div>
    </QueryClientProvider>
  );
}

export default App;
