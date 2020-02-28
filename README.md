# jupyterlab_iframe
Open a site in a widget, or add a set of "quicklinks".

[![Build Status](https://dev.azure.com/tpaine154/jupyter/_apis/build/status/timkpaine.jupyterlab_iframe?branchName=master)](https://dev.azure.com/tpaine154/jupyter/_build/latest?definitionId=10&branchName=master)
[![Coverage](https://img.shields.io/azure-devops/coverage/tpaine154/jupyter/10)](https://dev.azure.com/tpaine154/jupyter/_build?definitionId=10&_a=summary)
[![GitHub issues](https://img.shields.io/github/issues/timkpaine/jupyterlab_iframe.svg)]()
[![PyPI](https://img.shields.io/pypi/l/jupyterlab_iframe.svg)](https://pypi.python.org/pypi/jupyterlab_iframe)
[![PyPI](https://img.shields.io/pypi/v/jupyterlab_iframe.svg)](https://pypi.python.org/pypi/jupyterlab_iframe)
[![npm](https://img.shields.io/npm/v/jupyterlab_iframe.svg)](https://www.npmjs.com/package/jupyterlab_iframe)

![](https://raw.githubusercontent.com/timkpaine/jupyterlab_iframe/master/docs/example1.gif)

## Install
```bash
pip install jupyterlab_iframe
jupyter labextension install jupyterlab_iframe
jupyter serverextension enable --py jupyterlab_iframe
```

## Options
### Example
install the server extension, and add the following to `jupyter_notebook_config.py`

```python3
c.JupyterLabIFrame.iframes = ['list', 'of', 'sites']
c.JupyterLabIFrame.welcome = 'a site'
```

In this example, `list`, `of`, and `sites` will be available as links in the command palette, and `a site` will open by default the first time JupyterLab is opened.


## Caveats
### Update for version v0.0.12 - Most of these are covered by #31

~~This package uses iframes, so is subject to a few restrictions:~~
~~- If Jlab is served over SSL, so must the sites (http/https must match)~~
~~- If the underlying site enforces same-origin, then we cannot navigate to them (e.g. google)~~


## Similar Packages
- [Jupyterlab-html](https://github.com/mflevine/jupyterlab_html) displays local html files as websites in an iframe
- [Jupyterlab-sandbox](https://github.com/canavandl/jupyterlab_sandbox)
- [Main JLab Issue](https://github.com/jupyterlab/jupyterlab/issues/2369)

