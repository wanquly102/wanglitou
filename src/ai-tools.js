function normalizeText(value) {
  return String(value ?? "").replace(/\r\n?/g, "\n").trim();
}

function example(title, prompt, seed) {
  return { title, prompt, seed };
}

const toolCatalog = [
  {
    id: "poster-generator",
    slug: "poster-generator",
    title: "AI 海报生成",
    shortTitle: "海报",
    kind: "image",
    category: "Design",
    description: "一句话生成活动海报、促销海报和品牌宣传图。",
    placeholderPrompt:
      "例：给一家精品咖啡店做一张开业海报，主标题“第二杯半价”，黑金风格，适合小红书竖版，底部加“限本周”。",
    promptGuides: ["主题 / 产品", "目标人群", "核心卖点", "视觉风格", "主色与氛围", "尺寸 / 平台", "CTA"],
    image: {
      width: 896,
      height: 1344,
      model: "flux"
    },
    imageStyle:
      "professional Chinese marketing poster, premium editorial layout, bold typography, strong hierarchy, crisp lighting, studio quality",
    examples: [
      example(
        "咖啡开业海报",
        "给一家精品咖啡店做一张开业海报，主标题“第二杯半价”，黑金配色，适合小红书竖版，底部加“限本周”。",
        2201
      ),
      example(
        "女装上新海报",
        "为轻奢女装品牌生成一张春季上新海报，米白和雾蓝配色，突出面料质感和新品折扣，适合微信朋友圈。",
        2202
      ),
      example(
        "课程招生活动",
        "做一张 AI 绘画训练营招生活动海报，科技感蓝紫渐变，突出 3 天体验营和扫码咨询，适合 4:5 竖版。",
        2203
      )
    ]
  },
  {
    id: "xiaohongshu-carousel",
    slug: "xiaohongshu-carousel",
    title: "小红书图集生成",
    shortTitle: "图集",
    kind: "image",
    category: "Social",
    description: "生成图集封面主视觉，并给出可延展的图集内容方向。",
    placeholderPrompt:
      "例：做一张小红书图集封面，主题“独立站卖家如何用 AI 做商品图”，红白黑配色，信息密度高，适合创业博主账号。",
    promptGuides: ["图集主题", "封面标题", "受众", "视觉风格", "品牌元素", "页数 / 系列感"],
    image: {
      width: 1024,
      height: 1024,
      model: "flux"
    },
    imageStyle:
      "xiaohongshu cover design, Chinese editorial typography, strong cover headline, layered information blocks, trendy social media art direction",
    examples: [
      example(
        "AI 商品图图集",
        "做一张小红书图集封面，主题“独立站卖家如何用 AI 做商品图”，红白黑配色，标题要醒目，适合创业干货账号。",
        3201
      ),
      example(
        "副业变现图集",
        "设计一张小红书图集封面，主题“普通人怎么用 AI 接单赚钱”，奶油黄和黑色配色，强信息感，适合职场副业博主。",
        3202
      ),
      example(
        "护肤品牌种草",
        "生成一张小红书图集封面，主题“油皮夏天护肤清单”，清透薄荷绿风格，少女感但不廉价，适合品牌种草内容。",
        3203
      )
    ]
  },
  {
    id: "wechat-article",
    slug: "wechat-article",
    title: "公众号文章生成",
    shortTitle: "文章",
    kind: "text",
    category: "Content",
    description: "把一个选题扩写成可发布的公众号文章初稿。",
    placeholderPrompt:
      "例：写一篇公众号文章，主题“AI 工具导航站怎么做收费试用”，面向独立开发者，风格专业但不生硬，最后引导用户注册体验。",
    promptGuides: ["选题", "目标读者", "文章目标", "语气风格", "案例 / 方法", "结尾 CTA"],
    image: {
      width: 1024,
      height: 640,
      model: "flux"
    },
    imageStyle:
      "clean blog cover illustration, editorial Chinese design, professional content marketing aesthetic, modern layout",
    examples: [
      example(
        "收费试用文章",
        "写一篇公众号文章，主题“AI 工具导航站怎么做收费试用”，面向独立开发者，结构清楚，结尾引导用户先免费体验。",
        4201
      ),
      example(
        "品牌内容运营",
        "写一篇公众号文章，主题“品牌为什么要建立自己的 AI 内容工作流”，面向市场团队负责人，风格专业可信，带一个真实案例。",
        4202
      ),
      example(
        "私域增长方法",
        "写一篇公众号文章，主题“微信私域如何承接 AI 工具站流量”，面向创业团队，语言直接，强调落地步骤。",
        4203
      )
    ]
  },
  {
    id: "social-visual-pack",
    slug: "social-visual-pack",
    title: "社媒图片生成",
    shortTitle: "社媒图",
    kind: "image",
    category: "Social",
    description: "生成 Instagram、X、小红书等社媒主视觉。",
    placeholderPrompt:
      "例：给 AI 工具站做一张社媒宣传图，强调“1 分钟生成商品图”，深色背景配霓虹蓝，适合 X 和 LinkedIn 投放。",
    promptGuides: ["品牌 / 活动", "核心卖点", "平台", "风格", "颜色", "标题文案", "CTA"],
    image: {
      width: 1280,
      height: 1280,
      model: "flux"
    },
    imageStyle:
      "social media campaign visual, modern branding, premium lighting, bold copy space, high contrast, polished commercial artwork",
    examples: [
      example(
        "AI 工具站宣传图",
        "给 AI 工具站做一张社媒宣传图，强调“1 分钟生成商品图”，深色背景配霓虹蓝，适合 X 和 LinkedIn 投放。",
        5201
      ),
      example(
        "SaaS 限时试用图",
        "生成一张 SaaS 产品限时试用社媒图，蓝白科技风，突出 7 天免费体验和立即注册按钮，适合 Facebook 广告。",
        5202
      ),
      example(
        "品牌发布海报",
        "设计一张品牌新品发布社媒图，暖灰与橙色配色，主标题突出“Now Live”，适合 Instagram 方图。",
        5203
      )
    ]
  },
  {
    id: "product-image-kit",
    slug: "product-image-kit",
    title: "商品图片生成",
    shortTitle: "商品图",
    kind: "image",
    category: "Commerce",
    description: "生成商品主图、场景图和广告图风格。",
    placeholderPrompt:
      "例：为一款白色无线耳机生成商品主图，极简电商风，白底带轻微倒影，突出降噪与长续航，适合独立站首页。",
    promptGuides: ["商品名称", "外观 / 材质", "核心卖点", "场景", "风格", "比例", "品牌感"],
    image: {
      width: 1280,
      height: 1280,
      model: "flux"
    },
    imageStyle:
      "ecommerce product photography, luxury studio lighting, realistic material details, clean background, conversion oriented, high detail",
    examples: [
      example(
        "无线耳机主图",
        "为一款白色无线耳机生成商品主图，极简电商风，白底带轻微倒影，突出降噪与长续航，适合独立站首页。",
        6201
      ),
      example(
        "咖啡机场景图",
        "为一台复古家用咖啡机生成商品场景图，木质厨房台面，晨光氛围，突出奶油白机身和高端质感。",
        6202
      ),
      example(
        "护肤精华广告图",
        "生成一张高端护肤精华广告图，玻璃滴管瓶，水感光影，银蓝配色，适合电商投放和详情页首屏。",
        6203
      )
    ]
  }
];

function publicTool(tool) {
  return {
    id: tool.id,
    slug: tool.slug,
    title: tool.title,
    shortTitle: tool.shortTitle,
    kind: tool.kind,
    category: tool.category,
    description: tool.description,
    placeholderPrompt: tool.placeholderPrompt,
    promptGuides: [...tool.promptGuides],
    examples: tool.examples.map((item) => ({ ...item }))
  };
}

function buildChecklistBullets(tool) {
  return tool.promptGuides.map((item) => `补充${item}`);
}

export function listAiTools() {
  return toolCatalog.map(publicTool);
}

export function getAiTool(toolId) {
  return toolCatalog.find((tool) => tool.id === toolId) ?? null;
}

export function normalizeAiPrompt(rawPrompt) {
  const prompt = normalizeText(rawPrompt);
  if (!prompt) {
    const error = new Error("请输入你的需求");
    error.status = 400;
    throw error;
  }

  if (prompt.length > 1800) {
    const error = new Error("提示词请控制在 1800 字以内");
    error.status = 400;
    throw error;
  }

  return prompt;
}

export function buildPromptAssist(tool, prompt) {
  const checklist = buildChecklistBullets(tool);
  const normalizedPrompt = normalizeText(prompt).replace(/[。！？!?,，]+$/g, "");

  switch (tool.id) {
    case "poster-generator":
      return {
        suggestedPrompt: `请围绕以下需求生成一张适合商业传播的中文海报：${normalizedPrompt}。画面需要突出主标题、核心卖点和明确 CTA，保留干净的信息层级、强视觉焦点和适合社交媒体传播的版式。`,
        suggestions: checklist,
        notes: ["如果你有品牌色，可以直接写进去。", "如果要投放平台，建议补上比例，例如 4:5 竖版。"]
      };
    case "xiaohongshu-carousel":
      return {
        suggestedPrompt: `请围绕以下需求生成一张小红书图集封面主视觉：${normalizedPrompt}。封面要有强标题、大字排版、清楚的信息分层，并预留后续多页图集延展空间，整体风格年轻、清晰、易停留。`,
        suggestions: checklist,
        notes: ["最好补上封面标题。", "如果你希望偏干货、偏种草或偏成交，可以直接写出来。"]
      };
    case "wechat-article":
      return {
        suggestedPrompt: `请围绕以下主题写一篇适合微信公众号发布的中文文章：${normalizedPrompt}。文章需要有清楚标题、导语、3 到 5 个小节、结尾总结和转化引导，语言自然、专业、可直接发布。`,
        suggestions: checklist,
        notes: ["如果你有真实案例，可以补一句“请加入案例”。", "如果要转化，结尾可以写清楚引导动作。"]
      };
    case "social-visual-pack":
      return {
        suggestedPrompt: `请围绕以下需求生成一张适合社交媒体投放的品牌宣传图：${normalizedPrompt}。画面需要有清晰标题区、强卖点和可点击感，整体风格现代、高级、适合品牌传播，并保留 CTA 文案位置。`,
        suggestions: checklist,
        notes: ["社媒图最好写清平台。", "如果有品牌调性，比如极简、高级、赛博、温暖，也可以直接写。"]
      };
    case "product-image-kit":
      return {
        suggestedPrompt: `请围绕以下商品需求生成一张高转化商品图片：${normalizedPrompt}。画面需要突出商品主体、材质细节、核心卖点和高级光影，同时保留电商首图级别的干净背景与商业质感。`,
        suggestions: checklist,
        notes: ["补充材质、颜色和场景，效果会更稳定。", "如果是平台投放图，可以补上横图或方图要求。"]
      };
    default:
      return {
        suggestedPrompt: prompt,
        suggestions: checklist,
        notes: []
      };
  }
}

export function buildAiImagePrompt(tool, prompt) {
  const normalizedPrompt = normalizeText(prompt).replace(/[。！？!?,，]+$/g, "");
  return `${normalizedPrompt}，${tool.imageStyle}。`;
}

function buildArticleTitle(prompt) {
  const compact = prompt.replace(/\s+/g, " ");
  if (compact.length <= 22) {
    return compact;
  }
  return `${compact.slice(0, 22)}...`;
}

function buildLocalArticleBody(prompt) {
  const title = buildArticleTitle(prompt);
  return [
    `# ${title}`,
    "",
    "很多项目不是没有需求，而是没有把一个正确的体验路径做短、做清楚。",
    "真正能转化的 AI 工具，往往都有三个共同点：第一，用户一上来就能马上试；第二，结果足够好，能让人愿意继续；第三，收费节点明确，不会让用户在流程里迷路。",
    "",
    "第一，先把入口做短。",
    "用户进入页面后，最好先看到核心功能，而不是看到一整页解释。输入一句话，点一次生成，结果立刻出来，这比任何介绍都更有说服力。",
    "",
    "第二，把结果做成可以直接带走的成品。",
    "如果是图片工具，就让用户马上拿到可以下载的海报、商品图或社媒图；如果是内容工具，就让用户马上拿到可编辑的文章初稿、标题和发布文案。",
    "",
    "第三，把免费和付费边界说清楚。",
    "免费体验的目的不是长期供给，而是证明价值。一次试用足够让用户看到能力，后续再通过会员、套餐或团队版承接，路径才会稳定。",
    "",
    "最后，别急着把所有功能都塞进去。",
    "先把一条生成链路打磨顺，再逐步补例图、提示词扩写、历史记录和支付环节，系统会更稳，转化也更高。",
    "",
    "如果你正在做自己的 AI 工具站，这样的结构通常更容易跑起来：先给结果，再给价格，最后承接咨询或注册。"
  ].join("\n");
}

export function buildLocalAiResult(tool, prompt, finalPrompt) {
  if (tool.kind === "text") {
    return {
      headline: `${tool.title} 已生成`,
      summary: "已按你的输入整理成可直接编辑的文章初稿。",
      prompt: finalPrompt,
      body: buildLocalArticleBody(prompt),
      bullets: ["先检查标题是否够聚焦。", "如果有真实案例，可以再补一段。", "结尾建议保留一个明确 CTA。"]
    };
  }

  switch (tool.id) {
    case "poster-generator":
      return {
        headline: "海报已生成",
        summary: "这次结果优先强化标题可读性、卖点层级和 CTA 位置。",
        prompt: finalPrompt,
        body: "适合先检查主标题、利益点和二维码 / 按钮区是否够醒目，再决定是否二次微调。",
        bullets: ["标题尽量短。", "主视觉只保留一个焦点。", "CTA 放在底部或右下更稳。"]
      };
    case "xiaohongshu-carousel":
      return {
        headline: "图集封面已生成",
        summary: "封面主视觉会优先强调大标题和信息分层，方便继续延展成整组图集。",
        prompt: finalPrompt,
        body: "建议下一步围绕这张封面继续拆 6 到 8 页内容，每页只讲一个观点，整组内容会更完整。",
        bullets: ["封面标题别超过两行。", "保持统一颜色体系。", "正文页尽量一页一个重点。"]
      };
    case "social-visual-pack":
      return {
        headline: "社媒宣传图已生成",
        summary: "结果会更偏向停留率和转化兼顾的品牌传播画面。",
        prompt: finalPrompt,
        body: "你可以直接把这张图拿去做首屏宣传，再配一段短 caption 做 A/B 测试。",
        bullets: ["前两秒要能看懂核心信息。", "品牌名和卖点别同时过重。", "CTA 尽量用动词开头。"]
      };
    case "product-image-kit":
      return {
        headline: "商品图已生成",
        summary: "结果优先突出主体、材质和商业质感，适合作为首屏商品图方向。",
        prompt: finalPrompt,
        body: "如果要继续提高转化，可以基于同一提示词再做一版白底主图和一版场景图。",
        bullets: ["商品主体占画面中心。", "材质细节要清楚。", "背景不要抢卖点。"]
      };
    default:
      return {
        headline: `${tool.title} 已生成`,
        summary: "结果已经生成，可以继续微调提示词。",
        prompt: finalPrompt,
        body: "",
        bullets: []
      };
  }
}
