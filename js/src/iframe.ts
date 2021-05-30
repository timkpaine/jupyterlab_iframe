import { PageConfig } from "@jupyterlab/coreutils";

import { Widget } from "@lumino/widgets";

import { IRequestResult, request } from "requests-helper";

let unique = 0;

export class IFrameWidget extends Widget {
  private local_file: boolean;

  public constructor(path: string) {
    super();
    this.id = `${path}-${unique}`;
    const iconClass = `favicon-${unique}`;
    this.title.iconClass = iconClass;
    this.title.label = path;
    this.title.closable = true;

    this.local_file = path.startsWith("local://");

    unique += 1;

    if (!this.local_file && !path.startsWith("http")) {
      // use https, its 2020
      path = "https://" + path;
    }

    const div = document.createElement("div");
    div.classList.add("iframe-widget");
    const iframe = document.createElement("iframe");

    if (!this.local_file) {
      // External website

      // First try to get directly
      request("get", path).then(async (res: IRequestResult) => {
        if (res.ok && !res.headers.includes("Access-Control-Allow-Origin")) {
          // Site does not disable iframe

          // eslint-disable-next-line no-console
          console.log("site accessible: proceeding");

          iframe.src = path;

          const favicon_url = new URL("/favicon.ico", path).href;

          const res2: IRequestResult = await request("get", favicon_url);
          if (res2.ok) {
            const style = document.createElement("style");
            style.innerHTML = `div.${iconClass} { background: url("${favicon_url}"); }`;
            document.head.appendChild(style);
          }
        } else {
          // Site is blocked for some reason, so attempt to proxy through python.
          // Reasons include: disallowing iframes, http/https mismatch, etc

          // eslint-disable-next-line no-console
          console.log("site failed with code " + res.status.toString());

          // eslint-disable-next-line no-empty
          if (res.status === 404) {
            // nothing we can do
            // eslint-disable-next-line no-empty
          } else if (res.status === 401) {
            // nothing we can do
          } else {
            // otherwise try to proxy
            const favicon_url = `${PageConfig.getBaseUrl()}iframes/proxy?path=${
              new URL("/favicon.ico", path).href
            }`;

            path = `iframes/proxy?path=${encodeURI(path)}`;
            iframe.src = PageConfig.getBaseUrl() + path;
            // eslint-disable-next-line no-console
            console.log(`setting proxy for ${path}`);

            const res2: IRequestResult = await request("get", favicon_url);
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
      // eslint-disable-next-line no-console
      console.log("fetching local file " + path);
      path = `iframes/local?path=${encodeURI(path.replace("local://", ""))}`;
      iframe.src = PageConfig.getBaseUrl() + path;
    }

    div.appendChild(iframe);
    this.node.appendChild(div);
  }
}
