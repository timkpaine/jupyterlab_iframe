// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

module.exports = {
  process(src, filename, config, options) {
    return "module.exports = " + JSON.stringify(path.basename(filename)) + ";";
  },
};
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
Tra;
