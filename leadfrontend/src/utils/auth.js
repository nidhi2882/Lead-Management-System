import { jwtDecode } from "jwt-decode";

export const getUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);

    return {
      email: decoded.sub,
      role: decoded.role?.replace("ROLE_", "") || "SALES",
    };
  } catch (err) {
    return null;
  }
};