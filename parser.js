import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mammoth from "mammoth";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* =========================
   CONFIG
========================= */

const INPUT_TXT = path.join(__dirname, "questions.txt");
const INPUT_DOCX = path.join(__dirname, "вопросы с вариантами ответов на рус..docx");
const OUTPUT_JSON = path.join(__dirname, "questions.json");
const OUTPUT_JUDGE_JS = path.join(__dirname, "judge-questions.js");

/* =========================
   CATEGORY LIST
========================= */

const CATEGORY_LIST = [
    "Конституционное право",
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

/** Strip HTML tags and decode entities; return plain text. */
function stripHtml(html) {
    if (!html || typeof html !== "string") return "";
    return html
        .replace(/<strong\b[^>]*>|<\/strong>|<b\b[^>]*>|<\/b>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .trim();
}

/** Check if paragraph HTML contains bold (correct answer). Word can output bold as <b>/<strong>, or as style/class. */
function hasBold(html) {
    if (!html || typeof html !== "string") return false;
    // Standard tags
    if (/<strong\b[^>]*>|<\/strong>|<b\b[^>]*>|<\/b>/i.test(html)) return true;
    // Word sometimes uses inline style or span with font-weight
    if (/font-weight\s*:\s*(?:bold|[67]00)/i.test(html)) return true;
    if (/<span[^>]*style="[^"]*font-weight\s*:\s*bold/i.test(html)) return true;
    // Run/paragraph styles that mammoth might output as class="...bold..." etc.
    if (/class="[^"]*bold[^"]*"/i.test(html)) return true;
    if (/class="[^"]*Strong[^"]*"/i.test(html)) return true;
    return false;
}

/** Extract plain text of the first bold run in HTML (for per-option correct detection). */
function extractBoldText(html) {
    if (!html || typeof html !== "string") return "";
    const strongMatch = html.match(/<(?:strong|b)\b[^>]*>([\s\S]*?)<\/(?:strong|b)>/i);
    if (strongMatch) return stripHtml(strongMatch[1]).trim();
    // Inline style bold: <span style="...font-weight: bold...">...</span>
    const spanMatch = html.match(/<span[^>]*style="[^"]*font-weight\s*:\s*bold[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
    if (spanMatch) return stripHtml(spanMatch[1]).trim();
    return "";
}

/** Parse docx via mammoth: get array of { text, isCorrect } lines from paragraphs, list items, and table cells (in document order). */
async function parseDocxToLines(docxPath) {
    const result = await mammoth.convertToHtml({ path: docxPath });
    const html = result.value;
    const lines = [];
    const blockRegex = /<(p|li|td)[^>]*>([\s\S]*?)<\/\1>/gi;
    let m;
    while ((m = blockRegex.exec(html)) !== null) {
        const inner = m[2];
        const isCorrect = hasBold(inner);
        const text = stripHtml(inner)
            .replace(/^[-+]\s*/, "")
            .replace(/;\s*$/, "")
            .trim();
        if (!text) continue;
        // One block can contain multiple options (e.g. "а) ... б) ... в) ... г) ...") with only one bold. Split into separate lines and mark which is correct.
        const boldText = isCorrect ? extractBoldText(inner) : "";
        const hasMultipleOptions = text.includes(" \u0432) ") || text.includes(" \u0433) ");
        if (isCorrect && boldText && hasMultipleOptions) {
            const opts = splitParagraphIntoOptions(text);
            for (const opt of opts) {
                const match = normalizeOptionForMatch(opt).includes(normalizeOptionForMatch(boldText)) ||
                    normalizeOptionForMatch(boldText).includes(normalizeOptionForMatch(opt));
                lines.push({ text: opt, isCorrect: match });
            }
        } else {
            lines.push({ text, isCorrect });
        }
    }
    return lines;
}

function normalizeOptionForMatch(s) {
    return s.replace(/\s+/g, " ").trim().toLowerCase();
}

/** Split a paragraph that contains " а) ... б) ... в) ... г) ..." into separate option strings. */
function splitParagraphIntoOptions(text) {
    const CYRILLIC_A = "\u0430", CYRILLIC_B = "\u0431", CYRILLIC_V = "\u0432", CYRILLIC_G = "\u0433";
    const sepA = ` ${CYRILLIC_A}) `, sepB = ` ${CYRILLIC_B}) `, sepV = ` ${CYRILLIC_V}) `, sepG = ` ${CYRILLIC_G}) `;
    const opts = [];
    // Split by each option marker; keep delimiter with the following text (escape ) for regex)
    const re = new RegExp(`( ${CYRILLIC_A}\\) | ${CYRILLIC_B}\\) | ${CYRILLIC_V}\\) | ${CYRILLIC_G}\\) )`, "g");
    const parts = text.split(re).filter(Boolean);
    let i = 0;
    while (i < parts.length) {
        const token = parts[i];
        const next = parts[i + 1] || "";
        if (token === sepA || token === sepB || token === sepV || token === sepG) {
            const letter = token.trim().charAt(0);
            opts.push(letter + ") " + next.trim());
            i += 2;
        } else {
            i++;
        }
    }
    return opts.filter(o => o.length > 2);
}

/** Run the same state machine on an array of lines. For txt, line is string; for docx, line is { text, isCorrect }. */
function runParser(lines, options = {}) {
    const isDocx = options.fromDocx === true;
    const questions = [];
    let currentCategory = null;
    let lastKnownCategory = null;
    let categoryBuffer = "";
    let currentQuestion = null;
    let currentOption = null;
    let globalQuestionId = 1;

    for (const raw of lines) {
        const line = isDocx ? raw.text : raw;
        const lineIsCorrect = isDocx ? raw.isCorrect : false;

        /* ---------- CATEGORY DETECTION (MULTI-LINE) ---------- */
        categoryBuffer = categoryBuffer ? categoryBuffer + " " + line : line;
        const normalizedBuffer = normalize(categoryBuffer);
        const matchedCategory = NORMALIZED_CATEGORIES.find(c =>
            c.normalized.startsWith(normalizedBuffer) || normalizedBuffer.startsWith(c.normalized)
        );

        if (matchedCategory) {
            if (normalizedBuffer === matchedCategory.normalized) {
                currentCategory = matchedCategory.original;
                lastKnownCategory = currentCategory;
                categoryBuffer = "";
            }
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

        /* ---------- NEW OPTION (txt: -/+ or docx: any non-question line when we're in a question) ---------- */
        const treatAsOptionTxt = currentQuestion && (isOptionStart(line) || (currentQuestion.options.length > 0 && !/^\d+\./.test(line)));
        const treatAsOptionDocx = currentQuestion && !isQuestionStart(line) && (currentQuestion.options.length > 0 || line.match(/^[-–—]/) || currentQuestion.questionText.length > 0);

        if (isDocx) {
            if (currentQuestion && !isQuestionStart(line)) {
                const optionText = line.replace(/^[-–—]\s*/, "").replace(/;\s*$/, "").trim();
                if (!optionText) continue;
                const isFirstOption = currentQuestion.options.length === 0;
                const looksLikeOption = /^[-–—]/.test(line) || lineIsCorrect;
                if (isFirstOption && !looksLikeOption) {
                    currentQuestion.questionText += " " + optionText;
                } else {
                    currentQuestion.options.push(optionText);
                    if (lineIsCorrect) {
                        currentQuestion.correctAnswer = optionText;
                        currentQuestion.correctAnswerIndex = currentQuestion.options.length - 1;
                    }
                }
                continue;
            }
        } else {
            if (isOptionStart(line)) {
                const isCorrect = line.startsWith("+");
                const optionText = line.replace(/^[-+]\s*/, "").replace(/;$/, "").trim();
                currentOption = { text: optionText, isCorrect };
                currentQuestion.options.push(optionText);
                if (isCorrect) {
                    currentQuestion.correctAnswer = optionText;
                    currentQuestion.correctAnswerIndex = currentQuestion.options.length - 1;
                }
                continue;
            }
        }

        /* ---------- MULTI-LINE OPTION CONTINUATION (txt only) ---------- */
        if (!isDocx && currentOption && !isQuestionStart(line)) {
            currentOption.text += " " + line;
            const lastIndex = currentQuestion.options.length - 1;
            currentQuestion.options[lastIndex] = currentOption.text;
            if (currentOption.isCorrect) {
                currentQuestion.correctAnswer = currentOption.text;
            }
            continue;
        }

        /* ---------- MULTI-LINE QUESTION CONTINUATION ---------- */
        if (currentQuestion && !isDocx && currentQuestion.options.length === 0) {
            currentQuestion.questionText += " " + line;
        }
    }

    if (currentQuestion) {
        questions.push(currentQuestion);
    }
    return questions;
}

/* =========================
   EXTRACT INLINE OPTIONS (а) б) from questionText)
========================= */

const CYRILLIC_A = "\u0430"; // а
const CYRILLIC_B = "\u0431"; // б
const CYRILLIC_V = "\u0432"; // в
const CYRILLIC_G = "\u0433"; // г

const SEP_V = ` ${CYRILLIC_V}) `; // " в) "
const SEP_G = ` ${CYRILLIC_G}) `; // " г) "

/** Split options that have " б) ... в) ..." or " в) ... г) ..." merged in one string (same paragraph in Word). */
function splitMergedOptions(q) {
    const newOptions = [];
    for (const opt of q.options) {
        if (opt.includes(SEP_V)) {
            const parts = opt.split(SEP_V);
            newOptions.push(parts[0].trim());
            for (let i = 1; i < parts.length; i++) {
                const segment = parts[i].trim();
                if (segment.includes(SEP_G)) {
                    const subParts = segment.split(SEP_G);
                    newOptions.push(`${CYRILLIC_V}) ${subParts[0].trim()}`);
                    newOptions.push(`${CYRILLIC_G}) ${subParts[1].trim()}`);
                } else {
                    newOptions.push(`${CYRILLIC_V}) ${segment}`);
                }
            }
        } else if (opt.includes(SEP_G) && !opt.startsWith(`${CYRILLIC_G})`)) {
            const parts = opt.split(SEP_G);
            newOptions.push(parts[0].trim());
            newOptions.push(`${CYRILLIC_G}) ${parts[1].trim()}`);
        } else {
            newOptions.push(opt);
        }
    }
    q.options = newOptions;
    q.correctAnswerIndex = q.correctAnswer != null ? q.options.indexOf(q.correctAnswer) : 0;
}

function applySplitMergedOptions(questions) {
    questions.forEach(splitMergedOptions);
}

/** Move " а) ..." and " б) ..." from questionText into options array. */
function extractInlineOptions(q) {
    const text = q.questionText;
    const sepA = ` ${CYRILLIC_A}) `;
    const sepB = ` ${CYRILLIC_B}) `;
    if (!text.includes(sepA)) return;

    const idxA = text.indexOf(sepA);
    const mainQuestion = text.slice(0, idxA).trim();
    const afterA = text.slice(idxA + sepA.length);

    let optionAText = "";
    let optionBText = "";
    if (afterA.includes(sepB)) {
        const idxB = afterA.indexOf(sepB);
        optionAText = `${CYRILLIC_A}) ${afterA.slice(0, idxB).trim()}`;
        optionBText = `${CYRILLIC_B}) ${afterA.slice(idxB + sepB.length).trim()}`;
    } else {
        optionAText = `${CYRILLIC_A}) ${afterA.trim()}`;
    }

    const prepended = optionBText ? [optionAText, optionBText] : [optionAText];
    q.questionText = mainQuestion;
    q.options = prepended.concat(q.options);
    const newIndex = q.correctAnswer ? q.options.indexOf(q.correctAnswer) : -1;
    q.correctAnswerIndex = newIndex >= 0 ? newIndex : q.correctAnswerIndex + prepended.length;
}

function applyInlineOptionsExtraction(questions) {
    questions.forEach(extractInlineOptions);
}

/* =========================
   VALIDATION
========================= */

/**
 * WHY SO MANY "No correct answer"?
 * The parser detects the correct answer ONLY by BOLD text in the Word file (mammoth → <strong>/<b>).
 * Questions have no answer when:
 * - That section of the doc uses a different marker (underline, highlight, italic, or answer key at the end)
 * - Word uses a "bold" style that mammoth doesn't map to <b>/<strong>
 * - Options are in a table or other structure that mammoth converts differently
 * Use --keep-no-answer to include those questions with first option as placeholder (needsReview: true).
 */
function validateQuestions(questions, options = {}) {
    const keepNoAnswer = options.keepNoAnswer === true;
    const noAnswerIds = [];

    const valid = questions.filter(q => {
        if (!q.category) q.category = "UNCLASSIFIED";
        if (q.options.length === 0) {
            console.warn("⚠️ No options:", q.questionId);
            return false;
        }
        if (q.correctAnswerIndex === -1) {
            noAnswerIds.push(q.questionId);
            if (keepNoAnswer) {
                q.correctAnswerIndex = 0;
                q.correctAnswer = q.options[0];
                q.needsReview = true;
                return true;
            }
            const preview = q.questionText.length > 120 ? q.questionText.slice(0, 120) + "…" : q.questionText;
            console.warn("⚠️ No correct answer (id " + q.questionId + "):", preview);
            console.warn("   Options:", q.options.join(" | "));
            return false;
        }
        return true;
    });

    if (noAnswerIds.length > 0 && !keepNoAnswer) {
        console.warn("\n💡 " + noAnswerIds.length + " question(s) dropped (no bold answer in Word). Run with --keep-no-answer to include them with first option as placeholder.\n");
    } else if (noAnswerIds.length > 0 && keepNoAnswer) {
        console.log("📌 Kept " + noAnswerIds.length + " question(s) with no detected answer (needsReview: true, correctAnswerIndex: 0).");
    }
    return valid;
}

/* =========================
   MAIN
========================= */

const useDocx = process.argv.includes("--docx");
const useTxt = process.argv.includes("--txt") || !useDocx;
const keepNoAnswer = process.argv.includes("--keep-no-answer");

async function main() {
    if (useDocx && fs.existsSync(INPUT_DOCX)) {
        console.log("📄 Parsing Word document (bold = correct answer)...");
        const lines = await parseDocxToLines(INPUT_DOCX);
        const questions = runParser(lines, { fromDocx: true });
        applyInlineOptionsExtraction(questions);
        applySplitMergedOptions(questions);
        const validQuestions = validateQuestions(questions, { keepNoAnswer });
        const output = "// Judge questions parsed from Word (bold = correct answer)\n// Same structure as server/src/data/questions.json\n\nmodule.exports = " + JSON.stringify(validQuestions, null, 2) + ";\n";
        fs.writeFileSync(OUTPUT_JUDGE_JS, output, "utf-8");
        console.log("✅ Parsed judge questions:", validQuestions.length, "→", OUTPUT_JUDGE_JS);
        return;
    }

    if (useDocx && !fs.existsSync(INPUT_DOCX)) {
        console.error("❌ Word file not found:", INPUT_DOCX);
        process.exit(1);
    }

    if (useTxt && fs.existsSync(INPUT_TXT)) {
        const rawText = fs.readFileSync(INPUT_TXT, "utf-8");
        const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);
        const questions = runParser(lines, { fromDocx: false });
        const validQuestions = validateQuestions(questions);
        fs.writeFileSync(OUTPUT_JSON, JSON.stringify(validQuestions, null, 2), "utf-8");
        console.log("✅ Parsed questions:", validQuestions.length, "→", OUTPUT_JSON);
        return;
    }

    if (useTxt && !fs.existsSync(INPUT_TXT)) {
        console.error("❌ Text file not found:", INPUT_TXT);
        process.exit(1);
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
