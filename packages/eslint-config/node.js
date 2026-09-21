import eslint from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export const nodeConfig = tseslint.config(
  { ignores: ['dist/**', 'coverage/**'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
)
