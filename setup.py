from codecs import open
from os import path

from jupyter_packaging import (
    combine_commands,
    create_cmdclass,
    ensure_targets,
    get_version,
    install_npm,
)
from setuptools import find_packages, setup

pjoin = path.join

name = "jupyterlab_iframe"
here = path.abspath(path.dirname(__file__))
jshere = path.join(here, "js")
version = get_version(pjoin(here, name, "_version.py"))

with open(path.join(here, "README.md"), encoding="utf-8") as f:
    long_description = f.read().replace("\r\n", "\n")

requires = [
    "jupyterlab>=3.0.0",
    "requests>=2.22.0",
    "tornado>=6.0.0",
    "tornado-proxy-handlers>=0.0.4",
]

requires_dev = requires + [
    "black>=20.",
    "bump2version>=1.0.0",
    "flake8>=3.7.8",
    "flake8-black>=0.2.1",
    "jupyter_packaging",
    "mock",
    "pytest>=4.3.0",
    "pytest-cov>=2.6.1",
    "Sphinx>=1.8.4",
    "sphinx-markdown-builder>=0.5.2",
]

data_spec = [
    # Lab extension installed by default:
    (
        "share/jupyter/labextensions/jupyterlab_iframe",
        "jupyterlab_iframe/labextension",
        "**",
    ),
    # Config to enable server extension by default:
    ("etc/jupyter/jupyter_server_config.d", "jupyter-config", "*.json"),
]


cmdclass = create_cmdclass("js", data_files_spec=data_spec)
cmdclass["js"] = combine_commands(
    install_npm(jshere, build_cmd="build:all"),
    ensure_targets(
        [
            pjoin(jshere, "lib", "index.js"),
            pjoin(jshere, "style", "index.css"),
            pjoin(here, "jupyterlab_iframe", "labextension", "package.json"),
        ]
    ),
)


setup(
    name=name,
    version=version,
    description="IFrame widgets for JupyterLab",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/timkpaine/jupyterlab_iframe",
    author="Tim Paine",
    author_email="t.paine154@gmail.com",
    license="Apache 2.0",
    classifiers=[
        "Development Status :: 4 - Beta",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Framework :: Jupyter",
        "Framework :: Jupyter :: JupyterLab",
    ],
    cmdclass=cmdclass,
    keywords="jupyter jupyterlab",
    packages=find_packages(),
    install_requires=requires,
    extras_require={"dev": requires_dev},
    include_package_data=True,
    zip_safe=False,
    python_requires=">=3.7",
)
