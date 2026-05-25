const fs = require('fs');
let content = fs.readFileSync('src/components/InstructorTrackManager.tsx', 'utf8');

const target = `  const handleLessonVideoUpload = async (
    phaseId: string,
    moduleId: string,
    lessonId: string,
    file: File | null
          body: formData,
        }
      );`;

const replacement = `  const handleLessonVideoUpload = async (
    phaseId: string,
    moduleId: string,
    lessonId: string,
    file: File | null
  ): Promise<void> => {
    if (!file) return;

    setUploadingVideoLessonId(lessonId);

    try {
      const extension = file.name.split('.').pop() || 'mp4';
      const sanitizedFile = new File([file], \`upload_\${Date.now()}.\${extension}\`, { type: file.type });

      const formData = new FormData();
      formData.append("file", sanitizedFile);

      const res = await fetch(
        \`/api/tracks/\${trackId}/phases/\${phaseId}/modules/\${moduleId}/lessons/\${lessonId}/video\`,
        {
          method: "POST",
          body: formData,
        }
      );`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/InstructorTrackManager.tsx', content);
console.log('Fixed');
