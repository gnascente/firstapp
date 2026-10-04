const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf-8');

// The issue is inside the processMultipleMedia method for video/ type handling
// Specifically:
/*
        } else if (file.type.startsWith('video/')) {
            const result = await AppUtils.compressVideo(file, onProgress);
            if (result.video) {
                processedArray.push({ data: result.video, thumbnail: result.thumb, size: result.size, isVideo: true, createdAt: captureTime, updatedAt: captureTime });
            }
        }
*/
// It's not a missing resolve inside processMultipleMedia (as that method iterates using a for loop with awaits),
// but rather inside compressVideo, let's verify compressVideo
