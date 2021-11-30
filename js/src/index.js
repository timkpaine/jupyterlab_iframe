/* eslint-disable max-classes-per-file */
import {JupyterFrontEnd, JupyterFrontEndPlugin} from "@jupyterlab/application";

import {Dialog, ICommandPalette, showDialog} from "@jupyterlab/apputils";

import {PageConfig} from "@jupyterlab/coreutils";

import {Widget} from "@lumino/widgets";

import {IRequestResult, request} from "requests-helper";

import "../style/index.css";

let unique = 0;

class IFrameWidget extends Widget {
  constructor(path) {
    super();
    this.id = `${path}-${unique}`;
    this.path = path;
    this.local_file = false;

    this.init();
  }

  async init() {
    const iconClass = `favicon-${unique}`;
    this.title.iconClass = iconClass;
    this.title.label = this.path;
    this.title.closable = true;

    this.local_file = this.path.startsWith("local://");

    unique += 1;

    if (!this.local_file && !this.path.startsWith("http")) {
      // use https, its 2020
      this.path = `https://${this.path}`;
    }

    const div = document.createElement("div");
    div.classList.add("iframe-widget");
    const iframe = document.createElement("iframe");

    if (!this.local_file) {
      // External website

      // First try to get directly
      const res = await request("get", this.path);
      if (res.ok && !res.headers.includes("Access-Control-Allow-Origin")) {
        // Site does not disable iframe

        // eslint-disable-next-line no-console
        console.log("site accessible: proceeding");

        iframe.src = this.path;

        const favicon_url = new URL("/favicon.ico", this.path).href;

        const res2 = await request("get", favicon_url);
        if (res2.ok) {
          const style = document.createElement("style");
          style.innerHTML = `div.${iconClass} { background: url("${favicon_url}"); }`;
          document.head.appendChild(style);
        }
      } else {
        // Site is blocked for some reason, so attempt to proxy through python.
        // Reasons include: disallowing iframes, http/https mismatch, etc

        // eslint-disable-next-line no-console
        console.log(`site failed with code ${res.status.toString()}`);

        // eslint-disable-next-line no-empty
        if (res.status === 404) {
          // nothing we can do
          // eslint-disable-next-line no-empty
        } else if (res.status === 401) {
          // nothing we can do
        } else {
          // otherwise try to proxy
          const favicon_url = `${PageConfig.getBaseUrl()}iframes/proxy?path=${new URL("/favicon.ico", this.path).href}`;

          this.path = `iframes/proxy?path=${encodeURI(this.path)}`;
          iframe.src = PageConfig.getBaseUrl() + this.path;
          // eslint-disable-next-line no-console
          console.log(`setting proxy for ${this.path}`);

          const res2 = await request("get", favicon_url);
          if (res2.ok) {
            const style = document.createElement("style");
            style.innerHTML = `div.${iconClass} { background: url("${favicon_url}"); }`;
            document.head.appendChild(style);
          }
        }
      }
    } else {
      // Local file, replace url and query for local
      // eslint-disable-next-line no-console
      console.log(`fetching local file ${this.path}`);
      this.path = `iframes/local?path=${encodeURI(this.path.replace("local://", ""))}`;
      iframe.src = PageConfig.getBaseUrl() + this.path;
    }

    div.appendChild(iframe);
    this.node.appendChild(div);
  }
}

class OpenIFrameWidget extends Widget {
  constructor() {
    const body = document.createElement("div");
    const existingLabel = document.createElement("label");
    existingLabel.textContent = "Site:";

    const input = document.createElement("input");
    input.value = "";
    input.placeholder = "http://path.to.site";

    body.appendChild(existingLabel);
    body.appendChild(input);

    super({node: body});
  }

  get inputNode() {
    return this.node.getElementsByTagName("input")[0];
  }

  getValue() {
    return this.inputNode.value;
  }
}

function registerSite(app, palette, site) {
  const command = `iframe:open-${site}`;

  app.commands.addCommand(command, {
    execute: () => {
      const widget = new IFrameWidget(site);
      app.shell.add(widget);
      app.shell.activateById(widget.id);
    },
    isEnabled: () => true,
    label: `Open ${site}`,
  });
  palette.addItem({command, category: "Sites"});
}

async function activate(app, palette) {
  // Declare a widget variable
  let widget;

  // Add an application command
  const open_command = "iframe:open";

  app.commands.addCommand(open_command, {
    execute: async (args) => {
      let path = typeof args.path === "undefined" ? "" : args.path;

      if (path === "") {
        const result = await showDialog({
          body: new OpenIFrameWidget(),
          buttons: [Dialog.cancelButton(), Dialog.okButton({label: "GO"})],
          focusNodeSelector: "input",
          title: "Open site",
        });
        if (result.button.label === "Cancel") {
          return;
        }

        if (!result.value) {
          return;
        }
        path = result.value;
        widget = new IFrameWidget(path);
        app.shell.add(widget);
        app.shell.activateById(widget.id);
      } else {
        widget = new IFrameWidget(path);
        app.shell.add(widget);
        app.shell.activateById(widget.id);
      }
    },
    isEnabled: () => true,
    label: "Open IFrame",
  });

  // Add the command to the palette.
  palette.addItem({command: open_command, category: "Sites"});

  // grab sites from serverextension
  const res = await request("get", `${PageConfig.getBaseUrl()}iframes/`);
  if (res.ok) {
    const jsn = res.json();
    const {welcome} = jsn;
    const {local_files} = jsn;

    let welcome_included = false;

    const {sites} = jsn;

    sites.forEach((site) => {
      // eslint-disable-next-line no-console
      console.log(`adding quicklink for ${site}`);

      if (site === welcome) {
        welcome_included = true;
      }
      if (site) {
        registerSite(app, palette, site);
      }
    });

    local_files.forEach((site) => {
      const actual_site = `local://${site}`;

      // eslint-disable-next-line no-console
      console.log(`adding quicklink for ${actual_site}`);

      if (actual_site === welcome) {
        welcome_included = true;
      }
      if (actual_site) {
        registerSite(app, palette, actual_site);
      }
    });

    if (!welcome_included) {
      if (welcome !== "") {
        registerSite(app, palette, welcome);
      }
    }

    if (welcome) {
      await app.restored;
      if (!localStorage.getItem("jupyterlab_iframe_welcome")) {
        localStorage.setItem("jupyterlab_iframe_welcome", "false");
        await app.commands.execute(`iframe:open-${welcome}`);
      }
    }
  }

  // eslint-disable-next-line no-console
  console.log("JupyterLab extension jupyterlab_iframe is activated!");
}

const extension = {
  activate,
  autoStart: true,
  id: "jupyterlab_iframe",
  requires: [ICommandPalette],
};

export default extension;
export {activate as _activate};
