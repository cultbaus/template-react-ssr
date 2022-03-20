import { readFileSync } from "fs";
import { resolve as _resolve } from "path";
import * as express from "express";

import type { ViteDevServer, IndexHtmlTransformResult } from "vite";

const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD;

async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === "production"
) {
  const resolve = (p) => _resolve(__dirname, p);

  const indexProd = isProd
    ? readFileSync(resolve("dist/client/index.html"), "utf-8")
    : "";

  const app = express();

  let vite!: ViteDevServer;
  if (!isProd) {
    vite = await require("vite").createServer({
      root,
      logLevel: isTest ? "error" : "info",
      server: {
        middlewareMode: "ssr",
        watch: {
          // During tests we edit the files too fast and sometimes chokidar
          // misses change events, so enforce polling for consistency
          usePolling: true,
          interval: 100,
        },
      },
    });
    app.use(vite.middlewares);
  } else {
    app.use(require("compression")());
    app.use(
      require("serve-static")(resolve("dist/client"), {
        index: false,
      })
    );
  }

  app.use("*", async (req, res) => {
    try {
      const url = req.originalUrl;

      let template: string | Buffer | IndexHtmlTransformResult;
      let render: (url: string, context: any) => string;
      if (!isProd) {
        // always read fresh template in dev
        template = readFileSync(resolve("index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        render = (await vite.ssrLoadModule("/src/entry-server.jsx")).render;
      } else {
        template = indexProd;
        render = require("./dist/server/entry-server.js").render;
      }

      const context = {} as { url: string };
      const appHtml = render(url, context);

      if (context.url) {
        // Somewhere a <Redirect /> was rendered
        return res.redirect(301, context.url);
      }

      const html = template.replace(`<!--app-html-->`, appHtml);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      !isProd && vite.ssrFixStacktrace(e as Error);
      console.log((e as Error).stack);
      res.status(500).end((e as Error).stack);
    }
  });

  return { app, vite };
}

if (!isTest) {
  createServer().then(({ app }) =>
    app.listen(3000, () => {
      console.log("http://localhost:3000");
    })
  );
}

const _createServer = createServer;
export { _createServer as createServer };
