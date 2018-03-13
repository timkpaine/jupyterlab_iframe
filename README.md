# jupyterlab_iframe
Open a site in a widget, or add a set of "quicklinks".

![](https://raw.githubusercontent.com/timkpaine/jupyterlab_iframe/master/docs/example1.gif)

## Adding quicklinks
install the server extension, and add the following to `jupyter_notebook_config.py`

```python3
c.JupyterLabIFrame.iframes = ['list', 'of', 'sites']
```
