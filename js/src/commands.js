import {IFrameWidget} from "./iframe";

/**
 * @typedef {Object} Site
 * @property {string}  path         - URL or local:// path to the site.
 * @property {boolean} openOnLoad   - Whether to open this site on JupyterLab startup.
 * @property {boolean} launcher     - Whether to show this site in the launcher.
 * @property {string}  customIcon   - Optional custom icon URL for the launcher entry.
 */

export function addPageLoadSite(site, app) {
  app.restored.then(() => {
    const {path} = site;
    if (!localStorage.getItem("jupyterlab_iframe_welcome")) {
      localStorage.setItem("jupyterlab_iframe_welcome", "false");
      app.commands.execute(`iframe:open-${path}`);
    }
  });
}

export function addLauncherSite(site, app, launcher) {
  const {path, customIcon} = site;

  // Resolve the icon URL: prefer an explicit customIcon, otherwise try the
  // site's own favicon via the Google S2 favicon service.
  let kernelIconUrl;
  if (customIcon) {
    kernelIconUrl = customIcon;
  } else if (path.startsWith("http://") || path.startsWith("https://")) {
    kernelIconUrl = `https://www.google.com/s2/favicons?domain=${path}&sz=64`;
  } else {
    kernelIconUrl = undefined;
  }

  const launcherEntry = {
    category: "Sites",
    command: `iframe:open-${path}`,
    rank: 1,
  };

  if (kernelIconUrl) {
    launcherEntry.kernelIconUrl = kernelIconUrl;
  }

  launcher.add(launcherEntry);
}

export function addCommandPaletteSite(site, app, palette) {
  const {path} = site;
  const command = `iframe:open-${path}`;
  app.commands.addCommand(command, {
    execute: () => {
      const widget = new IFrameWidget(path);
      app.shell.add(widget);
      app.shell.activateById(widget.id);
    },
    isEnabled: () => true,
    label: path
      .replace(/https:\/\//, "")
      .replace(/http:\/\//, "")
      .replace(/local:\/\//, "")
      .replace(/www\./, ""),
  });
  palette.addItem({command, category: "Sites"});
}
