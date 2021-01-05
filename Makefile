PYTHON := python
YARN := yarn

testjs: ## Clean and Make js tests
	cd js; ${YARN} test

testpy: ## Clean and Make unit tests
	${PYTHON} -m pytest -v jupyterlab_iframe/tests --cov=jupyterlab_iframe

tests: lint ## run the tests
	${PYTHON} -m pytest -v jupyterlab_iframe/tests --cov=jupyterlab_iframe --junitxml=python_junit.xml --cov-report=xml --cov-branch
	cd js; ${YARN} test

lint: ## run linter
	${PYTHON} -m flake8 jupyterlab_iframe setup.py
	cd js; ${YARN} lint

fix:  ## run autopep8/tslint fix
	${PYTHON} -m black jupyterlab_iframe/ setup.py
	cd js; ${YARN} fix

clean: ## clean the repository
	find . -name "__pycache__" | xargs  rm -rf
	find . -name "*.pyc" | xargs rm -rf
	find . -name ".ipynb_checkpoints" | xargs  rm -rf
	rm -rf .coverage coverage cover htmlcov logs build dist *.egg-info lib node_modules
	# make -C ./docs clean

docs:  ## make documentation
	make -C ./docs html
	open ./docs/_build/html/index.html

install:  ## install to site-packages
	${PYTHON} -m pip install .

serverextension: install ## enable serverextension
	${PYTHON} -m jupyter serverextension enable --py jupyterlab_iframe

js:  ## build javascript
	cd js; ${YARN}
	cd js; ${YARN} build

labextension: js ## enable labextension
	cd js; ${PYTHON} -m jupyter labextension install .

dist: js  ## create dists
	rm -rf dist build
	${PYTHON} setup.py sdist bdist_wheel
	${PYTHON} -m twine check dist/*

publish: dist  ## dist to pypi and npm
	${PYTHON} -m twine upload dist/* --skip-existing
	cd js; npm publish || echo "can't publish - might already exist"

# Thanks to Francoise at marmelab.com for this
.DEFAULT_GOAL := help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

print-%:
	@echo '$*=$($*)'

.PHONY: clean install serverextension labextension test tests help docs dist
