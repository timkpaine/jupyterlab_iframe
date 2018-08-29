# jupyterlab_iframe
Open a site in a widget, or add a set of "quicklinks".

[![Build Status](https://travis-ci.org/timkpaine/jupyterlab_iframe.svg?branch=master)](https://travis-ci.org/timkpaine/jupyterlab_iframe)
[![GitHub issues](https://img.shields.io/github/issues/timkpaine/jupyterlab_iframe.svg)]()
[![codecov](https://codecov.io/gh/timkpaine/jupyterlab_iframe/branch/master/graph/badge.svg)](https://codecov.io/gh/timkpaine/jupyterlab_iframe)
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

## Adding quicklinks
install the server extension, and add the following to `jupyter_notebook_config.py`

```python3
c.JupyterLabIFrame.iframes = ['list', 'of', 'sites']
c.JupyterLabIFrame.welcome = 'a site'
```
