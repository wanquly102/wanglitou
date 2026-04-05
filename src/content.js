export const englishLevelOptions = [
  { id: "starter", label: "学前启蒙" },
  { id: "grade1", label: "1年级" },
  { id: "grade2", label: "2年级" },
  { id: "grade3", label: "3年级" },
  { id: "grade4", label: "4年级" },
  { id: "grade5", label: "5年级" },
  { id: "grade6", label: "6年级" },
  { id: "junior", label: "初中" },
  { id: "senior", label: "高中" },
  { id: "ket", label: "KET" },
  { id: "pet", label: "PET" },
  { id: "fce", label: "FCE" },
  { id: "cet4", label: "CET-4" },
  { id: "cet6", label: "CET-6" },
  { id: "toefl", label: "托福" },
  { id: "ielts", label: "雅思" }
];

export const chineseLevelOptions = [
  { id: "grade1", label: "1年级" },
  { id: "grade2", label: "2年级" },
  { id: "grade3", label: "3年级" },
  { id: "grade4", label: "4年级" },
  { id: "grade5", label: "5年级" },
  { id: "grade6", label: "6年级" },
  { id: "junior", label: "初中" }
];

export const mathRangeOptions = [
  { id: "10", label: "10以内", maxValue: 10 },
  { id: "20", label: "20以内", maxValue: 20 },
  { id: "30", label: "30以内", maxValue: 30 },
  { id: "50", label: "50以内", maxValue: 50 },
  { id: "100", label: "100以内", maxValue: 100 },
  { id: "custom", label: "自定义", maxValue: null }
];

export const countOptions = [
  { id: "10", label: "10" },
  { id: "20", label: "20" },
  { id: "30", label: "30" },
  { id: "50", label: "50" },
  { id: "100", label: "100" },
  { id: "custom", label: "自定义" }
];

export const intervalOptions = [
  { id: "5", label: "5秒" },
  { id: "10", label: "10秒" },
  { id: "15", label: "15秒" },
  { id: "20", label: "20秒" },
  { id: "custom", label: "自定义" }
];

export const repeatOptions = [
  { id: "1", label: "1次" },
  { id: "2", label: "2次" },
  { id: "3", label: "3次" },
  { id: "custom", label: "自定义" }
];

export const hintLanguageOptions = [
  { id: "zh", label: "中文提示" },
  { id: "en", label: "英文提示" }
];

export const mathOperationOptions = [
  { id: "add", label: "加法" },
  { id: "subtract", label: "减法" },
  { id: "multiply", label: "乘法" },
  { id: "divide", label: "除法" },
  { id: "add_sub_mix", label: "加减法混合" },
  { id: "mul_div_mix", label: "乘除法混合" },
  { id: "all_mix", label: "四则运算" }
];

export const englishLevelOrder = [
  "starter",
  "grade1",
  "grade2",
  "grade3",
  "grade4",
  "grade5",
  "grade6",
  "junior",
  "senior"
];

export const chineseLevelOrder = [
  "grade1",
  "grade2",
  "grade3",
  "grade4",
  "grade5",
  "grade6",
  "junior"
];

export const seedEnglishWords = [
  { level: "starter", word: "cat", hintZh: "猫", hintEn: "a small pet cat" },
  { level: "starter", word: "dog", hintZh: "狗", hintEn: "a friendly dog" },
  { level: "starter", word: "sun", hintZh: "太阳", hintEn: "the bright sun" },
  { level: "starter", word: "moon", hintZh: "月亮", hintEn: "the moon at night" },
  { level: "starter", word: "book", hintZh: "书", hintEn: "a book for reading" },
  { level: "starter", word: "pen", hintZh: "钢笔", hintEn: "a pen for writing" },
  { level: "starter", word: "red", hintZh: "红色", hintEn: "the color red" },
  { level: "starter", word: "blue", hintZh: "蓝色", hintEn: "the color blue" },
  { level: "starter", word: "one", hintZh: "一", hintEn: "the number one" },
  { level: "starter", word: "two", hintZh: "二", hintEn: "the number two" },
  { level: "starter", word: "apple", hintZh: "苹果", hintEn: "a red fruit" },
  { level: "starter", word: "milk", hintZh: "牛奶", hintEn: "a white drink" },

  { level: "grade1", word: "school", hintZh: "学校", hintEn: "a place to learn" },
  { level: "grade1", word: "teacher", hintZh: "老师", hintEn: "a person who teaches" },
  { level: "grade1", word: "classroom", hintZh: "教室", hintEn: "a room for class" },
  { level: "grade1", word: "friend", hintZh: "朋友", hintEn: "a good friend" },
  { level: "grade1", word: "happy", hintZh: "开心的", hintEn: "feeling good and glad" },
  { level: "grade1", word: "water", hintZh: "水", hintEn: "clear water to drink" },
  { level: "grade1", word: "bread", hintZh: "面包", hintEn: "soft bread to eat" },
  { level: "grade1", word: "chair", hintZh: "椅子", hintEn: "a chair to sit on" },
  { level: "grade1", word: "window", hintZh: "窗户", hintEn: "a window in the wall" },
  { level: "grade1", word: "mother", hintZh: "妈妈", hintEn: "your mom" },
  { level: "grade1", word: "father", hintZh: "爸爸", hintEn: "your dad" },
  { level: "grade1", word: "yellow", hintZh: "黄色", hintEn: "the color yellow" },

  { level: "grade2", word: "morning", hintZh: "早晨", hintEn: "the start of a day" },
  { level: "grade2", word: "evening", hintZh: "傍晚", hintEn: "the late part of a day" },
  { level: "grade2", word: "library", hintZh: "图书馆", hintEn: "a place full of books" },
  { level: "grade2", word: "garden", hintZh: "花园", hintEn: "a garden with plants" },
  { level: "grade2", word: "basketball", hintZh: "篮球", hintEn: "a sport with a ball" },
  { level: "grade2", word: "family", hintZh: "家庭", hintEn: "people in your home" },
  { level: "grade2", word: "flower", hintZh: "花", hintEn: "a beautiful flower" },
  { level: "grade2", word: "holiday", hintZh: "假期", hintEn: "days off from school" },
  { level: "grade2", word: "picture", hintZh: "图片", hintEn: "a picture or photo" },
  { level: "grade2", word: "orange", hintZh: "橙子", hintEn: "an orange fruit" },
  { level: "grade2", word: "question", hintZh: "问题", hintEn: "something you ask" },
  { level: "grade2", word: "answer", hintZh: "答案", hintEn: "a reply to a question" },

  { level: "grade3", word: "important", hintZh: "重要的", hintEn: "very useful or needed" },
  { level: "grade3", word: "because", hintZh: "因为", hintEn: "used to give a reason" },
  { level: "grade3", word: "beautiful", hintZh: "漂亮的", hintEn: "very pretty" },
  { level: "grade3", word: "weather", hintZh: "天气", hintEn: "sunny or rainy sky" },
  { level: "grade3", word: "science", hintZh: "科学", hintEn: "the study of nature" },
  { level: "grade3", word: "history", hintZh: "历史", hintEn: "things from the past" },
  { level: "grade3", word: "travel", hintZh: "旅行", hintEn: "to go to another place" },
  { level: "grade3", word: "healthy", hintZh: "健康的", hintEn: "in good condition" },
  { level: "grade3", word: "homework", hintZh: "家庭作业", hintEn: "school work at home" },
  { level: "grade3", word: "festival", hintZh: "节日", hintEn: "a special celebration day" },
  { level: "grade3", word: "mountain", hintZh: "山", hintEn: "a very high hill" },
  { level: "grade3", word: "practice", hintZh: "练习", hintEn: "do something many times" },

  { level: "grade4", word: "information", hintZh: "信息", hintEn: "facts or details" },
  { level: "grade4", word: "activity", hintZh: "活动", hintEn: "something you do" },
  { level: "grade4", word: "language", hintZh: "语言", hintEn: "English or Chinese" },
  { level: "grade4", word: "prepare", hintZh: "准备", hintEn: "get ready for something" },
  { level: "grade4", word: "favorite", hintZh: "最喜欢的", hintEn: "liked the most" },
  { level: "grade4", word: "village", hintZh: "村庄", hintEn: "a small place in the country" },
  { level: "grade4", word: "animal", hintZh: "动物", hintEn: "a living creature" },
  { level: "grade4", word: "engineer", hintZh: "工程师", hintEn: "a person who builds things" },
  { level: "grade4", word: "remember", hintZh: "记得", hintEn: "keep in your mind" },
  { level: "grade4", word: "careful", hintZh: "仔细的", hintEn: "paying close attention" },
  { level: "grade4", word: "weekend", hintZh: "周末", hintEn: "Saturday and Sunday" },
  { level: "grade4", word: "difficult", hintZh: "困难的", hintEn: "not easy" },

  { level: "grade5", word: "knowledge", hintZh: "知识", hintEn: "things you know" },
  { level: "grade5", word: "community", hintZh: "社区", hintEn: "people living together nearby" },
  { level: "grade5", word: "environment", hintZh: "环境", hintEn: "the world around us" },
  { level: "grade5", word: "discover", hintZh: "发现", hintEn: "find something new" },
  { level: "grade5", word: "support", hintZh: "支持", hintEn: "help or stand with" },
  { level: "grade5", word: "respect", hintZh: "尊重", hintEn: "show good manners and value" },
  { level: "grade5", word: "journey", hintZh: "旅程", hintEn: "a trip from one place to another" },
  { level: "grade5", word: "challenge", hintZh: "挑战", hintEn: "something hard but useful" },
  { level: "grade5", word: "improve", hintZh: "提升", hintEn: "make something better" },
  { level: "grade5", word: "protect", hintZh: "保护", hintEn: "keep safe" },
  { level: "grade5", word: "culture", hintZh: "文化", hintEn: "the customs of a group" },
  { level: "grade5", word: "creative", hintZh: "有创造力的", hintEn: "good at making new ideas" },

  { level: "grade6", word: "opportunity", hintZh: "机会", hintEn: "a good chance" },
  { level: "grade6", word: "confident", hintZh: "自信的", hintEn: "sure about yourself" },
  { level: "grade6", word: "responsible", hintZh: "负责的", hintEn: "ready to do your duty" },
  { level: "grade6", word: "communicate", hintZh: "沟通", hintEn: "share ideas with others" },
  { level: "grade6", word: "experience", hintZh: "经历", hintEn: "something you have done or felt" },
  { level: "grade6", word: "traditional", hintZh: "传统的", hintEn: "coming from long-time customs" },
  { level: "grade6", word: "technology", hintZh: "技术", hintEn: "tools and science in action" },
  { level: "grade6", word: "independent", hintZh: "独立的", hintEn: "able to do things alone" },
  { level: "grade6", word: "organize", hintZh: "整理", hintEn: "put things in order" },
  { level: "grade6", word: "resource", hintZh: "资源", hintEn: "something useful to use" },
  { level: "grade6", word: "decision", hintZh: "决定", hintEn: "a choice you make" },
  { level: "grade6", word: "solution", hintZh: "解决方案", hintEn: "an answer to a problem" },

  { level: "junior", word: "achieve", hintZh: "实现", hintEn: "reach a goal" },
  { level: "junior", word: "compare", hintZh: "比较", hintEn: "look at differences and similarities" },
  { level: "junior", word: "describe", hintZh: "描述", hintEn: "say what something is like" },
  { level: "junior", word: "develop", hintZh: "发展", hintEn: "grow and become stronger" },
  { level: "junior", word: "encourage", hintZh: "鼓励", hintEn: "give support and confidence" },
  { level: "junior", word: "knowledgeable", hintZh: "知识渊博的", hintEn: "knowing a lot" },
  { level: "junior", word: "necessary", hintZh: "必要的", hintEn: "needed and important" },
  { level: "junior", word: "schedule", hintZh: "日程安排", hintEn: "a plan of time" },
  { level: "junior", word: "towards", hintZh: "朝向", hintEn: "in the direction of" },
  { level: "junior", word: "valuable", hintZh: "有价值的", hintEn: "worth a lot" },
  { level: "junior", word: "volunteer", hintZh: "志愿者", hintEn: "a person who helps freely" },
  { level: "junior", word: "review", hintZh: "复习", hintEn: "study again" },

  { level: "senior", word: "analysis", hintZh: "分析", hintEn: "a detailed study" },
  { level: "senior", word: "available", hintZh: "可获得的", hintEn: "ready to be used" },
  { level: "senior", word: "conclusion", hintZh: "结论", hintEn: "the final idea after thinking" },
  { level: "senior", word: "contribute", hintZh: "贡献", hintEn: "give something useful" },
  { level: "senior", word: "efficient", hintZh: "高效的", hintEn: "working well with little waste" },
  { level: "senior", word: "principle", hintZh: "原则", hintEn: "a basic rule or idea" },
  { level: "senior", word: "resourceful", hintZh: "足智多谋的", hintEn: "good at solving problems" },
  { level: "senior", word: "significant", hintZh: "重要的", hintEn: "large in meaning or effect" },
  { level: "senior", word: "strategy", hintZh: "策略", hintEn: "a plan to reach a goal" },
  { level: "senior", word: "sustainable", hintZh: "可持续的", hintEn: "able to continue for long" },
  { level: "senior", word: "transfer", hintZh: "转移", hintEn: "move from one place to another" },
  { level: "senior", word: "willingness", hintZh: "意愿", hintEn: "being ready to do something" },

  { level: "ket", word: "airport", hintZh: "机场", hintEn: "a place for planes" },
  { level: "ket", word: "blanket", hintZh: "毯子", hintEn: "a warm cover for bed" },
  { level: "ket", word: "camera", hintZh: "相机", hintEn: "a machine for taking photos" },
  { level: "ket", word: "dangerous", hintZh: "危险的", hintEn: "not safe" },
  { level: "ket", word: "excited", hintZh: "兴奋的", hintEn: "very happy and eager" },
  { level: "ket", word: "forest", hintZh: "森林", hintEn: "a large area of trees" },
  { level: "ket", word: "hospital", hintZh: "医院", hintEn: "a place for sick people" },
  { level: "ket", word: "invitation", hintZh: "邀请", hintEn: "a request to come" },
  { level: "ket", word: "message", hintZh: "信息", hintEn: "a note or communication" },
  { level: "ket", word: "restaurant", hintZh: "餐馆", hintEn: "a place to eat out" },
  { level: "ket", word: "station", hintZh: "车站", hintEn: "a place where trains or buses stop" },
  { level: "ket", word: "ticket", hintZh: "票", hintEn: "a paper that lets you travel or enter" },

  { level: "pet", word: "adventure", hintZh: "冒险", hintEn: "an exciting experience" },
  { level: "pet", word: "borrow", hintZh: "借入", hintEn: "take and return later" },
  { level: "pet", word: "competition", hintZh: "比赛", hintEn: "an event to see who is best" },
  { level: "pet", word: "decision", hintZh: "决定", hintEn: "a choice after thinking" },
  { level: "pet", word: "electric", hintZh: "电动的", hintEn: "using electricity" },
  { level: "pet", word: "fashion", hintZh: "时尚", hintEn: "a popular style" },
  { level: "pet", word: "imagine", hintZh: "想象", hintEn: "form a picture in your mind" },
  { level: "pet", word: "journey", hintZh: "旅程", hintEn: "a long trip" },
  { level: "pet", word: "ordinary", hintZh: "普通的", hintEn: "not special" },
  { level: "pet", word: "pollution", hintZh: "污染", hintEn: "dirty and harmful waste" },
  { level: "pet", word: "recycle", hintZh: "回收利用", hintEn: "use something again" },
  { level: "pet", word: "traffic", hintZh: "交通", hintEn: "cars and buses on roads" },

  { level: "fce", word: "accurate", hintZh: "准确的", hintEn: "without mistakes" },
  { level: "fce", word: "audience", hintZh: "观众", hintEn: "people watching or listening" },
  { level: "fce", word: "complex", hintZh: "复杂的", hintEn: "not simple" },
  { level: "fce", word: "despite", hintZh: "尽管", hintEn: "without being stopped by" },
  { level: "fce", word: "essential", hintZh: "必要的", hintEn: "very important and needed" },
  { level: "fce", word: "frequently", hintZh: "经常地", hintEn: "many times" },
  { level: "fce", word: "impress", hintZh: "给人深刻印象", hintEn: "make someone admire" },
  { level: "fce", word: "maintain", hintZh: "维持", hintEn: "keep in good condition" },
  { level: "fce", word: "proposal", hintZh: "提案", hintEn: "a suggested plan" },
  { level: "fce", word: "recover", hintZh: "恢复", hintEn: "get better again" },
  { level: "fce", word: "reliable", hintZh: "可靠的", hintEn: "able to be trusted" },
  { level: "fce", word: "variety", hintZh: "多样性", hintEn: "many different kinds" },

  { level: "cet4", word: "adapt", hintZh: "适应", hintEn: "change to fit a new condition" },
  { level: "cet4", word: "approach", hintZh: "方法", hintEn: "a way of dealing with something" },
  { level: "cet4", word: "benefit", hintZh: "益处", hintEn: "something helpful or good" },
  { level: "cet4", word: "consume", hintZh: "消耗", hintEn: "use up" },
  { level: "cet4", word: "demonstrate", hintZh: "展示", hintEn: "show clearly" },
  { level: "cet4", word: "estimate", hintZh: "估计", hintEn: "guess the size or amount" },
  { level: "cet4", word: "factor", hintZh: "因素", hintEn: "one part of a result" },
  { level: "cet4", word: "ignore", hintZh: "忽视", hintEn: "pay no attention to" },
  { level: "cet4", word: "method", hintZh: "方法", hintEn: "a way to do something" },
  { level: "cet4", word: "pressure", hintZh: "压力", hintEn: "stress or force" },
  { level: "cet4", word: "reduce", hintZh: "减少", hintEn: "make smaller or less" },
  { level: "cet4", word: "source", hintZh: "来源", hintEn: "where something comes from" },

  { level: "cet6", word: "assess", hintZh: "评估", hintEn: "judge the value or quality" },
  { level: "cet6", word: "capacity", hintZh: "能力", hintEn: "the ability to hold or do" },
  { level: "cet6", word: "derive", hintZh: "获得", hintEn: "get from something else" },
  { level: "cet6", word: "emerge", hintZh: "出现", hintEn: "come into view" },
  { level: "cet6", word: "guarantee", hintZh: "保证", hintEn: "promise that something is true" },
  { level: "cet6", word: "implement", hintZh: "实施", hintEn: "carry out a plan" },
  { level: "cet6", word: "inevitable", hintZh: "不可避免的", hintEn: "certain to happen" },
  { level: "cet6", word: "motivate", hintZh: "激励", hintEn: "give a reason to act" },
  { level: "cet6", word: "perspective", hintZh: "视角", hintEn: "a way of thinking" },
  { level: "cet6", word: "precisely", hintZh: "精确地", hintEn: "exactly" },
  { level: "cet6", word: "retain", hintZh: "保留", hintEn: "keep and continue to have" },
  { level: "cet6", word: "substantial", hintZh: "大量的", hintEn: "large in size or amount" },

  { level: "toefl", word: "accumulate", hintZh: "积累", hintEn: "collect more and more over time" },
  { level: "toefl", word: "adjacent", hintZh: "邻近的", hintEn: "next to something" },
  { level: "toefl", word: "controversy", hintZh: "争议", hintEn: "a strong public disagreement" },
  { level: "toefl", word: "decline", hintZh: "下降", hintEn: "become less or lower" },
  { level: "toefl", word: "eliminate", hintZh: "消除", hintEn: "remove completely" },
  { level: "toefl", word: "fundamental", hintZh: "根本的", hintEn: "forming the base" },
  { level: "toefl", word: "hypothesis", hintZh: "假设", hintEn: "an idea to test" },
  { level: "toefl", word: "infrastructure", hintZh: "基础设施", hintEn: "basic systems and structures" },
  { level: "toefl", word: "notion", hintZh: "观念", hintEn: "an idea or belief" },
  { level: "toefl", word: "random", hintZh: "随机的", hintEn: "without a pattern" },
  { level: "toefl", word: "restore", hintZh: "恢复", hintEn: "bring back to an earlier state" },
  { level: "toefl", word: "transmit", hintZh: "传输", hintEn: "send from one place to another" },

  { level: "ielts", word: "abandon", hintZh: "放弃", hintEn: "leave behind completely" },
  { level: "ielts", word: "compulsory", hintZh: "强制的", hintEn: "required by rule" },
  { level: "ielts", word: "consequence", hintZh: "后果", hintEn: "what happens because of something" },
  { level: "ielts", word: "distinguish", hintZh: "区分", hintEn: "tell the difference" },
  { level: "ielts", word: "generate", hintZh: "产生", hintEn: "create or produce" },
  { level: "ielts", word: "intensive", hintZh: "密集的", hintEn: "strong and focused" },
  { level: "ielts", word: "justify", hintZh: "证明合理", hintEn: "show a good reason" },
  { level: "ielts", word: "legislation", hintZh: "立法", hintEn: "laws made by a government" },
  { level: "ielts", word: "participation", hintZh: "参与", hintEn: "taking part in something" },
  { level: "ielts", word: "priority", hintZh: "优先事项", hintEn: "something more important than others" },
  { level: "ielts", word: "significantly", hintZh: "显著地", hintEn: "in an important or large way" },
  { level: "ielts", word: "welfare", hintZh: "福利", hintEn: "health and happiness" }
];

export const seedChineseWords = [
  { level: "grade1", text: "春天", pinyin: "chun tian", explanation: "一年四季中的第一个季节" },
  { level: "grade1", text: "老师", pinyin: "lao shi", explanation: "在学校教书的人" },
  { level: "grade1", text: "朋友", pinyin: "peng you", explanation: "可以一起玩耍和学习的人" },
  { level: "grade1", text: "月亮", pinyin: "yue liang", explanation: "夜空中常见的天体" },
  { level: "grade1", text: "苹果", pinyin: "ping guo", explanation: "一种常见水果" },
  { level: "grade1", text: "开心", pinyin: "kai xin", explanation: "高兴快乐的样子" },
  { level: "grade1", text: "读书", pinyin: "du shu", explanation: "阅读书本" },
  { level: "grade1", text: "写字", pinyin: "xie zi", explanation: "用笔书写" },
  { level: "grade1", text: "早晨", pinyin: "zao chen", explanation: "一天开始的时候" },
  { level: "grade1", text: "校园", pinyin: "xiao yuan", explanation: "学校里的环境" },

  { level: "grade2", text: "认真", pinyin: "ren zhen", explanation: "做事细心专注" },
  { level: "grade2", text: "礼貌", pinyin: "li mao", explanation: "待人接物有修养" },
  { level: "grade2", text: "操场", pinyin: "cao chang", explanation: "学校活动和运动的地方" },
  { level: "grade2", text: "故事", pinyin: "gu shi", explanation: "讲述人物和事情的内容" },
  { level: "grade2", text: "河流", pinyin: "he liu", explanation: "流动的水道" },
  { level: "grade2", text: "照顾", pinyin: "zhao gu", explanation: "关心并帮助别人" },
  { level: "grade2", text: "清新", pinyin: "qing xin", explanation: "空气或感觉很新鲜" },
  { level: "grade2", text: "表扬", pinyin: "biao yang", explanation: "夸奖和肯定" },
  { level: "grade2", text: "温暖", pinyin: "wen nuan", explanation: "让人觉得舒服不冷" },
  { level: "grade2", text: "希望", pinyin: "xi wang", explanation: "对未来抱有期待" },

  { level: "grade3", text: "保护", pinyin: "bao hu", explanation: "让事物免受伤害" },
  { level: "grade3", text: "观察", pinyin: "guan cha", explanation: "仔细地看和研究" },
  { level: "grade3", text: "努力", pinyin: "nu li", explanation: "肯花力气去做" },
  { level: "grade3", text: "森林", pinyin: "sen lin", explanation: "树木很多的地方" },
  { level: "grade3", text: "实验", pinyin: "shi yan", explanation: "用操作来验证想法" },
  { level: "grade3", text: "明亮", pinyin: "ming liang", explanation: "光线充足" },
  { level: "grade3", text: "节日", pinyin: "jie ri", explanation: "特殊纪念和庆祝的日子" },
  { level: "grade3", text: "丰富", pinyin: "feng fu", explanation: "数量多内容足" },
  { level: "grade3", text: "安全", pinyin: "an quan", explanation: "没有危险" },
  { level: "grade3", text: "积极", pinyin: "ji ji", explanation: "主动向上的态度" },

  { level: "grade4", text: "鼓励", pinyin: "gu li", explanation: "给予信心和支持" },
  { level: "grade4", text: "耐心", pinyin: "nai xin", explanation: "不急躁，愿意等待" },
  { level: "grade4", text: "传递", pinyin: "chuan di", explanation: "一个接一个地送到" },
  { level: "grade4", text: "探索", pinyin: "tan suo", explanation: "寻找新的发现" },
  { level: "grade4", text: "梦想", pinyin: "meng xiang", explanation: "对未来的美好想象" },
  { level: "grade4", text: "精彩", pinyin: "jing cai", explanation: "非常出色" },
  { level: "grade4", text: "景色", pinyin: "jing se", explanation: "自然或城市的样子" },
  { level: "grade4", text: "传统", pinyin: "chuan tong", explanation: "长期流传下来的习惯" },
  { level: "grade4", text: "智慧", pinyin: "zhi hui", explanation: "善于思考和判断的能力" },
  { level: "grade4", text: "方法", pinyin: "fang fa", explanation: "做事的办法" },

  { level: "grade5", text: "挑战", pinyin: "tiao zhan", explanation: "有难度但值得尝试的事情" },
  { level: "grade5", text: "责任", pinyin: "ze ren", explanation: "应当承担的任务" },
  { level: "grade5", text: "坚持", pinyin: "jian chi", explanation: "一直不放弃" },
  { level: "grade5", text: "沟通", pinyin: "gou tong", explanation: "人与人交流想法" },
  { level: "grade5", text: "资源", pinyin: "zi yuan", explanation: "可以利用的条件和材料" },
  { level: "grade5", text: "秩序", pinyin: "zhi xu", explanation: "整齐有规则的状态" },
  { level: "grade5", text: "创新", pinyin: "chuang xin", explanation: "创造新的方法和内容" },
  { level: "grade5", text: "尊重", pinyin: "zun zhong", explanation: "重视并礼貌对待别人" },
  { level: "grade5", text: "经历", pinyin: "jing li", explanation: "亲身遇到过的事情" },
  { level: "grade5", text: "目标", pinyin: "mu biao", explanation: "想要达到的方向" },

  { level: "grade6", text: "独立", pinyin: "du li", explanation: "能够自己完成事情" },
  { level: "grade6", text: "方案", pinyin: "fang an", explanation: "解决问题的计划" },
  { level: "grade6", text: "效率", pinyin: "xiao lv", explanation: "完成事情的快慢和效果" },
  { level: "grade6", text: "判断", pinyin: "pan duan", explanation: "分析后做出结论" },
  { level: "grade6", text: "经验", pinyin: "jing yan", explanation: "从实践中得到的认识" },
  { level: "grade6", text: "协调", pinyin: "xie tiao", explanation: "使各部分配合起来" },
  { level: "grade6", text: "稳定", pinyin: "wen ding", explanation: "不轻易变化" },
  { level: "grade6", text: "规律", pinyin: "gui lv", explanation: "事物变化中常见的方式" },
  { level: "grade6", text: "启发", pinyin: "qi fa", explanation: "给人新的思路" },
  { level: "grade6", text: "综合", pinyin: "zong he", explanation: "把多方面结合起来" },

  { level: "junior", text: "沉淀", pinyin: "chen dian", explanation: "经过时间积累留下来的成果" },
  { level: "junior", text: "辨析", pinyin: "bian xi", explanation: "分辨并分析" },
  { level: "junior", text: "拓展", pinyin: "tuo zhan", explanation: "向更广的方向发展" },
  { level: "junior", text: "概括", pinyin: "gai kuo", explanation: "抓住重点做总结" },
  { level: "junior", text: "氛围", pinyin: "fen wei", explanation: "某个环境带来的感觉" },
  { level: "junior", text: "激励", pinyin: "ji li", explanation: "激发动力和热情" },
  { level: "junior", text: "梳理", pinyin: "shu li", explanation: "整理清楚" },
  { level: "junior", text: "论证", pinyin: "lun zheng", explanation: "用道理和事实证明" },
  { level: "junior", text: "审视", pinyin: "shen shi", explanation: "认真观察和思考" },
  { level: "junior", text: "联结", pinyin: "lian jie", explanation: "把不同内容关联起来" }
];

export function getOptionLabel(options, value) {
  return options.find((item) => item.id === value)?.label ?? value;
}

export function cumulativePool(items, level, orderedLevels) {
  const levelIndex = orderedLevels.indexOf(level);
  if (levelIndex === -1) {
    return items.filter((item) => item.level === level);
  }

  const allowed = new Set(orderedLevels.slice(0, levelIndex + 1));
  return items.filter((item) => allowed.has(item.level));
}
