// Minimal mock for @jupyterlab/launcher used in unit tests.
// The tests only verify that the extension object and activate function are
// exported – they never invoke launcher-specific behaviour.
const ILauncher = {};
module.exports = {ILauncher};
