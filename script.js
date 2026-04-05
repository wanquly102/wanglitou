const tools = [
  {
    id: "poster",
    title: "AI 海报生成",
    category: "Design",
    description: "适合活动海报、招生海报、品牌宣传图和促销视觉。",
    type: "image",
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
    category: "Social",
    description: "适合图集封面、干货封面、种草封面和转化封面。",
    type: "image",
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
    category: "Commerce",
    description: "适合主图、场景图、电商广告图和详情页首图。",
    type: "image",
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
    category: "Campaign",
    description: "适合品牌宣传图、广告图、活动图和社媒主视觉。",
    type: "image",
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
    category: "Content",
    description: "适合选题扩写、文章初稿、私域内容和转化文章。",
    type: "text",
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
  enhancedPrompt: ""
};

const dom = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheDom();
  bindEvents();
  renderToolTabs();
  renderCurrentTool();
  bootReveal();
});

function cacheDom() {
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
  dom.toolTabs.addEventListener("click", handleToolTabClick);
  dom.exampleGrid.addEventListener("click", handleExampleClick);
  dom.enhanceButton.addEventListener("click", handleEnhance);
  dom.generateButton.addEventListener("click", handleGenerate);
  document.body.addEventListener("click", handleCopyClick);
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

function renderCurrentTool() {
  const tool = getCurrentTool();
  dom.toolCategory.textContent = tool.category;
  dom.toolTitle.textContent = tool.title;
  dom.toolDescription.textContent = tool.description;
  dom.guideRow.innerHTML = tool.guides.map((item) => `<span class="guide-chip">${escapeHtml(item)}</span>`).join("");
  dom.promptInput.value = tool.examples[0].prompt;
  dom.exampleGrid.innerHTML = tool.examples
    .map(
      (item, index) => `
        <button class="example-card reveal" type="button" data-example-index="${index}">
          <img src="${escapeHtml(item.preview)}" alt="${escapeHtml(item.title)}" loading="lazy" />
          <strong>${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(item.prompt)}</span>
        </button>
      `
    )
    .join("");
  state.enhancedPrompt = "";
  dom.enhanceShell.classList.add("is-hidden");
  dom.resultShell.innerHTML = `
    <div class="empty-state">
      <strong>等待生成</strong>
      <p>选择一个工具，修改输入框里的示例，点击生成。</p>
    </div>
  `;
}

function handleToolTabClick(event) {
  const button = event.target.closest("[data-tool-id]");
  if (!button) {
    return;
  }

  state.toolId = button.dataset.toolId;
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
  dom.promptInput.value = example.prompt;
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

  try {
    if (tool.type === "image") {
      renderImageResult(tool, prompt);
      setStatus(`${tool.title} 已生成。`);
      return;
    }

    const article = await generateArticle(tool, prompt);
    renderTextResult(tool, prompt, article);
    setStatus(`${tool.title} 已生成。`);
  } catch (_error) {
    const fallback = buildFallbackArticle(prompt);
    renderTextResult(tool, prompt, fallback);
    setStatus("已返回本地草稿版本。");
  } finally {
    dom.generateButton.disabled = false;
  }
}

function renderImageResult(tool, prompt) {
  const finalPrompt = buildEnhancedPrompt(tool, prompt);
  const imageUrl = buildImageUrl(finalPrompt, Date.now(), 1024, 1365);

  dom.resultShell.innerHTML = `
    <article class="image-card">
      <div class="block-head">
        <div>
          <p class="eyebrow compact">Image</p>
          <h3>${escapeHtml(tool.title)}</h3>
        </div>
        <a class="mini-button" href="${escapeHtml(imageUrl)}" target="_blank" rel="noreferrer">打开图片</a>
      </div>
      <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(tool.title)}" />
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
  url.searchParams.set("model", "openai");
  url.searchParams.set(
    "system",
    "你是中文内容编辑。请直接输出一篇可读、结构完整、适合公众号发布的文章，不要解释，不要使用 markdown code fence。"
  );

  const response = await fetch(url.toString());
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
      return `请围绕以下需求生成一张适合商业传播的中文海报：${cleanPrompt}。画面需要突出主标题、核心卖点和明确 CTA，版式清楚、适合社交媒体传播。`;
    case "xiaohongshu":
      return `请围绕以下需求生成一张小红书图集封面：${cleanPrompt}。封面要有大标题、清楚的信息层次和强停留感。`;
    case "product":
      return `请围绕以下需求生成一张高转化商品图片：${cleanPrompt}。画面要突出商品主体、材质细节和商业质感。`;
    case "social":
      return `请围绕以下需求生成一张社交媒体宣传图：${cleanPrompt}。画面要有强卖点、清晰标题区和高辨识度。`;
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
  url.searchParams.set("model", "flux");
  url.searchParams.set("enhance", "true");
  url.searchParams.set("safe", "true");
  return url.toString();
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
