import http from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes, randomUUID } from "node:crypto";

import {
  chineseLevelOptions,
  chineseLevelOrder,
  countOptions,
  cumulativePool,
  englishLevelOptions,
  englishLevelOrder,
  hintLanguageOptions,
  intervalOptions,
  mathOperationOptions,
  mathRangeOptions,
  repeatOptions
} from "./src/content.js";
import {
  buildAiImagePrompt,
  buildLocalAiResult,
  buildPromptAssist,
  getAiTool,
  listAiTools,
  normalizeAiPrompt
} from "./src/ai-tools.js";
import {
  createReferralCode,
  hashPassword,
  initializeDatabase,
  verifyPassword
} from "./src/db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = join(__dirname, "web");
const DATA_PATH = join(__dirname, "data", "wanglitou.sqlite");
const db = initializeDatabase(DATA_PATH);
const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "127.0.0.1";
const SESSION_COOKIE = "wlt_session";
const GUEST_COOKIE = "wlt_guest";
const VISIT_COOKIE = "wlt_visit";
const SESSION_TTL_DAYS = 30;

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

const DEFAULT_ADMIN_EMAIL = process.env.WLT_ADMIN_EMAIL ?? "admin@wanglitou.local";
const DEFAULT_ADMIN_PASSWORD = process.env.WLT_ADMIN_PASSWORD ?? "ChangeMe123!";
const OPENAI_BASE_URL = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
const POLLINATIONS_IMAGE_BASE_URL = (process.env.POLLINATIONS_IMAGE_BASE_URL ?? "https://image.pollinations.ai").replace(/\/$/, "");
const POLLINATIONS_TEXT_BASE_URL = (process.env.POLLINATIONS_TEXT_BASE_URL ?? "https://text.pollinations.ai").replace(/\/$/, "");
const POLLINATIONS_API_KEY = process.env.POLLINATIONS_API_KEY ?? "";
const POLLINATIONS_IMAGE_MODEL = process.env.POLLINATIONS_IMAGE_MODEL ?? "flux";
const POLLINATIONS_TEXT_MODEL = process.env.POLLINATIONS_TEXT_MODEL ?? "openai";
const AI_PROVIDER = process.env.AI_PROVIDER ?? "pollinations";
const AI_TEXT_MODEL = process.env.AI_TEXT_MODEL ?? "gpt-5.4-mini";
const AI_IMAGE_MODEL = process.env.AI_IMAGE_MODEL ?? "gpt-image-1.5";
const AI_FETCH_TIMEOUT_MS = Number(process.env.AI_FETCH_TIMEOUT_MS ?? 8000);

function nowIso() {
  return new Date().toISOString();
}

function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toUTCString();
}

function json(res, status, payload, cookies = []) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8"
  };

  if (cookies.length > 0) {
    headers["Set-Cookie"] = cookies;
  }

  res.writeHead(status, headers);
  res.end(JSON.stringify(payload));
}

function text(res, status, payload) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(payload);
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${value}`];
  parts.push(`Path=${options.path ?? "/"}`);

  if (options.httpOnly !== false) {
    parts.push("HttpOnly");
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  } else {
    parts.push("SameSite=Lax");
  }

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  if (options.expires) {
    parts.push(`Expires=${options.expires}`);
  }

  return parts.join("; ");
}

function parseCookies(cookieHeader) {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(";").reduce((accumulator, part) => {
    const [rawKey, ...rest] = part.trim().split("=");
    accumulator[rawKey] = decodeURIComponent(rest.join("="));
    return accumulator;
  }, {});
}

async function readJsonBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString("utf-8").trim();
  if (!rawBody) {
    return {};
  }

  return JSON.parse(rawBody);
}

function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeEnglishAnswer(value) {
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeChineseAnswer(value) {
  return String(value ?? "").trim().replace(/\s+/g, "");
}

function normalizeMathAnswer(value) {
  return String(value ?? "").trim();
}

function safeInteger(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return fallback;
  }

  const rounded = Math.round(number);
  return Math.min(Math.max(rounded, min), max);
}

function pickRandomItems(items, count) {
  if (items.length === 0) {
    return { items: [], reusedItems: false };
  }

  const pool = [...items];
  const picked = [];
  let reusedItems = false;

  while (picked.length < count) {
    shuffle(pool);
    for (const item of pool) {
      picked.push(item);
      if (picked.length >= count) {
        break;
      }
    }

    if (count > items.length) {
      reusedItems = true;
    }
  }

  return { items: picked.slice(0, count), reusedItems };
}

function resolveSessionMode(value) {
  return normalizeText(value) === "parent_quiz" ? "parent_quiz" : "student_input";
}

function parseCustomTerms(value, limit = 200) {
  const parts = String(value ?? "")
    .split(/[\n,，;；、]+/g)
    .map((item) => normalizeText(item))
    .filter(Boolean);

  const unique = [];
  const seen = new Set();

  for (const part of parts) {
    const key = part.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(part);
    if (unique.length >= limit) {
      break;
    }
  }

  return unique;
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
  }
}

function generateCode(length = 6) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let index = 0; index < length; index += 1) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return result;
}

function getSourceInfo(req, url) {
  const refCode = normalizeText(url.searchParams.get("ref") ?? "");
  const utmSource = normalizeText(url.searchParams.get("utm_source") ?? "");
  const utmMedium = normalizeText(url.searchParams.get("utm_medium") ?? "");
  const utmCampaign = normalizeText(url.searchParams.get("utm_campaign") ?? "");
  const referrer = normalizeText(req.headers.referer ?? req.headers.referrer ?? "");

  if (refCode) {
    return {
      sourceType: "affiliate",
      sourceLabel: refCode,
      referralCode: refCode,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign
    };
  }

  if (utmSource || utmMedium || utmCampaign) {
    return {
      sourceType: "campaign",
      sourceLabel: utmSource || utmMedium || utmCampaign || "campaign",
      referralCode: "",
      referrer,
      utmSource,
      utmMedium,
      utmCampaign
    };
  }

  if (!referrer) {
    return {
      sourceType: "direct",
      sourceLabel: "direct",
      referralCode: "",
      referrer: "",
      utmSource: "",
      utmMedium: "",
      utmCampaign: ""
    };
  }

  let referrerHost = "";
  try {
    referrerHost = new URL(referrer).hostname.toLowerCase();
  } catch {
    referrerHost = "";
  }

  const currentHost = (req.headers.host ?? "").toLowerCase();
  if (referrerHost && currentHost && referrerHost.includes(currentHost)) {
    return {
      sourceType: "internal",
      sourceLabel: "internal",
      referralCode: "",
      referrer,
      utmSource: "",
      utmMedium: "",
      utmCampaign: ""
    };
  }

  const searchHosts = ["google.", "bing.", "baidu.", "sogou.", "so.com", "yahoo."];
  if (searchHosts.some((host) => referrerHost.includes(host))) {
    return {
      sourceType: "organic_search",
      sourceLabel: referrerHost,
      referralCode: "",
      referrer,
      utmSource: "",
      utmMedium: "",
      utmCampaign: ""
    };
  }

  const socialHosts = ["x.com", "t.co", "weibo.", "zhihu.", "facebook.", "instagram.", "youtube."];
  if (socialHosts.some((host) => referrerHost.includes(host))) {
    return {
      sourceType: "social",
      sourceLabel: referrerHost,
      referralCode: "",
      referrer,
      utmSource: "",
      utmMedium: "",
      utmCampaign: ""
    };
  }

  return {
    sourceType: "referral",
    sourceLabel: referrerHost || "referral",
    referralCode: "",
    referrer,
    utmSource: "",
    utmMedium: "",
    utmCampaign: ""
  };
}

function getOrCreateVisitToken(cookies, cookiesToSet) {
  let visitToken = cookies[VISIT_COOKIE];
  if (!visitToken) {
    visitToken = `visit_${randomBytes(12).toString("hex")}`;
    cookiesToSet.push(
      serializeCookie(VISIT_COOKIE, visitToken, {
        expires: daysFromNow(365)
      })
    );
  }
  return visitToken;
}

function safeJsonParse(rawValue, fallback = {}) {
  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return fallback;
  }
}

function getSettings() {
  const rows = db.prepare("SELECT key, value FROM site_settings").all();
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

function setSettings(entries) {
  const statement = db.prepare(`
    INSERT INTO site_settings (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);

  Object.entries(entries).forEach(([key, value]) => {
    statement.run(key, String(value ?? ""));
  });
}

function findUserById(userId) {
  return db
    .prepare(`
      SELECT id, email, display_name, role, is_vip, referral_code, free_trial_limit, created_at
      FROM users
      WHERE id = ?
      LIMIT 1
    `)
    .get(userId);
}

function findUserByEmail(email) {
  return db.prepare("SELECT * FROM users WHERE email = ? LIMIT 1").get(email);
}

function findUserByReferralCode(code) {
  return db
    .prepare(`
      SELECT id, display_name, referral_code
      FROM users
      WHERE referral_code = ?
      LIMIT 1
    `)
    .get(code);
}

function publicUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    role: user.role,
    isVip: Boolean(user.is_vip),
    referralCode: user.referral_code,
    freeTrialLimit: user.free_trial_limit,
    createdAt: user.created_at
  };
}

function createSessionForUser(userId, cookiesToSet) {
  const token = randomBytes(24).toString("hex");
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86400 * 1000).toISOString();

  db.prepare(`
    INSERT INTO sessions (token, user_id, created_at, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(token, userId, createdAt, expiresAt);

  cookiesToSet.push(
    serializeCookie(SESSION_COOKIE, token, {
      expires: daysFromNow(SESSION_TTL_DAYS)
    })
  );
}

function destroySession(token) {
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

function getOrCreateGuest(cookies, cookiesToSet) {
  let guestId = cookies[GUEST_COOKIE];

  if (!guestId) {
    guestId = `guest_${randomBytes(12).toString("hex")}`;
    cookiesToSet.push(
      serializeCookie(GUEST_COOKIE, guestId, {
        expires: daysFromNow(365)
      })
    );
  }

  const existing = db
    .prepare("SELECT guest_id FROM guest_profiles WHERE guest_id = ? LIMIT 1")
    .get(guestId);

  if (!existing) {
    db.prepare(`
      INSERT INTO guest_profiles (guest_id, created_at)
      VALUES (?, ?)
    `).run(guestId, nowIso());
  }

  return guestId;
}

function getRequestContext(req) {
  const cookies = parseCookies(req.headers.cookie);
  const cookiesToSet = [];
  const guestId = getOrCreateGuest(cookies, cookiesToSet);
  const visitToken = getOrCreateVisitToken(cookies, cookiesToSet);
  const sessionToken = cookies[SESSION_COOKIE];
  let user = null;

  if (sessionToken) {
    const session = db
      .prepare(`
        SELECT
          sessions.token,
          sessions.expires_at,
          users.id,
          users.email,
          users.display_name,
          users.role,
          users.is_vip,
          users.referral_code,
          users.free_trial_limit,
          users.created_at
        FROM sessions
        JOIN users ON users.id = sessions.user_id
        WHERE sessions.token = ?
        LIMIT 1
      `)
      .get(sessionToken);

    if (session && new Date(session.expires_at).getTime() > Date.now()) {
      user = session;
    } else {
      destroySession(sessionToken);
      cookiesToSet.push(
        serializeCookie(SESSION_COOKIE, "", {
          expires: new Date(0).toUTCString()
        })
      );
    }
  }

  if (user) {
    db.prepare(`
      UPDATE analytics_visits
      SET user_id = ?, last_seen_at = ?
      WHERE visit_token = ?
    `).run(user.id, nowIso(), visitToken);
  }

  return {
    cookies,
    cookiesToSet,
    guestId,
    visitToken,
    sessionToken,
    user
  };
}

function requireAuth(context) {
  if (!context.user) {
    const error = new Error("请先登录");
    error.status = 401;
    throw error;
  }
}

function requireAdmin(context) {
  requireAuth(context);
  if (context.user.role !== "admin") {
    const error = new Error("需要管理员权限");
    error.status = 403;
    throw error;
  }
}

function getChildren(userId) {
  return db
    .prepare(`
      SELECT id, name, grade, created_at
      FROM children
      WHERE user_id = ?
      ORDER BY created_at DESC
    `)
    .all(userId);
}

function getModuleTitle(module) {
  switch (module) {
    case "english_dictation":
      return "英语听写";
    case "chinese_dictation":
      return "语文听写";
    case "math_practice":
      return "数学练习";
    default:
      return module;
  }
}

function buildAttemptItems(payload) {
  if (payload.module === "math_practice") {
    return payload.questions.map((question) => ({
      itemOrder: question.order,
      itemType: "question",
      prompt: question.prompt,
      speakText: "",
      answer: String(question.answer),
      hint: "",
      extraJson: JSON.stringify({})
    }));
  }

  return payload.items.map((item) => ({
    itemOrder: item.order,
    itemType: "dictation",
    prompt: `第 ${item.order} 题`,
    speakText: item.speakText,
    answer: String(item.answer),
    hint: item.hint ?? "",
    extraJson: JSON.stringify({
      pinyin: item.pinyin ?? null
    })
  }));
}

function getAttemptOwnershipClause(context) {
  if (context.user) {
    return {
      clause: "practice_attempts.user_id = ?",
      value: context.user.id
    };
  }

  return {
    clause: "practice_attempts.guest_id = ? AND practice_attempts.user_id IS NULL",
    value: context.guestId
  };
}

function getAttemptForContext(attemptId, context, expectedModule = null) {
  const ownership = getAttemptOwnershipClause(context);
  let query = `
    SELECT
      practice_attempts.id,
      practice_attempts.user_id,
      practice_attempts.guest_id,
      practice_attempts.child_id,
      practice_attempts.module,
      practice_attempts.level,
      practice_attempts.config_json,
      practice_attempts.session_json,
      practice_attempts.created_at,
      practice_attempts.submitted_at,
      practice_attempts.correct_count,
      practice_attempts.total_count,
      practice_attempts.wrong_count,
      practice_attempts.score
    FROM practice_attempts
    WHERE practice_attempts.id = ?
      AND ${ownership.clause}
  `;

  const params = [attemptId, ownership.value];
  if (expectedModule) {
    query += " AND practice_attempts.module = ?";
    params.push(expectedModule);
  }

  return db.prepare(query).get(...params);
}

function getAttemptItems(attemptId) {
  return db
    .prepare(`
      SELECT
        id,
        item_order,
        item_type,
        prompt,
        speak_text,
        answer,
        hint,
        extra_json,
        user_answer,
        is_correct,
        submitted_at,
        created_at
      FROM practice_attempt_items
      WHERE attempt_id = ?
      ORDER BY item_order ASC
    `)
    .all(attemptId);
}

function serializeAttemptRow(row) {
  return {
    id: row.id,
    module: row.module,
    moduleTitle: getModuleTitle(row.module),
    level: row.level,
    createdAt: row.created_at,
    submittedAt: row.submitted_at,
    correctCount: row.correct_count,
    totalCount: row.total_count,
    wrongCount: row.wrong_count,
    score: row.score,
    status: row.submitted_at ? "submitted" : "pending",
    child: row.child_id
      ? {
          id: row.child_id,
          name: row.child_name,
          grade: row.child_grade
        }
      : null,
    config: safeJsonParse(row.config_json, {}),
    sessionMeta: safeJsonParse(row.session_json, {})
  };
}

function getQuotaState(context, settings) {
  if (context.user) {
    const used = db
      .prepare("SELECT COUNT(*) AS count FROM practice_attempts WHERE user_id = ?")
      .get(context.user.id).count;
    const configuredLimit = Number(settings.user_trial_limit ?? 10);
    const effectiveLimit = context.user.is_vip ? null : context.user.free_trial_limit ?? configuredLimit;
    return {
      scope: "user",
      used,
      limit: effectiveLimit,
      remaining: effectiveLimit === null ? null : Math.max(effectiveLimit - used, 0),
      isVip: Boolean(context.user.is_vip)
    };
  }

  const used = db
    .prepare("SELECT COUNT(*) AS count FROM practice_attempts WHERE guest_id = ?")
    .get(context.guestId).count;
  const limit = Number(settings.guest_trial_limit ?? 1);
  return {
    scope: "guest",
    used,
    limit,
    remaining: Math.max(limit - used, 0),
    isVip: false
  };
}

function getAiProviderRuntime() {
  if (AI_PROVIDER === "openai" && OPENAI_API_KEY) {
    return {
      provider: "openai",
      textModel: AI_TEXT_MODEL,
      imageModel: AI_IMAGE_MODEL,
      imageEnabled: true,
      textEnabled: true,
      promptAssistEnabled: true,
      modeLabel: "OpenAI 实时生成"
    };
  }

  if (AI_PROVIDER === "mock") {
    return {
      provider: "mock",
      textModel: "local-assist",
      imageModel: null,
      imageEnabled: false,
      textEnabled: false,
      promptAssistEnabled: true,
      modeLabel: "本地演示模式"
    };
  }

  return {
    provider: "pollinations",
    textModel: POLLINATIONS_TEXT_MODEL,
    imageModel: POLLINATIONS_IMAGE_MODEL,
    imageEnabled: true,
    textEnabled: true,
    promptAssistEnabled: true,
    modeLabel: "Pollinations 开源生成"
  };
}

function getAiProviderStatus() {
  const runtime = getAiProviderRuntime();
  return {
    provider: "ready",
    textModel: null,
    imageModel: null,
    imageEnabled: runtime.imageEnabled,
    textEnabled: runtime.textEnabled,
    promptAssistEnabled: runtime.promptAssistEnabled,
    modeLabel: runtime.imageEnabled ? "图片可直接生成" : "内容可直接生成"
  };
}

function getAiQuotaState(context, settings) {
  if (context.user) {
    const used = db
      .prepare("SELECT COUNT(*) AS count FROM ai_generations WHERE user_id = ?")
      .get(context.user.id).count;
    const configuredLimit = Number(settings.ai_user_trial_limit ?? 5);
    const effectiveLimit = context.user.is_vip ? null : configuredLimit;
    return {
      scope: "user",
      used,
      limit: effectiveLimit,
      remaining: effectiveLimit === null ? null : Math.max(effectiveLimit - used, 0),
      isVip: Boolean(context.user.is_vip)
    };
  }

  const used = db
    .prepare("SELECT COUNT(*) AS count FROM ai_generations WHERE guest_id = ?")
    .get(context.guestId).count;
  const limit = Number(settings.ai_guest_trial_limit ?? 1);
  return {
    scope: "guest",
    used,
    limit,
    remaining: Math.max(limit - used, 0),
    isVip: false
  };
}

function assertAiQuotaAvailable(context, settings) {
  const quota = getAiQuotaState(context, settings);
  const limitReached = quota.limit !== null && quota.remaining <= 0;
  if (limitReached) {
    const error = new Error(
      quota.scope === "guest"
        ? "AI 免费试用已用完，请登录或开通 VIP 后继续。"
        : "AI 免费次数已用完，请联系客服开通 VIP。"
    );
    error.status = 403;
    throw error;
  }
}

function extractOpenAiResponseText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  for (const item of payload?.output ?? []) {
    if (item.type !== "message") {
      continue;
    }

    for (const content of item.content ?? []) {
      if (content.type === "output_text" && content.text) {
        return String(content.text).trim();
      }
    }
  }

  return "";
}

async function callOpenAiText(prompt, systemPrompt = "") {
  const response = await fetch(`${OPENAI_BASE_URL}/responses`, {
    method: "POST",
    signal: AbortSignal.timeout(AI_FETCH_TIMEOUT_MS),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: AI_TEXT_MODEL,
      instructions: systemPrompt || undefined,
      input: prompt
    })
  });

  const payload = await response.json();
  if (!response.ok) {
    const error = new Error(payload?.error?.message || "AI 生成失败");
    error.status = response.status;
    throw error;
  }

  const outputText = extractOpenAiResponseText(payload);
  if (!outputText) {
    throw new Error("AI 未返回可解析内容");
  }

  return outputText;
}

async function callOpenAiImage(prompt, size = "1024x1024") {
  const response = await fetch(`${OPENAI_BASE_URL}/images/generations`, {
    method: "POST",
    signal: AbortSignal.timeout(AI_FETCH_TIMEOUT_MS),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: AI_IMAGE_MODEL,
      prompt,
      size,
      output_format: "png"
    })
  });

  const payload = await response.json();
  if (!response.ok) {
    const error = new Error(payload?.error?.message || "图片生成失败");
    error.status = response.status;
    throw error;
  }

  const asset = payload?.data?.[0];
  if (asset?.b64_json) {
    return `data:image/png;base64,${asset.b64_json}`;
  }
  if (asset?.url) {
    return asset.url;
  }

  return null;
}

async function callPollinationsText(prompt, systemPrompt = "") {
  const url = new URL(`${POLLINATIONS_TEXT_BASE_URL}/${encodeURIComponent(prompt)}`);
  url.searchParams.set("model", POLLINATIONS_TEXT_MODEL);
  if (systemPrompt) {
    url.searchParams.set("system", systemPrompt);
  }
  if (POLLINATIONS_API_KEY) {
    url.searchParams.set("key", POLLINATIONS_API_KEY);
  }

  const response = await fetch(url, {
    signal: AbortSignal.timeout(AI_FETCH_TIMEOUT_MS)
  });
  const contentType = response.headers.get("content-type") ?? "";
  let rawText = "";
  if (contentType.includes("application/json")) {
    const payload = await response.json();
    rawText =
      normalizeText(payload?.text) ||
      normalizeText(payload?.output) ||
      normalizeText(payload?.response) ||
      JSON.stringify(payload);
  } else {
    rawText = await response.text();
  }

  if (!response.ok) {
    const error = new Error(rawText || "Pollinations 文本生成失败");
    error.status = response.status;
    throw error;
  }

  return rawText.trim();
}

function randomSeed() {
  return Math.floor(Math.random() * 999999999);
}

function buildPollinationsImageUrl(prompt, options = {}) {
  const width = safeInteger(options.width, 1024, 512, 2048);
  const height = safeInteger(options.height, 1024, 512, 2048);
  const seed = safeInteger(options.seed, randomSeed(), 1, 999999999);
  const model = normalizeText(options.model) || POLLINATIONS_IMAGE_MODEL;
  const basePath = `${POLLINATIONS_IMAGE_BASE_URL}/prompt/${encodeURIComponent(prompt)}`;
  const url = new URL(basePath);
  url.searchParams.set("width", String(width));
  url.searchParams.set("height", String(height));
  url.searchParams.set("seed", String(seed));
  url.searchParams.set("model", model);
  url.searchParams.set("enhance", "true");
  url.searchParams.set("safe", "true");
  if (POLLINATIONS_API_KEY) {
    url.searchParams.set("key", POLLINATIONS_API_KEY);
  }
  return url.toString();
}

function decorateAiTool(tool) {
  return {
    ...tool,
    examples: tool.examples.map((item) => ({
      ...item,
      previewUrl: buildPollinationsImageUrl(item.prompt, {
        width: tool.image?.width ?? 1024,
        height: tool.image?.height ?? 1024,
        seed: item.seed,
        model: tool.image?.model ?? POLLINATIONS_IMAGE_MODEL
      })
    }))
  };
}

async function buildRemotePromptAssist(tool, prompt) {
  const providerStatus = getAiProviderRuntime();
  const provider = providerStatus.provider;
  const assist = buildPromptAssist(tool, prompt);
  const systemPrompt =
    "你是中文提示词优化助手。请把用户输入改写成一段更完整、更可直接用于图片或内容生成的中文提示词，只输出改写后的提示词本身。";

  if (provider === "mock") {
    return {
      ...assist,
      provider: "local-assist"
    };
  }

  try {
    const suggestedPrompt =
      provider === "openai"
        ? await callOpenAiText(assist.suggestedPrompt, systemPrompt)
        : await callPollinationsText(assist.suggestedPrompt, systemPrompt);

    return {
      ...assist,
      suggestedPrompt: normalizeText(suggestedPrompt) || assist.suggestedPrompt,
      provider
    };
  } catch (_error) {
    return {
      ...assist,
      provider: "local-assist"
    };
  }
}

async function buildGeneratedBody(tool, prompt, finalPrompt) {
  if (tool.kind !== "text") {
    return buildLocalAiResult(tool, prompt, finalPrompt);
  }

  const providerStatus = getAiProviderRuntime();
  const provider = providerStatus.provider;
  const systemPrompt =
    "你是中文内容编辑。请根据用户需求直接输出可读、可发布、结构完整的成品内容，不要解释，不要使用 markdown code fence。";

  try {
    if (provider === "openai") {
      const article = await callOpenAiText(finalPrompt, systemPrompt);
      return {
        headline: `${tool.title} 已生成`,
        summary: "已按当前提示词输出文章初稿。",
        prompt: finalPrompt,
        body: article,
        bullets: ["可以直接继续编辑。", "如果有品牌案例，可以再补一段。", "结尾 CTA 建议保留。"]
      };
    }

    if (provider === "pollinations") {
      const article = await callPollinationsText(finalPrompt, systemPrompt);
      return {
        headline: `${tool.title} 已生成`,
        summary: "已按当前提示词输出文章初稿。",
        prompt: finalPrompt,
        body: article,
        bullets: ["可以直接继续编辑。", "如果有品牌案例，可以再补一段。", "结尾 CTA 建议保留。"]
      };
    }
  } catch (_error) {
    // Fall back to a local draft so the tool always remains usable.
  }

  return buildLocalAiResult(tool, prompt, finalPrompt);
}

async function generateAiResult(tool, prompt) {
  const providerStatus = getAiProviderRuntime();
  const provider = providerStatus.provider;
  const assist = await buildRemotePromptAssist(tool, prompt);
  const finalPrompt = tool.kind === "image" ? buildAiImagePrompt(tool, assist.suggestedPrompt) : assist.suggestedPrompt;
  const result = await buildGeneratedBody(tool, prompt, finalPrompt);

  let imageUrl = null;
  let imageError = null;
  if (tool.kind === "image") {
    if (provider === "openai") {
      try {
        imageUrl = await callOpenAiImage(finalPrompt);
      } catch (error) {
        imageError = error.message;
      }
    } else if (provider === "pollinations") {
      imageUrl = buildPollinationsImageUrl(finalPrompt, {
        width: tool.image?.width ?? 1024,
        height: tool.image?.height ?? 1024,
        model: tool.image?.model ?? POLLINATIONS_IMAGE_MODEL
      });
    }
  }

  return {
    provider,
    textModel: providerStatus.textModel,
    imageModel: imageUrl ? providerStatus.imageModel : null,
    imageUrl,
    imageError,
    assist,
    result
  };
}

function saveAiGeneration(context, tool, requestPayload, generation) {
  const generationId = randomUUID();
  const createdAt = nowIso();
  db.prepare(`
    INSERT INTO ai_generations (
      id, user_id, guest_id, tool_id, tool_title, provider, text_model, image_model,
      headline, request_json, response_json, image_url, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    generationId,
    context.user?.id ?? null,
    context.user ? null : context.guestId,
    tool.id,
    tool.title,
    generation.provider,
    generation.textModel,
    generation.imageModel,
    generation.result.headline,
    JSON.stringify(requestPayload),
    JSON.stringify(generation.result),
    generation.imageUrl,
    createdAt
  );

  return generationId;
}

function listAiHistoryForUser(userId, limit = 12) {
  return db
    .prepare(`
      SELECT id, tool_id, tool_title, provider, text_model, image_model, headline, image_url, created_at
      FROM ai_generations
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `)
    .all(userId, limit)
    .map((row) => ({
      id: row.id,
      toolId: row.tool_id,
      toolTitle: row.tool_title,
      provider: row.provider,
      textModel: row.text_model,
      imageModel: row.image_model,
      headline: row.headline,
      imageUrl: row.image_url,
      createdAt: row.created_at
    }));
}

function consumePracticeAttempt(context, settings, payload) {
  const quota = getQuotaState(context, settings);
  const limitReached = quota.limit !== null && quota.remaining <= 0;
  if (limitReached) {
    const error = new Error(
      quota.scope === "guest"
        ? "免费体验已用完，请登录或开通 VIP 后继续。"
        : "免费次数已用完，请联系客服开通 VIP。"
    );
    error.status = 403;
    throw error;
  }

  const attemptId = randomUUID();
  const createdAt = nowIso();
  const items = buildAttemptItems(payload);

  db.exec("BEGIN");
  try {
    db.prepare(`
      INSERT INTO practice_attempts (
        id, user_id, guest_id, child_id, module, level, config_json, session_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      attemptId,
      context.user?.id ?? null,
      context.user ? null : context.guestId,
      payload.childId ?? null,
      payload.module,
      payload.level ?? null,
      JSON.stringify(payload.config),
      JSON.stringify({
        librarySize: payload.librarySize ?? null,
        reusedItems: Boolean(payload.reusedItems),
        itemCount: items.length
      }),
      createdAt
    );

    const insertItem = db.prepare(`
      INSERT INTO practice_attempt_items (
        id, attempt_id, item_order, item_type, prompt, speak_text, answer, hint, extra_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    items.forEach((item) => {
      insertItem.run(
        randomUUID(),
        attemptId,
        item.itemOrder,
        item.itemType,
        item.prompt,
        item.speakText,
        item.answer,
        item.hint,
        item.extraJson,
        createdAt
      );
    });

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return attemptId;
}

function getBootstrapPayload(context, origin) {
  const settings = getSettings();
  const user = publicUser(context.user);
  const quota = getQuotaState(context, settings);
  const children = context.user ? getChildren(context.user.id) : [];

  return {
    user,
    children,
    quota,
    settings: {
      customerWechat: settings.customer_wechat,
      wechatPaymentMessage: settings.wechat_payment_message,
      wechatQrImage: settings.wechat_qr_image,
      vipPriceText: settings.vip_price_text,
      vipBenefits: settings.vip_benefits,
      inviteRegistrationNotice: settings.invite_registration_notice,
      siteNotice: settings.site_notice
    },
    options: {
      englishLevels: englishLevelOptions,
      chineseLevels: chineseLevelOptions,
      mathRanges: mathRangeOptions,
      mathOperations: mathOperationOptions,
      counts: countOptions,
      intervals: intervalOptions,
      repeats: repeatOptions,
      hintLanguages: hintLanguageOptions
    },
    affiliateLink: user ? `${origin}/portal.html?ref=${user.referralCode}` : null,
    authModes: [
      { id: "email", label: "邮箱注册" },
      { id: "invite", label: "邀请码注册" }
    ],
    freeRules: {
      guestLimit: Number(settings.guest_trial_limit ?? 1),
      userLimit: Number(settings.user_trial_limit ?? 10)
    }
  };
}

function getAiBootstrapPayload(context, origin) {
  const settings = getSettings();
  const user = publicUser(context.user);
  const aiSiteNotice =
    settings.ai_site_notice === "AI 工具站当前支持文本生成，配置 API Key 后可继续接入真实出图。"
      ? "图片工具已接入开源生图能力，输入一句需求就能直接开始。"
      : settings.ai_site_notice || settings.site_notice || "";

  return {
    user,
    quota: getAiQuotaState(context, settings),
    provider: getAiProviderStatus(),
    tools: listAiTools().map(decorateAiTool),
    history: context.user ? listAiHistoryForUser(context.user.id, 12) : [],
    affiliateLink: user ? `${origin}/ai-tools/?ref=${user.referralCode}` : null,
    settings: {
      customerWechat: settings.customer_wechat,
      wechatPaymentMessage: settings.wechat_payment_message,
      vipPriceText: settings.vip_price_text,
      aiSiteNotice
    },
    freeRules: {
      guestLimit: Number(settings.ai_guest_trial_limit ?? 1),
      userLimit: Number(settings.ai_user_trial_limit ?? 5)
    }
  };
}

function buildOrigin(req) {
  const host = req.headers.host ?? `localhost:${PORT}`;
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol =
    typeof forwardedProto === "string"
      ? forwardedProto.split(",")[0].trim()
      : req.socket.encrypted
        ? "https"
        : "http";
  return `${protocol}://${host}`;
}

function trackPageVisit(req, url, pathname, context) {
  if (req.method !== "GET") {
    return;
  }

  const source = getSourceInfo(req, url);
  const now = nowIso();
  let visit = db
    .prepare(`
      SELECT id, source_type, source_label
      FROM analytics_visits
      WHERE visit_token = ?
      LIMIT 1
    `)
    .get(context.visitToken);

  if (!visit) {
    const visitId = randomUUID();
    db.prepare(`
      INSERT INTO analytics_visits (
        id, visit_token, guest_id, user_id, source_type, source_label, referrer,
        utm_source, utm_medium, utm_campaign, referral_code, landing_path,
        first_seen_at, last_seen_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      visitId,
      context.visitToken,
      context.guestId,
      context.user?.id ?? null,
      source.sourceType,
      source.sourceLabel,
      source.referrer,
      source.utmSource,
      source.utmMedium,
      source.utmCampaign,
      source.referralCode,
      pathname,
      now,
      now
    );
    visit = {
      id: visitId,
      source_type: source.sourceType,
      source_label: source.sourceLabel
    };
  } else {
    db.prepare(`
      UPDATE analytics_visits
      SET
        user_id = COALESCE(user_id, ?),
        last_seen_at = ?,
        referrer = CASE WHEN referrer IS NULL OR referrer = '' THEN ? ELSE referrer END,
        referral_code = CASE WHEN referral_code IS NULL OR referral_code = '' THEN ? ELSE referral_code END
      WHERE visit_token = ?
    `).run(context.user?.id ?? null, now, source.referrer, source.referralCode, context.visitToken);
  }

  db.prepare(`
    INSERT INTO analytics_pageviews (id, visit_id, path, title, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(randomUUID(), visit.id, pathname, "", now);
}

function getCurrentVisitSource(context) {
  if (!context.visitToken) {
    return {
      source: "direct",
      label: "direct"
    };
  }

  const row = db
    .prepare(`
      SELECT source_type, source_label, referral_code
      FROM analytics_visits
      WHERE visit_token = ?
      LIMIT 1
    `)
    .get(context.visitToken);

  if (!row) {
    return {
      source: "direct",
      label: "direct"
    };
  }

  return {
    source: row.source_type || "direct",
    label: row.referral_code || row.source_label || row.source_type || "direct"
  };
}

function buildAnalyticsOverview() {
  const today = db
    .prepare(`
      SELECT
        COUNT(DISTINCT CASE WHEN date(analytics_pageviews.created_at) = date('now') THEN analytics_pageviews.visit_id END) AS today_visitors,
        COUNT(CASE WHEN date(analytics_pageviews.created_at) = date('now') THEN 1 END) AS today_pageviews,
        COUNT(DISTINCT analytics_pageviews.visit_id) AS total_visitors,
        COUNT(*) AS total_pageviews
      FROM analytics_pageviews
    `)
    .get();

  const registrations = db
    .prepare(`
      SELECT
        COUNT(CASE WHEN date(created_at) = date('now') THEN 1 END) AS today_registrations,
        COUNT(*) AS total_registrations
      FROM users
      WHERE role != 'admin'
    `)
    .get();

  const vip = db
    .prepare(`
      SELECT
        COUNT(CASE WHEN vip_activated_at IS NOT NULL AND date(vip_activated_at) = date('now') THEN 1 END) AS today_vip_conversions,
        COUNT(CASE WHEN is_vip = 1 THEN 1 END) AS total_vip_users
      FROM users
      WHERE role != 'admin'
    `)
    .get();

  const trend = db
    .prepare(`
      SELECT
        date(analytics_pageviews.created_at) AS day,
        COUNT(*) AS pageviews,
        COUNT(DISTINCT analytics_pageviews.visit_id) AS visitors
      FROM analytics_pageviews
      WHERE datetime(analytics_pageviews.created_at) >= datetime('now', '-13 day')
      GROUP BY date(analytics_pageviews.created_at)
      ORDER BY day ASC
    `)
    .all();

  const dailyFunnel = db
    .prepare(`
      WITH RECURSIVE days(day) AS (
        SELECT date('now', '-13 day')
        UNION ALL
        SELECT date(day, '+1 day')
        FROM days
        WHERE day < date('now')
      ),
      pageview_stats AS (
        SELECT
          date(created_at) AS day,
          COUNT(DISTINCT visit_id) AS visitors,
          COUNT(*) AS pageviews
        FROM analytics_pageviews
        WHERE datetime(created_at) >= datetime('now', '-13 day')
        GROUP BY date(created_at)
      ),
      registration_stats AS (
        SELECT
          date(created_at) AS day,
          COUNT(*) AS registrations
        FROM users
        WHERE role != 'admin'
          AND datetime(created_at) >= datetime('now', '-13 day')
        GROUP BY date(created_at)
      ),
      vip_stats AS (
        SELECT
          date(vip_activated_at) AS day,
          COUNT(*) AS vip_conversions
        FROM users
        WHERE role != 'admin'
          AND vip_activated_at IS NOT NULL
          AND datetime(vip_activated_at) >= datetime('now', '-13 day')
        GROUP BY date(vip_activated_at)
      )
      SELECT
        days.day,
        COALESCE(pageview_stats.visitors, 0) AS visitors,
        COALESCE(pageview_stats.pageviews, 0) AS pageviews,
        COALESCE(registration_stats.registrations, 0) AS registrations,
        COALESCE(vip_stats.vip_conversions, 0) AS vip_conversions
      FROM days
      LEFT JOIN pageview_stats ON pageview_stats.day = days.day
      LEFT JOIN registration_stats ON registration_stats.day = days.day
      LEFT JOIN vip_stats ON vip_stats.day = days.day
      ORDER BY days.day ASC
    `)
    .all();

  const topPages = db
    .prepare(`
      SELECT path, COUNT(*) AS pageviews
      FROM analytics_pageviews
      GROUP BY path
      ORDER BY pageviews DESC
      LIMIT 10
    `)
    .all();

  const topSources = db
    .prepare(`
      SELECT
        source_type,
        COALESCE(NULLIF(source_label, ''), source_type, 'direct') AS label,
        COUNT(*) AS visits
      FROM analytics_visits
      GROUP BY source_type, label
      ORDER BY visits DESC
      LIMIT 10
    `)
    .all();

  const registrationsBySource = db
    .prepare(`
      SELECT
        COALESCE(NULLIF(acquisition_source, ''), 'unknown') AS source,
        COALESCE(NULLIF(acquisition_label, ''), COALESCE(NULLIF(acquisition_source, ''), 'unknown')) AS label,
        COUNT(*) AS registrations,
        COUNT(CASE WHEN is_vip = 1 THEN 1 END) AS vip_conversions
      FROM users
      WHERE role != 'admin'
      GROUP BY source, label
      ORDER BY registrations DESC
      LIMIT 10
    `)
    .all();

  const conversionRate =
    today.today_visitors > 0
      ? Math.round((registrations.today_registrations / today.today_visitors) * 100)
      : 0;

  return {
    summary: {
      todayVisitors: today.today_visitors,
      todayPageviews: today.today_pageviews,
      todayRegistrations: registrations.today_registrations,
      todayVipConversions: vip.today_vip_conversions,
      totalVisitors: today.total_visitors,
      totalPageviews: today.total_pageviews,
      totalRegistrations: registrations.total_registrations,
      totalVipUsers: vip.total_vip_users,
      todayRegistrationConversionRate: conversionRate
    },
    trend,
    dailyFunnel,
    topPages,
    topSources,
    registrationsBySource
  };
}

function getEnglishPool(level) {
  const allItems = db
    .prepare("SELECT id, level, word, hint_zh, hint_en FROM english_words ORDER BY created_at ASC")
    .all();
  return cumulativePool(allItems, level, englishLevelOrder);
}

function getChinesePool(level) {
  const allItems = db
    .prepare("SELECT id, level, text, pinyin, explanation FROM chinese_words ORDER BY created_at ASC")
    .all();
  return cumulativePool(allItems, level, chineseLevelOrder);
}

function buildEnglishSession(body, context) {
  const level = normalizeText(body.level);
  const count = safeInteger(body.count, 10, 1, 100);
  const intervalSeconds = safeInteger(body.intervalSeconds, 10, 2, 120);
  const repeats = safeInteger(body.repeats, 2, 1, 10);
  const hintLanguage = normalizeText(body.hintLanguage) || "zh";
  const childId = normalizeText(body.childId) || null;
  const sessionMode = resolveSessionMode(body.sessionMode);
  const customTerms = parseCustomTerms(body.customWordsText, 200);

  if (!level && customTerms.length === 0) {
    const error = new Error("请选择英语级别");
    error.status = 400;
    throw error;
  }

  if (context.user && childId) {
    const child = db
      .prepare("SELECT id FROM children WHERE id = ? AND user_id = ? LIMIT 1")
      .get(childId, context.user.id);
    if (!child) {
      const error = new Error("所选孩子不存在");
      error.status = 400;
      throw error;
    }
  }

  if (customTerms.length > 0) {
    return {
      module: "english_dictation",
      level: level || "custom",
      childId,
      config: {
        count: customTerms.length,
        intervalSeconds,
        repeats,
        hintLanguage,
        sessionMode,
        sourceType: "custom"
      },
      items: customTerms.map((term, index) => ({
        id: `custom-english-${index + 1}`,
        order: index + 1,
        speakText: term,
        answer: term,
        hint: "自定义词单"
      })),
      reusedItems: false,
      librarySize: customTerms.length,
      sourceType: "custom",
      sourceLabel: "自定义词单"
    };
  }

  const pool = getEnglishPool(level);
  if (pool.length === 0) {
    const error = new Error("当前级别词库还没有内容，请先在后台补充词库。");
    error.status = 400;
    throw error;
  }

  const picked = pickRandomItems(pool, count);
  return {
    module: "english_dictation",
    level,
    childId,
    config: {
      count,
      intervalSeconds,
      repeats,
      hintLanguage,
      sessionMode,
      sourceType: "library"
    },
    items: picked.items.map((item, index) => ({
      id: item.id,
      order: index + 1,
      speakText: item.word,
      answer: item.word,
      hint: hintLanguage === "en" ? item.hint_en : item.hint_zh
    })),
    reusedItems: picked.reusedItems,
    librarySize: pool.length,
    sourceType: "library",
    sourceLabel: "系统词库"
  };
}

function buildChineseSession(body, context) {
  const level = normalizeText(body.level);
  const count = safeInteger(body.count, 10, 1, 100);
  const intervalSeconds = safeInteger(body.intervalSeconds, 10, 2, 120);
  const repeats = safeInteger(body.repeats, 2, 1, 10);
  const childId = normalizeText(body.childId) || null;
  const sessionMode = resolveSessionMode(body.sessionMode);
  const customTerms = parseCustomTerms(body.customWordsText, 200);

  if (!level && customTerms.length === 0) {
    const error = new Error("请选择语文年级");
    error.status = 400;
    throw error;
  }

  if (context.user && childId) {
    const child = db
      .prepare("SELECT id FROM children WHERE id = ? AND user_id = ? LIMIT 1")
      .get(childId, context.user.id);
    if (!child) {
      const error = new Error("所选孩子不存在");
      error.status = 400;
      throw error;
    }
  }

  if (customTerms.length > 0) {
    return {
      module: "chinese_dictation",
      level: level || "custom",
      childId,
      config: {
        count: customTerms.length,
        intervalSeconds,
        repeats,
        sessionMode,
        sourceType: "custom"
      },
      items: customTerms.map((term, index) => ({
        id: `custom-chinese-${index + 1}`,
        order: index + 1,
        speakText: term,
        answer: term,
        hint: "自定义词单",
        pinyin: ""
      })),
      reusedItems: false,
      librarySize: customTerms.length,
      sourceType: "custom",
      sourceLabel: "自定义词单"
    };
  }

  const pool = getChinesePool(level);
  if (pool.length === 0) {
    const error = new Error("当前年级汉字词库还没有内容，请先在后台补充词库。");
    error.status = 400;
    throw error;
  }

  const picked = pickRandomItems(pool, count);
  return {
    module: "chinese_dictation",
    level,
    childId,
    config: {
      count,
      intervalSeconds,
      repeats,
      sessionMode,
      sourceType: "library"
    },
    items: picked.items.map((item, index) => ({
      id: item.id,
      order: index + 1,
      speakText: item.text,
      answer: item.text,
      hint: item.explanation,
      pinyin: item.pinyin
    })),
    reusedItems: picked.reusedItems,
    librarySize: pool.length,
    sourceType: "library",
    sourceLabel: "系统词库"
  };
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildMathQuestion(maxValue, operation) {
  switch (operation) {
    case "add": {
      const answer = randomNumber(2, Math.max(2, maxValue));
      const a = randomNumber(1, answer - 1);
      const b = answer - a;
      return { prompt: `${a} + ${b} = ?`, answer };
    }
    case "subtract": {
      const top = randomNumber(1, maxValue);
      const bottom = randomNumber(0, top);
      return { prompt: `${top} - ${bottom} = ?`, answer: top - bottom };
    }
    case "multiply": {
      const x = randomNumber(1, Math.min(12, maxValue));
      const y = randomNumber(1, Math.max(1, Math.min(12, Math.floor(maxValue / x))));
      return { prompt: `${x} × ${y} = ?`, answer: x * y };
    }
    case "divide": {
      const divisor = randomNumber(1, Math.min(12, maxValue));
      const quotient = randomNumber(1, Math.max(1, Math.min(12, Math.floor(maxValue / divisor))));
      return {
        prompt: `${divisor * quotient} ÷ ${divisor} = ?`,
        answer: quotient
      };
    }
    default:
      return buildMathQuestion(maxValue, "add");
  }
}

function resolveMathOperation(operation) {
  if (operation === "add_sub_mix") {
    return Math.random() > 0.5 ? "add" : "subtract";
  }
  if (operation === "mul_div_mix") {
    return Math.random() > 0.5 ? "multiply" : "divide";
  }
  if (operation === "all_mix") {
    return ["add", "subtract", "multiply", "divide"][randomNumber(0, 3)];
  }
  return operation;
}

function buildMathSession(body, context) {
  const rangeMax = safeInteger(body.rangeMax, 20, 5, 9999);
  const count = safeInteger(body.count, 10, 1, 100);
  const operation = normalizeText(body.operation) || "add";
  const childId = normalizeText(body.childId) || null;

  if (context.user && childId) {
    const child = db
      .prepare("SELECT id FROM children WHERE id = ? AND user_id = ? LIMIT 1")
      .get(childId, context.user.id);
    if (!child) {
      const error = new Error("所选孩子不存在");
      error.status = 400;
      throw error;
    }
  }

  const questions = Array.from({ length: count }, (_, index) => {
    const resolvedOperation = resolveMathOperation(operation);
    const question = buildMathQuestion(rangeMax, resolvedOperation);
    return {
      id: randomUUID(),
      order: index + 1,
      prompt: question.prompt,
      answer: question.answer
    };
  });

  return {
    module: "math_practice",
    level: String(rangeMax),
    childId,
    config: {
      rangeMax,
      count,
      operation
    },
    questions
  };
}

function normalizeAnswerByModule(module, value) {
  if (module === "english_dictation") {
    return normalizeEnglishAnswer(value);
  }
  if (module === "chinese_dictation") {
    return normalizeChineseAnswer(value);
  }
  return normalizeMathAnswer(value);
}

function isCorrectAnswer(module, expectedAnswer, candidateAnswer) {
  if (module === "math_practice") {
    return Number(candidateAnswer) === Number(expectedAnswer);
  }

  return normalizeAnswerByModule(module, candidateAnswer) === normalizeAnswerByModule(module, expectedAnswer);
}

function submitPracticeAttempt(context, module, attemptId, answers) {
  const attempt = getAttemptForContext(attemptId, context, module);
  if (!attempt) {
    const error = new Error("未找到对应练习记录");
    error.status = 404;
    throw error;
  }

  const answerMap = new Map(
    (Array.isArray(answers) ? answers : []).map((entry) => [
      Number(entry.order),
      normalizeText(entry.value)
    ])
  );
  const items = getAttemptItems(attemptId);
  const submittedAt = nowIso();

  let correctCount = 0;
  const results = items.map((item) => {
    const userAnswer = answerMap.get(item.item_order) ?? "";
    const correct = isCorrectAnswer(module, item.answer, userAnswer);
    if (correct) {
      correctCount += 1;
    }

    return {
      id: item.id,
      order: item.item_order,
      prompt: item.prompt,
      speakText: item.speak_text,
      hint: item.hint,
      answer: item.answer,
      userAnswer,
      isCorrect: correct,
      extra: safeJsonParse(item.extra_json, {})
    };
  });

  const totalCount = results.length;
  const wrongCount = totalCount - correctCount;
  const score = totalCount === 0 ? 0 : Math.round((correctCount / totalCount) * 100);

  db.exec("BEGIN");
  try {
    const updateItem = db.prepare(`
      UPDATE practice_attempt_items
      SET user_answer = ?, is_correct = ?, submitted_at = ?
      WHERE id = ?
    `);
    results.forEach((item) => {
      updateItem.run(item.userAnswer, item.isCorrect ? 1 : 0, submittedAt, item.id);
    });

    db.prepare(`
      UPDATE practice_attempts
      SET submitted_at = ?, correct_count = ?, total_count = ?, wrong_count = ?, score = ?
      WHERE id = ?
    `).run(submittedAt, correctCount, totalCount, wrongCount, score, attemptId);

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return {
    attemptId,
    module,
    moduleTitle: getModuleTitle(module),
    submittedAt,
    correctCount,
    totalCount,
    wrongCount,
    score,
    items: results.map((item) => ({
      order: item.order,
      prompt: item.prompt,
      speakText: item.speakText,
      hint: item.hint,
      answer: item.answer,
      userAnswer: item.userAnswer,
      isCorrect: item.isCorrect,
      pinyin: item.extra.pinyin ?? null
    }))
  };
}

function listPracticeHistory(userId, filters = {}) {
  const clauses = ["practice_attempts.user_id = ?"];
  const params = [userId];

  if (filters.childId) {
    clauses.push("practice_attempts.child_id = ?");
    params.push(filters.childId);
  }

  if (filters.module) {
    clauses.push("practice_attempts.module = ?");
    params.push(filters.module);
  }

  params.push(filters.limit ?? 20);

  const rows = db
    .prepare(`
      SELECT
        practice_attempts.*,
        children.name AS child_name,
        children.grade AS child_grade
      FROM practice_attempts
      LEFT JOIN children ON children.id = practice_attempts.child_id
      WHERE ${clauses.join(" AND ")}
      ORDER BY practice_attempts.created_at DESC
      LIMIT ?
    `)
    .all(...params);

  return rows.map((row) => serializeAttemptRow(row));
}

function getPracticeAttemptDetail(userId, attemptId) {
  const row = db
    .prepare(`
      SELECT
        practice_attempts.*,
        children.name AS child_name,
        children.grade AS child_grade
      FROM practice_attempts
      LEFT JOIN children ON children.id = practice_attempts.child_id
      WHERE practice_attempts.id = ? AND practice_attempts.user_id = ?
      LIMIT 1
    `)
    .get(attemptId, userId);

  if (!row) {
    return null;
  }

  const items = getAttemptItems(attemptId).map((item) => ({
    order: item.item_order,
    prompt: item.prompt,
    speakText: item.speak_text,
    answer: item.answer,
    hint: item.hint,
    userAnswer: item.user_answer,
    isCorrect: item.is_correct === null ? null : Boolean(item.is_correct),
    pinyin: safeJsonParse(item.extra_json, {}).pinyin ?? null
  }));

  return {
    ...serializeAttemptRow(row),
    items
  };
}

function listWrongBook(userId, filters = {}) {
  const clauses = ["practice_attempts.user_id = ?", "practice_attempt_items.is_correct = 0"];
  const params = [userId];

  if (filters.childId) {
    clauses.push("practice_attempts.child_id = ?");
    params.push(filters.childId);
  }

  if (filters.module) {
    clauses.push("practice_attempts.module = ?");
    params.push(filters.module);
  }

  params.push(filters.limit ?? 30);

  const rows = db
    .prepare(`
      SELECT
        practice_attempt_items.id,
        practice_attempt_items.item_order,
        practice_attempt_items.prompt,
        practice_attempt_items.speak_text,
        practice_attempt_items.answer,
        practice_attempt_items.hint,
        practice_attempt_items.extra_json,
        practice_attempt_items.user_answer,
        practice_attempt_items.submitted_at,
        practice_attempts.id AS attempt_id,
        practice_attempts.module,
        practice_attempts.level,
        practice_attempts.child_id,
        children.name AS child_name,
        children.grade AS child_grade
      FROM practice_attempt_items
      JOIN practice_attempts ON practice_attempts.id = practice_attempt_items.attempt_id
      LEFT JOIN children ON children.id = practice_attempts.child_id
      WHERE ${clauses.join(" AND ")}
      ORDER BY practice_attempt_items.submitted_at DESC, practice_attempt_items.item_order ASC
      LIMIT ?
    `)
    .all(...params);

  return rows.map((row) => ({
    id: row.id,
    attemptId: row.attempt_id,
    module: row.module,
    moduleTitle: getModuleTitle(row.module),
    level: row.level,
    order: row.item_order,
    prompt: row.prompt,
    speakText: row.speak_text,
    answer: row.answer,
    hint: row.hint,
    userAnswer: row.user_answer,
    submittedAt: row.submitted_at,
    child: row.child_id
      ? {
          id: row.child_id,
          name: row.child_name,
          grade: row.child_grade
        }
      : null,
    pinyin: safeJsonParse(row.extra_json, {}).pinyin ?? null
  }));
}

function buildParentReport(userId) {
  const totals = db
    .prepare(`
      SELECT
        COUNT(*) AS total_attempts,
        COUNT(CASE WHEN submitted_at IS NOT NULL THEN 1 END) AS submitted_attempts,
        COALESCE(AVG(score), 0) AS average_score,
        COUNT(CASE WHEN datetime(created_at) >= datetime('now', '-7 day') THEN 1 END) AS attempts_last_7_days,
        COUNT(CASE WHEN datetime(submitted_at) >= datetime('now', '-7 day') THEN 1 END) AS submitted_last_7_days,
        COALESCE(AVG(CASE WHEN datetime(submitted_at) >= datetime('now', '-7 day') THEN score END), 0) AS average_score_last_7_days
      FROM practice_attempts
      WHERE user_id = ?
    `)
    .get(userId);

  const byModule = db
    .prepare(`
      SELECT
        module,
        COUNT(*) AS attempts,
        COUNT(CASE WHEN submitted_at IS NOT NULL THEN 1 END) AS submitted_attempts,
        COALESCE(AVG(score), 0) AS average_score
      FROM practice_attempts
      WHERE user_id = ?
      GROUP BY module
      ORDER BY attempts DESC
    `)
    .all(userId)
    .map((row) => ({
      module: row.module,
      moduleTitle: getModuleTitle(row.module),
      attempts: row.attempts,
      submittedAttempts: row.submitted_attempts,
      averageScore: Math.round(row.average_score ?? 0)
    }));

  const byChild = db
    .prepare(`
      SELECT
        children.id,
        children.name,
        children.grade,
        COUNT(practice_attempts.id) AS attempts,
        COUNT(CASE WHEN practice_attempts.submitted_at IS NOT NULL THEN 1 END) AS submitted_attempts,
        COALESCE(AVG(practice_attempts.score), 0) AS average_score
      FROM children
      LEFT JOIN practice_attempts
        ON practice_attempts.child_id = children.id
        AND practice_attempts.user_id = children.user_id
      WHERE children.user_id = ?
      GROUP BY children.id
      ORDER BY attempts DESC, children.created_at DESC
    `)
    .all(userId)
    .map((row) => ({
      id: row.id,
      name: row.name,
      grade: row.grade,
      attempts: row.attempts,
      submittedAttempts: row.submitted_attempts,
      averageScore: Math.round(row.average_score ?? 0)
    }));

  const weakestModule = byModule
    .filter((row) => row.submittedAttempts > 0)
    .sort((left, right) => left.averageScore - right.averageScore)[0];

  let suggestion = "先完成至少一次英语、数学和语文训练，系统才能给出更稳定的家长建议。";
  if (weakestModule) {
    suggestion = `当前最值得优先加强的是${weakestModule.moduleTitle}，建议本周把它的训练频率提高到 2-3 次。`;
  } else if (totals.total_attempts > 0) {
    suggestion = "已经开始建立练习习惯了，接下来重点是让每次训练都提交批改，才能形成可靠的报告。";
  }

  return {
    totals: {
      totalAttempts: totals.total_attempts,
      submittedAttempts: totals.submitted_attempts,
      averageScore: Math.round(totals.average_score ?? 0),
      attemptsLast7Days: totals.attempts_last_7_days,
      submittedLast7Days: totals.submitted_last_7_days,
      averageScoreLast7Days: Math.round(totals.average_score_last_7_days ?? 0)
    },
    byModule,
    byChild,
    suggestion
  };
}

function createInviteCodes(adminUserId, quantity, maxUses) {
  const insert = db.prepare(`
    INSERT INTO invite_codes (code, status, max_uses, used_count, created_by, created_at)
    VALUES (?, 'active', ?, 0, ?, ?)
  `);

  const codes = [];
  for (let index = 0; index < quantity; index += 1) {
    let code = generateCode(8);
    while (db.prepare("SELECT code FROM invite_codes WHERE code = ? LIMIT 1").get(code)) {
      code = generateCode(8);
    }
    insert.run(code, maxUses, adminUserId, nowIso());
    codes.push(code);
  }
  return codes;
}

function listAdminUsers() {
  return db
    .prepare(`
      SELECT
        users.id,
        users.email,
        users.display_name,
        users.role,
        users.is_vip,
        users.referral_code,
        users.acquisition_source,
        users.acquisition_label,
        users.vip_activated_at,
        users.created_at,
        (
          SELECT COUNT(*)
          FROM practice_attempts
          WHERE practice_attempts.user_id = users.id
        ) AS practice_count,
        (
          SELECT COUNT(*)
          FROM ai_generations
          WHERE ai_generations.user_id = users.id
        ) AS ai_generation_count,
        (
          SELECT MAX(created_at)
          FROM ai_generations
          WHERE ai_generations.user_id = users.id
        ) AS last_ai_generation_at
      FROM users
      ORDER BY users.created_at DESC
    `)
    .all();
}

function listInviteCodes() {
  return db
    .prepare(`
      SELECT code, status, max_uses, used_count, created_at
      FROM invite_codes
      ORDER BY created_at DESC
    `)
    .all();
}

function adminOverview() {
  const userCount = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;
  const vipCount = db.prepare("SELECT COUNT(*) AS count FROM users WHERE is_vip = 1").get().count;
  const childrenCount = db.prepare("SELECT COUNT(*) AS count FROM children").get().count;
  const attemptsCount = db.prepare("SELECT COUNT(*) AS count FROM practice_attempts").get().count;
  const aiGenerationCount = db.prepare("SELECT COUNT(*) AS count FROM ai_generations").get().count;
  const inviteCount = db.prepare("SELECT COUNT(*) AS count FROM invite_codes").get().count;
  const englishCount = db.prepare("SELECT COUNT(*) AS count FROM english_words").get().count;
  const chineseCount = db.prepare("SELECT COUNT(*) AS count FROM chinese_words").get().count;

  return {
    userCount,
    vipCount,
    childrenCount,
    attemptsCount,
    aiGenerationCount,
    inviteCount,
    englishCount,
    chineseCount
  };
}

function contentSummary() {
  const english = db
    .prepare(`
      SELECT level, COUNT(*) AS count
      FROM english_words
      GROUP BY level
      ORDER BY level ASC
    `)
    .all();
  const chinese = db
    .prepare(`
      SELECT level, COUNT(*) AS count
      FROM chinese_words
      GROUP BY level
      ORDER BY level ASC
    `)
    .all();
  return { english, chinese };
}

function listContent(type, level, limit) {
  if (type === "english") {
    if (level) {
      return db
        .prepare(`
          SELECT id, level, word, hint_zh, hint_en, created_at
          FROM english_words
          WHERE level = ?
          ORDER BY created_at DESC
          LIMIT ?
        `)
        .all(level, limit);
    }

    return db
      .prepare(`
        SELECT id, level, word, hint_zh, hint_en, created_at
        FROM english_words
        ORDER BY created_at DESC
        LIMIT ?
      `)
      .all(limit);
  }

  if (level) {
    return db
      .prepare(`
        SELECT id, level, text, pinyin, explanation, created_at
        FROM chinese_words
        WHERE level = ?
        ORDER BY created_at DESC
        LIMIT ?
      `)
      .all(level, limit);
  }

  return db
    .prepare(`
      SELECT id, level, text, pinyin, explanation, created_at
      FROM chinese_words
      ORDER BY created_at DESC
      LIMIT ?
    `)
    .all(limit);
}

async function handleApi(req, res, pathname, context, origin) {
  if (pathname === "/api/health" && req.method === "GET") {
    return json(res, 200, { ok: true, now: nowIso() }, context.cookiesToSet);
  }

  if (pathname === "/api/bootstrap" && req.method === "GET") {
    return json(res, 200, getBootstrapPayload(context, origin), context.cookiesToSet);
  }

  if (pathname === "/api/ai-tools/bootstrap" && req.method === "GET") {
    return json(res, 200, getAiBootstrapPayload(context, origin), context.cookiesToSet);
  }

  if (pathname === "/api/ai-tools/generate" && req.method === "POST") {
    const body = await readJsonBody(req);
    const toolId = normalizeText(body.toolId);
    const tool = getAiTool(toolId);
    if (!tool) {
      return json(res, 404, { error: "未找到该 AI 工具" }, context.cookiesToSet);
    }

    const settings = getSettings();
    assertAiQuotaAvailable(context, settings);

    const prompt = normalizeAiPrompt(body.prompt);
    const generation = await generateAiResult(tool, prompt);
    const generationId = saveAiGeneration(
      context,
      tool,
      {
        toolId,
        prompt
      },
      generation
    );

    return json(
      res,
      200,
      {
        id: generationId,
        tool: {
          id: tool.id,
          title: tool.title,
          kind: tool.kind
        },
        provider: getAiProviderStatus(),
        imageUrl: generation.imageUrl,
        imageError: generation.imageError,
        assist: generation.assist,
        result: generation.result,
        quota: getAiQuotaState(context, settings)
      },
      context.cookiesToSet
    );
  }

  if (pathname === "/api/ai-tools/assist-prompt" && req.method === "POST") {
    const body = await readJsonBody(req);
    const toolId = normalizeText(body.toolId);
    const tool = getAiTool(toolId);
    if (!tool) {
      return json(res, 404, { error: "未找到该 AI 工具" }, context.cookiesToSet);
    }

    const prompt = normalizeAiPrompt(body.prompt);
    const assist = await buildRemotePromptAssist(tool, prompt);
    return json(
      res,
      200,
      {
        tool: {
          id: tool.id,
          title: tool.title,
          kind: tool.kind
        },
        assist
      },
      context.cookiesToSet
    );
  }

  if (pathname === "/api/ai-tools/history" && req.method === "GET") {
    requireAuth(context);
    const url = new URL(req.url, origin);
    const limit = safeInteger(url.searchParams.get("limit"), 12, 1, 100);
    return json(
      res,
      200,
      {
        history: listAiHistoryForUser(context.user.id, limit)
      },
      context.cookiesToSet
    );
  }

  if (pathname === "/api/referral/capture" && req.method === "POST") {
    const body = await readJsonBody(req);
    const code = normalizeText(body.code);
    if (!code) {
      return json(res, 400, { error: "缺少联盟代码" }, context.cookiesToSet);
    }

    const owner = findUserByReferralCode(code);
    if (!owner) {
      return json(res, 404, { error: "联盟代码无效" }, context.cookiesToSet);
    }

    db.prepare(`
      UPDATE guest_profiles
      SET referral_code = ?, updated_at = ?
      WHERE guest_id = ?
    `).run(code, nowIso(), context.guestId);

    return json(res, 200, { ok: true, referralCode: code }, context.cookiesToSet);
  }

  if (pathname === "/api/auth/register" && req.method === "POST") {
    const body = await readJsonBody(req);
    const settings = getSettings();
    const email = normalizeEmail(body.email);
    const password = String(body.password ?? "");
    const displayName = normalizeText(body.displayName) || email.split("@")[0] || "新用户";
    const mode = normalizeText(body.mode) || "email";
    const inviteCode = normalizeText(body.inviteCode);

    if (!email || !email.includes("@")) {
      return json(res, 400, { error: "请输入有效邮箱" }, context.cookiesToSet);
    }

    if (password.length < 6) {
      return json(res, 400, { error: "密码至少 6 位" }, context.cookiesToSet);
    }

    if (findUserByEmail(email)) {
      return json(res, 409, { error: "该邮箱已经注册过了" }, context.cookiesToSet);
    }

    if (mode === "invite") {
      const invite = db
        .prepare(`
          SELECT code, max_uses, used_count, status
          FROM invite_codes
          WHERE code = ?
          LIMIT 1
        `)
        .get(inviteCode);

      if (!invite || invite.status !== "active" || invite.used_count >= invite.max_uses) {
        return json(res, 400, { error: "邀请码无效或已用完" }, context.cookiesToSet);
      }

      db.prepare(`
        UPDATE invite_codes
        SET used_count = used_count + 1
        WHERE code = ?
      `).run(inviteCode);
    }

    const guestReferral = db
      .prepare("SELECT referral_code FROM guest_profiles WHERE guest_id = ? LIMIT 1")
      .get(context.guestId)?.referral_code;
    const referralCode = normalizeText(body.referralCode) || guestReferral || null;
    const referredUser = referralCode ? findUserByReferralCode(referralCode) : null;
    const currentVisitSource = getCurrentVisitSource(context);

    let userReferralCode = createReferralCode();
    while (findUserByReferralCode(userReferralCode)) {
      userReferralCode = createReferralCode();
    }

    const userId = randomUUID();
    db.prepare(`
      INSERT INTO users (
        id, email, password_hash, display_name, role, is_vip,
        referral_code, referred_by, free_trial_limit, created_at, acquisition_source, acquisition_label
      ) VALUES (?, ?, ?, ?, 'user', 0, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      email,
      hashPassword(password),
      displayName,
      userReferralCode,
      referredUser?.id ?? null,
      Number(settings.user_trial_limit ?? 10),
      nowIso(),
      referredUser ? "affiliate" : currentVisitSource.source,
      referredUser ? referralCode : currentVisitSource.label
    );

    createSessionForUser(userId, context.cookiesToSet);
    db.prepare(`
      UPDATE analytics_visits
      SET user_id = ?, last_seen_at = ?
      WHERE visit_token = ?
    `).run(userId, nowIso(), context.visitToken);
    const freshContext = {
      ...context,
      user: findUserById(userId)
    };
    return json(res, 201, getBootstrapPayload(freshContext, origin), context.cookiesToSet);
  }

  if (pathname === "/api/auth/login" && req.method === "POST") {
    const body = await readJsonBody(req);
    const email = normalizeEmail(body.email);
    const password = String(body.password ?? "");
    const user = findUserByEmail(email);

    if (!user || !verifyPassword(password, user.password_hash)) {
      return json(res, 401, { error: "邮箱或密码不正确" }, context.cookiesToSet);
    }

    createSessionForUser(user.id, context.cookiesToSet);
    const freshContext = {
      ...context,
      user: findUserById(user.id)
    };
    return json(res, 200, getBootstrapPayload(freshContext, origin), context.cookiesToSet);
  }

  if (pathname === "/api/auth/logout" && req.method === "POST") {
    if (context.sessionToken) {
      destroySession(context.sessionToken);
    }
    context.cookiesToSet.push(
      serializeCookie(SESSION_COOKIE, "", {
        expires: new Date(0).toUTCString()
      })
    );
    return json(res, 200, { ok: true }, context.cookiesToSet);
  }

  if (pathname === "/api/children" && req.method === "GET") {
    requireAuth(context);
    return json(res, 200, { children: getChildren(context.user.id) }, context.cookiesToSet);
  }

  if (pathname === "/api/children" && req.method === "POST") {
    requireAuth(context);
    const body = await readJsonBody(req);
    const name = normalizeText(body.name);
    const grade = normalizeText(body.grade);

    if (!name || !grade) {
      return json(res, 400, { error: "请填写孩子姓名和年级" }, context.cookiesToSet);
    }

    db.prepare(`
      INSERT INTO children (id, user_id, name, grade, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(randomUUID(), context.user.id, name, grade, nowIso());

    return json(res, 201, { children: getChildren(context.user.id) }, context.cookiesToSet);
  }

  if (pathname.startsWith("/api/children/") && req.method === "DELETE") {
    requireAuth(context);
    const childId = pathname.split("/").pop();
    db.prepare("DELETE FROM children WHERE id = ? AND user_id = ?").run(childId, context.user.id);
    return json(res, 200, { children: getChildren(context.user.id) }, context.cookiesToSet);
  }

  if (pathname === "/api/report/summary" && req.method === "GET") {
    requireAuth(context);
    return json(
      res,
      200,
      {
        report: buildParentReport(context.user.id)
      },
      context.cookiesToSet
    );
  }

  if (pathname === "/api/history" && req.method === "GET") {
    requireAuth(context);
    const url = new URL(req.url, origin);
    const limit = safeInteger(url.searchParams.get("limit"), 20, 1, 100);
    const childId = normalizeText(url.searchParams.get("childId") ?? "");
    const module = normalizeText(url.searchParams.get("module") ?? "");
    return json(
      res,
      200,
      {
        history: listPracticeHistory(context.user.id, {
          limit,
          childId: childId || null,
          module: module || null
        })
      },
      context.cookiesToSet
    );
  }

  if (pathname.startsWith("/api/history/") && req.method === "GET") {
    requireAuth(context);
    const attemptId = pathname.split("/").pop();
    const detail = getPracticeAttemptDetail(context.user.id, attemptId);
    if (!detail) {
      return json(res, 404, { error: "未找到练习详情" }, context.cookiesToSet);
    }
    return json(res, 200, { detail }, context.cookiesToSet);
  }

  if (pathname === "/api/wrong-book" && req.method === "GET") {
    requireAuth(context);
    const url = new URL(req.url, origin);
    const limit = safeInteger(url.searchParams.get("limit"), 30, 1, 200);
    const childId = normalizeText(url.searchParams.get("childId") ?? "");
    const module = normalizeText(url.searchParams.get("module") ?? "");
    return json(
      res,
      200,
      {
        wrongBook: listWrongBook(context.user.id, {
          limit,
          childId: childId || null,
          module: module || null
        })
      },
      context.cookiesToSet
    );
  }

  if (pathname === "/api/training/english/session" && req.method === "POST") {
    const body = await readJsonBody(req);
    const settings = getSettings();
    const session = buildEnglishSession(body, context);
    const attemptId = consumePracticeAttempt(context, settings, session);
    return json(
      res,
      200,
      {
        ...session,
        attemptId,
        quota: getQuotaState(context, settings)
      },
      context.cookiesToSet
    );
  }

  if (pathname === "/api/training/english/submit" && req.method === "POST") {
    const body = await readJsonBody(req);
    return json(
      res,
      200,
      submitPracticeAttempt(context, "english_dictation", normalizeText(body.attemptId), body.answers),
      context.cookiesToSet
    );
  }

  if (pathname === "/api/training/chinese/session" && req.method === "POST") {
    const body = await readJsonBody(req);
    const settings = getSettings();
    const session = buildChineseSession(body, context);
    const attemptId = consumePracticeAttempt(context, settings, session);
    return json(
      res,
      200,
      {
        ...session,
        attemptId,
        quota: getQuotaState(context, settings)
      },
      context.cookiesToSet
    );
  }

  if (pathname === "/api/training/chinese/submit" && req.method === "POST") {
    const body = await readJsonBody(req);
    return json(
      res,
      200,
      submitPracticeAttempt(context, "chinese_dictation", normalizeText(body.attemptId), body.answers),
      context.cookiesToSet
    );
  }

  if (pathname === "/api/training/math/session" && req.method === "POST") {
    const body = await readJsonBody(req);
    const settings = getSettings();
    const session = buildMathSession(body, context);
    const attemptId = consumePracticeAttempt(context, settings, session);
    return json(
      res,
      200,
      {
        ...session,
        attemptId,
        quota: getQuotaState(context, settings)
      },
      context.cookiesToSet
    );
  }

  if (pathname === "/api/training/math/submit" && req.method === "POST") {
    const body = await readJsonBody(req);
    return json(
      res,
      200,
      submitPracticeAttempt(context, "math_practice", normalizeText(body.attemptId), body.answers),
      context.cookiesToSet
    );
  }

  if (pathname === "/api/admin/overview" && req.method === "GET") {
    requireAdmin(context);
    return json(res, 200, adminOverview(), context.cookiesToSet);
  }

  if (pathname === "/api/admin/users" && req.method === "GET") {
    requireAdmin(context);
    return json(res, 200, { users: listAdminUsers() }, context.cookiesToSet);
  }

  if (pathname.startsWith("/api/admin/users/") && pathname.endsWith("/vip") && req.method === "POST") {
    requireAdmin(context);
    const body = await readJsonBody(req);
    const parts = pathname.split("/");
    const userId = parts[4];
    db.prepare(`
      UPDATE users
      SET is_vip = ?, updated_at = ?, vip_activated_at = CASE
        WHEN ? = 1 THEN COALESCE(vip_activated_at, ?)
        ELSE NULL
      END
      WHERE id = ?
    `).run(body.isVip ? 1 : 0, nowIso(), body.isVip ? 1 : 0, nowIso(), userId);
    return json(res, 200, { users: listAdminUsers() }, context.cookiesToSet);
  }

  if (pathname === "/api/admin/analytics/overview" && req.method === "GET") {
    requireAdmin(context);
    return json(res, 200, buildAnalyticsOverview(), context.cookiesToSet);
  }

  if (pathname === "/api/admin/invites" && req.method === "GET") {
    requireAdmin(context);
    return json(res, 200, { invites: listInviteCodes() }, context.cookiesToSet);
  }

  if (pathname === "/api/admin/invites" && req.method === "POST") {
    requireAdmin(context);
    const body = await readJsonBody(req);
    const quantity = safeInteger(body.quantity, 5, 1, 50);
    const maxUses = safeInteger(body.maxUses, 1, 1, 999);
    const codes = createInviteCodes(context.user.id, quantity, maxUses);
    return json(
      res,
      201,
      {
        codes,
        invites: listInviteCodes()
      },
      context.cookiesToSet
    );
  }

  if (pathname === "/api/admin/settings" && req.method === "GET") {
    requireAdmin(context);
    return json(res, 200, { settings: getSettings() }, context.cookiesToSet);
  }

  if (pathname === "/api/admin/settings" && req.method === "POST") {
    requireAdmin(context);
    const body = await readJsonBody(req);
    setSettings({
      customer_wechat: body.customerWechat,
      wechat_payment_message: body.wechatPaymentMessage,
      wechat_qr_image: body.wechatQrImage,
      guest_trial_limit: body.guestTrialLimit,
      user_trial_limit: body.userTrialLimit,
      ai_guest_trial_limit: body.aiGuestTrialLimit,
      ai_user_trial_limit: body.aiUserTrialLimit,
      vip_price_text: body.vipPriceText,
      vip_benefits: body.vipBenefits,
      invite_registration_notice: body.inviteRegistrationNotice,
      site_notice: body.siteNotice,
      ai_site_notice: body.aiSiteNotice
    });
    return json(res, 200, { settings: getSettings() }, context.cookiesToSet);
  }

  if (pathname === "/api/admin/content/summary" && req.method === "GET") {
    requireAdmin(context);
    return json(res, 200, contentSummary(), context.cookiesToSet);
  }

  if (pathname === "/api/admin/content" && req.method === "GET") {
    requireAdmin(context);
    const url = new URL(req.url, origin);
    const type = url.searchParams.get("type") || "english";
    const level = normalizeText(url.searchParams.get("level") ?? "");
    const limit = safeInteger(url.searchParams.get("limit"), 20, 1, 200);
    return json(
      res,
      200,
      { items: listContent(type, level, limit) },
      context.cookiesToSet
    );
  }

  if (pathname === "/api/admin/content/english" && req.method === "POST") {
    requireAdmin(context);
    const body = await readJsonBody(req);
    const level = normalizeText(body.level);
    const word = normalizeText(body.word);
    const hintZh = normalizeText(body.hintZh);
    const hintEn = normalizeText(body.hintEn);
    if (!level || !word) {
      return json(res, 400, { error: "请填写级别和单词" }, context.cookiesToSet);
    }
    db.prepare(`
      INSERT INTO english_words (id, level, word, hint_zh, hint_en, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(randomUUID(), level, word, hintZh, hintEn, nowIso());
    return json(res, 201, { items: listContent("english", "", 30) }, context.cookiesToSet);
  }

  if (pathname === "/api/admin/content/chinese" && req.method === "POST") {
    requireAdmin(context);
    const body = await readJsonBody(req);
    const level = normalizeText(body.level);
    const textValue = normalizeText(body.text);
    const pinyin = normalizeText(body.pinyin);
    const explanation = normalizeText(body.explanation);
    if (!level || !textValue) {
      return json(res, 400, { error: "请填写年级和词语" }, context.cookiesToSet);
    }
    db.prepare(`
      INSERT INTO chinese_words (id, level, text, pinyin, explanation, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(randomUUID(), level, textValue, pinyin, explanation, nowIso());
    return json(res, 201, { items: listContent("chinese", "", 30) }, context.cookiesToSet);
  }

  if (pathname.startsWith("/api/admin/content/english/") && req.method === "DELETE") {
    requireAdmin(context);
    const itemId = pathname.split("/").pop();
    db.prepare("DELETE FROM english_words WHERE id = ?").run(itemId);
    return json(res, 200, { items: listContent("english", "", 30) }, context.cookiesToSet);
  }

  if (pathname.startsWith("/api/admin/content/chinese/") && req.method === "DELETE") {
    requireAdmin(context);
    const itemId = pathname.split("/").pop();
    db.prepare("DELETE FROM chinese_words WHERE id = ?").run(itemId);
    return json(res, 200, { items: listContent("chinese", "", 30) }, context.cookiesToSet);
  }

  return json(res, 404, { error: "接口不存在" }, context.cookiesToSet);
}

function buildCookieHeaders(cookies = []) {
  return cookies.length > 0 ? { "Set-Cookie": cookies } : {};
}

function resolveStaticPath(pathname) {
  const aliases = new Map([
    ["/", "/index.html"],
    ["/portal", "/portal.html"],
    ["/admin", "/admin.html"]
  ]);

  let relativePath = aliases.get(pathname) ?? pathname;
  let normalized = normalize(join(WEB_ROOT, relativePath));

  if (!normalized.startsWith(WEB_ROOT)) {
    return null;
  }

  if (existsSync(normalized) && extname(normalized)) {
    return normalized;
  }

  const withIndex = normalize(join(WEB_ROOT, relativePath, "index.html"));
  if (withIndex.startsWith(WEB_ROOT) && existsSync(withIndex)) {
    return withIndex;
  }

  if (!extname(relativePath)) {
    const htmlFallback = normalize(join(WEB_ROOT, `${relativePath}.html`));
    if (htmlFallback.startsWith(WEB_ROOT) && existsSync(htmlFallback)) {
      return htmlFallback;
    }
  }

  return existsSync(normalized) ? normalized : null;
}

function buildSitemap(origin) {
  const urls = [
    "/",
    "/ai-tools/",
    "/portal.html",
    "/pricing.html",
    "/products/english/",
    "/products/math/",
    "/products/chinese/",
    "/insights/",
    "/insights/english-dictation-at-home/",
    "/insights/math-speed-practice/",
    "/insights/chinese-dictation-strategy/"
  ];

  const body = urls
    .map((path) => `<url><loc>${origin}${path}</loc></url>`)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}

function buildRobots(origin) {
  return `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`;
}

async function serveStatic(req, res, pathname, context, origin, url) {
  if (pathname === "/sitemap.xml") {
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[".xml"],
      ...buildCookieHeaders(context.cookiesToSet)
    });
    res.end(buildSitemap(origin));
    return;
  }

  if (pathname === "/robots.txt") {
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[".txt"],
      ...buildCookieHeaders(context.cookiesToSet)
    });
    res.end(buildRobots(origin));
    return;
  }

  const normalized = resolveStaticPath(pathname);
  if (!normalized || !existsSync(normalized)) {
    text(res, 404, "Not Found");
    return;
  }

  const ext = extname(normalized).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";
  if (contentType.startsWith("text/html")) {
    trackPageVisit(req, url, pathname, context);
  }
  const file = await readFile(normalized);
  res.writeHead(200, {
    "Content-Type": contentType,
    ...buildCookieHeaders(context.cookiesToSet)
  });
  res.end(file);
}

const server = http.createServer(async (req, res) => {
  try {
    const origin = buildOrigin(req);
    const url = new URL(req.url, origin);
    const context = getRequestContext(req);

    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url.pathname, context, origin);
      return;
    }

    await serveStatic(req, res, url.pathname, context, origin, url);
  } catch (error) {
    console.error(error);
    const status = error.status ?? 500;
    json(res, status, { error: error.message ?? "服务器异常" });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Wanglitou server running at http://${HOST}:${PORT}`);
  console.log(`Admin login: ${DEFAULT_ADMIN_EMAIL} / ${DEFAULT_ADMIN_PASSWORD}`);
});
