import tornado.gen
import tornado.web
import tornado.websocket
import tornado.httpclient
from notebook.base.handlers import IPythonHandler
from tornado_proxy_handlers import (
    ProxyHandler as TProxyHandler,
    ProxyWSHandler as TProxyWSHandler,
)


class ProxyHandler(IPythonHandler, TProxyHandler):
    def initialize(self, **kwargs):
        super(ProxyHandler, self).initialize(**kwargs)

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
        yield super(ProxyWSHandler, self).open(url=path)
