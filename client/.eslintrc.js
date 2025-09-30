module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
    'react-hooks',
    'jsx-a11y',
  ],
  rules: {
    // React相关规则
    'react/react-in-jsx-scope': 'off', // React 17+ 不需要导入React
    'react/prop-types': 'off', // 关闭PropTypes检查
    'react/jsx-uses-react': 'off',
    'react/jsx-uses-vars': 'error',
    
    // React Hooks规则
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'off', // 关闭依赖检查
    
    // 通用规则
    'no-unused-vars': 'error', // 未使用变量改为错误
    'no-console': 'off', // 关闭console检查
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    
    // 代码风格
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    
    // JSX规则
    'jsx-quotes': ['error', 'prefer-double'],
    'react/jsx-indent': ['error', 2],
    'react/jsx-indent-props': ['error', 2],
    'react/jsx-closing-bracket-location': 'error',
    'react/jsx-closing-tag-location': 'error',
    'react/jsx-curly-spacing': ['error', 'never'],
    'react/jsx-equals-spacing': ['error', 'never'],
    'react/jsx-first-prop-new-line': ['error', 'multiline'],
    'react/jsx-max-props-per-line': ['error', { 'maximum': 1, 'when': 'multiline' }],
    'react/jsx-no-bind': 'off', // 关闭箭头函数检查
    'react/jsx-pascal-case': 'error',
    'react/jsx-tag-spacing': ['error', {
      'closingSlash': 'never',
      'beforeSelfClosing': 'always',
      'afterOpening': 'never',
      'beforeClosing': 'never'
    }],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
