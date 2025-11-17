import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig: Config = {
  testEnvironment: 'jest-environment-jsdom',
  coverageProvider: 'v8',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  modulePaths: ['<rootDir>'],
  
  // Ignorar testes do Playwright e arquivos específicos
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/src/tests/admin.spec.ts',  // Arquivo Playwright
    '.*\\.spec\\.ts$',  // Todos os arquivos .spec.ts (Playwright)
  ],
  
  // Apenas executar arquivos .test.ts e .test.tsx
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(test).[jt]s?(x)'
  ],
  
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  transformIgnorePatterns: [
    '/node_modules/(?!(@tsparticles|@tanstack|framer-motion)/)',
  ],
  
  preset: 'ts-jest',
  
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx',
      },
    },
  },
}

export default createJestConfig(customJestConfig)
