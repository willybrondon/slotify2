import React, { useEffect, useState } from "react";

//redux
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const reduxIsAuth = useSelector((state) => state.auth.isAuth);
  const sessionIsAuth = sessionStorage.getItem("isAuth");
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    // Check both Redux state and session storage
    const checkAuth = () => {
      if (token && (sessionIsAuth === "true" || reduxIsAuth)) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    // Add a small delay to ensure all state is properly loaded
    const timer = setTimeout(checkAuth, 100);
    
    return () => clearTimeout(timer);
  }, [reduxIsAuth, sessionIsAuth, token]);

  if (isLoading) {
    // Show a loading state while checking authentication
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/salonpanel/login" />;
};

export default PrivateRoute;
