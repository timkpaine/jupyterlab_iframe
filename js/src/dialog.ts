import { Widget } from "@lumino/widgets";

export class OpenIFrameWidget extends Widget {
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
