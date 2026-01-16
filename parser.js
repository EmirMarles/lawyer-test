import fs from "fs";

/* =========================
   CONFIG
========================= */

const INPUT_FILE = "questions.txt";
const OUTPUT_FILE = "questions.json";

/* =========================
   CATEGORY LIST
========================= */

const CATEGORY_LIST = [
    "Уголовный кодекс",
    "Уголовно – процессуальный кодекс Кыргызской Республики",
    "Кодекс Кыргызской Республики о правонарушениях",
    "Уголовно – исполнительный кодекс Кыргызской Республики и Закон Кыргызской Республики «О пробации»",
    "Административно – процессуальный кодекс Кыргызской Республики",
    "Гражданский кодекс Кыргызской Республики",
    "Гражданский процессуальный кодекс Кыргызской Республики",
    "Семейный кодекс Кыргызской Республики",
    "Трудовой кодекс Кыргызской Республики",
    "Жилищный кодекс Кыргызской Республики",
    "Кодекс Кыргызской Республики о детях",
    "Кодекс Кыргызской Республики о неналоговых доходах",
    "Закон Кыргызской Республики «Об Адвокатуре Кыргызской Республики и адвокатской деятельности»",
    "Закон Кыргызской Республики «О гарантированной государством юридической помощи»",
    "Закон Кыргызской Республики «О статусе судебных исполнителей и исполнительном производстве»",
    "Закон Кыргызской Республики «О медиации»",
    "Закон Кыргызской Республики «О залоге»",
    "Закон Кыргызской Республики «О некоммерческих организациях»",
    "Закон Кыргызской Республики «О противодействии финансированию террористической деятельности и легализации (отмыванию) преступных доходов»",
    "Закон Кыргызской Республики «О хозяйственных товариществах и обществах»",
    "Закон Кыргызской Республики «Об актах гражданского состояния»",
    "Закон Кыргызской Республики «О порядке рассмотрения обращений граждан»",
    "Закон Кыргызской Республики «О лицензионно – разрешительной системе в Кыргызской Республике»",
    "Закон Кыргызской Республики «О государственной регистрации прав на недвижимое имущество и сделок с ним»",
    "Закон Кыргызской Республики «О нотариате»",
    "Международное право",
    "Положение о порядке гос. регистрации юридических лиц, филиалов (представительств)",
    "Закон Кыргызской Республики «Об основах административной деятельности и административных процедурах»"
];

/* =========================
   HELPERS
========================= */

function normalize(text) {
    return text
        .replace(/\s+/g, " ")
        .replace(/[–—]/g, "-")
        .trim()
        .toLowerCase();
}

const NORMALIZED_CATEGORIES = CATEGORY_LIST.map(c => ({
    original: c,
    normalized: normalize(c)
}));

function isQuestionStart(line) {
    return /^\d+\./.test(line);
}

function isOptionStart(line) {
    return line.startsWith("-") || line.startsWith("+");
}

/* =========================
   PARSER
========================= */

const rawText = fs.readFileSync(INPUT_FILE, "utf-8");

const lines = rawText
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

const questions = [];

let currentCategory = null;
let lastKnownCategory = null;
let categoryBuffer = "";

let currentQuestion = null;
let currentOption = null;

let globalQuestionId = 1;

/* =========================
   MAIN LOOP
========================= */

for (const line of lines) {

    /* ---------- CATEGORY DETECTION (MULTI-LINE) ---------- */
    categoryBuffer = categoryBuffer
        ? categoryBuffer + " " + line
        : line;

    const normalizedBuffer = normalize(categoryBuffer);

    let matchedCategory = NORMALIZED_CATEGORIES.find(c =>
        c.normalized.startsWith(normalizedBuffer) || normalizedBuffer.startsWith(c.normalized)
    );

    if (matchedCategory) {
        // If the buffer fully matches the normalized category, commit it
        if (normalizedBuffer === matchedCategory.normalized) {
            currentCategory = matchedCategory.original;
            lastKnownCategory = currentCategory;
            categoryBuffer = "";
            continue;
        }
        // else, keep accumulating lines until full match
        continue;
    }

    if (isQuestionStart(line)) {
        categoryBuffer = "";
    }

    /* ---------- NEW QUESTION ---------- */
    if (isQuestionStart(line)) {

        if (currentQuestion) {
            questions.push(currentQuestion);
        }

        currentQuestion = {
            questionId: globalQuestionId++,
            questionText: line.replace(/^\d+\.\s*/, ""),
            options: [],
            correctAnswer: "",
            correctAnswerIndex: -1,
            category: currentCategory || lastKnownCategory || "UNCLASSIFIED",
            language: "ru"
        };

        currentOption = null;
        continue;
    }

    /* ---------- NEW OPTION ---------- */
    if (isOptionStart(line)) {

        const isCorrect = line.startsWith("+");

        const optionText = line
            .replace(/^[-+]\s*/, "")
            .replace(/;$/, "")
            .trim();

        currentOption = {
            text: optionText,
            isCorrect
        };

        currentQuestion.options.push(optionText);

        if (isCorrect) {
            currentQuestion.correctAnswer = optionText;
            currentQuestion.correctAnswerIndex =
                currentQuestion.options.length - 1;
        }

        continue;
    }

    /* ---------- MULTI-LINE OPTION CONTINUATION ---------- */
    if (currentOption && !isQuestionStart(line)) {
        currentOption.text += " " + line;

        const lastIndex = currentQuestion.options.length - 1;
        currentQuestion.options[lastIndex] = currentOption.text;

        if (currentOption.isCorrect) {
            currentQuestion.correctAnswer = currentOption.text;
        }

        continue;
    }

    /* ---------- MULTI-LINE QUESTION CONTINUATION ---------- */
    if (currentQuestion) {
        currentQuestion.questionText += " " + line;
    }
}

/* push last question */
if (currentQuestion) {
    questions.push(currentQuestion);
}

/* =========================
   VALIDATION & CLEANUP
========================= */

const validQuestions = questions.filter(q => {
    if (!q.category) {
        q.category = "UNCLASSIFIED";
    }

    if (q.correctAnswerIndex === -1) {
        console.warn("⚠️ No correct answer:", q.questionId);
        return false;
    }

    if (q.options.length === 0) {
        console.warn("⚠️ No options:", q.questionId);
        return false;
    }

    return true;
});

/* =========================
   OUTPUT
========================= */

fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(validQuestions, null, 2),
    "utf-8"
);

console.log("✅ Parsed questions:", validQuestions.length);
