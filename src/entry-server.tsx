import ReactDOMServer from "react-dom/server";
import { StaticRouter as Router } from "react-router-dom/server";

import { App } from "./components/App";

// TODO: url/context will be required once router lives
export const render = (url: Partial<Location> | string) => {
  return ReactDOMServer.renderToString(
    <Router location={url}>
      <App />
    </Router>
  );
};
