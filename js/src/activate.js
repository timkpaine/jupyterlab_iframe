/* eslint-disable no-console */
import {Dialog, MainAreaWidget, WidgetTracker, showDialog} from "@jupyterlab/apputils";

import {PageConfig} from "@jupyterlab/coreutils";

import {request} from "requests-helper";

import {OpenIFrameWidget} from "./dialog";
import {IFrameWidget} from "./iframe";
import {addCommandPaletteSite, addLauncherSite, addPageLoadSite} from "./commands";

export async function activate(app, launcher, palette, restorer) {
  // Add an application command
  const open_command = "iframe:open";

  // Track open iframe widgets for session restore
  const tracker = new WidgetTracker({namespace: "iframe"});

  const handleWidget = (path) => {
    const content = new IFrameWidget(path);
    const widget = new MainAreaWidget({content});
    if (!tracker.has(widget)) {
      tracker.add(widget);
    }
    if (!widget.isAttached) {
      app.shell.add(widget, "main");
    }
    widget.update();
    app.shell.activateById(widget.id);
  };

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
        handleWidget(path);
      } else {
        handleWidget(path);
      }
    },
    isEnabled: () => true,
    label: "Open IFrame",
  });

  // Restore widgets from previous session
  restorer.restore(tracker, {
    command: open_command,
    args: (widget) => ({path: widget.content.path}),
    name: (widget) => widget.content.path,
  });

  // Add the command to the palette.
  palette.addItem({command: open_command, category: "Sites"});

  // grab sites from serverextension
  const res = await request("get", `${PageConfig.getBaseUrl()}iframes/`);

  if (res.ok) {
    const jsn = res.json();
    const {sites} = jsn;

    sites.forEach((site) => {
      // add to command palette
      addCommandPaletteSite(site, app, palette);

      if (site.openOnLoad) {
        // open on page load
        addPageLoadSite(site, app);
      }

      if (site.launcher) {
        // add to launcher
        addLauncherSite(site, app, launcher);
      }
    });
  }

  console.log("JupyterLab extension jupyterlab_iframe is activated!");
  return tracker;
}
