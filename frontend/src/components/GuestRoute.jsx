import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StatusMessage from "./StatusMessage";

export default function GuestRoute({ children }) {
  const { customer, loading } = useAuth();

  if (loading) {
    return <StatusMessage title="Loading..." />;
  }

  if (customer) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
