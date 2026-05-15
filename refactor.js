const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directories to process
const dirs = ['src/app', 'src/components', 'src/lib', 'src/context', 'src/hooks'];

// Files or directories to skip
const skipList = ['.DS_Store', 'node_modules', '.next'];

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Words to replace (ensure careful boundary matching where appropriate)
  // We use regex to match words and maintain casing.
  content = content.replace(/\bCourseStatus\b/g, 'TrackStatus');
  content = content.replace(/\bcourseId\b/g, 'trackId');
  content = content.replace(/\bCourseId\b/g, 'TrackId');
  content = content.replace(/\bcourse_id\b/g, 'track_id');
  content = content.replace(/\bCourses\b/g, 'Tracks');
  content = content.replace(/\bcourses\b/g, 'tracks');
  content = content.replace(/\bCourse\b/g, 'Track');
  content = content.replace(/\bcourse\b/g, 'track');
  content = content.replace(/\bCOURSE\b/g, 'TRACK');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function processDirectory(dirPath) {
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

// Rename directories containing 'course' or 'courses'
function renameDirectories(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    
    let files = fs.readdirSync(dirPath);
    
    for (const file of files) {
        if (skipList.includes(file)) continue;
        
        let fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            renameDirectories(fullPath); // recursive bottom-up
            
            // Re-stat because children might have been renamed
            let newName = file.replace(/courses/g, 'tracks').replace(/course/g, 'track');
            if (newName !== file) {
                const newFullPath = path.join(dirPath, newName);
                fs.renameSync(fullPath, newFullPath);
                console.log(`Renamed dir: ${fullPath} -> ${newFullPath}`);
            }
        }
    }
}

function renameFiles(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    
    let files = fs.readdirSync(dirPath);
    
    for (const file of files) {
        if (skipList.includes(file)) continue;
        
        let fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            renameFiles(fullPath);
        } else {
             let newName = file.replace(/Course/g, 'Track').replace(/course/g, 'track');
             if (newName !== file) {
                 const newFullPath = path.join(dirPath, newName);
                 fs.renameSync(fullPath, newFullPath);
                 console.log(`Renamed file: ${fullPath} -> ${newFullPath}`);
             }
        }
    }
}


for (const dir of dirs) {
  if (fs.existsSync(dir)) {
    processDirectory(dir);
    renameDirectories(dir);
    renameFiles(dir);
  }
}

console.log('Refactoring complete.');
