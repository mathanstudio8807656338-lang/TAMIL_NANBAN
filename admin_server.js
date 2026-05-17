const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const port = 3000;

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'json-db/lessons/tamil/8/'));
    },
    filename: (req, file, cb) => {
        // Find next lesson number
        const files = fs.readdirSync(path.join(__dirname, 'json-db/lessons/tamil/8/'))
            .filter(f => f.startsWith('tam_8_l') && f.endsWith('.json'));
        
        let nextNum = 1;
        if (files.length > 0) {
            const nums = files.map(f => parseInt(f.match(/tam_8_l(\d+)\.json/)[1])).sort((a, b) => b - a);
            nextNum = nums[0] + 1;
        }
        
        cb(null, `tam_8_l${nextNum}.json`);
    }
});

const upload = multer({ storage: storage });

app.use(express.json());

// Serve Dashboard - Explicitly first
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin_dashboard.html'));
});

app.use(express.static(__dirname));

// Handle Upload and Sync
app.post('/upload', upload.single('lesson'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ success: false, message: 'No file uploaded.' });
    }

    const filename = req.file.filename;
    const lessonNum = filename.match(/tam_8_l(\d+)\.json/)[1];

    console.log(`✅ File saved as ${filename}`);

    // Run Build and Sync
    const command = `node build_map.js && node update_syllabus_status.js && git add . && git commit -m "Upload Grade 8 Tamil Lesson ${lessonNum}" && git push origin main`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).send({ success: false, message: error.message, logs: stderr });
        }
        
        console.log(`STDOUT: ${stdout}`);
        res.send({ 
            success: true, 
            message: `Lesson ${lessonNum} uploaded and pushed to GitHub successfully!`,
            filename: filename,
            logs: stdout
        });
    });
});

app.listen(port, () => {
    console.log(`🚀 Admin Dashboard running at http://localhost:${port}`);
});
