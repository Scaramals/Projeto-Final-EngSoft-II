#!/usr/bin/env node

/**
 * Script de testes - Execute com: node scripts/test.js [comando]
 * Comandos disponíveis:
 * - node scripts/test.js run       : Executa todos os testes
 * - node scripts/test.js watch     : Executa testes em modo watch
 * - node scripts/test.js coverage  : Executa testes com cobertura
 * - node scripts/test.js ci        : Executa testes para CI/CD
 */

const { execSync } = require('child_process');

const command = process.argv[2] || 'run';

const commands = {
  run: 'jest',
  watch: 'jest --watch',
  coverage: 'jest --coverage',
  ci: 'jest --ci --coverage --watchAll=false'
};

if (!commands[command]) {
  console.error('Comando inválido. Use: run, watch, coverage, ou ci');
  process.exit(1);
}

try {
  execSync(commands[command], { stdio: 'inherit' });
} catch (error) {
  process.exit(error.status);
}