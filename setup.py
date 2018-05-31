from setuptools import setup, find_packages
from codecs import open
from os import path

here = path.abspath(path.dirname(__file__))

with open(path.join(here, 'README.md'), encoding='utf-8') as f:
    long_description = f.read()

setup(
    name='jupyterlab_iframe',
    version='0.0.5',
    description='IFrame widgets for JupyterLab',
    long_description=long_description,
    url='https://github.com/timkpaine/jupyterlab_iframe',
    download_url='https://github.com/timkpaine/jupyterlab_iframe/archive/v0.0.5.tar.gz',
    author='Tim Paine',
    author_email='t.paine154@gmail.com',
    license='GPL',

    classifiers=[
        'Development Status :: 3 - Alpha',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.3',
        'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3.5',
    ],

    keywords='jupyter jupyterlab',

    packages=find_packages(exclude=['tests', ]),
    zip_safe=False,

    # entry_points={
    #     'console_scripts': [
    #         'sample=sample:main',
    #     ],
    # },
)
