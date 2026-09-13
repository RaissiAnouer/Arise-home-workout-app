const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  if (!fs.existsSync(dir)) return filelist;
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      if (!dirFile.includes('node_modules') && !dirFile.includes('.expo') && !dirFile.includes('.git')) {
        filelist = walkSync(dirFile, filelist);
      }
    } else if (dirFile.endsWith('.tsx') || dirFile.endsWith('.ts')) {
      filelist.push(dirFile);
    }
  });
  return filelist;
};

const dirs = [path.join(__dirname, 'app'), path.join(__dirname, 'src')];
let files = [];
dirs.forEach(d => {
  files = walkSync(d, files);
});

let updatedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace fontFamily: 'Inter' or "Inter"
  content = content.replace(/fontFamily:\s*['"]Inter['"]/g, "fontWeight: 'normal'");
  content = content.replace(/fontFamily:\s*['"]InterMedium['"]/g, "fontWeight: '500'");
  content = content.replace(/fontFamily:\s*['"]InterSemiBold['"]/g, "fontWeight: '600'");
  content = content.replace(/fontFamily:\s*['"]InterBold['"]/g, "fontWeight: 'bold'");

  // Also replace 'Orbitron' or 'Eternal' or 'LatoRegular' or 'TruenoRoundBold' or 'PressStart2P' if needed, but let's just stick to Inter for now as it's the main font. The prompt says "change the fonts to be ios", so let's also remove other custom fonts.
  content = content.replace(/fontFamily:\s*['"]Orbitron['"]/g, "fontWeight: 'bold'");
  content = content.replace(/fontFamily:\s*['"]Eternal['"]/g, "fontWeight: 'bold'");
  content = content.replace(/fontFamily:\s*['"]LatoRegular['"]/g, "fontWeight: 'normal'");
  content = content.replace(/fontFamily:\s*['"]TruenoRoundBold['"]/g, "fontWeight: 'bold'");
  content = content.replace(/fontFamily:\s*['"]PressStart2P['"]/g, "fontWeight: 'normal'");

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    updatedCount++;
    console.log('Updated:', file);
  }
});

console.log('Total files updated:', updatedCount);
