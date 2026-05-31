const expo = require('eslint-config-expo/flat');

module.exports = [
  { ignores: ['dist/**', 'node_modules/**', '.expo/**'] },
  ...expo,
  {
    rules: {
      // i18next exposes `use` both as a default member and a named export; calling
      // it on the default import is the documented, intentional usage here.
      'import/no-named-as-default-member': 'off',
    },
  },
];
