/* eslint-disable no-console */
/* eslint-disable no-empty */
import {PageConfig} from "@jupyterlab/coreutils";

import {Widget} from "@lumino/widgets";

import {request} from "requests-helper";

let unique = 0;

export class IFrameWidget extends Widget {
  constructor(path) {
    super();
    this.id = `${path}-${unique}`;
    const iconClass = `favicon-${unique}`;
    this.title.iconClass = iconClass;
    this.title.label = path;
    this.title.closable = true;

    this.local_file = path.startsWith("local://");

    unique += 1;

    let url = path;
    this.path = url;
    if (!this.local_file && !url.startsWith("http")) {
      // use https, its the twenty first century
      url = `https://${url}`;
    }

    const div = document.createElement("div");
    div.classList.add("iframe-widget");
    const iframe = document.createElement("iframe");

    if (!this.local_file) {
      // External website

      // First try to get directly
      request("get", url).then(async (res) => {
        if (res.ok && !res.headers.includes("Access-Control-Allow-Origin")) {
          // Site does not disable iframe
          console.log("site accessible: proceeding");

          iframe.src = url;

          const favicon_url = new URL("/favicon.ico", url).href;

          const res2 = await request("get", favicon_url);
          if (res2.ok) {
            const style = document.createElement("style");
            style.innerHTML = `div.${iconClass} { background: url("${favicon_url}"); }`;
            document.head.appendChild(style);
          }
        } else {
          // Site is blocked for some reason, so attempt to proxy through python.
          // Reasons include: disallowing iframes, http/https mismatch, etc

          console.log(`site failed with code ${res.status.toString()}`);

          if (res.status === 404) {
            // nothing we can do
          } else if (res.status === 401) {
            // nothing we can do
          } else {
            // otherwise try to proxy
            const favicon_url = `${PageConfig.getBaseUrl()}iframes/proxy?path=${new URL("/favicon.ico", url).href}`;

            const proxyPath = `iframes/proxy?path=${encodeURI(url)}`;
            iframe.src = PageConfig.getBaseUrl() + proxyPath;
            console.log(`setting proxy for ${proxyPath}`);

            const res2 = await request("get", favicon_url);
            if (res2.ok) {
              const style = document.createElement("style");
              style.innerHTML = `div.${iconClass} { background: url("${favicon_url}"); }`;
              document.head.appendChild(style);
            }
          }
        }
      });
    } else {
      // Local file, replace url and query for local
      console.log(`fetching local file ${url}`);
      const localPath = `iframes?path=${encodeURI(url)}`;
      iframe.src = `${PageConfig.getBaseUrl()}${localPath}`;
    }

    div.appendChild(iframe);
    this.node.appendChild(div);
  }
}
