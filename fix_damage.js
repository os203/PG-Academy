const fs = require('fs');
const content = fs.readFileSync('src/components/InstructorTrackManager.tsx', 'utf8');

const lines = content.split('\n');

const startIdx = lines.findIndex(l => l.includes('alert("An error occurred while deleting the lesson");'));
const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes('setUploadingVideoLessonId(null);')) + 2;

const replacementLines = `      alert("An error occurred while deleting the lesson");
    } finally {
      setDeletingLessonId(null);
    }
  };

  const handleLessonVideoUpload = async (
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
      );

      const data = await readJsonSafely<VideoUploadResponse>(res);

      if (!res.ok) {
        alert(data?.error || "Failed to upload lesson video");
        return;
      }

      alert("Video uploaded and converted successfully");
      await fetchCourseData();
    } catch (error) {
      console.error(error);
      alert("An error occurred while uploading the lesson video");
    } finally {
      setUploadingVideoLessonId(null);
    }
  };`.split('\n');

lines.splice(startIdx, endIdx - startIdx, ...replacementLines);

fs.writeFileSync('src/components/InstructorTrackManager.tsx', lines.join('\n'));
console.log('Fixed completely');
