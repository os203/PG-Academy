import fs from "fs";
fs.appendFileSync('src/components/InstructorTrackManager.tsx', '\n}\n');
console.log('Appended brace');
