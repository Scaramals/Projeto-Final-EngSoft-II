
// Script para assegurar que a compilação Vercel seja bem-sucedida

const fs = require('fs');
const path = require('path');

// Garante que pastas necessárias existam
const directories = [
  'dist',
  'dist/assets',
];

directories.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Diretório criado: ${dirPath}`);
  }
});

console.log('Preparação de compilação concluída!');
