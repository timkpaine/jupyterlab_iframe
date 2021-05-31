import json
import os.path

import tornado.web
from notebook.base.handlers import IPythonHandler
from notebook.utils import url_path_join

from .proxy import ProxyHandler, ProxyWSHandler


class IFrameHandler(IPythonHandler):
    def initialize(self, sites=None, allow_any=True):
        self.sites = sites
        self.allowed_sites = [s["path"] for s in sites]
        self.allow_any = allow_any

    @tornado.web.authenticated
    def get(self):
        path = self.get_argument("path", "")
        if path.startswith("local://") and (
            self.allow_any or path in self.allowed_sites
        ):
            # allowed site or local site
            path = path.replace("local://", "")
            try:
                with open(path, "r") as fp:
                    self.set_header("Content-Type", "text/html")
                    self.finish(fp.read())
            except UnicodeDecodeError:
                with open(path, "rb") as fp:
                    self.finish(fp.read())
            return
        elif path:
            # path provided but not allowed
            raise tornado.web.HTTPError(403, "Site not allowed:{}".format(path))

        # if path not provided, just send listing
        self.set_header("Content-Type", "application/json")
        self.finish(
            json.dumps(
                {
                    "sites": self.sites,
                }
            )
        )


def load_jupyter_server_extension(nb_server_app):
    """
    Called when the extension is loaded.

    Args:
        nb_server_app (NotebookWebApplication): handle to the Notebook webserver instance.
    """
    web_app = nb_server_app.web_app
    sites = nb_server_app.config.get("JupyterLabIFrame", {}).get("sites", [])
    allow_any = nb_server_app.config.get("JupyterLabIFrame", {}).get(
        "allow_any_local", True
    )

    # clean up sites:
    sites = [s for s in sites if s.get("path", "")]
    for s in sites:
        s["openOnLoad"] = s.get("openOnLoad", False)
        s["launcher"] = s.get("launcher", False)
        s["openOnLoad"] = s.get("openOnLoad", False)
        s["customIcon"] = s.get("customIcon", "")

    # validate local files
    sites = [
        s
        for s in sites
        if (
            not s["path"].startswith("local://")
            or os.path.exists(s["path"].replace("local://", ""))
        )
    ]

    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]

    print(
        "Installing jupyterlab_iframe handler on path %s"
        % url_path_join(base_url, "sites")
    )
    print("Installing sites: %s" % [s["path"] for s in sites])

    if allow_any:
        print(
            "WARNING: allowing any local file to be served as html in an iframe (via `JupyterLabIFrame.allow_any_local` configuration)"
        )

    web_app.add_handlers(
        host_pattern,
        [
            (
                url_path_join(base_url, "iframes"),
                IFrameHandler,
                {"sites": sites, "allow_any": allow_any},
            ),
            (url_path_join(base_url, "iframes/proxy"), ProxyHandler),
            (url_path_join(base_url, "iframes/proxy"), ProxyWSHandler),
        ],
    )
