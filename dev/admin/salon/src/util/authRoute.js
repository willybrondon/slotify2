import React from "react";

//redux
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const isAuth = sessionStorage.getItem("isAuth");

  return isAuth ? <Outlet /> : <Navigate to="/salonpanel/login" />;
};

export default PrivateRoute;
