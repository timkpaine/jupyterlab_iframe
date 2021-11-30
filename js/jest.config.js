module.exports = {
  transform: {
    "^.+\\.jsx?$": "babel-jest",
    ".+\\.(css|styl|less|sass|scss)$": "jest-transform-css",
  },
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "<rootDir>/tests/styleMock.js",
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/tests/fileMock.js",
  },
  moduleDirectories: ["node_modules", "src", "tests"],
  transformIgnorePatterns: ["/node_modules/(?!(@jupyterlab|@finos*|lib0|y-protocols))"],
};