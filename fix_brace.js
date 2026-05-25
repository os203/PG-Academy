const fs = require('fs');
let content = fs.readFileSync('src/components/InstructorTrackManager.tsx', 'utf8');

// Find the last '}' and remove it
const lastBraceIndex = content.lastIndexOf('}');
if (lastBraceIndex !== -1) {
  content = content.slice(0, lastBraceIndex) + content.slice(lastBraceIndex + 1);
  fs.writeFileSync('src/components/InstructorTrackManager.tsx', content);
  console.log('Removed last brace');
} else {
  console.log('No brace found');
}
