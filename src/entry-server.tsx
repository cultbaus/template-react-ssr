import ReactDOMServer from "react-dom/server";
import { App } from "./components/App";

// TODO: url/context will be required once router lives
export const render = (_url: string, _context: any) => {
  return ReactDOMServer.renderToString(<App />);
};
