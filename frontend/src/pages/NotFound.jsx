import { Link } from "react-router-dom";
import StatusMessage from "../components/StatusMessage";

export default function NotFound() {
  return (
    <StatusMessage title="This page is not on the map.">
      <Link to="/products" className="font-semibold text-accent">
        Back to products
      </Link>
    </StatusMessage>
  );
}
