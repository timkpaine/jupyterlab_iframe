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
    let div = document.createElement('div');
    div.classList.add('iframe-widget');
    this.node.appendChild(div);
  }
};


function activate(app: JupyterLab, docManager: IDocumentManager, palette: ICommandPalette, restorer: ILayoutRestorer) {
  console.log('JupyterLab extension knowledgelab is activated!');

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
          focusNodeSelector: 'input',
          buttons: [Dialog.cancelButton(), Dialog.okButton({ label: 'path' })]
        }).then(result => {
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
  palette.addItem({command: open_command, category: 'Tools'});
};


export default extension;
