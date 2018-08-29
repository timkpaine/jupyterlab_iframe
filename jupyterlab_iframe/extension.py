import json
from notebook.base.handlers import IPythonHandler
from notebook.utils import url_path_join


class IFrameHandler(IPythonHandler):
    def initialize(self, welcome=None, sites=None):
        self.sites = sites
        self.welcome = welcome

    def get(self):
        self.finish(json.dumps({'welcome': self.welcome or '', 'sites': self.sites}))


def load_jupyter_server_extension(nb_server_app):
    """
    Called when the extension is loaded.

    Args:
        nb_server_app (NotebookWebApplication): handle to the Notebook webserver instance.
    """
    web_app = nb_server_app.web_app
    sites = nb_server_app.config.get('JupyterLabIFrame', {}).get('iframes', [])
    welcome = nb_server_app.config.get('JupyterLabIFrame', {}).get('welcome', [])

    host_pattern = '.*$'
    base_url = web_app.settings['base_url']

    print('Installing jupyterlab_iframe handler on path %s' % url_path_join(base_url, 'iframes'))
    print('Handling iframes: %s' % sites)

    web_app.add_handlers(host_pattern, [(url_path_join(base_url, 'iframes'), IFrameHandler, {'welcome': welcome, 'sites': sites})])
