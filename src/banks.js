import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  seedChineseWords as legacyChineseWords,
  seedEnglishWords as legacyEnglishWords
} from "./content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadBank(fileName, fallbackItems) {
  const filePath = join(__dirname, "data", fileName);
  if (!existsSync(filePath)) {
    return {
      version: "legacy",
      items: fallbackItems
    };
  }

  try {
    const payload = JSON.parse(readFileSync(filePath, "utf8"));
    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      throw new Error("empty bank");
    }

    return {
      version: String(payload.version ?? "generated"),
      items: payload.items
    };
  } catch {
    return {
      version: "legacy",
      items: fallbackItems
    };
  }
}

const englishBank = loadBank("english-github-bank.json", legacyEnglishWords);
const chineseBank = loadBank("chinese-github-bank.json", legacyChineseWords);

export const englishBankVersion = englishBank.version;
export const chineseBankVersion = chineseBank.version;
export const hasGeneratedEnglishBank = englishBank.version !== "legacy";
export const hasGeneratedChineseBank = chineseBank.version !== "legacy";

export const seedEnglishWords = englishBank.items;
export const seedChineseWords = chineseBank.items;
