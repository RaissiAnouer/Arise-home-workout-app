const fs = require('fs');
const path = require('path');

const exercisesDir = path.join(__dirname, 'src/data/exercises');

const files = fs.readdirSync(exercisesDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

files.forEach(file => {
  const filePath = path.join(exercisesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Regex to remove animationUrl and thumbnailUrl lines
  content = content.replace(/\s*animationUrl:\s*'.*?',?/g, '');
  content = content.replace(/\s*thumbnailUrl:\s*'.*?',?/g, '');
  
  fs.writeFileSync(filePath, content);
  console.log(`Processed ${file}`);
});
