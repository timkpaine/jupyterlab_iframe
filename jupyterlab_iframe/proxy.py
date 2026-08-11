import tornado.gen
import tornado.httpclient
import tornado.web
import tornado.websocket
from jupyter_server.base.handlers import JupyterHandler
from tornado_proxy_handlers import (
    ProxyHandler as TProxyHandler,
    ProxyWSHandler as TProxyWSHandler,
)


class ProxyHandler(JupyterHandler, TProxyHandler):
    def initialize(self, **kwargs):
        super().initialize(**kwargs)

    @tornado.web.authenticated
    @tornado.gen.coroutine
    def get(self, *args):
        """Get the login page"""
        yield TProxyHandler.get(self, url=self.get_argument("path"))


class ProxyWSHandler(TProxyWSHandler):
    @tornado.web.authenticated
    @tornado.gen.coroutine
    def open(self, *args):
        path = self.get_argument("path")
        yield super().open(url=path)
