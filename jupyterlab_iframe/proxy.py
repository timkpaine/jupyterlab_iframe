import requests
from notebook.base.handlers import IPythonHandler


class IFrameProxyHandler(IPythonHandler):
    def get(self):
        url = self.request.get_argument('url', '')
        if url:
            self.finish(requests.get(url, headers=self.request.headers).text)
        else:
            self.finish('')
