/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  transform: {
    '\\.jsx?$': 'babel-jest',
    '\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  transformIgnorePatterns: ['/node_modules/(?!@plumier/reflect*).+\\.js'],
  testEnvironment: 'node',
};
