import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { DatabaseSync } from "node:sqlite";

import {
  chineseBankVersion,
  englishBankVersion,
  hasGeneratedChineseBank,
  hasGeneratedEnglishBank,
  seedChineseWords,
  seedEnglishWords
} from "./banks.js";

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  const [salt, originalHash] = storedHash.split(":");
  if (!salt || !originalHash) {
    return false;
  }

  const candidateHash = scryptSync(password, salt, 64);
  const originalBuffer = Buffer.from(originalHash, "hex");

  if (candidateHash.length !== originalBuffer.length) {
    return false;
  }

  return timingSafeEqual(candidateHash, originalBuffer);
}

function createDefaultSettings(db) {
  const defaults = [
    ["site_name", "Wanglitou 快乐教育"],
    ["customer_wechat", "wanglitou-service"],
    ["wechat_payment_message", "扫码后请添加客服微信，并备注“开通VIP”。客服确认后将为你开通会员。"],
    ["wechat_qr_image", ""],
    ["guest_trial_limit", "1"],
    ["user_trial_limit", "10"],
    ["ai_guest_trial_limit", "1"],
    ["ai_user_trial_limit", "5"],
    ["vip_price_text", "联系客服微信开通 VIP"],
    ["vip_benefits", "不限次数训练、家长管理面板、联盟推广链接、优先词库扩展支持"],
    ["invite_registration_notice", "如需邀请码注册，请联系客服微信领取邀请码。"],
    ["site_notice", "当前版本为 MVP，适合快速验证产品与运营流程。"],
    ["ai_site_notice", "图片工具已接入开源生图能力，输入一句需求就能直接开始。"]
  ];

  const statement = db.prepare(`
    INSERT OR IGNORE INTO site_settings (key, value)
    VALUES (?, ?)
  `);

  defaults.forEach(([key, value]) => statement.run(key, value));
}

function seedContent(db) {
  syncEnglishContent(db);
  syncChineseContent(db);
}

function seedAdmin(db) {
  const adminEmail = process.env.WLT_ADMIN_EMAIL ?? "admin@wanglitou.local";
  const adminPassword = process.env.WLT_ADMIN_PASSWORD ?? "ChangeMe123!";
  const existingAdmin = db
    .prepare("SELECT id FROM users WHERE email = ? LIMIT 1")
    .get(adminEmail);

  if (existingAdmin) {
    return;
  }

  db.prepare(`
    INSERT INTO users (
      id, email, password_hash, display_name, role, is_vip,
      referral_code, free_trial_limit, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    randomUUID(),
    adminEmail,
    hashPassword(adminPassword),
    "Wanglitou Admin",
    "admin",
    1,
    createReferralCode(),
    999999,
    new Date().toISOString()
  );
}

export function createReferralCode() {
  return `WLT${randomBytes(4).toString("hex").toUpperCase()}`;
}

function ensureColumn(db, tableName, columnName, definition) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  if (!columns.some((column) => column.name === columnName)) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition};`);
  }
}

export function initializeDatabase(dbPath) {
  mkdirSync(dirname(dbPath), { recursive: true });

  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA foreign_keys = ON;");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      is_vip INTEGER NOT NULL DEFAULT 0,
      referral_code TEXT NOT NULL UNIQUE,
      referred_by TEXT,
      free_trial_limit INTEGER NOT NULL DEFAULT 10,
      created_at TEXT NOT NULL,
      updated_at TEXT,
      FOREIGN KEY (referred_by) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS guest_profiles (
      guest_id TEXT PRIMARY KEY,
      referral_code TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS children (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      grade TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS invite_codes (
      code TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'active',
      max_uses INTEGER NOT NULL DEFAULT 1,
      used_count INTEGER NOT NULL DEFAULT 0,
      created_by TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (created_by) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS practice_attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      guest_id TEXT,
      child_id TEXT,
      module TEXT NOT NULL,
      level TEXT,
      config_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
      FOREIGN KEY (child_id) REFERENCES children (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS practice_attempt_items (
      id TEXT PRIMARY KEY,
      attempt_id TEXT NOT NULL,
      item_order INTEGER NOT NULL,
      item_type TEXT NOT NULL,
      prompt TEXT,
      speak_text TEXT,
      answer TEXT NOT NULL,
      hint TEXT,
      extra_json TEXT,
      user_answer TEXT,
      is_correct INTEGER,
      submitted_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (attempt_id) REFERENCES practice_attempts (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS analytics_visits (
      id TEXT PRIMARY KEY,
      visit_token TEXT NOT NULL UNIQUE,
      guest_id TEXT,
      user_id TEXT,
      source_type TEXT,
      source_label TEXT,
      referrer TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      referral_code TEXT,
      landing_path TEXT,
      first_seen_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS analytics_pageviews (
      id TEXT PRIMARY KEY,
      visit_id TEXT NOT NULL,
      path TEXT NOT NULL,
      title TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (visit_id) REFERENCES analytics_visits (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS english_words (
      id TEXT PRIMARY KEY,
      level TEXT NOT NULL,
      word TEXT NOT NULL,
      hint_zh TEXT,
      hint_en TEXT,
      source TEXT NOT NULL DEFAULT 'manual',
      external_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chinese_words (
      id TEXT PRIMARY KEY,
      level TEXT NOT NULL,
      text TEXT NOT NULL,
      pinyin TEXT,
      explanation TEXT,
      source TEXT NOT NULL DEFAULT 'manual',
      external_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ai_generations (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      guest_id TEXT,
      tool_id TEXT NOT NULL,
      tool_title TEXT NOT NULL,
      provider TEXT NOT NULL,
      text_model TEXT,
      image_model TEXT,
      headline TEXT,
      request_json TEXT NOT NULL,
      response_json TEXT NOT NULL,
      image_url TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
    );
  `);

  ensureColumn(db, "practice_attempts", "session_json", "TEXT");
  ensureColumn(db, "practice_attempts", "submitted_at", "TEXT");
  ensureColumn(db, "practice_attempts", "correct_count", "INTEGER");
  ensureColumn(db, "practice_attempts", "total_count", "INTEGER");
  ensureColumn(db, "practice_attempts", "wrong_count", "INTEGER");
  ensureColumn(db, "practice_attempts", "score", "REAL");
  ensureColumn(db, "users", "vip_activated_at", "TEXT");
  ensureColumn(db, "users", "acquisition_source", "TEXT");
  ensureColumn(db, "users", "acquisition_label", "TEXT");
  ensureColumn(db, "english_words", "source", "TEXT NOT NULL DEFAULT 'manual'");
  ensureColumn(db, "english_words", "external_id", "TEXT");
  ensureColumn(db, "chinese_words", "source", "TEXT NOT NULL DEFAULT 'manual'");
  ensureColumn(db, "chinese_words", "external_id", "TEXT");

  createDefaultSettings(db);
  seedContent(db);
  seedAdmin(db);

  return db;
}

function getSetting(db, key) {
  return db.prepare("SELECT value FROM site_settings WHERE key = ? LIMIT 1").get(key)?.value ?? "";
}

function setSetting(db, key, value) {
  db.prepare(`
    INSERT INTO site_settings (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, value);
}

function syncEnglishContent(db) {
  const currentVersion = getSetting(db, "content_seed_version_english");
  const englishCount = db.prepare("SELECT COUNT(*) AS count FROM english_words").get().count;

  if (currentVersion === englishBankVersion && englishCount > 0) {
    return;
  }

  if (!hasGeneratedEnglishBank && englishCount > 0) {
    return;
  }

  const replaceAll = hasGeneratedEnglishBank && !currentVersion && englishCount <= 300;
  if (replaceAll) {
    db.prepare("DELETE FROM english_words").run();
  } else {
    db.prepare("DELETE FROM english_words WHERE source IN ('github', 'seed')").run();
  }

  if (seedEnglishWords.length > 0) {
    const insertEnglish = db.prepare(`
      INSERT INTO english_words (id, level, word, hint_zh, hint_en, source, external_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    const source = hasGeneratedEnglishBank ? "github" : "seed";
    seedEnglishWords.forEach((item) => {
      insertEnglish.run(
        randomUUID(),
        item.level,
        item.word,
        item.hintZh,
        item.hintEn,
        source,
        item.externalId ?? null,
        now
      );
    });
  }

  setSetting(db, "content_seed_version_english", englishBankVersion);
}

function syncChineseContent(db) {
  const currentVersion = getSetting(db, "content_seed_version_chinese");
  const chineseCount = db.prepare("SELECT COUNT(*) AS count FROM chinese_words").get().count;

  if (currentVersion === chineseBankVersion && chineseCount > 0) {
    return;
  }

  if (!hasGeneratedChineseBank && chineseCount > 0) {
    return;
  }

  const replaceAll = hasGeneratedChineseBank && !currentVersion && chineseCount <= 120;
  if (replaceAll) {
    db.prepare("DELETE FROM chinese_words").run();
  } else {
    db.prepare("DELETE FROM chinese_words WHERE source IN ('github', 'seed')").run();
  }

  if (seedChineseWords.length > 0) {
    const insertChinese = db.prepare(`
      INSERT INTO chinese_words (id, level, text, pinyin, explanation, source, external_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    const source = hasGeneratedChineseBank ? "github" : "seed";
    seedChineseWords.forEach((item) => {
      insertChinese.run(
        randomUUID(),
        item.level,
        item.text,
        item.pinyin,
        item.explanation,
        source,
        item.externalId ?? null,
        now
      );
    });
  }

  setSetting(db, "content_seed_version_chinese", chineseBankVersion);
}
