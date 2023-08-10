module.exports = {
  "verbose": true,
  "preset": "ts-jest",
  "modulePathIgnorePatterns": [".dist/"],
  "snapshotSerializers": [
      "enzyme-to-json"
  ]
}
