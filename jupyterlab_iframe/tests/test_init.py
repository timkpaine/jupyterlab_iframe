# for Coverage
from jupyterlab_iframe.__init__ import _jupyter_server_extension_paths


class TestInit:
    def test__jupyter_server_extension_paths(self):
        assert _jupyter_server_extension_paths() == [
            {"module": "jupyterlab_iframe.extension"}
        ]
