const state = {
  bootstrap: null,
  users: [],
  invites: [],
  settings: {},
  summary: null,
  analytics: null,
  englishItems: [],
  chineseItems: []
};

const dom = {};

document.addEventListener("DOMContentLoaded", async () => {
  cacheDom();
  bindEvents();
  await initialize();
});

function cacheDom() {
  dom.adminNav = document.querySelector("#admin-nav");
  dom.sectionButtons = [...document.querySelectorAll("[data-admin-section]")];
  dom.panels = [...document.querySelectorAll("[data-admin-panel]")];
  dom.status = document.querySelector("#admin-status");
  dom.overviewCards = document.querySelector("#overview-cards");
  dom.analyticsSummaryCards = document.querySelector("#analytics-summary-cards");
  dom.analyticsDailyTableBody = document.querySelector("#analytics-daily-table-body");
  dom.analyticsTrendList = document.querySelector("#analytics-trend-list");
  dom.analyticsTopPages = document.querySelector("#analytics-top-pages");
  dom.analyticsTopSources = document.querySelector("#analytics-top-sources");
  dom.analyticsRegistrationsBySource = document.querySelector("#analytics-registrations-by-source");
  dom.usersTableBody = document.querySelector("#users-table-body");
  dom.inviteForm = document.querySelector("#invite-form");
  dom.inviteList = document.querySelector("#invite-list");
  dom.settingsForm = document.querySelector("#settings-form");
  dom.englishContentForm = document.querySelector("#english-content-form");
  dom.chineseContentForm = document.querySelector("#chinese-content-form");
  dom.englishContentSummary = document.querySelector("#english-content-summary");
  dom.chineseContentSummary = document.querySelector("#chinese-content-summary");
  dom.englishContentList = document.querySelector("#english-content-list");
  dom.chineseContentList = document.querySelector("#chinese-content-list");
  dom.adminEnglishLevel = document.querySelector("#admin-english-level");
  dom.adminChineseLevel = document.querySelector("#admin-chinese-level");
}

function bindEvents() {
  dom.adminNav?.addEventListener("click", handleSectionSwitch);
  dom.inviteForm?.addEventListener("submit", handleCreateInvites);
  dom.settingsForm?.addEventListener("submit", handleSaveSettings);
  dom.englishContentForm?.addEventListener("submit", handleCreateEnglishContent);
  dom.chineseContentForm?.addEventListener("submit", handleCreateChineseContent);

  dom.usersTableBody?.addEventListener("click", handleUsersTableActions);
  dom.englishContentList?.addEventListener("click", (event) => handleDeleteContent(event, "english"));
  dom.chineseContentList?.addEventListener("click", (event) => handleDeleteContent(event, "chinese"));
}

function handleSectionSwitch(event) {
  const button = event.target.closest("[data-admin-section]");
  if (!button) {
    return;
  }

  setAdminSection(button.dataset.adminSection);
}

function setAdminSection(section) {
  dom.sectionButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.adminSection === section);
  });

  dom.panels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.adminPanel === section);
  });
}

async function initialize() {
  try {
    state.bootstrap = await api("/api/bootstrap");
    if (!state.bootstrap.user || state.bootstrap.user.role !== "admin") {
      setStatus("当前账号不是管理员，请先用管理员账户登录训练中心。");
      return;
    }

    populateSelect(dom.adminEnglishLevel, state.bootstrap.options.englishLevels);
    populateSelect(dom.adminChineseLevel, state.bootstrap.options.chineseLevels);

    await Promise.all([
      loadOverview(),
      loadAnalytics(),
      loadUsers(),
      loadInvites(),
      loadSettings(),
      loadContent()
    ]);

    setAdminSection("overview");
    setStatus("管理员权限已确认，运营后台已加载。");
  } catch (error) {
    setStatus(error.message);
  }
}

async function loadOverview() {
  const overview = await api("/api/admin/overview");
  const summary = await api("/api/admin/content/summary");
  state.summary = summary;
  renderOverview(overview);
  renderContentSummary();
}

async function loadAnalytics() {
  state.analytics = await api("/api/admin/analytics/overview");
  renderAnalytics();
}

async function loadUsers() {
  const payload = await api("/api/admin/users");
  state.users = payload.users;
  renderUsers();
}

async function loadInvites() {
  const payload = await api("/api/admin/invites");
  state.invites = payload.invites;
  renderInvites();
}

async function loadSettings() {
  const payload = await api("/api/admin/settings");
  state.settings = payload.settings;
  renderSettings();
}

async function loadContent() {
  const [english, chinese] = await Promise.all([
    api("/api/admin/content?type=english&limit=20"),
    api("/api/admin/content?type=chinese&limit=20")
  ]);
  state.englishItems = english.items;
  state.chineseItems = chinese.items;
  renderContentLists();
}

function renderOverview(overview) {
  const cards = [
    { label: "注册用户", value: overview.userCount, note: "全部账户" },
    { label: "VIP 用户", value: overview.vipCount, note: "会员账户" },
    { label: "孩子资料", value: overview.childrenCount, note: "已建档案" },
    { label: "训练次数", value: overview.attemptsCount, note: "累计练习" },
    { label: "AI 生成", value: overview.aiGenerationCount, note: "累计调用" },
    { label: "邀请码", value: overview.inviteCount, note: "可用邀请码" },
    { label: "内容条目", value: overview.englishCount + overview.chineseCount, note: "题库总量" }
  ];

  dom.overviewCards.innerHTML = cards
    .map(
      (card) => `
        <article class="metric-card">
          <p>${card.label}</p>
          <strong>${card.value}</strong>
          <p>${card.note}</p>
        </article>
      `
    )
    .join("");
}

function renderAnalytics() {
  const analytics = state.analytics;
  if (!analytics) {
    return;
  }

  renderAnalyticsSummary(analytics.summary);
  renderAnalyticsDailyFunnel(analytics.dailyFunnel ?? []);
  renderAnalyticsTrend(analytics.trend ?? []);
  renderAnalyticsList(dom.analyticsTopPages, analytics.topPages ?? [], (row) => ({
    title: row.path || "/",
    note: `${row.pageviews} 次浏览`
  }));
  renderAnalyticsList(dom.analyticsTopSources, analytics.topSources ?? [], (row) => ({
    title: row.label || row.source_type || "direct",
    note: `${row.visits} 次访问`
  }));
  renderAnalyticsList(dom.analyticsRegistrationsBySource, analytics.registrationsBySource ?? [], (row) => ({
    title: row.label || row.source,
    note: `${row.registrations} 个注册 · ${row.vip_conversions} 个会员`
  }));
}

function renderAnalyticsSummary(summary) {
  const cards = [
    { label: "今日访客", value: summary.todayVisitors, note: `浏览 ${summary.todayPageviews}` },
    { label: "今日注册", value: summary.todayRegistrations, note: `转化 ${summary.todayRegistrationConversionRate}%` },
    { label: "今日会员转化", value: summary.todayVipConversions, note: "新增会员" },
    { label: "累计访客", value: summary.totalVisitors, note: `浏览 ${summary.totalPageviews}` },
    { label: "累计注册", value: summary.totalRegistrations, note: "普通用户" },
    { label: "累计 VIP", value: summary.totalVipUsers, note: "会员总数" }
  ];

  dom.analyticsSummaryCards.innerHTML = cards
    .map(
      (card) => `
        <article class="metric-card">
          <p>${card.label}</p>
          <strong>${card.value}</strong>
          <p>${card.note}</p>
        </article>
      `
    )
    .join("");
}

function renderAnalyticsDailyFunnel(rows) {
  if (!dom.analyticsDailyTableBody) {
    return;
  }

  if (rows.length === 0) {
    dom.analyticsDailyTableBody.innerHTML = `
      <tr>
        <td colspan="5">还没有访客数据，先让站点开始被访问。</td>
      </tr>
    `;
    return;
  }

  dom.analyticsDailyTableBody.innerHTML = rows
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(formatDay(row.day))}</td>
          <td>${row.visitors}</td>
          <td>${row.pageviews}</td>
          <td>${row.registrations}</td>
          <td>${row.vip_conversions}</td>
        </tr>
      `
    )
    .join("");
}

function renderAnalyticsTrend(rows) {
  if (!dom.analyticsTrendList) {
    return;
  }

  if (rows.length === 0) {
    dom.analyticsTrendList.innerHTML = `<div class="status-banner">还没有趋势数据。</div>`;
    return;
  }

  dom.analyticsTrendList.innerHTML = rows
    .map(
      (row) => `
        <div class="mini-card">
          <div>
            <strong>${escapeHtml(formatDay(row.day))}</strong>
            <p>访客 ${row.visitors} · 浏览 ${row.pageviews}</p>
          </div>
        </div>
      `
    )
    .join("");
}

function renderAnalyticsList(target, rows, mapper) {
  if (!target) {
    return;
  }

  if (rows.length === 0) {
    target.innerHTML = `<div class="status-banner">还没有数据。</div>`;
    return;
  }

  target.innerHTML = rows
    .map((row) => {
      const item = mapper(row);
      return `
        <div class="mini-card">
          <div>
            <strong>${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.note)}</p>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderUsers() {
  dom.usersTableBody.innerHTML = state.users
    .map(
      (user) => `
        <tr>
          <td>${escapeHtml(user.email)}</td>
          <td>${escapeHtml(user.display_name)}</td>
          <td>${escapeHtml(user.role)}</td>
          <td>${escapeHtml(user.acquisition_label || user.acquisition_source || "direct")}</td>
          <td>${user.is_vip ? "是" : "否"}</td>
          <td>${user.vip_activated_at ? escapeHtml(formatDateTime(user.vip_activated_at)) : "-"}</td>
          <td>${user.ai_generation_count}</td>
          <td>${user.last_ai_generation_at ? escapeHtml(formatDateTime(user.last_ai_generation_at)) : "-"}</td>
          <td>${user.practice_count}</td>
          <td>${escapeHtml(user.referral_code)}</td>
          <td>
            <button
              class="button secondary"
              type="button"
              data-action="toggle-vip"
              data-id="${escapeHtml(user.id)}"
              data-next-vip="${user.is_vip ? "0" : "1"}"
            >
              ${user.is_vip ? "取消 VIP" : "开通 VIP"}
            </button>
          </td>
        </tr>
      `
    )
    .join("");
}

function renderInvites() {
  if (state.invites.length === 0) {
    dom.inviteList.innerHTML = `<div class="status-banner">还没有邀请码，适合先生成一批给社群或客服使用。</div>`;
    return;
  }

  dom.inviteList.innerHTML = state.invites
    .map(
      (invite) => `
        <div class="mini-card">
          <div>
            <strong>${escapeHtml(invite.code)}</strong>
            <p>状态：${escapeHtml(invite.status)} · 已使用 ${invite.used_count} / ${invite.max_uses}</p>
          </div>
        </div>
      `
    )
    .join("");
}

function renderSettings() {
  fillForm(dom.settingsForm, {
    customerWechat: state.settings.customer_wechat,
    wechatQrImage: state.settings.wechat_qr_image,
    vipPriceText: state.settings.vip_price_text,
    guestTrialLimit: state.settings.guest_trial_limit,
    userTrialLimit: state.settings.user_trial_limit,
    aiGuestTrialLimit: state.settings.ai_guest_trial_limit,
    aiUserTrialLimit: state.settings.ai_user_trial_limit,
    wechatPaymentMessage: state.settings.wechat_payment_message,
    vipBenefits: state.settings.vip_benefits,
    inviteRegistrationNotice: state.settings.invite_registration_notice,
    siteNotice: state.settings.site_notice,
    aiSiteNotice: state.settings.ai_site_notice
  });
}

function renderContentSummary() {
  const summaryBlock = (rows) =>
    rows.map((row) => `<span class="tag">${escapeHtml(row.level)} · ${row.count}</span>`).join("");

  dom.englishContentSummary.innerHTML = summaryBlock(state.summary?.english ?? []);
  dom.chineseContentSummary.innerHTML = summaryBlock(state.summary?.chinese ?? []);
}

function renderContentLists() {
  dom.englishContentList.innerHTML = state.englishItems
    .map(
      (item) => `
        <div class="mini-card">
          <div>
            <strong>${escapeHtml(item.word)}</strong>
            <p>${escapeHtml(item.level)} · ${escapeHtml(item.hint_zh ?? "")}</p>
          </div>
          <button class="button secondary" type="button" data-action="delete-content" data-type="english" data-id="${escapeHtml(item.id)}">
            删除
          </button>
        </div>
      `
    )
    .join("");

  dom.chineseContentList.innerHTML = state.chineseItems
    .map(
      (item) => `
        <div class="mini-card">
          <div>
            <strong>${escapeHtml(item.text)}</strong>
            <p>${escapeHtml(item.level)} · ${escapeHtml(item.explanation ?? "")}</p>
          </div>
          <button class="button secondary" type="button" data-action="delete-content" data-type="chinese" data-id="${escapeHtml(item.id)}">
            删除
          </button>
        </div>
      `
    )
    .join("");
}

async function handleUsersTableActions(event) {
  const button = event.target.closest("[data-action='toggle-vip']");
  if (!button) {
    return;
  }

  try {
    const payload = await api(`/api/admin/users/${button.dataset.id}/vip`, {
      method: "POST",
      body: {
        isVip: button.dataset.nextVip === "1"
      }
    });
    state.users = payload.users;
    renderUsers();
    await Promise.all([loadOverview(), loadAnalytics()]);
    setStatus("VIP 状态已更新。");
  } catch (error) {
    setStatus(error.message);
  }
}

async function handleCreateInvites(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  try {
    const payload = await api("/api/admin/invites", {
      method: "POST",
      body: {
        quantity: Number(formData.get("quantity")),
        maxUses: Number(formData.get("maxUses"))
      }
    });
    state.invites = payload.invites;
    renderInvites();
    await loadOverview();
    setStatus(`已生成邀请码：${payload.codes.join(", ")}`);
  } catch (error) {
    setStatus(error.message);
  }
}

async function handleSaveSettings(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  try {
    const payload = await api("/api/admin/settings", {
      method: "POST",
      body: Object.fromEntries(formData.entries())
    });
    state.settings = payload.settings;
    renderSettings();
    setStatus("运营设置已保存。");
  } catch (error) {
    setStatus(error.message);
  }
}

async function handleCreateEnglishContent(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  try {
    await api("/api/admin/content/english", {
      method: "POST",
      body: Object.fromEntries(formData.entries())
    });
    event.currentTarget.reset();
    await Promise.all([loadOverview(), loadContent()]);
    setStatus("英语词条已添加。");
  } catch (error) {
    setStatus(error.message);
  }
}

async function handleCreateChineseContent(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  try {
    await api("/api/admin/content/chinese", {
      method: "POST",
      body: Object.fromEntries(formData.entries())
    });
    event.currentTarget.reset();
    await Promise.all([loadOverview(), loadContent()]);
    setStatus("语文词条已添加。");
  } catch (error) {
    setStatus(error.message);
  }
}

async function handleDeleteContent(event, type) {
  const button = event.target.closest("[data-action='delete-content']");
  if (!button) {
    return;
  }

  try {
    await api(`/api/admin/content/${type}/${button.dataset.id}`, {
      method: "DELETE"
    });
    await Promise.all([loadOverview(), loadContent()]);
    setStatus("内容已删除。");
  } catch (error) {
    setStatus(error.message);
  }
}

function populateSelect(select, options) {
  if (!select) {
    return;
  }

  select.innerHTML = options
    .map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.label)}</option>`)
    .join("");
}

function fillForm(form, values) {
  Object.entries(values).forEach(([key, value]) => {
    const field = form.elements.namedItem(key);
    if (field) {
      field.value = value ?? "";
    }
  });
}

function formatDay(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" });
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value ?? "";
  }
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function setStatus(message) {
  if (dom.status) {
    dom.status.textContent = message;
  }
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
