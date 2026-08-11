from .extension import load_jupyter_server_extension

__version__ = "0.5.0"


def _jupyter_server_extension_paths():
    return [{"module": "jupyterlab_iframe.extension"}]


def _jupyter_server_extension_points():
    return [{"module": "jupyterlab_iframe"}]


def _load_jupyter_server_extension(serverapp, nb6_entrypoint=False):
    load_jupyter_server_extension(serverapp)


def _jupyter_nbextension_paths():
    return [
        {
            "section": "tree",
            "src": "nbextension/static",
            "dest": "jupyterlab_iframe",
            "require": "jupyterlab_iframe/notebook",
        }
    ]
