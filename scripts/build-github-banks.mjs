import { spawn } from "node:child_process";
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = dirname(__dirname);
const outputDir = join(projectRoot, "src", "data");
const version = "github-2026-04-04-v3";

const paths = {
  dwyl: "/tmp/wlt-dwyl-english-words/words_alpha.txt",
  oxford: "/tmp/wlt-the-oxford-3000/The_Oxford_3000.txt",
  chineseCi: "/tmp/wlt-pwxcoo-chinese-xinhua/data/ci.csv",
  chineseWord: "/tmp/wlt-pwxcoo-chinese-xinhua/data/word.json",
  chineseFreqZip:
    "/tmp/wlt-chinese-mandarin-freq/Chinese Word Frequencies/Chinese Word Frequencies.tab.zip"
};

const englishLevelSpecs = [
  { id: "starter", target: 220, minScore: 2, maxScore: 4, allowDwyl: false },
  { id: "grade1", target: 240, minScore: 4, maxScore: 5, allowDwyl: false },
  { id: "grade2", target: 260, minScore: 5, maxScore: 6, allowDwyl: false },
  { id: "grade3", target: 280, minScore: 6, maxScore: 7, allowDwyl: false },
  { id: "grade4", target: 300, minScore: 7, maxScore: 8, allowDwyl: false },
  { id: "grade5", target: 320, minScore: 8, maxScore: 9, allowDwyl: false },
  { id: "grade6", target: 340, minScore: 9, maxScore: 10, allowDwyl: false },
  { id: "junior", target: 360, minScore: 10, maxScore: 11, allowDwyl: false },
  { id: "senior", target: 380, minScore: 11, maxScore: 20, allowDwyl: true },
  { id: "ket", target: 260, minScore: 4, maxScore: 6, allowDwyl: false },
  { id: "pet", target: 280, minScore: 5, maxScore: 7, allowDwyl: false },
  { id: "fce", target: 320, minScore: 7, maxScore: 9, allowDwyl: true },
  { id: "cet4", target: 340, minScore: 7, maxScore: 10, allowDwyl: true },
  { id: "cet6", target: 360, minScore: 9, maxScore: 12, allowDwyl: true },
  { id: "toefl", target: 400, minScore: 10, maxScore: 15, allowDwyl: true },
  { id: "ielts", target: 400, minScore: 10, maxScore: 15, allowDwyl: true }
];

const chineseLevelSpecs = [
  { id: "grade1", target: 220, hskMax: 1, rankMax: 800, maxLength: 2, requireHsk: false },
  { id: "grade2", target: 240, hskMax: 2, rankMax: 1600, maxLength: 2, requireHsk: false },
  { id: "grade3", target: 260, hskMax: 3, rankMax: 2800, maxLength: 3, requireHsk: false },
  { id: "grade4", target: 280, hskMax: 4, rankMax: 4500, maxLength: 3, requireHsk: false },
  { id: "grade5", target: 300, hskMax: 5, rankMax: 7000, maxLength: 4, requireHsk: false },
  { id: "grade6", target: 320, hskMax: 6, rankMax: 10000, maxLength: 4, requireHsk: false },
  { id: "junior", target: 420, hskMax: 6, rankMax: 18000, maxLength: 4, requireHsk: false }
];

const chineseFunctionWordMarkers = [
  "助词",
  "代词",
  "连词",
  "介词",
  "副词",
  "叹词",
  "语气词",
  "拟声词",
  "象声词"
];

const chineseHintStopMarkers = [
  "古时",
  "古代",
  "帝王",
  "皇帝",
  "文言",
  "方言",
  "旧时",
  "借指",
  "代称",
  "特指",
  "亦作",
  "见“",
  "同“",
  "犹",
  "书名",
  "地名"
];

const chineseSensitiveMarkers = [
  "杀",
  "死",
  "毒",
  "赌",
  "狱",
  "牢",
  "枪",
  "炮",
  "炸",
  "尸",
  "奸",
  "淫",
  "鬼",
  "墓",
  "葬",
  "凶",
  "仇",
  "谋",
  "骗"
];

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  ensurePath(paths.dwyl, "dwyl words_alpha.txt");
  ensurePath(paths.oxford, "Oxford 3000 text");
  ensurePath(paths.chineseCi, "新华词语 CSV");
  ensurePath(paths.chineseWord, "新华汉字 JSON");
  ensurePath(paths.chineseFreqZip, "Chinese Word Frequencies.tab.zip");

  const englishBank = buildEnglishBank();
  const chineseBank = await buildChineseBank();

  mkdirSync(outputDir, { recursive: true });
  writeJson(join(outputDir, "english-github-bank.json"), englishBank);
  writeJson(join(outputDir, "chinese-github-bank.json"), chineseBank);

  console.log(
    JSON.stringify(
      {
        version,
        english: englishBank.items.length,
        chinese: chineseBank.items.length
      },
      null,
      2
    )
  );
}

function ensurePath(filePath, label) {
  if (!existsSync(filePath)) {
    throw new Error(`缺少源文件: ${label} (${filePath})`);
  }
}

function buildEnglishBank() {
  const oxfordWords = readFileSync(paths.oxford, "utf8")
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map(normalizeEnglishWord)
    .filter(Boolean);
  const oxfordSet = new Set(oxfordWords);

  const dwylWords = readFileSync(paths.dwyl, "utf8")
    .split(/\r?\n/)
    .map(normalizeEnglishWord)
    .filter((word) => word && !oxfordSet.has(word));

  const oxfordCandidates = oxfordWords.map((word) => createEnglishCandidate(word, true));
  const dwylCandidates = dwylWords.map((word) => createEnglishCandidate(word, false));

  const items = englishLevelSpecs.flatMap((spec) =>
    buildEnglishLevelItems(spec, oxfordCandidates, dwylCandidates)
  );

  return {
    version,
    generatedAt: new Date().toISOString(),
    sources: ["dwyl/english-words", "sapbmw/The-Oxford-3000"],
    items
  };
}

function normalizeEnglishWord(word) {
  const value = String(word ?? "")
    .trim()
    .toLowerCase()
    .replace(/^\uFEFF/, "");
  if (!/^[a-z]+(?:-[a-z]+)?$/.test(value)) {
    return "";
  }
  if (value.length < 2 || value.length > 18) {
    return "";
  }
  return value;
}

function createEnglishCandidate(word, isOxford) {
  const cleanWord = word.replace(/-/g, "");
  const rareLetters = (cleanWord.match(/[jqxzvk]/g) ?? []).length;
  const academicBonus = /(tion|sion|ment|ture|ology|ence|ance|ism|ist|ity|ous|ive|ize|ise)$/.test(cleanWord)
    ? 2
    : 0;

  return {
    word,
    source: isOxford ? "sapbmw/The-Oxford-3000" : "dwyl/english-words",
    score: cleanWord.length + rareLetters * 1.5 + academicBonus + (isOxford ? 0 : 4)
  };
}

function buildEnglishLevelItems(spec, oxfordCandidates, dwylCandidates) {
  const picked = [];
  const seen = new Set();

  pickEnglishCandidates(picked, seen, oxfordCandidates, spec.minScore, spec.maxScore, spec.target);
  pickEnglishCandidates(
    picked,
    seen,
    oxfordCandidates,
    spec.minScore - 1,
    spec.maxScore + 1,
    spec.target
  );

  if (spec.allowDwyl) {
    pickEnglishCandidates(picked, seen, dwylCandidates, spec.minScore, spec.maxScore + 2, spec.target);
  }

  if (picked.length < spec.target) {
    pickEnglishCandidates(picked, seen, oxfordCandidates, 0, 99, spec.target);
  }

  if (picked.length < spec.target && spec.allowDwyl) {
    pickEnglishCandidates(picked, seen, dwylCandidates, 0, 99, spec.target);
  }

  return picked.slice(0, spec.target).map((candidate) => {
    const letterCount = candidate.word.replace(/-/g, "").length;
    return {
      externalId: `${spec.id}:${candidate.word}`,
      level: spec.id,
      word: candidate.word,
      hintZh: `${letterCount} 个字母`,
      hintEn: `${letterCount} letters`,
      githubSource: candidate.source
    };
  });
}

function pickEnglishCandidates(target, seen, candidates, minScore, maxScore, desiredCount) {
  candidates
    .filter((candidate) => candidate.score >= minScore && candidate.score <= maxScore)
    .sort((left, right) => left.score - right.score || left.word.localeCompare(right.word))
    .forEach((candidate) => {
      if (target.length >= desiredCount || seen.has(candidate.word)) {
        return;
      }
      seen.add(candidate.word);
      target.push(candidate);
    });
}

async function buildChineseBank() {
  const ciMap = loadChineseCiMap();
  const chineseCharacterMap = loadChineseCharacterMap();
  const frequencyMap = await loadChineseFrequencyMap();

  const candidates = [...ciMap.entries()]
    .map(([text, explanation]) => createChineseCandidate(text, explanation, frequencyMap))
    .filter(Boolean)
    .sort(compareChineseCandidates);

  const items = chineseLevelSpecs.flatMap((spec) => {
    const selected = [];
    const seen = new Set();

    for (const candidate of candidates) {
      if (selected.length >= spec.target) {
        break;
      }

      if (!isChineseCandidateEligible(candidate, spec) || seen.has(candidate.text)) {
        continue;
      }

      seen.add(candidate.text);
      selected.push(candidate);
    }

    return selected.map((candidate) => ({
      externalId: `${spec.id}:${candidate.text}`,
      level: spec.id,
      text: candidate.text,
      pinyin: buildChinesePinyin(candidate.text, chineseCharacterMap),
      explanation: buildChineseHint(candidate),
      githubSource: "zk25796/pwxcoo-chinese-xinhua + lxs602/Chinese-Mandarin-Dictionaries"
    }));
  });

  return {
    version,
    generatedAt: new Date().toISOString(),
    sources: [
      "zk25796/pwxcoo-chinese-xinhua",
      "lxs602/Chinese-Mandarin-Dictionaries"
    ],
    items
  };
}

function loadChineseCiMap() {
  const lines = readFileSync(paths.chineseCi, "utf8").split(/\r?\n/);
  const map = new Map();

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return;
    }

    const separatorIndex = trimmed.indexOf(",");
    if (separatorIndex <= 0) {
      return;
    }

    const text = trimmed.slice(0, separatorIndex).trim();
    const explanation = normalizeChineseExplanation(trimmed.slice(separatorIndex + 1));

    if (!/^[\u4e00-\u9fff]{2,4}$/.test(text) || !explanation || map.has(text)) {
      return;
    }

    map.set(text, explanation);
  });

  return map;
}

function loadChineseCharacterMap() {
  const map = new Map();
  const entries = JSON.parse(readFileSync(paths.chineseWord, "utf8"));

  entries.forEach((entry) => {
    const text = String(entry.word ?? "").trim();
    if (!/^[\u4e00-\u9fff]$/.test(text)) {
      return;
    }

    map.set(text, {
      pinyin: normalizeShortChineseText(entry.pinyin),
      explanation: normalizeChineseExplanation(entry.explanation)
    });
  });

  return map;
}

async function loadChineseFrequencyMap() {
  const frequencyMap = new Map();
  const unzip = spawn("unzip", ["-p", paths.chineseFreqZip], {
    stdio: ["ignore", "pipe", "inherit"]
  });
  const lineReader = readline.createInterface({
    input: unzip.stdout,
    crlfDelay: Infinity
  });

  for await (const line of lineReader) {
    const separatorIndex = line.indexOf("\t");
    if (separatorIndex <= 0) {
      continue;
    }

    const text = line.slice(0, separatorIndex).trim();
    if (!/^[\u4e00-\u9fff]{1,4}$/.test(text)) {
      continue;
    }

    const html = line.slice(separatorIndex + 1);
    const info = extractChineseFrequencyInfo(html);
    if (info.hsk === null && info.bestRank === null) {
      continue;
    }

    frequencyMap.set(text, info);
  }

  await new Promise((resolve, reject) => {
    unzip.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`无法解析词频 ZIP，退出码 ${code}`));
    });
    unzip.on("error", reject);
  });

  return frequencyMap;
}

function extractChineseFrequencyInfo(html) {
  const hsk = extractInteger(html, /HSK \(2012\):<\/b>[^]*?<td[^>]*>([^<]+)/i);
  const movieRank = extractInteger(html, /<b>Movies <\/b>[^]*?Word freq\.: <\/td><td[^>]*>([^<]+)/i);
  const bookRank = extractInteger(html, /Word freq\. \(Books\): <\/td><td[^>]*>([^<]+)/i);
  const mixedRank = extractInteger(html, /Word freq\. \(Mixed print\): <\/td><td[^>]*>([^<]+)/i);
  const internetRank = extractInteger(html, /Word freq\. \(Internet\): <\/td><td[^>]*>([^<]+)/i);
  const newsRank = extractInteger(html, /Word freq\. \(Newswire\): <\/td><td[^>]*>([^<]+)/i);
  const ranks = [movieRank, bookRank, mixedRank, internetRank, newsRank].filter(Number.isFinite);

  return {
    hsk,
    bestRank: ranks.length > 0 ? Math.min(...ranks) : null
  };
}

function extractInteger(text, pattern) {
  const match = text.match(pattern);
  if (!match) {
    return null;
  }

  const numeric = String(match[1]).replace(/[^\d]/g, "");
  if (!numeric) {
    return null;
  }

  return Number(numeric);
}

function createChineseCandidate(text, explanation, frequencyMap) {
  if (!/^[\u4e00-\u9fff]{2,4}$/.test(text)) {
    return null;
  }

  if (chineseFunctionWordMarkers.some((marker) => explanation.includes(marker))) {
    return null;
  }

  if (
    chineseSensitiveMarkers.some(
      (marker) => text.includes(marker) || explanation.includes(marker)
    )
  ) {
    return null;
  }

  const frequency = frequencyMap.get(text);
  if (!frequency) {
    return null;
  }

  if (frequency.bestRank === null && frequency.hsk === null) {
    return null;
  }

  return {
    text,
    explanation,
    hsk: frequency.hsk,
    bestRank: frequency.bestRank
  };
}

function buildChinesePinyin(text, chineseCharacterMap) {
  const parts = [...text].map((character) => {
    const raw = chineseCharacterMap.get(character)?.pinyin ?? "";
    const primary = raw
      .split(/[\/,; ]+/)
      .map((item) => item.trim())
      .find(Boolean);
    return primary ?? "";
  });

  return parts.every(Boolean) ? parts.join(" ") : "";
}

function compareChineseCandidates(left, right) {
  const leftHsk = left.hsk ?? 99;
  const rightHsk = right.hsk ?? 99;
  const leftRank = left.bestRank ?? Number.MAX_SAFE_INTEGER;
  const rightRank = right.bestRank ?? Number.MAX_SAFE_INTEGER;
  return leftHsk - rightHsk || leftRank - rightRank || left.text.length - right.text.length || left.text.localeCompare(right.text, "zh-CN");
}

function isChineseCandidateEligible(candidate, spec) {
  if (candidate.text.length > spec.maxLength) {
    return false;
  }

  if (spec.requireHsk) {
    return candidate.hsk !== null && candidate.hsk <= spec.hskMax;
  }

  if (candidate.hsk !== null) {
    return candidate.hsk <= spec.hskMax;
  }

  return candidate.bestRank !== null && candidate.bestRank <= spec.rankMax;
}

function normalizeChineseExplanation(value) {
  return String(value ?? "")
    .replace(/^"+|"+$/g, "")
    .replace(/""/g, '"')
    .replace(/\s+/g, " ")
    .replace(/^(\d+\.)+/, "")
    .trim();
}

function normalizeShortChineseText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeChineseHint(explanation) {
  const primary = String(explanation ?? "")
    .split(/[。；]/)[0]
    .replace(/^①/, "")
    .trim();

  if (!primary) {
    return "";
  }

  if (chineseHintStopMarkers.some((marker) => primary.includes(marker))) {
    return "";
  }

  if (primary.length > 36) {
    return `${primary.slice(0, 34)}...`;
  }

  return primary;
}

function buildChineseHint(candidate) {
  const safeHint = sanitizeChineseHint(candidate.explanation);
  if (safeHint) {
    return safeHint;
  }

  if (candidate.hsk !== null) {
    return `HSK ${candidate.hsk} 高频词`;
  }

  return "高频词语";
}

function writeJson(filePath, payload) {
  writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}
