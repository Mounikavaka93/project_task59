import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";

export function NotFoundPage({
  title = "That page is not on the map.",
  body = "Try a search, or return home.",
}) {
  usePageTitle("Not found");
  return (
    <div className="page">
      <div className="shell narrow empty">
        <h1>{title}</h1>
        <p>{body}</p>
        <Link to="/" className="btn btn-primary">
          Back home
        </Link>
      </div>
    </div>
  );
}
