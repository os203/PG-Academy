const fs = require('fs');
const path = require('path');

const dirs = ['src/app', 'src/components', 'src/lib', 'src/context', 'src/hooks'];
const skipList = ['.DS_Store', 'node_modules', '.next'];

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Fix imports
  content = content.replace(/CourseCardForSale/g, 'TrackCardForSale');
  content = content.replace(/CreateCourseModal/g, 'CreateTrackModal');
  content = content.replace(/InstructorCourseManager/g, 'InstructorTrackManager');
  content = content.replace(/StudentCourseViewer/g, 'StudentTrackViewer');
  content = content.replace(/EditCourseDetailsModal/g, 'EditTrackDetailsModal');
  content = content.replace(/CourseCardBase/g, 'TrackCardBase');
  content = content.replace(/PlayerCourse/g, 'PlayerTrack');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed imports in: ${filePath}`);
  }
}

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    if (skipList.includes(file)) continue;

    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      replaceInFile(fullPath);
    }
  }
}

for (const dir of dirs) {
  processDirectory(dir);
}

console.log('Import fixes complete.');
