const state = {
  bootstrap: null,
  selectedToolId: null,
  drafts: {},
  assists: {},
  results: {},
  authView: "login"
};

const dom = {};

document.addEventListener("DOMContentLoaded", async () => {
  cacheDom();
  bindEvents();
  await captureReferralFromUrl();
  await refreshBootstrap();
});

function cacheDom() {
  dom.toolNav = document.querySelector("#tool-nav-list");
  dom.quotaPill = document.querySelector("#quota-pill");
  dom.providerPill = document.querySelector("#provider-pill");
  dom.authButton = document.querySelector("#auth-button");
  dom.logoutButton = document.querySelector("#logout-button");
  dom.heroCopy = document.querySelector("#hero-copy");
  dom.toolCategory = document.querySelector("#selected-tool-category");
  dom.toolTitle = document.querySelector("#selected-tool-title");
  dom.toolDescription = document.querySelector("#selected-tool-description");
  dom.userIdentity = document.querySelector("#user-identity");
  dom.guideChips = document.querySelector("#prompt-guide-chips");
  dom.promptInput = document.querySelector("#prompt-input");
  dom.assistButton = document.querySelector("#assist-button");
  dom.generateButton = document.querySelector("#generate-button");
  dom.message = document.querySelector("#ai-global-message");
  dom.assistShell = document.querySelector("#assist-shell");
  dom.examples = document.querySelector("#tool-examples");
  dom.resultShell = document.querySelector("#ai-result-shell");
  dom.authModal = document.querySelector("#auth-modal");
  dom.closeAuth = document.querySelector("#close-auth");
  dom.authTabs = [...document.querySelectorAll(".auth-tab")];
  dom.loginForm = document.querySelector("#login-form");
  dom.registerForm = document.querySelector("#register-form");
  dom.authMessage = document.querySelector("#auth-message");
}

function bindEvents() {
  dom.toolNav?.addEventListener("click", handleToolSelection);
  dom.examples?.addEventListener("click", handleExampleSelection);
  dom.promptInput?.addEventListener("input", persistPromptDraft);
  dom.assistButton?.addEventListener("click", handleAssist);
  dom.generateButton?.addEventListener("click", handleGenerate);
  dom.resultShell?.addEventListener("click", handleCopyActions);
  dom.assistShell?.addEventListener("click", handleCopyActions);

  dom.authButton?.addEventListener("click", () => openAuthModal("login"));
  dom.logoutButton?.addEventListener("click", handleLogout);
  dom.closeAuth?.addEventListener("click", closeAuthModal);
  dom.authModal?.addEventListener("click", (event) => {
    if (event.target instanceof HTMLElement && event.target.dataset.closeModal === "true") {
      closeAuthModal();
    }
  });

  dom.authTabs.forEach((button) => {
    button.addEventListener("click", () => setAuthView(button.dataset.authView || "login"));
  });

  dom.loginForm?.addEventListener("submit", handleLogin);
  dom.registerForm?.addEventListener("submit", handleRegister);

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !dom.authModal?.classList.contains("is-hidden")) {
      closeAuthModal();
    }
  });
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
  } catch (_error) {
    // Ignore referral capture failures so the page remains usable.
  } finally {
    url.searchParams.delete("ref");
    window.history.replaceState({}, "", url);
  }
}

async function refreshBootstrap() {
  const previousToolId = state.selectedToolId;
  state.bootstrap = await api("/api/ai-tools/bootstrap");

  const requestedToolId = new URL(window.location.href).searchParams.get("tool");
  const nextToolId =
    findToolId(requestedToolId) ||
    findToolId(previousToolId) ||
    state.bootstrap.tools[0]?.id ||
    null;

  state.selectedToolId = nextToolId;
  renderBootstrap();
}

function renderBootstrap() {
  renderTopBar();
  renderHeroCopy();
  renderToolNav();
  renderSelectedTool();
  renderResult();
}

function renderTopBar() {
  const quota = state.bootstrap.quota;
  const user = state.bootstrap.user;

  dom.quotaPill.textContent =
    quota.limit === null
      ? "VIP 不限次"
      : quota.scope === "guest"
        ? `游客剩余 ${quota.remaining} / ${quota.limit}`
        : `登录剩余 ${quota.remaining} / ${quota.limit}`;
  dom.providerPill.textContent = "图片可直接生成";

  if (user) {
    dom.authButton.classList.add("is-hidden");
    dom.logoutButton.classList.remove("is-hidden");
    dom.userIdentity.textContent = user.displayName || "已登录";
  } else {
    dom.authButton.classList.remove("is-hidden");
    dom.logoutButton.classList.add("is-hidden");
    dom.userIdentity.textContent = "游客模式";
  }
}

function renderHeroCopy() {
  const user = state.bootstrap.user;
  const freeRules = state.bootstrap.freeRules;
  const message = state.bootstrap.settings.aiSiteNotice || "";
  const prefix = user
    ? `已登录，可免费使用 ${freeRules.userLimit} 次，VIP 不限次。`
    : `游客可免费试用 ${freeRules.guestLimit} 次，登录后可免费使用 ${freeRules.userLimit} 次。`;
  dom.heroCopy.textContent = message ? `${prefix} ${message}` : prefix;
}

function renderToolNav() {
  dom.toolNav.innerHTML = state.bootstrap.tools
    .map(
      (tool) => `
        <button
          class="tool-pill ${tool.id === state.selectedToolId ? "is-active" : ""}"
          type="button"
          data-tool-id="${escapeHtml(tool.id)}"
        >
          <span>${escapeHtml(tool.shortTitle)}</span>
        </button>
      `
    )
    .join("");
}

function renderSelectedTool() {
  const tool = getSelectedTool();
  if (!tool) {
    return;
  }

  dom.toolCategory.textContent = tool.category;
  dom.toolTitle.textContent = tool.title;
  dom.toolDescription.textContent = tool.description;
  const defaultPrompt = tool.examples[0]?.prompt || tool.placeholderPrompt || "";
  if (!state.drafts[tool.id]) {
    state.drafts[tool.id] = defaultPrompt;
  }

  dom.promptInput.placeholder = tool.placeholderPrompt;
  dom.promptInput.value = state.drafts[tool.id];

  dom.guideChips.innerHTML = tool.promptGuides
    .map((item) => `<span class="guide-chip">${escapeHtml(item)}</span>`)
    .join("");

  dom.examples.innerHTML = tool.examples
    .map(
      (item) => `
        <button
          class="example-card"
          type="button"
          data-example-prompt="${escapeHtml(item.prompt)}"
        >
          <img src="${escapeHtml(item.previewUrl)}" alt="${escapeHtml(item.title)}" loading="lazy" />
          <span>${escapeHtml(item.title)}</span>
        </button>
      `
    )
    .join("");

  renderAssist();
}

function renderAssist() {
  const tool = getSelectedTool();
  const assist = tool ? state.assists[tool.id] : null;
  if (!assist) {
    dom.assistShell.classList.add("is-hidden");
    dom.assistShell.innerHTML = "";
    return;
  }

  dom.assistShell.classList.remove("is-hidden");
  dom.assistShell.innerHTML = `
    <div class="assist-head">
      <strong>提示词已扩写</strong>
      <button class="copy-button" type="button" data-copy="${escapeHtml(assist.suggestedPrompt)}">复制</button>
    </div>
    <pre class="assist-prompt">${escapeHtml(assist.suggestedPrompt)}</pre>
    ${
      assist.notes?.length
        ? `
          <div class="assist-list">
            ${assist.notes.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
          </div>
        `
        : ""
    }
  `;
}

function renderResult() {
  const tool = getSelectedTool();
  const payload = tool ? state.results[tool.id] : null;

  if (!payload) {
    dom.resultShell.innerHTML = `
      <div class="empty-state">
        <strong>等待生成</strong>
        <p>选一个工具，输入一句需求，结果会出现在这里。</p>
      </div>
    `;
    return;
  }

  const result = payload.result;
  dom.resultShell.innerHTML = `
    <div class="result-stack">
      <div class="result-head">
        <div>
          <p class="section-kicker">Output</p>
          <h4>${escapeHtml(result.headline)}</h4>
        </div>
        <span class="meta-chip">${escapeHtml(payload.provider.modeLabel)}</span>
      </div>
      <p class="result-summary">${escapeHtml(result.summary || "")}</p>
      ${
        payload.imageError
          ? `<div class="status-banner warning">图片生成失败：${escapeHtml(payload.imageError)}</div>`
          : ""
      }
      ${
        payload.imageUrl
          ? `
            <div class="image-frame">
              <img src="${escapeHtml(payload.imageUrl)}" alt="${escapeHtml(result.headline)}" />
            </div>
          `
          : ""
      }
      <div class="result-actions">
        ${payload.imageUrl ? `<a class="ghost-button" href="${escapeHtml(payload.imageUrl)}" target="_blank" rel="noreferrer">打开图片</a>` : ""}
        <button class="ghost-button" type="button" data-copy="${escapeHtml(result.prompt || "")}">复制提示词</button>
        ${result.body ? `<button class="ghost-button" type="button" data-copy="${escapeHtml(result.body)}">复制内容</button>` : ""}
      </div>
      ${
        result.body
          ? `
            <article class="content-block">
              <div class="content-head">
                <strong>${tool.kind === "text" ? "生成内容" : "生成说明"}</strong>
              </div>
              <pre>${escapeHtml(result.body)}</pre>
            </article>
          `
          : ""
      }
      ${
        result.prompt
          ? `
            <article class="content-block">
              <div class="content-head">
                <strong>最终提示词</strong>
              </div>
              <pre>${escapeHtml(result.prompt)}</pre>
            </article>
          `
          : ""
      }
      ${
        result.bullets?.length
          ? `
            <article class="content-block">
              <div class="content-head">
                <strong>继续优化</strong>
              </div>
              <ul class="bullet-list">
                ${result.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
              </ul>
            </article>
          `
          : ""
      }
    </div>
  `;
}

function handleToolSelection(event) {
  const button = event.target.closest("[data-tool-id]");
  if (!button) {
    return;
  }

  const nextToolId = button.dataset.toolId;
  if (!findToolId(nextToolId)) {
    return;
  }

  state.selectedToolId = nextToolId;
  updateToolInUrl(nextToolId);
  renderToolNav();
  renderSelectedTool();
  renderResult();
  setMessage("可以开始输入了。");
}

function handleExampleSelection(event) {
  const button = event.target.closest("[data-example-prompt]");
  if (!button) {
    return;
  }

  const tool = getSelectedTool();
  if (!tool) {
    return;
  }

  state.drafts[tool.id] = button.dataset.examplePrompt || "";
  dom.promptInput.value = state.drafts[tool.id];
  setMessage("示例提示词已载入，可以直接生成，也可以先改一改。");
}

function persistPromptDraft() {
  const tool = getSelectedTool();
  if (!tool) {
    return;
  }

  state.drafts[tool.id] = dom.promptInput.value;
}

async function handleAssist() {
  const tool = getSelectedTool();
  if (!tool) {
    return;
  }

  const prompt = dom.promptInput.value.trim();
  if (!prompt) {
    setMessage("先输入一句需求。");
    dom.promptInput.focus();
    return;
  }

  dom.assistButton.disabled = true;
  setMessage("正在扩写提示词...");

  try {
    const payload = await api("/api/ai-tools/assist-prompt", {
      method: "POST",
      body: {
        toolId: tool.id,
        prompt
      }
    });

    state.assists[tool.id] = payload.assist;
    state.drafts[tool.id] = payload.assist.suggestedPrompt;
    dom.promptInput.value = payload.assist.suggestedPrompt;
    renderAssist();
    setMessage("提示词已扩写。");
  } catch (error) {
    setMessage(error.message);
  } finally {
    dom.assistButton.disabled = false;
  }
}

async function handleGenerate() {
  const tool = getSelectedTool();
  if (!tool) {
    return;
  }

  const prompt = dom.promptInput.value.trim();
  if (!prompt) {
    setMessage("先输入一句需求。");
    dom.promptInput.focus();
    return;
  }

  dom.generateButton.disabled = true;
  setMessage(`正在生成 ${tool.title}...`);

  try {
    const payload = await api("/api/ai-tools/generate", {
      method: "POST",
      body: {
        toolId: tool.id,
        prompt
      }
    });

    state.results[tool.id] = payload;
    state.bootstrap.quota = payload.quota;
    if (payload.assist) {
      state.assists[tool.id] = payload.assist;
    }
    if (payload.result?.prompt) {
      state.drafts[tool.id] = payload.result.prompt;
      dom.promptInput.value = payload.result.prompt;
    }

    renderTopBar();
    renderAssist();
    renderResult();
    setMessage(`${tool.title} 已生成。`);
  } catch (error) {
    setMessage(error.message);
    if (!state.bootstrap.user && /登录|免费试用/.test(error.message)) {
      openAuthModal("login");
    }
  } finally {
    dom.generateButton.disabled = false;
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const formData = new FormData(dom.loginForm);
  const submitButton = dom.loginForm.querySelector("button[type='submit']");
  submitButton.disabled = true;
  setAuthMessage("正在登录...");

  try {
    await api("/api/auth/login", {
      method: "POST",
      body: {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? "")
      }
    });

    closeAuthModal();
    await refreshBootstrap();
    setMessage("登录成功。");
  } catch (error) {
    setAuthMessage(error.message);
  } finally {
    submitButton.disabled = false;
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const formData = new FormData(dom.registerForm);
  const inviteCode = String(formData.get("inviteCode") ?? "").trim();
  const submitButton = dom.registerForm.querySelector("button[type='submit']");
  submitButton.disabled = true;
  setAuthMessage("正在注册...");

  try {
    await api("/api/auth/register", {
      method: "POST",
      body: {
        displayName: String(formData.get("displayName") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        inviteCode,
        mode: inviteCode ? "invite" : "email"
      }
    });

    closeAuthModal();
    await refreshBootstrap();
    setMessage("注册成功。");
  } catch (error) {
    setAuthMessage(error.message);
  } finally {
    submitButton.disabled = false;
  }
}

async function handleLogout() {
  await api("/api/auth/logout", { method: "POST" });
  state.results = {};
  state.assists = {};
  await refreshBootstrap();
  setMessage("已退出登录。");
}

async function handleCopyActions(event) {
  const button = event.target.closest("[data-copy]");
  if (!button) {
    return;
  }

  await navigator.clipboard.writeText(button.dataset.copy || "");
  setMessage("已复制。");
}

function openAuthModal(view = "login") {
  setAuthView(view);
  dom.authModal.classList.remove("is-hidden");
  dom.authModal.setAttribute("aria-hidden", "false");
  setAuthMessage("输入邮箱即可开始。");
}

function closeAuthModal() {
  dom.authModal.classList.add("is-hidden");
  dom.authModal.setAttribute("aria-hidden", "true");
}

function setAuthView(view) {
  state.authView = view === "register" ? "register" : "login";
  const isLogin = state.authView === "login";
  dom.loginForm.classList.toggle("is-hidden", !isLogin);
  dom.registerForm.classList.toggle("is-hidden", isLogin);
  dom.authTabs.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.authView === state.authView);
  });
}

function setMessage(message) {
  dom.message.textContent = message;
}

function setAuthMessage(message) {
  dom.authMessage.textContent = message;
}

function getSelectedTool() {
  return state.bootstrap?.tools?.find((tool) => tool.id === state.selectedToolId) ?? null;
}

function findToolId(toolId) {
  return state.bootstrap?.tools?.find((tool) => tool.id === toolId)?.id ?? null;
}

function updateToolInUrl(toolId) {
  const url = new URL(window.location.href);
  url.searchParams.set("tool", toolId);
  window.history.replaceState({}, "", url);
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
