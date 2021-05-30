import { JupyterFrontEnd } from "@jupyterlab/application";

import { ICommandPalette } from "@jupyterlab/apputils";

import { IFrameWidget } from "./iframe";

export function registerCommand(
  app: JupyterFrontEnd,
  palette: ICommandPalette,
  site: string
): null {
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
  palette.addItem({ command, category: "Sites" });
}
