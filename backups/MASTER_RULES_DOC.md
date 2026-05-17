# A1 Coaching Centre - Master Rules

This document outlines the strict validation rules that all lesson and quiz content must follow before being uploaded to the production system.

## Rule 1: No Omissions or Shortcuts (முழுமையான கோப்புகள்)
Each JSON file must provide the **full content** for the lesson or quiz. The use of placeholders like `...`, `[...]`, `---`, or "Details coming soon" is strictly forbidden. 

## Rule 2: Bilingual Integrity (இருமொழித் தன்மை)
All content must be provided in both **Tamil** and **English** using the `isBilingual: true` flag and the established bilingual schema.

## Rule 3: Minimum Question Count (குறைந்தபட்சக் கேள்விகள்) 
Every lesson quiz must contain at least **15-20 questions** (minimum 10) to ensure effective student practice.

## Rule 4: Structural Compliance (கட்டமைப்பு ஒருமைப்பாடு)
Files must contain the following mandatory top-level fields:
- `isBilingual`
- `unit`
- `subject`
- `class`
- `term`
- `title`
- `material`
- `quiz`
- `credits`

## Rule 5: Correct Labeling (சரியான குறியீடுகள்)
Lesson codes must follow the format `{subject}_{class}_{term}_l{number}` (e.g., `soc_6_t1_l1`).

---
*Created and saved in Master Rules Backup on: 2026-04-14*
