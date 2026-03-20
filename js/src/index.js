import {ICommandPalette} from "@jupyterlab/apputils";
import {ILauncher} from "@jupyterlab/launcher";

import {activate} from "./activate";
import "../style/index.css";

const extension = {
  activate,
  autoStart: true,
  id: "jupyterlab_iframe",
  requires: [ILauncher, ICommandPalette],
};

export default extension;
export {activate as _activate};
