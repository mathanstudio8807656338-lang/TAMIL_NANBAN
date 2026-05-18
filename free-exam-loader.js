// Free Exam Loader - Automatically loads JSON files from /json-db/free-exams/
// No lesson mapping needed!

class FreeExamLoader {
    constructor() {
        this.examFolder = '/json-db/free-exams/';
        this.availableExams = [];
    }

    // Auto-detect all JSON files in free-exams folder
    async loadAvailableExams() {
        try {
            // Try to load paper1.json and paper2.json
            const possiblePapers = ['paper1.json', 'paper2.json'];
            this.availableExams = [];

            for (const paperFile of possiblePapers) {
                try {
                    const response = await fetch(`${this.examFolder}${paperFile}`);
                    if (response.ok) {
                        const examData = await response.json();
                        this.availableExams.push({
                            filename: paperFile,
                            data: examData,
                            title: examData.title,
                            paperType: examData.paper_type,
                            totalQuestions: examData.total_questions
                        });
                        console.log(`✅ Loaded: ${paperFile}`);
                    }
                } catch (err) {
                    console.log(`⏭️  Skipped: ${paperFile} (not found)`);
                }
            }

            console.log(`📋 Total exams available: ${this.availableExams.length}`);
            return this.availableExams;

        } catch (error) {
            console.error('Error loading exams:', error);
            return [];
        }
    }

    // Load a specific exam by filename
    async loadExam(filename) {
        try {
            const response = await fetch(`${this.examFolder}${filename}`);
            if (!response.ok) {
                throw new Error(`Failed to load ${filename}`);
            }
            const examData = await response.json();
            console.log(`✅ Loaded exam: ${filename}`);
            return examData;
        } catch (error) {
            console.error(`Error loading exam ${filename}:`, error);
            return null;
        }
    }

    // Get all questions from loaded exam
    getAllQuestions(examData) {
        const allQuestions = [];
        let questionNumber = 1;

        examData.sections.forEach(section => {
            section.questions.forEach(q => {
                allQuestions.push({
                    number: questionNumber++,
                    subject: section.subject,
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.answer,
                    explanation: q.explanation || '',
                    difficulty: q.difficulty || 'medium'
                });
            });
        });

        return allQuestions;
    }

    // Shuffle questions (optional)
    shuffleQuestions(questions) {
        const shuffled = [...questions];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

// Export for use in other files
window.FreeExamLoader = FreeExamLoader;
