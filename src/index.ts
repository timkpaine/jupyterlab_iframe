import {
  JupyterLab, JupyterLabPlugin, ILayoutRestorer
} from '@jupyterlab/application';

import {
  ICommandPalette, showDialog, Dialog
} from '@jupyterlab/apputils';

import {
  IDocumentManager
} from '@jupyterlab/docmanager';

import {
  Widget
} from '@phosphor/widgets';

import '../style/index.css';

const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab_iframe',
  autoStart: true,
  requires: [IDocumentManager, ICommandPalette, ILayoutRestorer],
  activate: activate
};

class IFrameWidget extends Widget {
  constructor(path: string) {
    super();
    this.id = path;
    this.title.label = path;
    this.title.closable = true;

    let div = document.createElement('div');
    div.classList.add('iframe-widget');
    let iframe = document.createElement('iframe');
    iframe.setAttribute('baseURI', '');
    iframe.src = path;

    div.appendChild(iframe);
    this.node.appendChild(div);
  }

};

class OpenIFrameWidget extends Widget {
  constructor() {
    let body = document.createElement('div');
    let existingLabel = document.createElement('label');
    existingLabel.textContent = 'Site:';

    let input = document.createElement('input');
    input.value = '';
    input.placeholder = 'http://tim.paine.nyc';

    body.appendChild(existingLabel);
    body.appendChild(input);

    super({ node: body });
  }

  getValue(): string {
    return this.inputNode.value;
  }

  get inputNode(): HTMLInputElement {
    return this.node.getElementsByTagName('input')[0] as HTMLInputElement;
  }
}

function activate(app: JupyterLab, docManager: IDocumentManager, palette: ICommandPalette, restorer: ILayoutRestorer) {

  // Declare a widget variable
  let widget: IFrameWidget;

  // Add an application command
  const open_command = 'iframe:open';

  app.commands.addCommand(open_command, {
    label: 'Open IFrame',
    isEnabled: () => true,
    execute: args => {
      var path = typeof args['path'] === 'undefined' ? '': args['path'] as string;

      if (path === '') {
        showDialog({
          title: 'Open site',
          body: new OpenIFrameWidget(),
          focusNodeSelector: 'input',
          buttons: [Dialog.cancelButton(), Dialog.okButton({ label: 'GO' })]
        }).then(result => {
          if (result.button.label !== 'GO') {
            return;
          }

          if (!result.value) {
            return null;
          }
          path = <string>result.value;
          widget = new IFrameWidget(path);
          app.shell.addToMainArea(widget);
          app.shell.activateById(widget.id);
        });
      } else {
        widget = new IFrameWidget(path);
        app.shell.addToMainArea(widget);
        app.shell.activateById(widget.id);
      }
    }
  });

  // Add the command to the palette.
  palette.addItem({command: open_command, category: 'Sites'});

  // grab sites from serverextension
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "/iframes", true);
  xhr.onload = function (e:any) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        let sites = JSON.parse(xhr.responseText);
        for(let site of sites){
          console.log('adding quicklink for ' + site);
          let command = 'iframe:open-' + site;
          app.commands.addCommand(command, {
            label: 'Open ' + site,
            isEnabled: () => true,
            execute: () => {
                widget = new IFrameWidget(site);
                app.shell.addToMainArea(widget);
                app.shell.activateById(widget.id);
            }
          });
          palette.addItem({command: command, category: 'Sites'});
        }
      } else {
        console.error(xhr.statusText);
      }
    }
  }.bind(this);
  xhr.onerror = function (e) {
    console.error(xhr.statusText);
  };
  xhr.send(null);

  console.log('JupyterLab extension jupyterlab_iframe is activated!');
};


export default extension;
