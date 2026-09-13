const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'app', 'workout-schedule.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  ["color={isActiveWeek ? '#FF8A00' : '#7E8597'}", "color={isActiveWeek ? '#FFFFFF' : '#7E8597'}"],
  ["backgroundColor: '#1E2026'", "backgroundColor: '#000000'"],
  ["backgroundColor: '#FF8A00',\\n    borderRadius: 2,", "backgroundColor: '#FFFFFF',\\n    borderRadius: 2,"],
  ["backgroundColor: 'rgba(255, 138, 0, 0.15)'", "backgroundColor: 'rgba(255, 255, 255, 0.15)'"],
  ["borderColor: '#FF8A00',\\n  },", "borderColor: '#FFFFFF',\\n  },"],
  ["backgroundColor: '#FF8A00',\\n  },", "backgroundColor: '#FFFFFF',\\n  },"],
  ["color: '#FF8A00',\\n  },", "color: '#FFFFFF',\\n  },"],
  ["backgroundColor: '#292C35'", "backgroundColor: '#0A0A0A'"],
  ["backgroundColor: '#434857'", "backgroundColor: '#333333'"],
  ["backgroundColor: '#00E676',\\n  },", "backgroundColor: '#FFFFFF',\\n  },"],
  ["backgroundColor: '#20222A'", "backgroundColor: '#1A1A1A'"],
  ["borderColor: '#434857'", "borderColor: '#333333'"],
  ["backgroundColor: '#1B1D24'", "backgroundColor: '#0A0A0A'"],
  ["borderColor: '#353945'", "borderColor: '#222222'"],
  ["backgroundColor: '#171920'", "backgroundColor: '#050505'"],
  ["borderColor: '#303442'", "borderColor: '#111111'"],
  ["backgroundColor: '#00E676'", "backgroundColor: '#FFFFFF'"],
  ["borderColor: '#00E676'", "borderColor: '#FFFFFF'"],
  ["borderColor: '#FF8A00'", "borderColor: '#38B6FF'"],
  ["shadowColor: '#FF8A00'", "shadowColor: '#38B6FF'"],
  ["color: '#FF8A00'", "color: '#38B6FF'"],
  ["backgroundColor: 'rgba(255, 138, 0, 0.12)'", "backgroundColor: 'rgba(56, 182, 255, 0.12)'"],
  ["borderColor: 'rgba(255, 138, 0, 0.4)'", "borderColor: 'rgba(56, 182, 255, 0.4)'"],
  ["backgroundColor: 'rgba(30, 32, 38, 0.94)'", "backgroundColor: 'rgba(0, 0, 0, 0.94)'"],
  ["shadowColor: '#00E676'", "shadowColor: '#FFFFFF'"]
];

for (const [target, replacement] of replacements) {
  content = content.split(target.replace(/\\n/g, '\n')).join(replacement.replace(/\\n/g, '\n'));
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Colors replaced successfully!');
