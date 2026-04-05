const moduleName = document.body.dataset.practiceModule;
const dictationModules = new Set(["english", "chinese"]);

const state = {
  bootstrap: null,
  session: null
};

const dom = {};

const player = {
  token: 0,
  currentIndex: 0,
  hasStarted: false
};

const voiceProfiles = {
  "en-US": {
    rate: 0.84,
    exactNames: [
      "Samantha",
      "Karen",
      "Google US English",
      "Google UK English Female",
      "Daniel",
      "Alex",
      "Microsoft Aria Online (Natural) - English (United States)",
      "Microsoft Jenny Online (Natural) - English (United States)"
    ],
    keywords: ["samantha", "karen", "google us english", "aria", "jenny", "daniel", "alex", "english"]
  },
  "zh-CN": {
    rate: 0.92,
    exactNames: [
      "Ting-Ting",
      "Mei-Jia",
      "Sin-ji",
      "Google 普通话（中国大陆）",
      "Microsoft Xiaoxiao Online (Natural) - Chinese (Mainland)",
      "Microsoft Yunxi Online (Natural) - Chinese (Mainland)"
    ],
    keywords: ["ting-ting", "mei-jia", "sin-ji", "xiaoxiao", "yunxi", "mandarin", "普通话", "chinese"]
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  cacheDom();
  bindEvents();
  registerVoiceListeners();
  resetStage();
  await refreshBootstrap();
});

function cacheDom() {
  dom.message = document.querySelector("#practice-message");
  dom.quota = document.querySelector("#practice-quota");
  dom.form = document.querySelector("#practice-form");
  dom.status = document.querySelector("#module-status");
  dom.answerGrid = document.querySelector("#module-answer-grid");
  dom.startButton = document.querySelector("#module-start");
  dom.pauseButton = document.querySelector("#module-pause");
  dom.checkButton = document.querySelector("#module-check");
  dom.modeSelect = document.querySelector("#module-session-mode");
  dom.customWords = document.querySelector("#module-custom-words");
  dom.progressFill = document.querySelector("#module-progress-fill");
  dom.progressText = document.querySelector("#module-progress-text");
  dom.progressNote = document.querySelector("#module-progress-note");
  dom.sessionMeta = document.querySelector("#module-session-meta");
  dom.wordPanel = document.querySelector("#module-word-panel");
  dom.wordList = document.querySelector("#module-word-list");
  dom.wordToggle = document.querySelector("#module-word-toggle");
  dom.wordPanelTitle = document.querySelector("#module-word-panel-title");
  dom.wordPanelNote = document.querySelector("#module-word-panel-note");
}

function bindEvents() {
  dom.form?.addEventListener("submit", handleGenerate);
  dom.quota?.addEventListener("click", handleQuotaActions);
  dom.startButton?.addEventListener("click", startPlayback);
  dom.pauseButton?.addEventListener("click", pausePlayback);
  dom.checkButton?.addEventListener("click", submitAnswers);
  dom.wordToggle?.addEventListener("click", toggleWordPanel);

  document.querySelectorAll(".count-choice, .interval-choice, .repeat-choice, #module-range").forEach((select) => {
    select?.addEventListener("change", (event) => updateCustomVisibility(event.target));
  });

  dom.modeSelect?.addEventListener("change", syncModeUi);
}

function registerVoiceListeners() {
  if (!("speechSynthesis" in window)) {
    return;
  }

  const refreshVoices = () => {
    window.speechSynthesis.getVoices();
  };

  refreshVoices();
  if (typeof window.speechSynthesis.addEventListener === "function") {
    window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);
    return;
  }

  window.speechSynthesis.onvoiceschanged = refreshVoices;
}

async function refreshBootstrap() {
  state.bootstrap = await api("/api/bootstrap");
  renderBootstrap();
}

function renderBootstrap() {
  renderQuota();
  populateSharedSelects();
  dom.message.textContent = state.bootstrap.settings.siteNotice || "可以开始。";
}

function renderQuota() {
  const quota = state.bootstrap.quota;
  dom.quota.innerHTML = `
    <div class="quota-block">
      <strong>${quota.isVip ? "VIP 会员" : quota.scope === "user" ? "登录用户" : "游客体验"}</strong>
      <p>${quota.limit === null ? "不限次数" : `剩余 ${quota.remaining} / ${quota.limit} 次`}</p>
    </div>
    <div class="quota-block">
      <strong>${state.bootstrap.user ? escapeHtml(state.bootstrap.user.displayName) : "未登录"}</strong>
      <div class="quota-actions">
        <a class="button secondary" href="/portal.html">${state.bootstrap.user ? "控制台" : "去登录"}</a>
        ${
          state.bootstrap.user
            ? '<button class="button secondary" type="button" data-action="logout">退出登录</button>'
            : ""
        }
      </div>
    </div>
  `;
}

async function handleQuotaActions(event) {
  const logoutButton = event.target.closest("[data-action='logout']");
  if (!logoutButton) {
    return;
  }

  try {
    await api("/api/auth/logout", { method: "POST" });
    state.session = null;
    resetStage();
    dom.message.textContent = "已退出登录。";
    await refreshBootstrap();
  } catch (error) {
    dom.message.textContent = error.message;
  }
}

function populateSharedSelects() {
  const children = [
    { id: "", label: state.bootstrap.user ? "不绑定孩子资料" : "游客体验模式" },
    ...(state.bootstrap.children ?? []).map((child) => ({
      id: child.id,
      label: `${child.name} · ${child.grade}`
    }))
  ];
  populateSelect(dom.form.querySelector(".child-select"), children);

  if (moduleName === "english") {
    populateSelect(document.querySelector("#module-level"), state.bootstrap.options.englishLevels);
    populateSelect(document.querySelector("#module-hint-language"), state.bootstrap.options.hintLanguages);
    populateSelect(dom.form.querySelector(".count-choice"), state.bootstrap.options.counts);
    populateSelect(dom.form.querySelector(".interval-choice"), state.bootstrap.options.intervals);
    populateSelect(dom.form.querySelector(".repeat-choice"), state.bootstrap.options.repeats);
  }

  if (moduleName === "chinese") {
    populateSelect(document.querySelector("#module-level"), state.bootstrap.options.chineseLevels);
    populateSelect(dom.form.querySelector(".count-choice"), state.bootstrap.options.counts);
    populateSelect(dom.form.querySelector(".interval-choice"), state.bootstrap.options.intervals);
    populateSelect(dom.form.querySelector(".repeat-choice"), state.bootstrap.options.repeats);
  }

  if (moduleName === "math") {
    populateSelect(document.querySelector("#module-range"), state.bootstrap.options.mathRanges);
    populateSelect(document.querySelector("#module-operation"), state.bootstrap.options.mathOperations);
    populateSelect(dom.form.querySelector(".count-choice"), state.bootstrap.options.counts);
  }

  document.querySelectorAll(".count-choice, .interval-choice, .repeat-choice, #module-range").forEach((select) => {
    updateCustomVisibility(select);
  });

  syncModeUi();
}

function populateSelect(select, options) {
  if (!select) {
    return;
  }
  select.innerHTML = options
    .map((option) => `<option value="${escapeHtml(option.id)}">${escapeHtml(option.label)}</option>`)
    .join("");
}

function resolveChoice(name, customName) {
  const choice = dom.form.elements.namedItem(name)?.value;
  if (choice === "custom") {
    return Number(dom.form.elements.namedItem(customName)?.value);
  }
  return Number(choice);
}

async function handleGenerate(event) {
  event.preventDefault();
  stopSpeech();

  try {
    const payload = await buildPayload();
    state.session = await api(getSessionUrl(), {
      method: "POST",
      body: payload
    });
    state.bootstrap.quota = state.session.quota;
    renderQuota();
    renderSession();
    dom.message.textContent = buildGenerateMessage();
  } catch (error) {
    dom.message.textContent = error.message;
  }
}

async function buildPayload() {
  if (moduleName === "english") {
    return {
      childId: dom.form.childId.value,
      level: dom.form.level.value,
      count: resolveChoice("countChoice", "countCustom"),
      hintLanguage: dom.form.hintLanguage.value,
      intervalSeconds: resolveChoice("intervalChoice", "intervalCustom"),
      repeats: resolveChoice("repeatChoice", "repeatCustom"),
      sessionMode: dom.form.sessionMode.value,
      customWordsText: dom.form.customWords?.value ?? ""
    };
  }

  if (moduleName === "chinese") {
    return {
      childId: dom.form.childId.value,
      level: dom.form.level.value,
      count: resolveChoice("countChoice", "countCustom"),
      intervalSeconds: resolveChoice("intervalChoice", "intervalCustom"),
      repeats: resolveChoice("repeatChoice", "repeatCustom"),
      sessionMode: dom.form.sessionMode.value,
      customWordsText: dom.form.customWords?.value ?? ""
    };
  }

  return {
    childId: dom.form.childId.value,
    rangeMax: resolveChoice("rangeChoice", "rangeCustom"),
    count: resolveChoice("countChoice", "countCustom"),
    operation: dom.form.operation.value
  };
}

function getSessionUrl() {
  if (moduleName === "english") {
    return "/api/training/english/session";
  }
  if (moduleName === "chinese") {
    return "/api/training/chinese/session";
  }
  return "/api/training/math/session";
}

function getSubmitUrl() {
  if (moduleName === "english") {
    return "/api/training/english/submit";
  }
  if (moduleName === "chinese") {
    return "/api/training/chinese/submit";
  }
  return "/api/training/math/submit";
}

function getModuleTitle() {
  if (moduleName === "english") {
    return "英语听写";
  }
  if (moduleName === "chinese") {
    return "语文听写";
  }
  return "数学练习";
}

function getEmptyStageText() {
  if (moduleName === "english") {
    return "先生成一组英语听写。";
  }
  if (moduleName === "chinese") {
    return "先生成一组语文听写。";
  }
  return "先生成一组数学题。";
}

function buildGenerateMessage() {
  if (moduleName === "math") {
    return "数学练习已生成。";
  }

  const sourceLabel = state.session.sourceLabel || "系统词库";
  const sessionMode = getSessionMode();
  return sessionMode === "parent_quiz"
    ? `${getModuleTitle()}已生成，${sourceLabel}共 ${state.session.items.length} 项。`
    : `${getModuleTitle()}已生成，孩子可以开始填写。`;
}

function renderSession() {
  if (!state.session) {
    return;
  }

  player.currentIndex = 0;
  player.hasStarted = false;

  if (moduleName === "math") {
    dom.status.textContent = `数学练习已生成，共 ${state.session.questions.length} 题。完成后提交批改。`;
    dom.answerGrid.innerHTML = state.session.questions
      .map(
        (question) => `
          <article class="answer-card trackable-item" data-order="${question.order}">
            <label>
              <strong>第 ${question.order} 题：${escapeHtml(question.prompt)}</strong>
              <input type="text" data-answer-input data-order="${question.order}" placeholder="输入答案" />
            </label>
          </article>
        `
      )
      .join("");
    return;
  }

  const itemCount = state.session.items.length;
  const sourceLabel = state.session.sourceLabel || "系统词库";
  const sessionMode = getSessionMode();
  const isParentMode = sessionMode === "parent_quiz";
  const reuseMessage = state.session.reusedItems ? "已复用部分词条补足题量" : "按当前设置生成";

  dom.status.textContent = isParentMode
    ? `已生成 ${itemCount} 个词，系统会逐项朗读，家长可直接提问。`
    : `已生成 ${itemCount} 个词，点击开始后，孩子边听边填写。`;

  dom.sessionMeta.innerHTML = `
    <span class="session-chip">${escapeHtml(sourceLabel)}</span>
    <span class="session-chip">${escapeHtml(isParentMode ? "家长提问" : "学生填写")}</span>
    <span class="session-chip">${itemCount} 项</span>
    <span class="session-chip">${state.session.config.intervalSeconds} 秒间隔</span>
    <span class="session-chip">${state.session.config.repeats} 次朗读</span>
    <span class="session-chip">${escapeHtml(reuseMessage)}</span>
  `;

  renderWordList(isParentMode);
  setWordPanelCollapsed(!isParentMode);
  dom.wordToggle?.classList.toggle("hidden", false);
  dom.checkButton?.classList.toggle("hidden", isParentMode);

  if (isParentMode) {
    dom.answerGrid.innerHTML = `
      <article class="stage-empty-card">
        <strong>家长提问模式</strong>
        <p>右侧会列出本次全部词单。点击开始后系统会依次朗读，你可以看着词单提问。</p>
      </article>
    `;
  } else {
    dom.answerGrid.innerHTML = state.session.items
      .map(
        (item) => `
          <article class="answer-card trackable-item" data-order="${item.order}">
            <label>
              <strong>第 ${item.order} 题</strong>
              <input type="text" data-answer-input data-order="${item.order}" placeholder="请在这里输入答案" />
            </label>
            <div class="answer-meta">提示：${escapeHtml(item.hint || "本题无额外提示")}</div>
          </article>
        `
      )
      .join("");
  }

  updateProgress(0, itemCount, "等待开始");
  highlightCard(null);
}

function renderWordList(isParentMode) {
  if (!dom.wordList || !state.session?.items) {
    return;
  }

  dom.wordPanelTitle.textContent = isParentMode ? "本次词单" : "家长词单";
  dom.wordPanelNote.textContent =
    state.session.sourceType === "custom"
      ? `自定义词单，共 ${state.session.items.length} 项`
      : `${state.session.sourceLabel || "系统词库"}，共 ${state.session.items.length} 项`;

  dom.wordList.innerHTML = state.session.items
    .map(
      (item) => `
        <article class="word-chip trackable-item" data-order="${item.order}">
          <span class="word-chip-order">${item.order}</span>
          <div class="word-chip-body">
            <strong>${escapeHtml(item.answer)}</strong>
            ${
              moduleName === "chinese" && item.pinyin
                ? `<small>${escapeHtml(item.pinyin)}</small>`
                : ""
            }
          </div>
        </article>
      `
    )
    .join("");
}

async function startPlayback() {
  if (moduleName === "math") {
    dom.message.textContent = "数学模块不需要语音播放，直接做题后提交批改即可。";
    return;
  }

  if (!state.session?.items?.length) {
    dom.message.textContent = "请先生成练习。";
    return;
  }

  stopSpeech(false);
  player.token += 1;
  player.hasStarted = true;

  const token = player.token;
  const total = state.session.items.length;
  const language = getSpeechLanguage();
  const isParentMode = getSessionMode() === "parent_quiz";

  for (let index = player.currentIndex; index < total; index += 1) {
    if (token !== player.token) {
      return;
    }

    player.currentIndex = index;
    highlightCard(index + 1);
    updateProgress(index + 1, total, `第 ${index + 1} / ${total} 项`);
    dom.status.textContent = isParentMode
      ? `正在朗读第 ${index + 1} / ${total} 个词。`
      : `正在播放第 ${index + 1} / ${total} 题。`;

    for (let repeatIndex = 0; repeatIndex < state.session.config.repeats; repeatIndex += 1) {
      if (token !== player.token) {
        return;
      }
      await speak(state.session.items[index].speakText, language);
      await sleep(420);
    }

    if (index < total - 1) {
      dom.status.textContent = `第 ${index + 1} 项已播放，${state.session.config.intervalSeconds} 秒后进入下一项。`;
      await sleep(state.session.config.intervalSeconds * 1000);
    }
  }

  player.currentIndex = 0;
  player.hasStarted = false;
  highlightCard(null);
  updateProgress(total, total, "播放完成");
  dom.status.textContent = isParentMode ? "播放完成，可以继续手动提问或重新开始。" : "播放完成，可以提交批改。";
}

function pausePlayback() {
  if (moduleName === "math") {
    return;
  }

  player.token += 1;
  window.speechSynthesis?.cancel();
  const total = state.session?.items?.length ?? 0;
  const completed = player.hasStarted ? Math.min(player.currentIndex + 1, total) : 0;
  updateProgress(completed, total, "已暂停");
  dom.status.textContent = "已暂停，再点开始会从当前位置继续。";
}

async function submitAnswers() {
  if (!state.session?.attemptId) {
    dom.message.textContent = "请先生成练习。";
    return;
  }

  if (getSessionMode() === "parent_quiz") {
    dom.message.textContent = "家长提问模式不需要提交批改。";
    return;
  }

  const questions = moduleName === "math" ? state.session.questions : state.session.items;
  try {
    const result = await api(getSubmitUrl(), {
      method: "POST",
      body: {
        attemptId: state.session.attemptId,
        answers: questions.map((item) => ({
          order: item.order,
          value: document.querySelector(`[data-answer-input][data-order="${item.order}"]`)?.value ?? ""
        }))
      }
    });

    result.items.forEach((item) => {
      const card = document.querySelector(`.answer-card[data-order="${item.order}"]`);
      if (!card) {
        return;
      }
      card.classList.remove("correct", "wrong", "active");
      card.classList.add(item.isCorrect ? "correct" : "wrong");

      const existing = card.querySelector(".result-meta");
      if (existing) {
        existing.remove();
      }

      const meta = document.createElement("div");
      meta.className = "answer-meta result-meta";
      meta.textContent =
        moduleName === "chinese"
          ? `你的答案：${item.userAnswer || "未填写"} · 正确答案：${item.answer}${item.pinyin ? ` / ${item.pinyin}` : ""}`
          : `你的答案：${item.userAnswer || "未填写"} · 正确答案：${item.answer}`;
      card.appendChild(meta);
    });

    updateProgress(result.totalCount, result.totalCount, "已批改");
    dom.status.textContent = `批改完成：${result.correctCount} / ${result.totalCount} 正确，正确率 ${result.score}%。`;
    dom.message.textContent = "已保存到历史记录和家长报告。";
  } catch (error) {
    dom.message.textContent = error.message;
  }
}

function toggleWordPanel() {
  if (!dom.wordPanel) {
    return;
  }
  setWordPanelCollapsed(!dom.wordPanel.classList.contains("is-collapsed"));
}

function setWordPanelCollapsed(collapsed) {
  if (!dom.wordPanel) {
    return;
  }

  dom.wordPanel.classList.toggle("is-collapsed", collapsed);
  if (dom.wordToggle) {
    dom.wordToggle.textContent = collapsed ? "显示家长词单" : "隐藏家长词单";
  }
}

function highlightCard(order) {
  document
    .querySelectorAll(".trackable-item")
    .forEach((card) => card.classList.toggle("active", Number(card.dataset.order) === order));
}

function updateProgress(current, total, note) {
  if (!dom.progressFill || !dom.progressText || !dom.progressNote) {
    return;
  }

  const safeTotal = Math.max(total || 0, 0);
  const safeCurrent = Math.min(Math.max(current || 0, 0), safeTotal || 0);
  const percent = safeTotal > 0 ? Math.round((safeCurrent / safeTotal) * 100) : 0;

  dom.progressFill.style.width = `${percent}%`;
  dom.progressText.textContent = safeTotal > 0 ? `${safeCurrent} / ${safeTotal}` : "0 / 0";
  dom.progressNote.textContent = note || "等待开始";
}

function syncModeUi() {
  if (!dictationModules.has(moduleName)) {
    return;
  }

  const isParentMode = getSelectedSessionMode() === "parent_quiz";
  document.querySelectorAll("[data-session-target='student']").forEach((element) => {
    element.classList.toggle("hidden", isParentMode);
  });

  if (!state.session) {
    dom.checkButton?.classList.toggle("hidden", isParentMode);
    setWordPanelCollapsed(!isParentMode);
    if (dom.wordPanelTitle) {
      dom.wordPanelTitle.textContent = isParentMode ? "本次词单" : "家长词单";
    }
    if (dom.wordPanelNote) {
      dom.wordPanelNote.textContent = isParentMode ? "生成后会直接显示全部词单" : "生成后可切换查看";
    }
    if (dom.wordList) {
      dom.wordList.innerHTML = `
        <article class="stage-empty-card compact">
          <strong>生成后显示</strong>
          <p>${isParentMode ? "会直接列出全部词单。" : "家长可按需展开词单查看。"}</p>
        </article>
      `;
    }
  }
}

function getSelectedSessionMode() {
  return dom.modeSelect?.value === "parent_quiz" ? "parent_quiz" : "student_input";
}

function getSessionMode() {
  return state.session?.config?.sessionMode || getSelectedSessionMode();
}

function getSpeechLanguage() {
  return moduleName === "english" ? "en-US" : "zh-CN";
}

function updateCustomVisibility(select) {
  if (!select) {
    return;
  }
  const container = select.closest("form") ?? document;
  const target = container.querySelector(`[data-custom-for='${select.name}']`);
  if (!target) {
    return;
  }
  target.classList.toggle("hidden", select.value !== "custom");
}

function resetStage() {
  stopSpeech();
  player.currentIndex = 0;
  player.hasStarted = false;
  highlightCard(null);

  if (dom.answerGrid) {
    dom.answerGrid.innerHTML = "";
  }

  if (dom.status) {
    dom.status.textContent = getEmptyStageText();
  }

  if (dom.sessionMeta) {
    dom.sessionMeta.innerHTML = "";
  }

  updateProgress(0, 0, "等待开始");
  syncModeUi();
}

function stopSpeech(resetToken = true) {
  if (resetToken) {
    player.token += 1;
  }
  window.speechSynthesis?.cancel();
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function speak(text, language) {
  if (!("speechSynthesis" in window)) {
    return;
  }

  const voices = await ensureVoices();
  const utterance = new SpeechSynthesisUtterance(text);
  const profile = voiceProfiles[language] ?? { rate: 0.9, exactNames: [], keywords: [] };
  const selectedVoice = pickVoice(voices, language, profile);

  utterance.lang = selectedVoice?.lang || language;
  utterance.rate = profile.rate;
  utterance.pitch = 1;
  utterance.volume = 1;

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  await new Promise((resolve) => {
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

async function ensureVoices() {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    return voices;
  }

  return new Promise((resolve) => {
    const finish = () => resolve(window.speechSynthesis.getVoices());
    const timeout = window.setTimeout(finish, 900);

    if (typeof window.speechSynthesis.addEventListener === "function") {
      const handler = () => {
        window.clearTimeout(timeout);
        window.speechSynthesis.removeEventListener("voiceschanged", handler);
        finish();
      };
      window.speechSynthesis.addEventListener("voiceschanged", handler);
      return;
    }

    window.speechSynthesis.onvoiceschanged = () => {
      window.clearTimeout(timeout);
      finish();
    };
  });
}

function pickVoice(voices, language, profile) {
  const languagePrefix = language.slice(0, 2).toLowerCase();

  return [...voices]
    .filter((voice) => voice.lang?.toLowerCase().startsWith(languagePrefix))
    .sort((a, b) => scoreVoice(b, language, profile) - scoreVoice(a, language, profile))[0];
}

function scoreVoice(voice, language, profile) {
  let score = 0;
  const voiceName = (voice.name || "").toLowerCase();
  const voiceLanguage = (voice.lang || "").toLowerCase();

  if (voiceLanguage === language.toLowerCase()) {
    score += 120;
  } else if (voiceLanguage.startsWith(language.slice(0, 2).toLowerCase())) {
    score += 90;
  }

  profile.exactNames.forEach((name, index) => {
    if (voice.name === name) {
      score += 160 - index * 8;
    }
  });

  profile.keywords.forEach((keyword, index) => {
    if (voiceName.includes(keyword)) {
      score += 70 - index * 4;
    }
  });

  if (voice.localService) {
    score += 12;
  }

  if (voice.default) {
    score += 6;
  }

  return score;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json"
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "请求失败");
  }
  return payload;
}
