import json
import os.path
import tornado.web
from notebook.base.handlers import IPythonHandler
from notebook.utils import url_path_join
from .proxy import ProxyHandler, ProxyWSHandler


class IFrameHandler(IPythonHandler):
    def initialize(self, welcome=None, sites=None, local_files=None):
        self.sites = sites
        self.welcome = welcome
        self.local_files = local_files

    @tornado.web.authenticated
    def get(self):
        self.set_header("Content-Type", "application/json")
        self.finish(
            json.dumps(
                {
                    "welcome": self.welcome,
                    "sites": self.sites,
                    "local_files": self.local_files,
                }
            )
        )


class IFrameLocalFileHandler(IPythonHandler):
    def initialize(self, local_files=None, allow_any=True):
        self.local_files = local_files
        self.allow_any = allow_any

    @tornado.web.authenticated
    def get(self):
        path = self.get_argument("path", "")
        if path and (self.allow_any or path in self.local_files):
            try:
                with open(path, "r") as fp:
                    self.set_header("Content-Type", "text/html")
                    self.finish(fp.read())
            except UnicodeDecodeError:
                with open(path, "rb") as fp:
                    self.finish(fp.read())

        raise tornado.web.HTTPError(404, "Site not found:{}".format(path))


def load_jupyter_server_extension(nb_server_app):
    """
    Called when the extension is loaded.

    Args:
        nb_server_app (NotebookWebApplication): handle to the Notebook webserver instance.
    """
    web_app = nb_server_app.web_app
    sites = nb_server_app.config.get("JupyterLabIFrame", {}).get("iframes", [])
    welcome = nb_server_app.config.get("JupyterLabIFrame", {}).get("welcome", "")
    local_files = nb_server_app.config.get("JupyterLabIFrame", {}).get(
        "local_files", ""
    )
    allow_any = nb_server_app.config.get("JupyterLabIFrame", {}).get(
        "allow_any_local", True
    )
    local_files = [f for f in local_files if os.path.exists(f)]

    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]

    print(
        "Installing jupyterlab_iframe handler on path %s"
        % url_path_join(base_url, "iframes")
    )
    print("Installing iframes: %s" % sites)

    if welcome:
        print("Installing welcome page: %s" % welcome)

    if local_files:
        print("Installing local files: %s" % local_files)
        if allow_any:
            print(
                "WARNING: allowing any local file to be served as html in an iframe (via `JupyterLabIFrame.allow_any_local` configuration)"
            )

    web_app.add_handlers(
        host_pattern,
        [
            (
                url_path_join(base_url, "iframes/"),
                IFrameHandler,
                {"welcome": welcome, "sites": sites, "local_files": local_files},
            ),
            (
                url_path_join(base_url, "iframes/local"),
                IFrameLocalFileHandler,
                {"local_files": local_files, "allow_any": allow_any},
            ),
            (url_path_join(base_url, "iframes/proxy"), ProxyHandler),
            (url_path_join(base_url, "iframes/proxy"), ProxyWSHandler),
        ],
    )
