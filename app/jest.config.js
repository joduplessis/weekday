module.exports = {
  "verbose": true,
  "preset": "jest-puppeteer",
  "modulePathIgnorePatterns": [".dist/"],
  "snapshotSerializers": [
      "enzyme-to-json"
  ]
}
