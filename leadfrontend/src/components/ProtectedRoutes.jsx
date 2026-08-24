import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // No token - redirect to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Token exists but role check fails
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on actual role
    if (userRole === "ADMIN") {
      return <Navigate to="/dashboard/admin" replace />;
    } else if (userRole === "SALES") {
      return <Navigate to="/dashboard/sales" replace />;
    }
    // No valid role, redirect to login
    return <Navigate to="/" replace />;
  }

  // All checks passed
  return children;
};

export default ProtectedRoute;