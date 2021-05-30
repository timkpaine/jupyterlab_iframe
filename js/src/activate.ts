import {
  JupyterFrontEnd,
} from "@jupyterlab/application";

import { Dialog, ICommandPalette, showDialog } from "@jupyterlab/apputils";

import { PageConfig } from "@jupyterlab/coreutils";

import { IRequestResult, request } from "requests-helper";

import {OpenIFrameWidget} from "./dialog";
import {IFrameWidget} from "./iframe";


export async function activate(app: JupyterFrontEnd, palette: ICommandPalette): null {
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
    PageConfig.getBaseUrl() + "iframes/"
  );
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
      await app.restored;
      if (!localStorage.getItem("jupyterlab_iframe_welcome")) {
        localStorage.setItem("jupyterlab_iframe_welcome", "false");
        app.commands.execute("iframe:open-" + welcome);
      }
    }
  }
  // eslint-disable-next-line no-console
  console.log("JupyterLab extension jupyterlab_iframe is activated!");
}
