# for Coverage
from unittest.mock import patch, MagicMock
from jupyterlab_iframe.extension import (
    load_jupyter_server_extension,
    IFrameHandler,
    ProxyHandler,
)  # noqa: F401


class TestExtension:
    def test_load_jupyter_server_extension(self):
        m = MagicMock()

        m.web_app.settings = {}
        m.web_app.settings["base_url"] = "/test"
        load_jupyter_server_extension(m)

    def test_handler_listing(self):
        import tornado.web

        app = tornado.web.Application()
        m = MagicMock()
        m.get_argument.return_value = ""

        h = IFrameHandler(app, m, sites=[], allow_any=True)
        h.current_user = h._jupyter_current_user = "blerg"
        h._transforms = []
        h.get()

    def test_handler_local_file(self, tmp_path):
        import tornado.web

        html_file = tmp_path / "test.html"
        html_file.write_text("<html><body>test</body></html>")
        path = f"local://{html_file}"

        app = tornado.web.Application()
        m = MagicMock()
        m.get_argument.return_value = path

        h = IFrameHandler(app, m, sites=[{"path": path}], allow_any=True)
        h.current_user = h._jupyter_current_user = "blerg"
        h._transforms = []
        h.get()

    def test_proxy_handler(self):
        import tornado.web

        app = tornado.web.Application()
        m = MagicMock()

        h = ProxyHandler(app, m)
        h.current_user = h._jupyter_current_user = "blerg"
        h._transforms = []

        with patch("requests.get") as m2:
            m2.return_value.text = "test"
            h.get()
