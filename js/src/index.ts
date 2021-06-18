/* eslint-disable max-classes-per-file */
import {
  ILayoutRestorer, JupyterFrontEnd, JupyterFrontEndPlugin,
} from "@jupyterlab/application";

import {
  Dialog, ICommandPalette, MainAreaWidget, showDialog, WidgetTracker,
} from "@jupyterlab/apputils";

import {
  PageConfig,
} from "@jupyterlab/coreutils";

import {
  Widget,
} from "@lumino/widgets";

import {
  IRequestResult, request,
} from "requests-helper";

import "../style/index.css";

let unique = 0;

const extension: JupyterFrontEndPlugin<WidgetTracker> = {
  activate,
  autoStart: true,
  id: "jupyterlab_iframe",
  requires: [ICommandPalette, ILayoutRestorer],
};

class IFrameWidget extends Widget {
  private local_file: boolean;
  public path: string;

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

    if (!this.local_file){
      // External website

      // First try to get directly
      request("get", path).then((res: IRequestResult) => {
        if (res.ok && !res.headers.includes("Access-Control-Allow-Origin")) {
          // Site does not disable iframe

          // eslint-disable-next-line no-console
          console.log("site accessible: proceeding");

          iframe.src = path;

          const favicon_url = new URL("/favicon.ico", path).href;

          request("get", favicon_url).then((res2: IRequestResult) => {
            if (res2.ok) {
              const style = document.createElement("style");
              style.innerHTML = `div.${iconClass} { background: url("${favicon_url}"); }`;
              document.head.appendChild(style);
            }
          });

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
            const favicon_url = `${PageConfig.getBaseUrl()}iframes/proxy?path=${new URL("/favicon.ico", path).href}`;

            path = `iframes/proxy?path=${encodeURI(path)}`;
            iframe.src = PageConfig.getBaseUrl() + path;
            // eslint-disable-next-line no-console
            console.log(`setting proxy for ${path}`);

            request("get", favicon_url).then((res2: IRequestResult) => {
              if (res2.ok) {
                const style = document.createElement("style");
                style.innerHTML = `div.${iconClass} { background: url("${favicon_url}"); }`;
                document.head.appendChild(style);
              }
            });
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
    this.path = path;
    div.appendChild(iframe);
    this.node.appendChild(div);
  }

}

class OpenIFrameWidget extends Widget {
  public constructor() {
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

  public get inputNode(): HTMLInputElement {
    return this.node.getElementsByTagName("input")[0];
  }
}

function registerSite(app: JupyterFrontEnd, palette: ICommandPalette, site: string) {
  const command = "iframe:open-" + site;

  app.commands.addCommand(command, {
    execute: () => {
      const widget = new IFrameWidget(site);
      app.shell.add(widget);
      app.shell.activateById(widget.id);
    },
    isEnabled: () => true,
    label: "Open " + site,
  });
  palette.addItem({command, category: "Sites"});
}

function activate(app: JupyterFrontEnd, palette: ICommandPalette, restorer: ILayoutRestorer) {

  // Declare a widget variable
  let widget: MainAreaWidget<IFrameWidget>;

  // Add an application command
  const open_command = "iframe:open";
  const handleWidget = (path: string) => {
    const content = new IFrameWidget(path);
    widget = new MainAreaWidget({content});

    if (!tracker.has(widget)) {
      // Track the state of the widget for later restoration
      tracker.add(widget);
    }
    if (!widget.isAttached) {
      // Attach the widget to the main work area if it's not there
      app.shell.add(widget, 'main');
    }
    widget.update();
    // Activate the widget
    app.shell.activateById(widget.id);
  }

  app.commands.addCommand(open_command, {
    execute: (args) => {
      let path = typeof args.path === "undefined" ? "" : (args.path as string);
      if (path === "") {
        showDialog({
          body: new OpenIFrameWidget(),
          buttons: [Dialog.cancelButton(), Dialog.okButton({ label: "GO" })],
          focusNodeSelector: "input",
          title: "Open site",
        }).then((result) => {
          if (result.button.label === "Cancel") {
            return;
          }

          if (!result.value) {
            return null;
          }
          path =  result.value;
          handleWidget(path)
        });
      } else {
        handleWidget(path);
      }
    },
    isEnabled: () => true,
    label: "Open IFrame",
  });

  // Add the command to the palette.
  palette.addItem({command: open_command, category: "Sites"});

  // Track and restore the widget state
  let tracker = new WidgetTracker<MainAreaWidget<IFrameWidget>>({
    namespace: 'iframe'
  });
  restorer.restore(tracker, {
    command: open_command,
    name: () => widget.content.path,
    args: widget => ({path: widget.content.path})
  });

  // grab sites from serverextension
  request("get", PageConfig.getBaseUrl() + "iframes/").then((res: IRequestResult) => {
    if (res.ok) {
      const jsn: any = res.json();
      const welcome = jsn.welcome;
      const local_files = jsn.local_files;

      let welcome_included = false;

      const sites = jsn.sites;

      for (const site of sites) {
        // eslint-disable-next-line no-console
        console.log("adding quicklink for " + site);

        if (site === welcome) {
          welcome_included = true;
        }
        if (site) {
          registerSite(app, palette, site);
        }
      }

      for (const site of local_files) {
        const actual_site = `local://${site}`;

        // eslint-disable-next-line no-console
        console.log("adding quicklink for " + actual_site);

        if (actual_site === welcome) {
          welcome_included = true;
        }
        if (actual_site) {
          registerSite(app, palette, actual_site);
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
  // eslint-disable-next-line no-console
  console.log("JupyterLab extension jupyterlab_iframe is activated!");
  return tracker
}

export default extension;
export {activate as _activate};
