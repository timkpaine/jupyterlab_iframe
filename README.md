# jupyterlab_iframe

Open a site in a widget, or add a set of "quicklinks".

[![Build Status](https://github.com/timkpaine/jupyterlab_iframe/workflows/Build%20Status/badge.svg?branch=main)](https://github.com/timkpaine/jupyterlab_iframe/actions?query=workflow%3A%22Build+Status%22)
[![codecov](https://codecov.io/gh/timkpaine/jupyterlab_iframe/branch/main/graph/badge.svg)](https://codecov.io/gh/timkpaine/jupyterlab_iframe)
[![PyPI](https://img.shields.io/pypi/l/jupyterlab_iframe.svg)](https://pypi.python.org/pypi/jupyterlab_iframe)
[![PyPI](https://img.shields.io/pypi/v/jupyterlab_iframe.svg)](https://pypi.python.org/pypi/jupyterlab_iframe)
[![npm](https://img.shields.io/npm/v/jupyterlab_iframe.svg)](https://www.npmjs.com/package/jupyterlab_iframe)
[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/timkpaine/jupyterlab_iframe/main?urlpath=lab)

![](https://raw.githubusercontent.com/timkpaine/jupyterlab_iframe/main/docs/example1.gif)

## Install

```bash
pip install jupyterlab_iframe
jupyter labextension install jupyterlab_iframe
jupyter serverextension enable --py jupyterlab_iframe
```

## Options
Install the server extension, and add the following to `jupyter_notebook_config.py`

```python3
c.JupyterLabIFrame.sites = [
    {"path": "http://tim.paine.nyc", "openOnLoad": False, "launcher": False},
    {"path": "local://path/to/local/file", "openOnLoad": True, "launcher": True},
    ...
```

Each entry has a few options:
- `path`: **Required** the URL of the site. Use `local://` for files on the local filesystem.
- `openOnLoad` (Default: `False`): Open the iframe the first time JupyterLab is opened (formerly called `welcome`).
- `launcher` (Default: `False`): Create an icon in the launcher.

Any files specified as local will be served up as local links. By default any file on the filesystem is allowed, to disable this and only allow the items designated in the list above, set `c.JupyterLabIFrame.allow_any_local = False`.

## Caveats
- If running behind SSL, non-SSL sites will be proxied via the `jupyterlab_iframe` server extension, and vice-versa if running without SSL for SSL sites.
- If a site enforces `same-origin`, it will be proxied.
- If there are any other issues loading a site directly, it will attempt to proxy via the backend. Sites that specify absolute-path resources (e.g. serving images from a separate site CDN) may not load completely or correctly

## Similar Packages

- [Jupyterlab-html](https://github.com/mflevine/jupyterlab_html) displays local html files as websites in an iframe
- [Jupyterlab-sandbox](https://github.com/canavandl/jupyterlab_sandbox)
- [Main JLab Issue](https://github.com/jupyterlab/jupyterlab/issues/2369)



## Configuring Binder with a landing page

To configure binder to serve a landing page, simply add the following configuration:

To requirements.txt:

`jupyterlab_iframe>=0.3`

To postBuild:

```bash
jupyter labextension install jupyterlab_iframe@^0.2
jupyter serverextension enable --py jupyterlab_iframe

config="c.JupyterLabIFrame.sites = {'path': 'local://binder/landing.html', 'openOnLoad': True}"
mkdir -p ~/.jupyter
echo -e $config > ~/.jupyter/jupyter_notebook_config.py
```

