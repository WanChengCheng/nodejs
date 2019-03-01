/*
 * File: .eslintrc.react.js
 * File Created: Friday, 1st March 2019 12:44:32 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */

module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    /**
     * ecmaVersion - set to 3, 5 (default), 6, 7, 8, 9, or 10 to specify the version of ECMAScript syntax you want to use.
     *  You can also set to 2015 (same as 6), 2016 (same as 7), 2017 (same as 8), 2018 (same as 9), or 2019 (same as 10) to use the year-based naming.
     */
    ecmaVersion: '2019',
  },
  extends: 'airbnb',
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: ['**/*.test.js', '**/*.spec.js', '**/*.e2e.js'] },
    ],

    // enable additional rules
  },
  globals: {},
};
