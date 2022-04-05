from codecs import open
from os import path

from jupyter_packaging import get_data_files, npm_builder, wrap_installers
from setuptools import find_packages, setup

pjoin = path.join
name = "jupyterlab_iframe"
here = path.abspath(path.dirname(__file__))
jshere = path.abspath(pjoin(path.dirname(__file__), "js"))

with open(path.join(here, "README.md"), encoding="utf-8") as f:
    long_description = f.read().replace("\r\n", "\n")

requires = [
    "jupyterlab>=3.0.0",
    "requests>=2.22.0",
    "tornado>=6.0.0",
    "tornado-proxy-handlers>=0.0.4",
]

requires_test = [
    "pytest>=4.3.0",
    "pytest-cov>=2.6.1",
]

requires_dev = (
    requires
    + requires_test
    + [
        "black>=20.8b1",
        "bump2version>=1.0.0",
        "check-manifest",
        "flake8>=3.7.8",
        "flake8-black>=0.2.1",
        "jupyter_packaging",
        "Sphinx>=1.8.4",
        "sphinx-markdown-builder>=0.5.2",
    ]
)

ext_path = pjoin(name, "extension")
lab_path = pjoin(name, "labextension")

# Representative files that should exist after a successful build
jstargets = [
    pjoin(jshere, "lib", "index.js"),
]

data_spec = [
    (
        "share/jupyter/labextensions/jupyterlab_iframe",
        lab_path,
        "**",
    ),
    ("etc/jupyter/jupyter_server_config.d", ext_path, "*.json"),
]

ensured_targets = [
    pjoin("jupyterlab_iframe", "labextension", "package.json"),
]

builder = npm_builder(build_cmd="build", path=jshere)

setup(
    name=name,
    version="0.4.3",
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
    platforms="Linux, Mac OS X, Windows",
    keywords=["Jupyter", "Jupyterlab", "Widgets", "IPython", "Graph", "Data", "DAG"],
    cmdclass=wrap_installers(
        post_develop=builder, pre_dist=builder, ensured_targets=ensured_targets
    ),
    data_files=get_data_files(data_spec),
    packages=find_packages(
        exclude=[
            "tests",
        ]
    ),
    install_requires=requires,
    test_suite="jupyterlab_iframe.tests",
    tests_require=requires_test,
    extras_require={
        "dev": requires_dev,
        "develop": requires_dev,
    },
    include_package_data=True,
    zip_safe=False,
    python_requires=">=3.7",
)
