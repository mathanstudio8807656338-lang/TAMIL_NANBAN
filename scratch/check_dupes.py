import json
import os

base_path = r'c:\Users\MATHAN\.gemini\antigravity\A1CoachingCentre\json-db\lessons\revision\all'
subjects = ['psy', 'tam', 'eng', 'mat', 'sci', 'soc']
revision_nums = [1, 2, 3, 4, 5]

all_questions = {} # subject -> [(question_text, file_name)]

for sub in subjects:
    all_questions[sub] = []
    for num in revision_nums:
        file_name = f'rev_{num}_{sub}.json'
        full_path = os.path.join(base_path, file_name)
        if os.path.exists(full_path):
            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    questions = data.get('quiz', {}).get('questions', [])
                    for q in questions:
                        q_text = q.get('question', '').strip()
                        all_questions[sub].append((q_text, file_name))
            except Exception as e:
                print(f"Error reading {file_name}: {e}")

# Check for duplicates per subject
for sub in subjects:
    seen = {} # q_text -> count
    duplicates = []
    for q_text, file_name in all_questions[sub]:
        if q_text in seen:
            duplicates.append((q_text, file_name, seen[q_text]))
        seen[q_text] = file_name
    
    if duplicates:
        print(f"\nDuplicates in {sub}:")
        for q, f1, f2 in duplicates:
            print(f" - '{q}' found in {f1} and {f2}")
    else:
        print(f"No duplicates in {sub}")
