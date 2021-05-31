import {
  JupyterFrontEnd,
} from "@jupyterlab/application";

import { Dialog, ICommandPalette, showDialog } from "@jupyterlab/apputils";
import { ILauncher } from "@jupyterlab/launcher";

import { PageConfig } from "@jupyterlab/coreutils";

import { IRequestResult, request } from "requests-helper";

import {OpenIFrameWidget} from "./dialog";
import {IFrameWidget} from "./iframe";
import {Site, addCommandPaletteSite, addLauncherSite, addPageLoadSite} from "./commands";

export async function activate(app: JupyterFrontEnd, launcher: ILauncher, palette: ICommandPalette): Promise<void> {
  // Declare a widget variable
  let widget: IFrameWidget;

  // Add an application command
  const open_command = "iframe:open";

  app.commands.addCommand(open_command, {
    execute: async (args) => {
      let path = typeof args.path === "undefined" ? "" : (args.path as string);

      if (path === "") {
        const result = await showDialog({
          body: new OpenIFrameWidget(),
          buttons: [Dialog.cancelButton(), Dialog.okButton({ label: "GO" })],
          focusNodeSelector: "input",
          title: "Open site",
        });

        if (result.button.label === "Cancel") {
          return;
        }

        if (!result.value) {
          return null;
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
  palette.addItem({ command: open_command, category: "Sites" });

  // grab sites from serverextension
  const res: IRequestResult = await request(
    "get",
    `${PageConfig.getBaseUrl()}iframes/`
  );

  if (res.ok) {
    const jsn: {[site: string]: Site[]} = res.json();
    const {sites} = jsn;

    for (const site of sites) {
      console.log(site);
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
    }
  }
  console.log("JupyterLab extension jupyterlab_iframe is activated!");
}
