from ._version import __version__
from .extension import load_jupyter_server_extension


def _jupyter_server_extension_paths():
    return [{"module": "jupyterlab_iframe.extension"}]
