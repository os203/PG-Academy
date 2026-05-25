const fs = require('fs');
let content = fs.readFileSync('src/components/InstructorTrackManager.tsx', 'utf8');
const lines = content.split('\n');

// The file might have \r so we check for includes
if (lines[723].includes('  };')) {
  lines.splice(723, 1); // Remove line 724 (index 723)
  fs.writeFileSync('src/components/InstructorTrackManager.tsx', lines.join('\n'));
  console.log('Removed extra };');
} else {
  console.log('Line 724 is not }; it is ' + lines[723]);
}
