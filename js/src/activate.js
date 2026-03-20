/* eslint-disable no-console */
import {Dialog, showDialog} from "@jupyterlab/apputils";

import {PageConfig} from "@jupyterlab/coreutils";

import {request} from "requests-helper";

import {OpenIFrameWidget} from "./dialog";
import {IFrameWidget} from "./iframe";
import {addCommandPaletteSite, addLauncherSite, addPageLoadSite} from "./commands";

export async function activate(app, launcher, palette) {
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
}
