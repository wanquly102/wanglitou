const tools = [
  {
    id: "poster",
    title: "AI 海报生成",
    category: "图片",
    description: "活动海报、宣传海报、招生活动和品牌视觉都可以直接出图。",
    type: "image",
    placeholder: "比如：做一张春季活动海报，主标题要醒目，颜色要高级，底部加扫码咨询。",
    outputWidth: 1024,
    outputHeight: 1365,
    guides: ["主题", "目标人群", "卖点", "风格", "配色", "尺寸", "CTA"],
    examples: [
      {
        title: "咖啡店开业海报",
        prompt: "给一家精品咖啡店做一张开业海报，主标题第二杯半价，黑金风格，适合小红书竖版，底部加限本周。",
        preview: buildImageUrl("给一家精品咖啡店做一张开业海报，主标题第二杯半价，黑金风格，适合小红书竖版，底部加限本周。", 2201, 960, 960)
      },
      {
        title: "课程招生活动",
        prompt: "做一张 AI 绘画训练营招生活动海报，科技感蓝紫渐变，突出 3 天体验营和扫码咨询，适合 4:5 竖版。",
        preview: buildImageUrl("做一张 AI 绘画训练营招生活动海报，科技感蓝紫渐变，突出 3 天体验营和扫码咨询，适合 4:5 竖版。", 2202, 960, 960)
      },
      {
        title: "女装上新海报",
        prompt: "为轻奢女装品牌生成一张春季上新海报，米白和雾蓝配色，突出面料质感和新品折扣，适合微信朋友圈。",
        preview: buildImageUrl("为轻奢女装品牌生成一张春季上新海报，米白和雾蓝配色，突出面料质感和新品折扣，适合微信朋友圈。", 2203, 960, 960)
      }
    ]
  },
  {
    id: "xiaohongshu",
    title: "小红书封面生成",
    category: "图片",
    description: "适合图集封面、种草封面、干货封面和转化封面。",
    type: "image",
    placeholder: "比如：做一张小红书封面，标题要大，适合创业干货账号，颜色醒目但不廉价。",
    outputWidth: 1080,
    outputHeight: 1440,
    guides: ["主题", "封面标题", "受众", "风格", "系列感", "品牌元素"],
    examples: [
      {
        title: "AI 商品图封面",
        prompt: "做一张小红书图集封面，主题独立站卖家如何用 AI 做商品图，红白黑配色，标题要醒目，适合创业干货账号。",
        preview: buildImageUrl("做一张小红书图集封面，主题独立站卖家如何用 AI 做商品图，红白黑配色，标题要醒目，适合创业干货账号。", 3201, 960, 960)
      },
      {
        title: "副业变现封面",
        prompt: "设计一张小红书图集封面，主题普通人怎么用 AI 接单赚钱，奶油黄和黑色配色，强信息感，适合职场副业博主。",
        preview: buildImageUrl("设计一张小红书图集封面，主题普通人怎么用 AI 接单赚钱，奶油黄和黑色配色，强信息感，适合职场副业博主。", 3202, 960, 960)
      },
      {
        title: "护肤种草封面",
        prompt: "生成一张小红书图集封面，主题油皮夏天护肤清单，清透薄荷绿风格，少女感但不廉价，适合品牌种草内容。",
        preview: buildImageUrl("生成一张小红书图集封面，主题油皮夏天护肤清单，清透薄荷绿风格，少女感但不廉价，适合品牌种草内容。", 3203, 960, 960)
      }
    ]
  },
  {
    id: "product",
    title: "商品图生成",
    category: "图片",
    description: "适合商品主图、场景图、电商广告图和详情页首图。",
    type: "image",
    placeholder: "比如：为一款护肤精华做商品图，突出瓶身质感、补水卖点和高端感。",
    outputWidth: 1200,
    outputHeight: 1200,
    guides: ["商品名", "材质", "卖点", "场景", "风格", "比例"],
    examples: [
      {
        title: "无线耳机主图",
        prompt: "为一款白色无线耳机生成商品主图，极简电商风，白底带轻微倒影，突出降噪与长续航，适合独立站首页。",
        preview: buildImageUrl("为一款白色无线耳机生成商品主图，极简电商风，白底带轻微倒影，突出降噪与长续航，适合独立站首页。", 6201, 960, 960)
      },
      {
        title: "咖啡机场景图",
        prompt: "为一台复古家用咖啡机生成商品场景图，木质厨房台面，晨光氛围，突出奶油白机身和高端质感。",
        preview: buildImageUrl("为一台复古家用咖啡机生成商品场景图，木质厨房台面，晨光氛围，突出奶油白机身和高端质感。", 6202, 960, 960)
      },
      {
        title: "护肤精华广告图",
        prompt: "生成一张高端护肤精华广告图，玻璃滴管瓶，水感光影，银蓝配色，适合电商投放和详情页首屏。",
        preview: buildImageUrl("生成一张高端护肤精华广告图，玻璃滴管瓶，水感光影，银蓝配色，适合电商投放和详情页首屏。", 6203, 960, 960)
      }
    ]
  },
  {
    id: "social",
    title: "社媒图片生成",
    category: "图片",
    description: "适合品牌宣传图、广告图、活动图和社媒主视觉。",
    type: "image",
    placeholder: "比如：做一张 SaaS 产品广告图，突出免费试用和立即注册，适合社媒投放。",
    outputWidth: 1200,
    outputHeight: 900,
    guides: ["品牌", "卖点", "平台", "颜色", "标题", "CTA"],
    examples: [
      {
        title: "AI 工具站宣传图",
        prompt: "给 AI 工具站做一张社媒宣传图，强调 1 分钟生成商品图，深色背景配霓虹蓝，适合 X 和 LinkedIn 投放。",
        preview: buildImageUrl("给 AI 工具站做一张社媒宣传图，强调 1 分钟生成商品图，深色背景配霓虹蓝，适合 X 和 LinkedIn 投放。", 5201, 960, 960)
      },
      {
        title: "SaaS 试用广告图",
        prompt: "生成一张 SaaS 产品限时试用社媒图，蓝白科技风，突出 7 天免费体验和立即注册按钮，适合 Facebook 广告。",
        preview: buildImageUrl("生成一张 SaaS 产品限时试用社媒图，蓝白科技风，突出 7 天免费体验和立即注册按钮，适合 Facebook 广告。", 5202, 960, 960)
      },
      {
        title: "品牌发布海报",
        prompt: "设计一张品牌新品发布社媒图，暖灰与橙色配色，主标题突出 Now Live，适合 Instagram 方图。",
        preview: buildImageUrl("设计一张品牌新品发布社媒图，暖灰与橙色配色，主标题突出 Now Live，适合 Instagram 方图。", 5203, 960, 960)
      }
    ]
  },
  {
    id: "article",
    title: "公众号文章生成",
    category: "文章",
    description: "适合公众号文章初稿、选题扩写、私域内容和转化文章。",
    type: "text",
    placeholder: "比如：写一篇公众号文章，主题是 AI 工具站如何做收费试用，风格专业直接。",
    guides: ["选题", "读者", "目标", "语气", "案例", "结尾 CTA"],
    examples: [
      {
        title: "收费试用文章",
        prompt: "写一篇公众号文章，主题是 AI 工具导航站如何做收费试用，面向独立开发者，风格专业直接。",
        preview: buildImageUrl("写一篇公众号文章，主题是 AI 工具导航站如何做收费试用，面向独立开发者，风格专业直接。", 4201, 960, 960)
      },
      {
        title: "品牌内容运营",
        prompt: "写一篇公众号文章，主题是品牌为什么要建立自己的 AI 内容工作流，面向市场团队负责人，风格专业可信，带一个真实案例。",
        preview: buildImageUrl("写一篇公众号文章，主题是品牌为什么要建立自己的 AI 内容工作流，面向市场团队负责人，风格专业可信，带一个真实案例。", 4202, 960, 960)
      },
      {
        title: "私域增长方法",
        prompt: "写一篇公众号文章，主题是微信私域如何承接 AI 工具站流量，面向创业团队，语言直接，强调落地步骤。",
        preview: buildImageUrl("写一篇公众号文章，主题是微信私域如何承接 AI 工具站流量，面向创业团队，语言直接，强调落地步骤。", 4203, 960, 960)
      }
    ]
  }
];

const state = {
  toolId: tools[0].id,
  enhancedPrompt: "",
  exampleIndex: 0
};

const dom = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheDom();
  bindEvents();
  renderQuickActions();
  renderToolTabs();
  renderCurrentTool();
  setStatus("直接修改输入框里的示例，点生成即可。");
  bootReveal();
});

function cacheDom() {
  dom.quickActions = document.querySelector("#quick-actions");
  dom.toolTabs = document.querySelector("#tool-tabs");
  dom.toolCategory = document.querySelector("#tool-category");
  dom.toolTitle = document.querySelector("#tool-title");
  dom.toolDescription = document.querySelector("#tool-description");
  dom.guideRow = document.querySelector("#guide-row");
  dom.promptInput = document.querySelector("#prompt-input");
  dom.exampleGrid = document.querySelector("#example-grid");
  dom.enhanceButton = document.querySelector("#enhance-button");
  dom.generateButton = document.querySelector("#generate-button");
  dom.statusBanner = document.querySelector("#status-banner");
  dom.enhanceShell = document.querySelector("#enhance-shell");
  dom.enhancedPrompt = document.querySelector("#enhanced-prompt");
  dom.resultShell = document.querySelector("#result-shell");
}

function bindEvents() {
  dom.quickActions.addEventListener("click", handleToolSelect);
  dom.toolTabs.addEventListener("click", handleToolTabClick);
  dom.exampleGrid.addEventListener("click", handleExampleClick);
  dom.enhanceButton.addEventListener("click", handleEnhance);
  dom.generateButton.addEventListener("click", handleGenerate);
  document.body.addEventListener("click", handleCopyClick);
  document.body.addEventListener("input", handlePosterFieldInput);
  document.body.addEventListener("error", handleImageError, true);
}

function getCurrentTool() {
  return tools.find((tool) => tool.id === state.toolId) ?? tools[0];
}

function renderToolTabs() {
  dom.toolTabs.innerHTML = tools
    .map(
      (tool) => `
        <button class="tool-tab ${tool.id === state.toolId ? "is-active" : ""}" type="button" data-tool-id="${escapeHtml(tool.id)}">
          ${escapeHtml(tool.title)}
        </button>
      `
    )
    .join("");
}

function renderQuickActions() {
  dom.quickActions.innerHTML = tools
    .map(
      (tool) => `
        <button class="quick-action ${tool.id === state.toolId ? "is-active" : ""}" type="button" data-tool-id="${escapeHtml(tool.id)}">
          <strong>${escapeHtml(tool.title)}</strong>
          <span>${escapeHtml(tool.description)}</span>
        </button>
      `
    )
    .join("");
}

function renderCurrentTool() {
  const tool = getCurrentTool();
  const activeExample = tool.examples[state.exampleIndex] ?? tool.examples[0];

  dom.toolCategory.textContent = tool.category;
  dom.toolTitle.textContent = tool.title;
  dom.toolDescription.textContent = tool.description;
  dom.guideRow.innerHTML = tool.guides.map((item) => `<span class="guide-chip">${escapeHtml(item)}</span>`).join("");
  dom.promptInput.value = activeExample.prompt;
  dom.promptInput.placeholder = tool.placeholder || tool.examples[0].prompt;
  dom.exampleGrid.innerHTML = tool.examples
    .map(
      (item, index) => `
        <button class="example-card ${index === state.exampleIndex ? "is-active" : ""}" type="button" data-example-index="${index}">
          <img
            src="${escapeHtml(buildExamplePreview(tool, item, index))}"
            alt="${escapeHtml(item.title)}"
            loading="lazy"
          />
          <strong>${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(summarizePrompt(item.prompt))}</span>
        </button>
      `
    )
    .join("");
  state.enhancedPrompt = "";
  dom.enhanceShell.classList.add("is-hidden");
  dom.enhancedPrompt.textContent = "";
  dom.resultShell.innerHTML = `
    <div class="empty-state">
      <strong>${escapeHtml(tool.title)} 已准备好</strong>
      <p>直接修改输入框里的示例，或者点下方模版切换后再生成。</p>
    </div>
  `;
}

function handleToolTabClick(event) {
  handleToolSelect(event);
}

function handleToolSelect(event) {
  const button = event.target.closest("[data-tool-id]");
  if (!button) {
    return;
  }

  state.toolId = button.dataset.toolId;
  state.exampleIndex = 0;
  renderQuickActions();
  renderToolTabs();
  renderCurrentTool();
  setStatus("示例已更新，可以直接在输入框里改。");
}

function handleExampleClick(event) {
  const button = event.target.closest("[data-example-index]");
  if (!button) {
    return;
  }

  const tool = getCurrentTool();
  const example = tool.examples[Number(button.dataset.exampleIndex)] ?? tool.examples[0];
  state.exampleIndex = Number(button.dataset.exampleIndex) || 0;
  dom.promptInput.value = example.prompt;
  renderCurrentTool();
  setStatus("示例已带入输入框。");
}

function handleEnhance() {
  const prompt = normalizePrompt(dom.promptInput.value);
  if (!prompt) {
    setStatus("先输入一句需求。");
    dom.promptInput.focus();
    return;
  }

  const tool = getCurrentTool();
  state.enhancedPrompt = buildEnhancedPrompt(tool, prompt);
  dom.enhancedPrompt.textContent = state.enhancedPrompt;
  dom.enhanceShell.classList.remove("is-hidden");
  dom.promptInput.value = state.enhancedPrompt;
  setStatus("提示词已扩写。");
}

async function handleGenerate() {
  const tool = getCurrentTool();
  const prompt = normalizePrompt(dom.promptInput.value);

  if (!prompt) {
    setStatus("先输入一句需求。");
    dom.promptInput.focus();
    return;
  }

  dom.generateButton.disabled = true;
  setStatus(`正在生成 ${tool.title}...`);
  renderPendingState(tool);

  try {
    if (tool.type === "image") {
      renderImageResult(tool, prompt);
      setStatus(`${tool.title} 已生成。`);
      scrollToResult();
      return;
    }

    const article = await generateArticle(tool, prompt);
    renderTextResult(tool, prompt, article);
    setStatus(`${tool.title} 已生成。`);
    scrollToResult();
  } catch (_error) {
    const fallback = buildFallbackArticle(prompt);
    renderTextResult(tool, prompt, fallback);
    setStatus("已返回本地草稿版本。");
    scrollToResult();
  } finally {
    dom.generateButton.disabled = false;
  }
}

function renderImageResult(tool, prompt) {
  const finalPrompt = buildEnhancedPrompt(tool, prompt);
  const imageUrl = buildImageUrl(finalPrompt, Date.now(), tool.outputWidth || 1024, tool.outputHeight || 1365);
  const fallbackUrl = buildResultFallbackPreview(tool, prompt);
  const copy = buildPosterCopy(tool, prompt);

  dom.resultShell.innerHTML = `
    <article class="image-card poster-card">
      <div class="block-head">
        <div>
          <p class="eyebrow compact">Image</p>
          <h3>${escapeHtml(tool.title)}</h3>
        </div>
        <a class="mini-button" href="${escapeHtml(imageUrl)}" target="_blank" rel="noreferrer">打开底图</a>
      </div>
      <p class="poster-note">为避免模型把中文写成乱码，AI 只负责生成底图，标题文案由页面叠加。</p>
      <div class="poster-workspace">
        <div class="poster-canvas-shell">
          <div class="poster-canvas">
            <img
              src="${escapeHtml(imageUrl)}"
              alt="${escapeHtml(tool.title)}"
              data-fallback-src="${escapeHtml(fallbackUrl)}"
            />
            <div class="poster-overlay">
              <div class="poster-topline" id="poster-label-display">${escapeHtml(copy.label)}</div>
              <div class="poster-copy">
                <h4 class="poster-title" id="poster-title-display">${escapeHtml(copy.title)}</h4>
                <p class="poster-subtitle" id="poster-subtitle-display">${escapeHtml(copy.subtitle)}</p>
              </div>
              <div class="poster-cta" id="poster-cta-display">${escapeHtml(copy.cta)}</div>
            </div>
          </div>
        </div>

        <div class="poster-editor">
          <label class="editor-field">
            <span>标题</span>
            <input type="text" value="${escapeHtml(copy.title)}" data-sync-target="poster-title-display" />
          </label>
          <label class="editor-field">
            <span>副标题</span>
            <textarea rows="4" data-sync-target="poster-subtitle-display">${escapeHtml(copy.subtitle)}</textarea>
          </label>
          <label class="editor-field">
            <span>按钮文案</span>
            <input type="text" value="${escapeHtml(copy.cta)}" data-sync-target="poster-cta-display" />
          </label>
          <label class="editor-field">
            <span>顶部标签</span>
            <input type="text" value="${escapeHtml(copy.label)}" data-sync-target="poster-label-display" />
          </label>
        </div>
      </div>
    </article>
    <article class="content-card">
      <div class="block-head">
        <strong>最终提示词</strong>
        <button class="mini-button" type="button" data-copy-text="${escapeHtml(finalPrompt)}">复制</button>
      </div>
      <pre>${escapeHtml(finalPrompt)}</pre>
    </article>
  `;
}

function renderTextResult(tool, prompt, content) {
  const finalPrompt = buildEnhancedPrompt(tool, prompt);
  dom.resultShell.innerHTML = `
    <article class="content-card">
      <div class="block-head">
        <div>
          <p class="eyebrow compact">Content</p>
          <h3>${escapeHtml(tool.title)}</h3>
        </div>
        <button class="mini-button" type="button" data-copy-text="${escapeHtml(content)}">复制内容</button>
      </div>
      <pre>${escapeHtml(content)}</pre>
    </article>
    <article class="content-card">
      <div class="block-head">
        <strong>最终提示词</strong>
        <button class="mini-button" type="button" data-copy-text="${escapeHtml(finalPrompt)}">复制</button>
      </div>
      <pre>${escapeHtml(finalPrompt)}</pre>
    </article>
  `;
}

async function generateArticle(tool, prompt) {
  const finalPrompt = buildEnhancedPrompt(tool, prompt);
  const url = new URL(`https://text.pollinations.ai/${encodeURIComponent(finalPrompt)}`);
  url.searchParams.set(
    "system",
    "你是中文内容编辑。请直接输出一篇可读、结构完整、适合公众号发布的文章，不要解释，不要使用 markdown code fence。"
  );

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url.toString(), { signal: controller.signal });
    if (!response.ok) {
      throw new Error("text api failed");
    }
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const payload = await response.json();
      return payload.text || payload.output || payload.response || buildFallbackArticle(prompt);
    }
    const text = await response.text();
    return text || buildFallbackArticle(prompt);
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function handleCopyClick(event) {
  const button = event.target.closest("[data-copy-text], [data-copy-target]");
  if (!button) {
    return;
  }

  const directText = button.dataset.copyText;
  const targetId = button.dataset.copyTarget;
  const text = directText || document.querySelector(`#${targetId}`)?.textContent || "";
  navigator.clipboard.writeText(text);
  setStatus("已复制。");
}

function handleImageError(event) {
  const img = event.target;
  if (!(img instanceof HTMLImageElement)) {
    return;
  }

  const fallbackSrc = img.dataset.fallbackSrc;
  if (!fallbackSrc || img.src === fallbackSrc) {
    return;
  }

  img.src = fallbackSrc;
  img.classList.add("is-fallback");

  if (img.closest(".image-card")) {
    setStatus("图片服务暂时不稳定，先显示静态预览。");
  }
}

function handlePosterFieldInput(event) {
  const field = event.target.closest("[data-sync-target]");
  if (!field) {
    return;
  }

  const targetId = field.dataset.syncTarget;
  const target = document.querySelector(`#${targetId}`);
  if (!target) {
    return;
  }

  target.textContent = normalizePrompt(field.value) || " ";
}

function setStatus(message) {
  dom.statusBanner.textContent = message;
}

function normalizePrompt(value) {
  return String(value || "").trim();
}

function buildEnhancedPrompt(tool, prompt) {
  const cleanPrompt = normalizePrompt(prompt).replace(/[。！？!?,，]+$/g, "");

  switch (tool.id) {
    case "poster":
      return `请围绕以下需求生成一张适合商业传播的海报底图：${cleanPrompt}。只生成视觉画面，不要出现任何中文、英文、字母、数字、水印、logo 或排版文字。请预留清晰的标题区域和按钮区域，画面高级、适合叠加文案。`;
    case "xiaohongshu":
      return `请围绕以下需求生成一张小红书图集封面底图：${cleanPrompt}。只生成背景视觉，不要出现任何中文、英文、字母、数字、水印或 logo。请给封面标题预留明显留白，整体有强停留感。`;
    case "product":
      return `请围绕以下需求生成一张高转化商品图片：${cleanPrompt}。不要出现任何文字、字母、数字、水印或 logo。画面只突出商品主体、材质细节和商业质感。`;
    case "social":
      return `请围绕以下需求生成一张社交媒体宣传图底图：${cleanPrompt}。只做视觉主画面，不要出现任何文字、字母、数字、水印或 logo。请预留明显标题区，便于后续叠加文案。`;
    case "article":
      return `请围绕以下主题写一篇适合公众号发布的中文文章：${cleanPrompt}。文章需要有标题、导语、3到5个小节、结尾总结和转化引导。`;
    default:
      return cleanPrompt;
  }
}

function buildFallbackArticle(prompt) {
  const title = normalizePrompt(prompt).slice(0, 24) || "AI 内容草稿";
  return [
    `# ${title}`,
    "",
    "很多项目不是没有需求，而是没有把一个正确的体验路径做短、做清楚。",
    "真正能转化的 AI 工具，往往都有三个共同点：用户一上来就能马上试、结果足够好、收费节点明确。",
    "",
    "第一，先把入口做短。",
    "用户进入页面后，最好先看到核心功能，而不是看到一整页解释。输入一句话，点一次生成，结果立刻出来，这比任何介绍都更有说服力。",
    "",
    "第二，把结果做成可以直接带走的成品。",
    "如果是图片工具，就让用户马上拿到可继续修改或下载的图片；如果是内容工具，就让用户马上拿到可编辑的文章初稿。",
    "",
    "第三，把免费和付费边界说清楚。",
    "免费体验的目的不是长期供给，而是证明价值。只要用户在第一次体验里看到了结果，后续转化会更顺。",
    "",
    "最后，不要把所有功能一次堆满。",
    "先把一条生成链路打磨顺，再补模板、示例、支付和数据统计，产品会更稳。"
  ].join("\n");
}

function buildImageUrl(prompt, seed, width, height) {
  const url = new URL(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`);
  url.searchParams.set("width", String(width));
  url.searchParams.set("height", String(height));
  url.searchParams.set("seed", String(seed));
  url.searchParams.set("enhance", "true");
  url.searchParams.set("safe", "true");
  return url.toString();
}

function buildExamplePreview(tool, example, index) {
  const palette = getPreviewPalette(tool.id, index);
  const lines = wrapText(example.title, 8, 3);
  const footer = summarizePrompt(example.prompt);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 1200">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette[0]}" />
          <stop offset="100%" stop-color="${palette[1]}" />
        </linearGradient>
        <linearGradient id="panel" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.18)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0.02)" />
        </linearGradient>
      </defs>
      <rect width="960" height="1200" rx="44" fill="url(#bg)" />
      <circle cx="840" cy="180" r="180" fill="rgba(255,255,255,0.08)" />
      <circle cx="130" cy="1000" r="190" fill="rgba(255,255,255,0.05)" />
      <rect x="54" y="56" width="260" height="58" rx="29" fill="rgba(8,17,31,0.46)" stroke="rgba(255,255,255,0.16)" />
      <text x="86" y="94" fill="#f4f8ff" font-size="28" font-family="Noto Sans SC, sans-serif" font-weight="700">${escapeSvgText(tool.title)}</text>
      <rect x="54" y="166" width="852" height="770" rx="38" fill="rgba(7,16,28,0.22)" stroke="rgba(255,255,255,0.16)" />
      ${lines
        .map(
          (line, lineIndex) => `
            <text
              x="82"
              y="${318 + lineIndex * 118}"
              fill="#ffffff"
              font-size="86"
              font-family="Noto Sans SC, sans-serif"
              font-weight="700"
            >${escapeSvgText(line)}</text>
          `
        )
        .join("")}
      <text x="82" y="1030" fill="rgba(255,255,255,0.84)" font-size="34" font-family="Noto Sans SC, sans-serif">${escapeSvgText(footer)}</text>
      <text x="82" y="1092" fill="rgba(255,255,255,0.62)" font-size="26" font-family="Space Grotesk, sans-serif" letter-spacing="4">${escapeSvgText(tool.category)} TEMPLATE ${String(index + 1).padStart(2, "0")}</text>
    </svg>
  `;

  return svgToDataUri(svg);
}

function buildResultFallbackPreview(tool, prompt) {
  const palette = getPreviewPalette(tool.id, 9);
  const copy = buildPosterCopy(tool, prompt);
  const lines = wrapText(copy.title, 8, 2);
  const footer = summarizePrompt(copy.subtitle);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1365">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette[0]}" />
          <stop offset="100%" stop-color="${palette[1]}" />
        </linearGradient>
      </defs>
      <rect width="1024" height="1365" rx="48" fill="url(#bg)" />
      <rect x="64" y="64" width="896" height="1237" rx="40" fill="rgba(6,16,29,0.26)" stroke="rgba(255,255,255,0.18)" />
      ${lines
        .map(
          (line, lineIndex) => `
            <text
              x="110"
              y="${320 + lineIndex * 118}"
              fill="#ffffff"
              font-size="92"
              font-family="Noto Sans SC, sans-serif"
              font-weight="700"
            >${escapeSvgText(line)}</text>
          `
        )
        .join("")}
      <text x="110" y="1104" fill="rgba(255,255,255,0.84)" font-size="38" font-family="Noto Sans SC, sans-serif">${escapeSvgText(footer)}</text>
      <rect x="110" y="1180" width="242" height="70" rx="35" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.18)" />
      <text x="154" y="1226" fill="#ffffff" font-size="28" font-family="Noto Sans SC, sans-serif">${escapeSvgText(copy.cta)}</text>
      <text x="110" y="1288" fill="rgba(255,255,255,0.62)" font-size="24" font-family="Noto Sans SC, sans-serif">外部图片服务暂时不可用时显示</text>
    </svg>
  `;

  return svgToDataUri(svg);
}

function buildPosterCopy(tool, prompt) {
  const cleanPrompt = normalizePrompt(prompt).replace(/[。！？!?,，]+$/g, "");
  const segments = cleanPrompt
    .split(/[，,。；;、\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

  const rawTitle =
    segments.find((item) => /海报|封面|主图|商品|招生活动|宣传图|广告图|发布/.test(item)) ||
    segments[0] ||
    tool.title;
  const title = normalizeHeadline(cleanSubject(rawTitle), tool.id);
  const subtitle = summarizeSubtitle(segments.slice(1).join("，") || cleanPrompt, 34);
  const cta = detectCallToAction(cleanPrompt);

  return {
    label: pickPosterLabel(tool),
    title,
    subtitle,
    cta
  };
}

function pickPosterLabel(tool) {
  switch (tool.id) {
    case "poster":
      return "PROMO";
    case "xiaohongshu":
      return "XHS COVER";
    case "product":
      return "PRODUCT";
    case "social":
      return "CAMPAIGN";
    default:
      return tool.title.toUpperCase();
  }
}

function cleanSubject(value) {
  return String(value || "")
    .replace(/^(做一张|设计一张|生成一张|来一张|请做一张)/, "")
    .replace(/^给.+?(做一张|设计一张|生成一张)/, "")
    .replace(/^为.+?(做一张|设计一张|生成一张)/, "")
    .replace(/^(主题是|主题为)/, "")
    .replace(/(适合|用于).+$/, "")
    .trim();
}

function normalizeHeadline(value, toolId) {
  const fallbackMap = {
    poster: "品牌活动海报",
    xiaohongshu: "小红书封面",
    product: "商品主视觉",
    social: "社媒宣传图"
  };
  const cleanValue = normalizePrompt(value);
  if (!cleanValue) {
    return fallbackMap[toolId] || "AI 视觉设计";
  }

  const headline = cleanValue.length > 14 ? `${cleanValue.slice(0, 14)}` : cleanValue;
  return headline;
}

function summarizeSubtitle(value, maxLength) {
  const cleanValue = normalizePrompt(value).replace(/\s+/g, " ");
  if (!cleanValue) {
    return "你可以继续修改右侧文案，让画面更接近你的投放场景。";
  }

  if (cleanValue.length <= maxLength) {
    return cleanValue;
  }

  return `${cleanValue.slice(0, maxLength)}...`;
}

function detectCallToAction(prompt) {
  const rules = [
    { pattern: /扫码咨询/, cta: "扫码咨询" },
    { pattern: /立即注册/, cta: "立即注册" },
    { pattern: /免费试用/, cta: "免费试用" },
    { pattern: /立即了解/, cta: "立即了解" },
    { pattern: /立即购买/, cta: "立即购买" },
    { pattern: /预约体验/, cta: "预约体验" },
    { pattern: /咨询/, cta: "立即咨询" }
  ];

  const hit = rules.find((item) => item.pattern.test(prompt));
  return hit ? hit.cta : "立即了解";
}

function getPreviewPalette(toolId, index) {
  const palettes = {
    poster: ["#173a6a", "#10a37f"],
    xiaohongshu: ["#6f1d46", "#ff6b6b"],
    product: ["#253042", "#8ea3b9"],
    social: ["#0e3c63", "#8248ff"],
    article: ["#5b431e", "#c48a3a"]
  };
  const fallback = ["#1a2741", "#355ea8"];
  const palette = palettes[toolId] || fallback;

  if (index % 2 === 0) {
    return palette;
  }

  return [palette[1], palette[0]];
}

function wrapText(value, size, limit) {
  const chars = Array.from(String(value || "").trim());
  const lines = [];

  for (let index = 0; index < chars.length && lines.length < limit; index += size) {
    lines.push(chars.slice(index, index + size).join(""));
  }

  if (lines.length === 0) {
    return ["AI 模版"];
  }

  return lines;
}

function escapeSvgText(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function svgToDataUri(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function renderPendingState(tool) {
  dom.resultShell.innerHTML = `
    <div class="empty-state loading-state">
      <strong>正在生成 ${escapeHtml(tool.title)}</strong>
      <p>结果会显示在这里，请稍等几秒。</p>
    </div>
  `;
}

function summarizePrompt(prompt) {
  const cleanPrompt = normalizePrompt(prompt).replace(/\s+/g, " ");
  if (cleanPrompt.length <= 44) {
    return cleanPrompt;
  }
  return `${cleanPrompt.slice(0, 44)}...`;
}

function scrollToResult() {
  document.querySelector("#result")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function bootReveal() {
  const revealItems = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => observer.observe(item));
}
