module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.ts?$": "ts-jest",
    "^.+\\.js$": "babel-jest",
    ".+\\.(css|styl|less|sass|scss)$": "jest-transform-css",
    "\\.svg$": "jest-raw-loader",
  },
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "<rootDir>/tests/styleMock.js",
    "\\.(jpg|jpeg|png|gif|eot)$": "<rootDir>/tests/fileMock.js",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testPathIgnorePatterns: ["/lib/", "/node_modules/"],
  testRegex: "tests\/.*\.test\.ts[x]?$",
  testEnvironment: "jsdom",
  transformIgnorePatterns: ["/node_modules/(?!(@jupyterlab/.*)|(lib0)/|(y-protocols)/)"],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.test.json",
    },
  },
};
