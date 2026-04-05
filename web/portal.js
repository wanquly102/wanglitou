const state = {
  bootstrap: null,
  report: null,
  history: [],
  historyDetails: {},
  expandedHistoryIds: new Set(),
  wrongBook: [],
  englishSession: null,
  chineseSession: null,
  mathSession: null
};

const dom = {};

document.addEventListener("DOMContentLoaded", async () => {
  cacheDom();
  bindStaticEvents();
  await captureReferralFromUrl();
  await refreshBootstrap();
});

function cacheDom() {
  dom.globalMessage = document.querySelector("#global-message");
  dom.quotaCard = document.querySelector("#quota-card");
  dom.authState = document.querySelector("#auth-state");
  dom.authTabs = document.querySelector("#auth-tabs");
  dom.loginForm = document.querySelector("#login-form");
  dom.registerForm = document.querySelector("#register-form");
  dom.inviteRegisterForm = document.querySelector("#invite-register-form");
  dom.inviteNotice = document.querySelector("#invite-notice");
  dom.childForm = document.querySelector("#child-form");
  dom.childGradeSelect = document.querySelector("#child-grade-select");
  dom.childrenList = document.querySelector("#children-list");
  dom.englishForm = document.querySelector("#english-form");
  dom.englishStatus = document.querySelector("#english-status");
  dom.englishAnswerGrid = document.querySelector("#english-answer-grid");
  dom.mathForm = document.querySelector("#math-form");
  dom.mathStatus = document.querySelector("#math-status");
  dom.mathAnswerGrid = document.querySelector("#math-answer-grid");
  dom.chineseForm = document.querySelector("#chinese-form");
  dom.chineseStatus = document.querySelector("#chinese-status");
  dom.chineseAnswerGrid = document.querySelector("#chinese-answer-grid");
  dom.customerWechat = document.querySelector("#customer-wechat");
  dom.vipPriceText = document.querySelector("#vip-price-text");
  dom.wechatPaymentMessage = document.querySelector("#wechat-payment-message");
  dom.wechatQrBox = document.querySelector("#wechat-qr-box");
  dom.affiliatePanel = document.querySelector("#affiliate-panel");
  dom.reportMetrics = document.querySelector("#report-metrics");
  dom.reportByModule = document.querySelector("#report-by-module");
  dom.reportByChild = document.querySelector("#report-by-child");
  dom.reportSuggestion = document.querySelector("#report-suggestion");
  dom.historyList = document.querySelector("#history-list");
  dom.wrongBookList = document.querySelector("#wrong-book-list");
}

function bindStaticEvents() {
  dom.authTabs?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-auth-view]");
    if (!button) {
      return;
    }
    setAuthView(button.dataset.authView);
  });

  dom.loginForm?.addEventListener("submit", handleLogin);
  dom.registerForm?.addEventListener("submit", handleRegister);
  dom.inviteRegisterForm?.addEventListener("submit", handleRegister);
  dom.childForm?.addEventListener("submit", handleCreateChild);
  dom.childrenList?.addEventListener("click", handleChildListActions);

  dom.englishForm?.addEventListener("submit", handleEnglishGenerate);
  dom.mathForm?.addEventListener("submit", handleMathGenerate);
  dom.chineseForm?.addEventListener("submit", handleChineseGenerate);

  document.querySelector("#english-start")?.addEventListener("click", () => startDictation("english"));
  document.querySelector("#english-pause")?.addEventListener("click", () => pauseDictation("english"));
  document.querySelector("#english-check")?.addEventListener("click", () => gradeDictation("english"));
  document.querySelector("#chinese-start")?.addEventListener("click", () => startDictation("chinese"));
  document.querySelector("#chinese-pause")?.addEventListener("click", () => pauseDictation("chinese"));
  document.querySelector("#chinese-check")?.addEventListener("click", () => gradeDictation("chinese"));
  document.querySelector("#math-check")?.addEventListener("click", gradeMathSession);

  document.querySelectorAll(".count-choice, .interval-choice, .repeat-choice, #math-range").forEach((select) => {
    select.addEventListener("change", (event) => {
      updateCustomVisibility(event.target);
    });
  });

  dom.authState?.addEventListener("click", async (event) => {
    const logoutButton = event.target.closest("[data-action='logout']");
    if (!logoutButton) {
      return;
    }

    await api("/api/auth/logout", { method: "POST" });
    resetUserState();
    setGlobalMessage("已退出登录。");
    await refreshBootstrap();
  });

  dom.affiliatePanel?.addEventListener("click", async (event) => {
    const copyButton = event.target.closest("[data-action='copy-affiliate']");
    if (!copyButton) {
      return;
    }

    await navigator.clipboard.writeText(copyButton.dataset.link);
    setGlobalMessage("联盟链接已复制。");
  });

  dom.historyList?.addEventListener("click", handleHistoryActions);
}

function resetUserState() {
  state.report = null;
  state.history = [];
  state.historyDetails = {};
  state.expandedHistoryIds = new Set();
  state.wrongBook = [];
  state.englishSession = null;
  state.chineseSession = null;
  state.mathSession = null;
}

async function captureReferralFromUrl() {
  const url = new URL(window.location.href);
  const ref = url.searchParams.get("ref");
  if (!ref) {
    return;
  }

  try {
    await api("/api/referral/capture", {
      method: "POST",
      body: { code: ref }
    });
    setGlobalMessage(`已记录联盟来源：${ref}`);
  } catch (_error) {
    // Public visitors should not be blocked by bad referral links.
  } finally {
    url.searchParams.delete("ref");
    window.history.replaceState({}, "", url);
  }
}

async function refreshBootstrap() {
  const payload = await api("/api/bootstrap");
  state.bootstrap = payload;
  renderBootstrap();
  await refreshInsights();
}

async function refreshInsights() {
  if (!state.bootstrap?.user) {
    renderInsightPlaceholders();
    return;
  }

  const [reportPayload, historyPayload, wrongBookPayload] = await Promise.all([
    api("/api/report/summary"),
    api("/api/history?limit=12"),
    api("/api/wrong-book?limit=20")
  ]);

  state.report = reportPayload.report;
  state.history = historyPayload.history;
  state.wrongBook = wrongBookPayload.wrongBook;

  renderReport();
  renderHistory();
  renderWrongBook();
}

function renderBootstrap() {
  renderQuota();
  renderAuthState();
  renderInviteNotice();
  populateBaseSelects();
  renderChildren();
  renderMembership();
  renderAffiliate();

  updateCustomVisibility(dom.englishForm?.querySelector(".count-choice"));
  updateCustomVisibility(dom.englishForm?.querySelector(".interval-choice"));
  updateCustomVisibility(dom.englishForm?.querySelector(".repeat-choice"));
  updateCustomVisibility(dom.mathForm?.querySelector(".count-choice"));
  updateCustomVisibility(document.querySelector("#math-range"));
  updateCustomVisibility(dom.chineseForm?.querySelector(".count-choice"));
  updateCustomVisibility(dom.chineseForm?.querySelector(".interval-choice"));
  updateCustomVisibility(dom.chineseForm?.querySelector(".repeat-choice"));

  if (!dom.globalMessage.textContent || dom.globalMessage.textContent === "正在加载系统信息...") {
    setGlobalMessage("可以开始。");
  }
}

function renderInsightPlaceholders() {
  if (dom.reportMetrics) {
    dom.reportMetrics.innerHTML = [
      { label: "累计练习", value: "-", note: "登录后显示" },
      { label: "平均正确率", value: "-", note: "登录后显示" },
      { label: "近 7 天练习", value: "-", note: "登录后显示" }
    ]
      .map(
        (item) => `
          <article class="metric-card">
            <p>${item.label}</p>
            <strong>${item.value}</strong>
            <p>${item.note}</p>
          </article>
        `
      )
      .join("");
  }

  if (dom.reportByModule) {
    dom.reportByModule.innerHTML = `<div class="status-banner">登录后显示。</div>`;
  }
  if (dom.reportByChild) {
    dom.reportByChild.innerHTML = `<div class="status-banner">添加孩子后显示。</div>`;
  }
  if (dom.reportSuggestion) {
    dom.reportSuggestion.textContent = "完成训练后显示。";
  }
  if (dom.historyList) {
    dom.historyList.innerHTML = `<div class="status-banner">登录后显示。</div>`;
  }
  if (dom.wrongBookList) {
    dom.wrongBookList.innerHTML = `<div class="status-banner">提交后显示。</div>`;
  }
}

function renderQuota() {
  const quota = state.bootstrap?.quota;
  if (!quota || !dom.quotaCard) {
    return;
  }

  const planLabel = quota.isVip ? "VIP 会员" : quota.scope === "user" ? "登录用户" : "游客体验";
  const remaining =
    quota.limit === null ? "不限次数" : `${quota.remaining} / ${quota.limit} 次剩余`;

  dom.quotaCard.innerHTML = `
    <div>
      <strong>${planLabel}</strong>
      <p>已发起 ${quota.used} 次训练。</p>
    </div>
    <div>
      <strong>${remaining}</strong>
      <p>${quota.isVip ? "不限次数。" : "达到上限后提示开通。"}</p>
    </div>
    ${state.bootstrap.user?.role === "admin" ? `<div><a class="button secondary" href="/admin.html">进入后台</a></div>` : ""}
  `;
}

function renderAuthState() {
  const user = state.bootstrap?.user;
  if (!dom.authState) {
    return;
  }

  if (!user) {
    dom.authState.innerHTML = `
      <div class="status-banner">当前未登录。</div>
    `;
    dom.authTabs?.classList.remove("hidden");
    setAuthView("login");
    return;
  }

  dom.authState.innerHTML = `
    <div class="mini-card">
      <div>
        <strong>${escapeHtml(user.displayName)}</strong>
        <p>${escapeHtml(user.email)} · ${user.isVip ? "VIP 会员" : "普通账户"}</p>
      </div>
      <div class="top-actions">
        ${user.role === "admin" ? '<a class="button secondary" href="/admin.html">后台</a>' : ""}
        <button class="button secondary" type="button" data-action="logout">退出</button>
      </div>
    </div>
  `;
  dom.authTabs?.classList.add("hidden");
  document.querySelectorAll(".auth-panel").forEach((panel) => panel.classList.remove("is-active"));
}

function renderInviteNotice() {
  if (dom.inviteNotice) {
    dom.inviteNotice.textContent = state.bootstrap?.settings.inviteRegistrationNotice ?? "";
  }
}

function getCombinedGradeOptions() {
  const combined = [
    ...state.bootstrap.options.englishLevels,
    ...state.bootstrap.options.chineseLevels
  ];
  const map = new Map();
  combined.forEach((item) => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });
  return [...map.values()];
}

function populateBaseSelects() {
  const { options } = state.bootstrap;
  populateSelect(dom.childGradeSelect, getCombinedGradeOptions());
  populateSelect(document.querySelector("#english-level"), options.englishLevels);
  populateSelect(document.querySelector("#english-hint-language"), options.hintLanguages);
  populateSelect(document.querySelector("#chinese-level"), options.chineseLevels);
  populateSelect(document.querySelector("#math-operation"), options.mathOperations);
  populateSelect(document.querySelector("#math-range"), options.mathRanges);

  document.querySelectorAll(".count-choice").forEach((select) => populateSelect(select, options.counts));
  document.querySelectorAll(".interval-choice").forEach((select) => populateSelect(select, options.intervals));
  document.querySelectorAll(".repeat-choice").forEach((select) => populateSelect(select, options.repeats));

  populateChildSelectors();
}

function populateChildSelectors() {
  const options = [
    { id: "", label: state.bootstrap.user ? "不绑定孩子资料" : "游客体验模式" },
    ...(state.bootstrap.children ?? []).map((child) => ({
      id: child.id,
      label: `${child.name} · ${child.grade}`
    }))
  ];

  document.querySelectorAll(".child-select").forEach((select) => populateSelect(select, options));
}

function populateSelect(select, options) {
  if (!select) {
    return;
  }

  const previousValue = select.value;
  select.innerHTML = options
    .map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.label)}</option>`)
    .join("");

  if (previousValue && [...select.options].some((option) => option.value === previousValue)) {
    select.value = previousValue;
  }
}

function renderChildren() {
  if (!dom.childrenList) {
    return;
  }

  if (!state.bootstrap.user) {
    dom.childrenList.innerHTML = `<div class="status-banner">登录后可添加孩子。</div>`;
    populateChildSelectors();
    return;
  }

  const children = state.bootstrap.children ?? [];
  if (children.length === 0) {
    dom.childrenList.innerHTML = `<div class="status-banner">还没有孩子资料。</div>`;
    populateChildSelectors();
    return;
  }

  dom.childrenList.innerHTML = children
    .map(
      (child) => `
        <div class="mini-card">
          <div>
            <strong>${escapeHtml(child.name)}</strong>
            <p>${escapeHtml(child.grade)}</p>
          </div>
          <button class="button secondary" type="button" data-action="delete-child" data-id="${escapeHtml(child.id)}">
            删除
          </button>
        </div>
      `
    )
    .join("");

  populateChildSelectors();
}

function renderMembership() {
  if (!dom.customerWechat || !dom.vipPriceText || !dom.wechatPaymentMessage || !dom.wechatQrBox) {
    return;
  }

  dom.customerWechat.textContent = state.bootstrap.settings.customerWechat || "待配置";
  dom.vipPriceText.textContent = state.bootstrap.settings.vipPriceText || "";
  dom.wechatPaymentMessage.textContent = state.bootstrap.settings.wechatPaymentMessage || "";

  if (state.bootstrap.settings.wechatQrImage) {
    dom.wechatQrBox.innerHTML = `<img src="${escapeHtml(state.bootstrap.settings.wechatQrImage)}" alt="微信二维码" style="max-width:100%;border-radius:18px;" />`;
  } else {
    dom.wechatQrBox.textContent = "待设置二维码";
  }
}

function renderAffiliate() {
  if (!dom.affiliatePanel) {
    return;
  }

  if (!state.bootstrap.user) {
    dom.affiliatePanel.innerHTML = `
      <div class="status-banner">登录后生成链接。</div>
    `;
    return;
  }

  dom.affiliatePanel.innerHTML = `
    <div class="mini-card">
      <div>
        <strong>你的联盟链接</strong>
        <p>${escapeHtml(state.bootstrap.affiliateLink)}</p>
      </div>
      <button class="button secondary" type="button" data-action="copy-affiliate" data-link="${escapeHtml(
        state.bootstrap.affiliateLink
      )}">
        复制链接
      </button>
    </div>
  `;
}

function renderReport() {
  const report = state.report;
  if (!dom.reportMetrics && !dom.reportByModule && !dom.reportByChild && !dom.reportSuggestion) {
    return;
  }

  if (!report) {
    renderInsightPlaceholders();
    return;
  }

  const metrics = [
    {
      label: "累计练习",
      value: report.totals.totalAttempts,
      note: `已提交 ${report.totals.submittedAttempts} 次批改`
    },
    {
      label: "平均正确率",
      value: `${report.totals.averageScore}%`,
      note: "来自所有已提交练习"
    },
    {
      label: "近 7 天练习",
      value: report.totals.attemptsLast7Days,
      note: `近 7 天平均 ${report.totals.averageScoreLast7Days}%`
    }
  ];

  if (dom.reportMetrics) {
    dom.reportMetrics.innerHTML = metrics
      .map(
        (item) => `
          <article class="metric-card">
            <p>${item.label}</p>
            <strong>${item.value}</strong>
            <p>${item.note}</p>
          </article>
        `
      )
      .join("");
  }

  if (dom.reportByModule) {
    dom.reportByModule.innerHTML =
      report.byModule.length === 0
        ? `<div class="status-banner">还没有已记录的模块表现。先开始一次训练吧。</div>`
        : report.byModule
            .map(
              (item) => `
                <div class="mini-card">
                  <div>
                    <strong>${escapeHtml(item.moduleTitle)}</strong>
                    <p>发起 ${item.attempts} 次 · 已提交 ${item.submittedAttempts} 次</p>
                  </div>
                  <div class="score-pill">${item.averageScore}%</div>
                </div>
              `
            )
            .join("");
  }

  if (dom.reportByChild) {
    dom.reportByChild.innerHTML =
      report.byChild.length === 0
        ? `<div class="status-banner">还没有孩子维度数据。登录后先添加一个孩子资料会更清晰。</div>`
        : report.byChild
            .map(
              (child) => `
                <div class="mini-card">
                  <div>
                    <strong>${escapeHtml(child.name)}</strong>
                    <p>${escapeHtml(child.grade)} · 发起 ${child.attempts} 次 · 已提交 ${child.submittedAttempts} 次</p>
                  </div>
                  <div class="score-pill">${child.averageScore}%</div>
                </div>
              `
            )
            .join("");
  }

  if (dom.reportSuggestion) {
    dom.reportSuggestion.textContent = report.suggestion;
  }
}

function renderHistory() {
  if (!dom.historyList) {
    return;
  }

  if (!state.bootstrap?.user) {
    dom.historyList.innerHTML = `<div class="status-banner">登录后可查看最近练习历史和批改记录。</div>`;
    return;
  }

  if (state.history.length === 0) {
    dom.historyList.innerHTML = `<div class="status-banner">还没有历史记录。先生成一组练习并提交批改吧。</div>`;
    return;
  }

  dom.historyList.innerHTML = state.history
    .map((entry) => {
      const detail = state.historyDetails[entry.id];
      const isExpanded = state.expandedHistoryIds.has(entry.id);
      const scoreText =
        entry.status === "submitted"
          ? `${entry.correctCount} / ${entry.totalCount} · ${entry.score}%`
          : "待提交批改";

      return `
        <div class="history-card">
          <div class="mini-card">
            <div>
              <strong>${escapeHtml(entry.moduleTitle)}</strong>
              <p>${entry.child ? `${escapeHtml(entry.child.name)} · ` : ""}${formatDateTime(entry.createdAt)} · ${escapeHtml(
                entry.level || "未标记"
              )}</p>
              <p>${scoreText}</p>
            </div>
            <div class="top-actions">
              <span class="tag">${entry.status === "submitted" ? "已批改" : "待批改"}</span>
              <button class="button secondary" type="button" data-action="toggle-history" data-id="${escapeHtml(entry.id)}">
                ${isExpanded ? "收起详情" : "查看详情"}
              </button>
            </div>
          </div>
          ${
            isExpanded && detail
              ? `
                <div class="history-detail">
                  ${detail.items
                    .map(
                      (item) => `
                        <div class="mini-card">
                          <div>
                            <strong>第 ${item.order} 题</strong>
                            <p>${escapeHtml(item.prompt || item.speakText || "练习项")}</p>
                            ${
                              item.hint
                                ? `<p>提示：${escapeHtml(item.hint)}</p>`
                                : ""
                            }
                          </div>
                          <div>
                            <p>你的答案：${escapeHtml(item.userAnswer || "未填写")}</p>
                            <p>正确答案：${escapeHtml(item.answer)}</p>
                          </div>
                        </div>
                      `
                    )
                    .join("")}
                </div>
              `
              : ""
          }
        </div>
      `;
    })
    .join("");
}

function renderWrongBook() {
  if (!dom.wrongBookList) {
    return;
  }

  if (!state.bootstrap?.user) {
    dom.wrongBookList.innerHTML = `<div class="status-banner">登录并完成批改后，错题会自动沉淀到这里。</div>`;
    return;
  }

  if (state.wrongBook.length === 0) {
    dom.wrongBookList.innerHTML = `<div class="status-banner">当前还没有错题记录，这很棒。继续保持练习节奏。</div>`;
    return;
  }

  dom.wrongBookList.innerHTML = state.wrongBook
    .map(
      (item) => `
        <div class="mini-card">
          <div>
            <strong>${escapeHtml(item.moduleTitle)} · 第 ${item.order} 题</strong>
            <p>${item.child ? `${escapeHtml(item.child.name)} · ` : ""}${formatDateTime(item.submittedAt)}</p>
            <p>${escapeHtml(item.prompt || item.speakText || "练习项")}</p>
            ${item.hint ? `<p>提示：${escapeHtml(item.hint)}</p>` : ""}
            ${item.pinyin ? `<p>拼音：${escapeHtml(item.pinyin)}</p>` : ""}
          </div>
          <div>
            <p>你的答案：${escapeHtml(item.userAnswer || "未填写")}</p>
            <p>正确答案：${escapeHtml(item.answer)}</p>
          </div>
        </div>
      `
    )
    .join("");
}

async function handleLogin(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  try {
    const payload = await api("/api/auth/login", {
      method: "POST",
      body: {
        email: formData.get("email"),
        password: formData.get("password")
      }
    });
    state.bootstrap = payload;
    renderBootstrap();
    await refreshInsights();
    setGlobalMessage("登录成功。");
  } catch (error) {
    setGlobalMessage(error.message);
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  try {
    const payload = await api("/api/auth/register", {
      method: "POST",
      body: {
        displayName: formData.get("displayName"),
        email: formData.get("email"),
        password: formData.get("password"),
        mode: formData.get("mode"),
        inviteCode: formData.get("inviteCode")
      }
    });
    state.bootstrap = payload;
    renderBootstrap();
    await refreshInsights();
    setGlobalMessage("注册成功，已经为你登录。");
  } catch (error) {
    setGlobalMessage(error.message);
  }
}

async function handleCreateChild(event) {
  event.preventDefault();
  if (!state.bootstrap.user) {
    setGlobalMessage("请先登录再添加孩子资料。");
    return;
  }

  const formData = new FormData(event.currentTarget);
  try {
    const payload = await api("/api/children", {
      method: "POST",
      body: {
        name: formData.get("name"),
        grade: formData.get("grade")
      }
    });
    state.bootstrap.children = payload.children;
    renderChildren();
    event.currentTarget.reset();
    populateSelect(dom.childGradeSelect, getCombinedGradeOptions());
    await refreshInsights();
    setGlobalMessage("孩子资料已添加。");
  } catch (error) {
    setGlobalMessage(error.message);
  }
}

async function handleChildListActions(event) {
  const button = event.target.closest("[data-action='delete-child']");
  if (!button) {
    return;
  }

  try {
    const payload = await api(`/api/children/${button.dataset.id}`, {
      method: "DELETE"
    });
    state.bootstrap.children = payload.children;
    renderChildren();
    await refreshInsights();
    setGlobalMessage("孩子资料已删除。");
  } catch (error) {
    setGlobalMessage(error.message);
  }
}

async function handleHistoryActions(event) {
  const button = event.target.closest("[data-action='toggle-history']");
  if (!button || !state.bootstrap?.user) {
    return;
  }

  const attemptId = button.dataset.id;
  if (state.expandedHistoryIds.has(attemptId)) {
    state.expandedHistoryIds.delete(attemptId);
    renderHistory();
    return;
  }

  if (!state.historyDetails[attemptId]) {
    try {
      const payload = await api(`/api/history/${attemptId}`);
      state.historyDetails[attemptId] = payload.detail;
    } catch (error) {
      setGlobalMessage(error.message);
      return;
    }
  }

  state.expandedHistoryIds.add(attemptId);
  renderHistory();
}

function resolveChoice(form, choiceName, customName) {
  const choice = form.querySelector(`[name='${choiceName}']`)?.value;
  if (choice === "custom") {
    return Number(form.querySelector(`[name='${customName}']`)?.value);
  }
  return Number(choice);
}

async function handleEnglishGenerate(event) {
  event.preventDefault();
  try {
    const form = event.currentTarget;
    const payload = await api("/api/training/english/session", {
      method: "POST",
      body: {
        childId: form.childId.value,
        level: form.level.value,
        count: resolveChoice(form, "countChoice", "countCustom"),
        hintLanguage: form.hintLanguage.value,
        intervalSeconds: resolveChoice(form, "intervalChoice", "intervalCustom"),
        repeats: resolveChoice(form, "repeatChoice", "repeatCustom")
      }
    });
    state.englishSession = payload;
    state.bootstrap.quota = payload.quota;
    renderQuota();
    renderDictationSession("english", payload);
    await refreshInsights();
    setGlobalMessage(payload.reusedItems ? "已生成练习。当前词库不足，系统重复使用了部分词。" : "英语听写已生成。");
  } catch (error) {
    setGlobalMessage(error.message);
  }
}

async function handleChineseGenerate(event) {
  event.preventDefault();
  try {
    const form = event.currentTarget;
    const payload = await api("/api/training/chinese/session", {
      method: "POST",
      body: {
        childId: form.childId.value,
        level: form.level.value,
        count: resolveChoice(form, "countChoice", "countCustom"),
        intervalSeconds: resolveChoice(form, "intervalChoice", "intervalCustom"),
        repeats: resolveChoice(form, "repeatChoice", "repeatCustom")
      }
    });
    state.chineseSession = payload;
    state.bootstrap.quota = payload.quota;
    renderQuota();
    renderDictationSession("chinese", payload);
    await refreshInsights();
    setGlobalMessage(payload.reusedItems ? "已生成练习。当前词库不足，系统重复使用了部分词。" : "语文听写已生成。");
  } catch (error) {
    setGlobalMessage(error.message);
  }
}

async function handleMathGenerate(event) {
  event.preventDefault();
  try {
    const form = event.currentTarget;
    const payload = await api("/api/training/math/session", {
      method: "POST",
      body: {
        childId: form.childId.value,
        rangeMax: resolveChoice(form, "rangeChoice", "rangeCustom"),
        count: resolveChoice(form, "countChoice", "countCustom"),
        operation: form.operation.value
      }
    });
    state.mathSession = payload;
    state.bootstrap.quota = payload.quota;
    renderQuota();
    renderMathSession(payload);
    await refreshInsights();
    setGlobalMessage("数学练习已生成。");
  } catch (error) {
    setGlobalMessage(error.message);
  }
}

function renderDictationSession(kind, payload) {
  const statusEl = kind === "english" ? dom.englishStatus : dom.chineseStatus;
  const gridEl = kind === "english" ? dom.englishAnswerGrid : dom.chineseAnswerGrid;
  const label = kind === "english" ? "英语" : "语文";

  statusEl.textContent = `${label}练习已准备好，词库共 ${payload.librarySize} 条，本次 ${payload.items.length} 题。点击“开始”即可播放。`;
  gridEl.innerHTML = payload.items
    .map(
      (item) => `
        <article class="answer-card" data-kind="${kind}" data-order="${item.order}">
          <label>
            <strong>第 ${item.order} 题</strong>
            <input type="text" data-answer-input="${kind}" data-order="${item.order}" placeholder="请在这里输入答案" />
          </label>
          <div class="answer-meta">提示：${escapeHtml(item.hint || "本题无额外提示")}</div>
        </article>
      `
    )
    .join("");
}

function renderMathSession(payload) {
  dom.mathStatus.textContent = `数学练习已生成，共 ${payload.questions.length} 题。完成后点击“提交批改”。`;
  dom.mathAnswerGrid.innerHTML = payload.questions
    .map(
      (question) => `
        <article class="answer-card" data-kind="math" data-order="${question.order}">
          <label>
            <strong>第 ${question.order} 题：${escapeHtml(question.prompt)}</strong>
            <input type="text" data-answer-input="math" data-order="${question.order}" placeholder="输入答案" />
          </label>
        </article>
      `
    )
    .join("");
}

const players = {
  english: createDictationPlayer("english", "en-US"),
  chinese: createDictationPlayer("chinese", "zh-CN")
};

function createDictationPlayer(kind, language) {
  return {
    token: 0,
    currentIndex: 0,
    async start() {
      const session = state[`${kind}Session`];
      if (!session) {
        setGlobalMessage("请先生成练习。");
        return;
      }

      this.token += 1;
      const activeToken = this.token;
      const statusEl = kind === "english" ? dom.englishStatus : dom.chineseStatus;

      for (let index = this.currentIndex; index < session.items.length; index += 1) {
        if (activeToken !== this.token) {
          return;
        }

        this.currentIndex = index;
        highlightCurrentCard(kind, index + 1);
        statusEl.textContent = `正在播放第 ${index + 1} / ${session.items.length} 题。`;

        for (let repeatIndex = 0; repeatIndex < session.config.repeats; repeatIndex += 1) {
          if (activeToken !== this.token) {
            return;
          }
          await speak(session.items[index].speakText, language);
          await sleep(500);
        }

        if (index < session.items.length - 1) {
          statusEl.textContent = `第 ${index + 1} 题已播放，${session.config.intervalSeconds} 秒后进入下一题。`;
          await sleep(session.config.intervalSeconds * 1000);
        }
      }

      this.currentIndex = 0;
      highlightCurrentCard(kind, null);
      statusEl.textContent = "播放完成，可以点击“提交批改”查看结果。";
    },
    pause() {
      this.token += 1;
      window.speechSynthesis.cancel();
      const statusEl = kind === "english" ? dom.englishStatus : dom.chineseStatus;
      statusEl.textContent = `已暂停，当前停在第 ${this.currentIndex + 1} 题，再点“开始”会从当前位置继续。`;
    }
  };
}

function startDictation(kind) {
  players[kind].start();
}

function pauseDictation(kind) {
  players[kind].pause();
}

async function gradeDictation(kind) {
  const session = state[`${kind}Session`];
  if (!session?.attemptId) {
    setGlobalMessage("请先生成练习。");
    return;
  }

  try {
    const payload = await api(`/api/training/${kind}/submit`, {
      method: "POST",
      body: {
        attemptId: session.attemptId,
        answers: session.items.map((item) => ({
          order: item.order,
          value: document.querySelector(`[data-answer-input="${kind}"][data-order="${item.order}"]`)?.value ?? ""
        }))
      }
    });

    applySubmissionResults(kind, payload);
    await refreshInsights();
    setGlobalMessage(`${payload.moduleTitle}批改完成：${payload.correctCount} / ${payload.totalCount}，正确率 ${payload.score}%。`);
  } catch (error) {
    setGlobalMessage(error.message);
  }
}

async function gradeMathSession() {
  const session = state.mathSession;
  if (!session?.attemptId) {
    setGlobalMessage("请先生成数学练习。");
    return;
  }

  try {
    const payload = await api("/api/training/math/submit", {
      method: "POST",
      body: {
        attemptId: session.attemptId,
        answers: session.questions.map((question) => ({
          order: question.order,
          value: document.querySelector(`[data-answer-input="math"][data-order="${question.order}"]`)?.value ?? ""
        }))
      }
    });

    applySubmissionResults("math", payload);
    await refreshInsights();
    setGlobalMessage(`数学练习批改完成：${payload.correctCount} / ${payload.totalCount}，正确率 ${payload.score}%。`);
  } catch (error) {
    setGlobalMessage(error.message);
  }
}

function applySubmissionResults(kind, payload) {
  const statusEl =
    kind === "english"
      ? dom.englishStatus
      : kind === "chinese"
        ? dom.chineseStatus
        : dom.mathStatus;

  payload.items.forEach((item) => {
    const card = document.querySelector(`.answer-card[data-kind="${kind}"][data-order="${item.order}"]`);
    if (!card) {
      return;
    }

    card.classList.remove("correct", "wrong", "active");
    card.classList.add(item.isCorrect ? "correct" : "wrong");

    const existingMeta = card.querySelector(".result-meta");
    if (existingMeta) {
      existingMeta.remove();
    }

    const result = document.createElement("div");
    result.className = "answer-meta result-meta";

    if (kind === "math") {
      result.textContent = `你的答案：${item.userAnswer || "未填写"} · 正确答案：${item.answer}`;
    } else if (kind === "chinese") {
      result.textContent = `你的答案：${item.userAnswer || "未填写"} · 正确答案：${item.answer}${item.pinyin ? ` / ${item.pinyin}` : ""}`;
    } else {
      result.textContent = `你的答案：${item.userAnswer || "未填写"} · 正确答案：${item.answer}`;
    }

    card.appendChild(result);
  });

  statusEl.textContent = `批改完成：${payload.correctCount} / ${payload.totalCount} 正确，正确率 ${payload.score}%。`;
}

function highlightCurrentCard(kind, order) {
  document
    .querySelectorAll(`.answer-card[data-kind="${kind}"]`)
    .forEach((card) => card.classList.toggle("active", Number(card.dataset.order) === order));
}

function setAuthView(view) {
  document.querySelectorAll("[data-auth-view]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.authView === view);
  });

  document.querySelectorAll(".auth-panel").forEach((panel) => {
    const matches =
      (view === "login" && panel.id === "login-form") ||
      (view === "email" && panel.id === "register-form") ||
      (view === "invite" && panel.id === "invite-register-form");
    panel.classList.toggle("is-active", matches);
  });
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

function setGlobalMessage(message) {
  if (dom.globalMessage) {
    dom.globalMessage.textContent = message;
  }
}

function formatDateTime(value) {
  if (!value) {
    return "未记录";
  }

  return new Date(value).toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function speak(text, language) {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
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
