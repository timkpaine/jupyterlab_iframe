import {ICommandPalette} from "@jupyterlab/apputils";
import {ILayoutRestorer} from "@jupyterlab/application";
import {ILauncher} from "@jupyterlab/launcher";

<<<<<<< before updating
import {activate} from "./activate";
import "../style/index.css";
=======
async function activate(_app) {
  // oxlint-disable-next-line no-console
  console.log("JupyterLab extension jupyterlab-iframe is activated!");
}
>>>>>>> after updating

const extension = {
  activate,
  autoStart: true,
  id: "jupyterlab_iframe",
  requires: [ILauncher, ICommandPalette, ILayoutRestorer],
};

export default extension;
export {activate as _activate};
