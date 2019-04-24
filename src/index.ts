import {
  ILayoutRestorer, JupyterLab, JupyterLabPlugin,
} from "@jupyterlab/application";

import {
  Dialog, ICommandPalette, showDialog,
} from "@jupyterlab/apputils";

import {
  PageConfig,
} from "@jupyterlab/coreutils";

import {
  IDocumentManager,
} from "@jupyterlab/docmanager";

import {
  Widget,
} from "@phosphor/widgets";

import {
  IRequestResult, request,
} from "./request";

import "../style/index.css";

// tslint:disable: variable-name
let unique = 0;

const extension: JupyterLabPlugin<void> = {
  activate,
  autoStart: true,
  id: "jupyterlab_iframe",
  requires: [IDocumentManager, ICommandPalette, ILayoutRestorer],
};

class IFrameWidget extends Widget {
  constructor(path: string) {
    super();
    this.id = path + "-" + unique;
    unique += 1;

    this.title.label = path;
    this.title.closable = true;

    const div = document.createElement("div");
    div.classList.add("iframe-widget");
    const iframe = document.createElement("iframe");

    // TODO proxy path if necessary
    request("get", path).then((res: IRequestResult) => {
      if (res.ok && res.headers.indexOf("Access-Control-Allow-Origin") < 0) {
        // tslint:disable-next-line: no-console
        console.log("site accesible: proceeding");
        iframe.src = path;
      } else {
        iframe.setAttribute("baseURI", PageConfig.getBaseUrl());

        // tslint:disable-next-line: no-console
        console.log("site failed with code " + res.status.toString());

        // tslint:disable-next-line: no-empty
        if (res.status === 404) {

        } else if (res.status === 401) {
        // tslint:disable-next-line: no-empty

        } else {
          // tslint:disable-next-line: no-console
          path = "iframes/proxy?path=" + encodeURI(path);
          iframe.src = path;
          // tslint:disable-next-line: no-console
          console.log("setting proxy for " + path);
        }
      }
    });

    div.appendChild(iframe);
    this.node.appendChild(div);
  }

}

// tslint:disable-next-line: max-classes-per-file
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

    super({ node: body });
  }

  public getValue(): string {
    return this.inputNode.value;
  }

  get inputNode(): HTMLInputElement {
    return this.node.getElementsByTagName("input")[0] as HTMLInputElement;
  }
}

function registerSite(app: JupyterLab, palette: ICommandPalette, site: string) {
  const command = "iframe:open-" + site;

  app.commands.addCommand(command, {
    execute: () => {
        const widget = new IFrameWidget(site);
        app.shell.addToMainArea(widget);
        app.shell.activateById(widget.id);
    },
    isEnabled: () => true,
    label: "Open " + site,
  });
  palette.addItem({command, category: "Sites"});
}

function activate(app: JupyterLab, docManager: IDocumentManager, palette: ICommandPalette, restorer: ILayoutRestorer) {

  // Declare a widget variable
  let widget: IFrameWidget;

  // Add an application command
  const open_command = "iframe:open";

  app.commands.addCommand(open_command, {
    execute: (args) => {
      let path = typeof args.path === "undefined" ? "" : args.path as string;

      if (path === "") {
        showDialog({
          body: new OpenIFrameWidget(),
          buttons: [Dialog.cancelButton(), Dialog.okButton({ label: "GO" })],
          focusNodeSelector: "input",
          title: "Open site",
        }).then((result) => {
          if (result.button.label === "CANCEL") {
            return;
          }

          if (!result.value) {
            return null;
          }
          path =  result.value as string;
          widget = new IFrameWidget(path);
          app.shell.addToMainArea(widget);
          app.shell.activateById(widget.id);
        });
      } else {
        widget = new IFrameWidget(path);
        app.shell.addToMainArea(widget);
        app.shell.activateById(widget.id);
      }
    },
    isEnabled: () => true,
    label: "Open IFrame",
  });

  // Add the command to the palette.
  palette.addItem({command: open_command, category: "Sites"});

  // grab sites from serverextension
  request("get", PageConfig.getBaseUrl() + "iframes").then((res: IRequestResult) => {
    if (res.ok) {
      const jsn = res.json() as {[key: string]: string};
      const welcome = jsn.welcome;
      let welcome_included = false;

      const sites = jsn.sites;

      for (const site of sites) {
          // tslint:disable-next-line: no-console
          console.log("adding quicklink for " + site);

          if (site === welcome) {
            welcome_included = true;
          }
          if (site) {
            registerSite(app, palette, site);
          }
        }

      if (!welcome_included) {
          if (welcome !== "") {
            registerSite(app, palette, welcome);
          }
        }

      if (welcome) {
          app.restored.then(() => {
            if (!localStorage.getItem("jupyterlab_iframe_welcome")) {
              localStorage.setItem("jupyterlab_iframe_welcome", "false");
              app.commands.execute("iframe:open-" + welcome);
            }
          });
        }
    }
  });
  // tslint:disable-next-line: no-console
  console.log("JupyterLab extension jupyterlab_iframe is activated!");
}

export default extension;
export {activate as _activate};
