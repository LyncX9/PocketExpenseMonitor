module.exports = {
  preset: "react-native",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  testEnvironment: "node",
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"]
}
