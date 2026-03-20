import {Widget} from "@lumino/widgets";

export class OpenIFrameWidget extends Widget {
  constructor() {
    const body = document.createElement("div");
    const existingLabel = document.createElement("label");
    existingLabel.textContent = "Site:";

    const input = document.createElement("input");
    input.value = "";
    input.placeholder = "http://path.to.site";

    body.appendChild(existingLabel);
    body.appendChild(input);

    super({node: body});
  }

  get inputNode() {
    return this.node.getElementsByTagName("input")[0];
  }

  getValue() {
    return this.inputNode.value;
  }
}
