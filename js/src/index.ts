import { JupyterFrontEndPlugin } from "@jupyterlab/application";

import { ICommandPalette } from "@jupyterlab/apputils";

import "../style/index.css";
import { activate } from "./activate";

const extension: JupyterFrontEndPlugin<void> = {
  activate,
  autoStart: true,
  id: "jupyterlab_iframe",
  requires: [ICommandPalette],
};

export default extension;
export { activate as _activate };
