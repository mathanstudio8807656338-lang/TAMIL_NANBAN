const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

/**
 * PDF to JSON Extraction Tool for A1 LMS
 * 
 * Usage: node extract_pdf.js <input_pdf_path> <output_json_path>
 */

async function extractPdfToJson(pdfPath, outputPath) {
    try {
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdf(dataBuffer);
        
        console.log('✅ PDF Text Extracted. Processing content...');
        
        const text = data.text;
        const lessonMeta = {
            title: path.basename(pdfPath, '.pdf'),
            unit: "l1",
            grade: "7",
            term: "t1",
            subject: "social",
            code: ""
        };

        const questions = [];
        const sections = [];

        // Simple Regex for Quiz Questions (Adapt based on PDF format)
        // This looks for numbered questions with 4 options
        const questionRegex = /(\d+)\.\s+(.+?)\s+அ\)\s+(.+?)\s+ஆ\)\s+(.+?)\s+இ\)\s+(.+?)\s+ஈ\)\s+(.+?)\s+விடை:\s+(.+?)(?:\s+விளக்கம்:\s+(.+?))?(?=\n\d+\.|$)/gs;
        
        let match;
        while ((match = questionRegex.exec(text)) !== null) {
            const [_, num, q, o1, o2, o3, o4, ansText, explanation] = match;
            
            // Map Tamil option letters to indices
            const ansMap = { 'அ': 0, 'ஆ': 1, 'இ': 2, 'ஈ': 3 };
            const answerIndex = ansMap[ansText.trim()] || 0;

            questions.push({
                question: q.trim(),
                options: [o1.trim(), o2.trim(), o3.trim(), o4.trim()],
                answer: answerIndex,
                explanation: explanation ? explanation.trim() : ""
            });
        }

        // Simple section extractor (looking for bold/title like lines)
        // This is a placeholder as material extraction is highly dependent on formatting
        sections.push({
            title: "பாடக் குறிப்புகள்",
            content: "PDF-ல் இருந்து நேரடியாக எடுக்கப்பட்டது. தயவுசெய்து சரிபார்க்கவும்."
        });

        const finalJson = {
            lesson_meta: lessonMeta,
            quiz: { questions },
            material: { sections }
        };

        fs.writeFileSync(outputPath, JSON.stringify(finalJson, null, 2), 'utf8');
        console.log(`🚀 Extraction complete! saved to: ${outputPath}`);
        console.log(`📊 Found ${questions.length} questions.`);

    } catch (error) {
        console.error('❌ Error extracting PDF:', error);
    }
}

const args = process.argv.slice(2);
if (args.length < 2) {
    console.log('Usage: node extract_pdf.js <input_pdf_path> <output_json_path>');
} else {
    extractPdfToJson(args[0], args[1]);
}
