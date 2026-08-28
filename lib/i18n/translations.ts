/**
 * Clyra Native Multi-Language Translation Dictionaries
 * Supports: id (Indonesian), en (English), zh (Chinese Simplified), ar (Arabic RTL)
 * Brand Name "Clyra" is strictly preserved across all languages.
 */

export type SupportedLanguage = "id" | "en" | "zh" | "ar";

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  dir: "ltr" | "rtl";
}

export const LANGUAGES: LanguageMeta[] = [
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩", dir: "ltr" },
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "zh", name: "Chinese", nativeName: "简体中文", flag: "🇨🇳", dir: "ltr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", dir: "rtl" },
];

export const TRANSLATIONS = {
  id: {
    // Navigation
    "nav.home": "Home",
    "nav.tools": "Tools Hub",
    "nav.prompts": "AI Prompts",
    "nav.web": "Web Works",
    "nav.member_vault": "Member Vault",
    "nav.search": "Cari",
    "nav.search_placeholder": "Cari cepat (Ctrl+K)...",

    // Notice Banner
    "banner.early_access": "Clyra Hub (Early Access)",
    "banner.subtitle": "Suite Utilitas Produktivitas & Developer 100% Client-Side",
    "banner.changelog_btn": "Changelog v2.5.0",

    // Hero Section
    "hero.badge_pro": "PRO FEATURES UNLOCKED",
    "hero.badge_free": "100% Gratis Tanpa Batasan",
    "hero.title_main": "Semua Fitur Premium,",
    "hero.title_highlight": "Kini Gratis",
    "hero.title_end": "& Tanpa Batas.",
    "hero.description":
      "Tidak ada paywall, tidak ada batasan ukuran file harian, tanpa watermark, dan tanpa wajib daftar. Semua tools berjalan instan dan privat langsung di browser Anda.",
    "hero.input_placeholder": "Cari tool (e.g. compress, qr logo, typescript, prompt)...",
    "hero.btn_tools": "Jelajahi Semua Tools",
    "hero.btn_prompts": "Galeri Prompt AI",
    "hero.feat_unlimited": "100% Fitur Pro Unlocked",
    "hero.feat_privacy": "Zero Server Tracking",
    "hero.feat_ready": "Performa Cepat & Stabil",

    // Section Titles
    "sec.diff_badge": "KENAPA CLYRA BERBEDA?",
    "sec.diff_title": "Bebas dari Segala Batasan Berbayar",
    "sec.other_tools_title": "WEB TOOLS LAIN DI INTERNET",
    "sec.clyra_title": "CLYRA PLATFORM",
    "sec.trending_badge": "PALING SERING DIGUNAKAN",
    "sec.trending_title": "Tools Produktivitas Pro",
    "sec.trending_desc": "Peringkat otomatis berdasarkan intensitas penggunaan harian Anda.",
    "sec.see_all_tools": "Lihat Katalog Lengkap",
    "sec.prompts_badge": "PROMPT SHOWCASE",
    "sec.prompts_title": "Koleksi Prompt & Thumbnail AI",
    "sec.prompts_desc": "Simpan dan gunakan prompt berkualitas lengkap dengan preview gambar hasil generate.",
    "sec.see_all_prompts": "Buka Galeri Lengkap",
    "sec.web_badge": "PORTOFOLIO WEB",
    "sec.web_title": "Karya & Website yang Dibuat",
    "sec.web_desc": "Kumpulan projek website dan aplikasi web yang telah dibangun.",
    "sec.see_all_web": "Lihat Semua Projek",

    // Tools Page
    "tools.page_badge": "SUITE UTILITAS CLIENT-SIDE",
    "tools.page_title": "Katalog Lengkap Tools & Utilitas",
    "tools.page_desc": "Semua pemrosesan berkas dijalankan 100% secara lokal di browser Anda tanpa pernah diunggah ke server mana pun.",
    "tools.search_placeholder": "Cari nama tool, tag, atau fungsi (misal: qr, compress, json)...",
    "tools.filter_all": "Semua Kategori",
    "tools.sort_usage": "Paling Sering Dipakai",
    "tools.sort_popular": "Populer",
    "tools.sort_alpha": "Nama A - Z",
    "tools.pinned_title": "Tool Tersemat (Pinned)",
    "tools.recent_title": "Baru Saja Digunakan",
    "tools.all_tools_title": "Semua Utilitas",
    "tools.total_count": "Total {count} Utilitas Tersedia",
    "tools.no_results": "Tidak ada tool yang cocok dengan pencarian Anda.",
    "tools.reset_filter": "Reset Filter",
    "tools.open_tool": "Buka Tool",
    "tools.pin": "Sematkan",
    "tools.unpin": "Lepas Sematan",

    // Prompts Page
    "prompts.page_badge": "ARSIP PROMPT AI KREATIF",
    "prompts.page_title": "Galeri Prompt AI & Visual Vault",
    "prompts.page_desc": "Kumpulan prompt fotorealistik dan sinematik teruji lengkap dengan rasio aspek, panduan model, dan preview visual.",
    "prompts.search_placeholder": "Cari prompt berdasarkan subjek, gaya fotografi, atau model AI...",
    "prompts.filter_all": "Semua Model",
    "prompts.copy_prompt": "Salin Prompt",
    "prompts.copied": "Tersalin!",
    "prompts.aspect_ratio": "Rasio Aspek",
    "prompts.model_label": "Model AI",
    "prompts.negative_prompt": "Negative Prompt",
    "prompts.click_detail": "Klik untuk detail lengkap",
    "prompts.modal_title": "Detail Lengkap Prompt",

    // Web Projects Page
    "web.page_badge": "PORTOFOLIO DIGITAL",
    "web.page_title": "Karya Website & Aplikasi Web",
    "web.page_desc": "Eksplorasi kumpulan arsitektur frontend modern, sistem interaktif, dan utilitas web yang telah dibangun.",
    "web.visit_btn": "Kunjungi Website",
    "web.source_btn": "Source Code",
    "web.tech_stack": "Teknologi",

    // Terms & Disclaimer Page
    "terms.page_badge": "KEBIJAKAN & PRIVASI",
    "terms.page_title": "Syarat, Ketentuan & Disclaimer Legal",
    "terms.page_desc": "Clyra dirancang dengan memprioritaskan privasi penuh dan eksekusi aman di sisi pengguna.",
    "terms.back_home": "Kembali ke Beranda",
    "terms.client_side_rule": "100% Eksekusi Client-Side",
    "terms.client_side_desc": "Seluruh proses konversi gambar, enkripsi password, dan manipulasi teks dijalankan di peramban Anda. Tidak ada data yang dikirim atau disimpan di server Clyra.",
    "terms.accept_btn": "Saya Mengerti & Setuju",

    // Member Vault & Auth
    "member.vault_badge": "MEMBER VAULT VIP",
    "member.activate_title": "Aktivasi Akun Pembeli",
    "member.activate_desc": "Masukkan email pesanan Anda untuk membuka akses eksklusif materi digital dan script workspace.",
    "member.email_label": "Email Terdaftar di Pesanan",
    "member.password_label": "Buat Password Akun Baru",
    "member.confirm_password_label": "Ulangi Password",
    "member.activate_btn": "Buat Akun & Buka Workspace",
    "member.login_title": "Login Member Clyra",
    "member.login_desc": "Masuk ke workspace multi-device Anda untuk mengakses seluruh materi digital yang Anda miliki.",
    "member.login_btn": "Masuk ke Workspace",
    "member.workspace_title": "Workspace Pembeli Eksklusif",
    "member.workspace_desc": "Pusat membaca materi digital, repositori script, dan brankas catatan cloud pribadi Anda.",
    "member.my_products": "Produk Saya",
    "member.notes_title": "Catatan Cloud Pribadi",
    "member.logout": "Keluar Sesi",

    // Command Palette
    "palette.placeholder": "Ketik nama tool, prompt, atau rute navigasi...",
    "palette.group_nav": "Navigasi Menu",
    "palette.group_tools": "Utilitas & Tools",
    "palette.group_prompts": "AI Prompts",
    "palette.group_web": "Web Works",
    "palette.no_results": "Tidak ada hasil ditemukan.",

    // Weather & Telemetry Widget
    "weather.title": "Status Cuaca & Waktu",
    "weather.local_time": "WAKTU LOKAL",
    "weather.condition": "Kondisi Cuaca",
    "weather.humidity": "Kelembaban",
    "weather.wind": "Kecepatan Angin",
    "weather.uv": "Indeks UV",
    "weather.detected_loc": "Lokasi Terdeteksi",
    "weather.search_placeholder": "Ganti kota (e.g. Jakarta, Surabaya)...",
    "weather.search_btn": "Cari",
    "weather.use_gps": "Gunakan GPS Presisi",
    "weather.reset": "Reset",

    // Footer
    "footer.title": "Personal Workspace & Tool Hub",
    "footer.desc": "Dirancang minimalis, efisien, 100% Client-side safe & terenkripsi.",
    "footer.terms": "Syarat & Disclaimer",
    "footer.changelog": "Changelog",
    "footer.crafted": "Crafted for high productivity",
  },

  en: {
    // Navigation
    "nav.home": "Home",
    "nav.tools": "Tools Hub",
    "nav.prompts": "AI Prompts",
    "nav.web": "Web Works",
    "nav.member_vault": "Member Vault",
    "nav.search": "Search",
    "nav.search_placeholder": "Quick search (Ctrl+K)...",

    // Notice Banner
    "banner.early_access": "Clyra Hub (Early Access)",
    "banner.subtitle": "100% Client-Side Productivity & Developer Utilities Suite",
    "banner.changelog_btn": "Changelog v2.5.0",

    // Hero Section
    "hero.badge_pro": "PRO FEATURES UNLOCKED",
    "hero.badge_free": "100% Free & Unlimited",
    "hero.title_main": "All Premium Features,",
    "hero.title_highlight": "Now Free",
    "hero.title_end": "& Limitless.",
    "hero.description":
      "No paywalls, no daily file size caps, no watermarks, and no sign-up required. All utilities run instantly and privately inside your web browser.",
    "hero.input_placeholder": "Search tool (e.g. compress, qr logo, typescript, prompt)...",
    "hero.btn_tools": "Explore All Tools",
    "hero.btn_prompts": "AI Prompt Gallery",
    "hero.feat_unlimited": "100% Pro Unlocked",
    "hero.feat_privacy": "Zero Server Tracking",
    "hero.feat_ready": "Fast & Highly Responsive",

    // Section Titles
    "sec.diff_badge": "WHY CHOOSE CLYRA?",
    "sec.diff_title": "Free from Paywalls & Restrictions",
    "sec.other_tools_title": "OTHER ONLINE WEB TOOLS",
    "sec.clyra_title": "CLYRA PLATFORM",
    "sec.trending_badge": "MOST FREQUENTLY USED",
    "sec.trending_title": "Pro Productivity Utilities",
    "sec.trending_desc": "Automatically sorted by your daily usage frequency.",
    "sec.see_all_tools": "Browse Full Catalog",
    "sec.prompts_badge": "PROMPT VAULT",
    "sec.prompts_title": "Curated AI Prompts & Visuals",
    "sec.prompts_desc": "Save and use high-quality generative AI prompts with image previews.",
    "sec.see_all_prompts": "Open Full Gallery",
    "sec.web_badge": "WEB SHOWCASE",
    "sec.web_title": "Built Websites & Applications",
    "sec.web_desc": "A portfolio of modern, responsive web applications.",
    "sec.see_all_web": "View All Projects",

    // Tools Page
    "tools.page_badge": "CLIENT-SIDE UTILITY SUITE",
    "tools.page_title": "Complete Catalog of Tools & Utilities",
    "tools.page_desc": "All data and file transformations execute 100% locally in your browser without ever uploading to any remote server.",
    "tools.search_placeholder": "Search tool name, tags, or functionality (e.g. qr, compress, json)...",
    "tools.filter_all": "All Categories",
    "tools.sort_usage": "Most Used",
    "tools.sort_popular": "Popular",
    "tools.sort_alpha": "Name A - Z",
    "tools.pinned_title": "Pinned Tools",
    "tools.recent_title": "Recently Used",
    "tools.all_tools_title": "All Utilities",
    "tools.total_count": "Total {count} Utilities Available",
    "tools.no_results": "No utilities match your search query.",
    "tools.reset_filter": "Reset Filters",
    "tools.open_tool": "Open Tool",
    "tools.pin": "Pin",
    "tools.unpin": "Unpin",

    // Prompts Page
    "prompts.page_badge": "CREATIVE AI PROMPT VAULT",
    "prompts.page_title": "AI Prompts Gallery & Visual Showcase",
    "prompts.page_desc": "Curated photorealistic and cinematic tested prompts complete with aspect ratios, model guidance, and visual previews.",
    "prompts.search_placeholder": "Search prompts by subject, photography style, or AI model...",
    "prompts.filter_all": "All Models",
    "prompts.copy_prompt": "Copy Prompt",
    "prompts.copied": "Copied!",
    "prompts.aspect_ratio": "Aspect Ratio",
    "prompts.model_label": "AI Model",
    "prompts.negative_prompt": "Negative Prompt",
    "prompts.click_detail": "Click for full details",
    "prompts.modal_title": "Full Prompt Details",

    // Web Projects Page
    "web.page_badge": "DIGITAL PORTFOLIO",
    "web.page_title": "Websites & Web Applications Showcase",
    "web.page_desc": "Explore modern frontend architectures, interactive systems, and performant web utilities.",
    "web.visit_btn": "Visit Website",
    "web.source_btn": "Source Code",
    "web.tech_stack": "Technologies",

    // Terms & Disclaimer Page
    "terms.page_badge": "PRIVACY & LEGAL POLICIES",
    "terms.page_title": "Terms, Conditions & Legal Disclaimer",
    "terms.page_desc": "Clyra is engineered with strict client-side privacy and secure execution at its core.",
    "terms.back_home": "Back to Home",
    "terms.client_side_rule": "100% Client-Side Execution",
    "terms.client_side_desc": "All image conversions, password encryptions, and text transformations happen strictly inside your browser. No personal data is ever collected or transmitted to remote servers.",
    "terms.accept_btn": "I Understand & Accept",

    // Member Vault & Auth
    "member.vault_badge": "VIP MEMBER VAULT",
    "member.activate_title": "Customer Account Activation",
    "member.activate_desc": "Enter your order email to unlock exclusive access to your digital materials and script workspace.",
    "member.email_label": "Registered Order Email",
    "member.password_label": "Create New Account Password",
    "member.confirm_password_label": "Confirm Password",
    "member.activate_btn": "Create Account & Open Workspace",
    "member.login_title": "Clyra Member Login",
    "member.login_desc": "Sign in to your multi-device workspace to access all your purchased digital products.",
    "member.login_btn": "Sign In to Workspace",
    "member.workspace_title": "Exclusive Member Workspace",
    "member.workspace_desc": "Your unified hub for digital material reading, source script repositories, and synced cloud notes.",
    "member.my_products": "My Purchased Products",
    "member.notes_title": "Personal Cloud Notes",
    "member.logout": "Sign Out",

    // Command Palette
    "palette.placeholder": "Type tool name, prompt, or navigation route...",
    "palette.group_nav": "Menu Navigation",
    "palette.group_tools": "Utilities & Tools",
    "palette.group_prompts": "AI Prompts",
    "palette.group_web": "Web Works",
    "palette.no_results": "No results found.",

    // Weather & Telemetry Widget
    "weather.title": "Weather & Time Status",
    "weather.local_time": "LOCAL TIME",
    "weather.condition": "Weather Condition",
    "weather.humidity": "Humidity",
    "weather.wind": "Wind Speed",
    "weather.uv": "UV Index",
    "weather.detected_loc": "Detected Location",
    "weather.search_placeholder": "Change city (e.g. New York, London, Tokyo)...",
    "weather.search_btn": "Search",
    "weather.use_gps": "Use Precision GPS",
    "weather.reset": "Reset",

    // Footer
    "footer.title": "Personal Workspace & Tool Hub",
    "footer.desc": "Designed minimal, fast, 100% client-side safe & encrypted.",
    "footer.terms": "Terms & Disclaimer",
    "footer.changelog": "Changelog",
    "footer.crafted": "Crafted for high productivity",
  },

  zh: {
    // Navigation
    "nav.home": "首页",
    "nav.tools": "工具中心",
    "nav.prompts": "AI 提示词",
    "nav.web": "网页作品",
    "nav.member_vault": "会员金库",
    "nav.search": "搜索",
    "nav.search_placeholder": "快捷搜索 (Ctrl+K)...",

    // Notice Banner
    "banner.early_access": "Clyra 平台 (抢先体验)",
    "banner.subtitle": "100% 浏览器端生产力与开发者实用工具套件",
    "banner.changelog_btn": "更新日志 v2.5.0",

    // Hero Section
    "hero.badge_pro": "专业功能已解锁",
    "hero.badge_free": "100% 免费无限制",
    "hero.title_main": "所有高级功能，",
    "hero.title_highlight": "现已完全免费",
    "hero.title_end": "且无限制。",
    "hero.description":
      "无付费墙、无每日文件大小限制、无水印、无需注册。所有工具均在您的浏览器端即时、私密运行。",
    "hero.input_placeholder": "搜索工具 (例如 压缩、二维码、TypeScript、提示词)...",
    "hero.btn_tools": "浏览所有工具",
    "hero.btn_prompts": "AI 提示词库",
    "hero.feat_unlimited": "100% 解锁专业版",
    "hero.feat_privacy": "零服务器追踪",
    "hero.feat_ready": "极速且响应灵敏",

    // Section Titles
    "sec.diff_badge": "为什么选择 CLYRA？",
    "sec.diff_title": "摆脱一切付费限制",
    "sec.other_tools_title": "互联网上的其他工具",
    "sec.clyra_title": "CLYRA 平台",
    "sec.trending_badge": "常用工具",
    "sec.trending_title": "专业级生产力工具",
    "sec.trending_desc": "根据您的日常使用频率自动排序。",
    "sec.see_all_tools": "查看完整目录",
    "sec.prompts_badge": "提示词精选",
    "sec.prompts_title": "精选 AI 提示词与作品",
    "sec.prompts_desc": "保存并使用高品质生成式 AI 提示词，附带高清预览图。",
    "sec.see_all_prompts": "进入完整画廊",
    "sec.web_badge": "网页作品集",
    "sec.web_title": "打造的网站与应用",
    "sec.web_desc": "已构建的高性能现代化网页作品精选。",
    "sec.see_all_web": "查看所有项目",

    // Tools Page
    "tools.page_badge": "客户端工具套件",
    "tools.page_title": "完整工具与实用程序目录",
    "tools.page_desc": "所有数据和文件处理完全在您的浏览器本地执行，绝不上传到任何远程服务器。",
    "tools.search_placeholder": "搜索工具名称、标签或功能...",
    "tools.filter_all": "所有类别",
    "tools.sort_usage": "最常使用",
    "tools.sort_popular": "热门推荐",
    "tools.sort_alpha": "字母 A - Z",
    "tools.pinned_title": "已置顶工具",
    "tools.recent_title": "最近使用",
    "tools.all_tools_title": "全部工具",
    "tools.total_count": "共 {count} 款可用工具",
    "tools.no_results": "没有找到匹配的工具。",
    "tools.reset_filter": "重置筛选",
    "tools.open_tool": "打开工具",
    "tools.pin": "置顶",
    "tools.unpin": "取消置顶",

    // Prompts Page
    "prompts.page_badge": "创意 AI 提示词库",
    "prompts.page_title": "AI 提示词画廊与视觉宝库",
    "prompts.page_desc": "精选摄影级与电影感提示词，附带画面比例、模型指南与高清视觉预览。",
    "prompts.search_placeholder": "按主题、摄影风格或 AI 模型搜索提示词...",
    "prompts.filter_all": "全部模型",
    "prompts.copy_prompt": "复制提示词",
    "prompts.copied": "已复制！",
    "prompts.aspect_ratio": "画面比例",
    "prompts.model_label": "AI 模型",
    "prompts.negative_prompt": "负向提示词",
    "prompts.click_detail": "点击查看完整详情",
    "prompts.modal_title": "提示词完整详情",

    // Web Projects Page
    "web.page_badge": "数字作品集",
    "web.page_title": "网站与 Web 应用精选",
    "web.page_desc": "探索现代前端架构、交互式系统与高性能 Web 应用程序。",
    "web.visit_btn": "访问网站",
    "web.source_btn": "源代码",
    "web.tech_stack": "技术栈",

    // Terms & Disclaimer Page
    "terms.page_badge": "隐私与法律条款",
    "terms.page_title": "服务条款与法律免责声明",
    "terms.page_desc": "Clyra 坚持以严格的本地隐私保护和安全执行为核心理念。",
    "terms.back_home": "返回首页",
    "terms.client_side_rule": "100% 本地浏览器运行",
    "terms.client_side_desc": "所有图片转换、密码加密和文本处理均在您的浏览器中完成。绝不会向远程服务器收集或传输任何个人数据。",
    "terms.accept_btn": "我已阅读并同意",

    // Member Vault & Auth
    "member.vault_badge": "VIP 会员金库",
    "member.activate_title": "买家账户激活",
    "member.activate_desc": "输入您下单时的邮箱以解锁专属数字内容与脚本工作空间。",
    "member.email_label": "下单登记邮箱",
    "member.password_label": "创建新账户密码",
    "member.confirm_password_label": "确认密码",
    "member.activate_btn": "创建账户并进入工作空间",
    "member.login_title": "Clyra 会员登录",
    "member.login_desc": "登录您的多设备云端工作空间，访问您购买的全部数字产品。",
    "member.login_btn": "登录工作空间",
    "member.workspace_title": "会员专属工作空间",
    "member.workspace_desc": "畅读数字材料、复制脚本代码并同步个人云端笔记的统一中心。",
    "member.my_products": "我的数字产品",
    "member.notes_title": "个人云端笔记",
    "member.logout": "退出登录",

    // Command Palette
    "palette.placeholder": "输入工具名称、提示词或导航路径...",
    "palette.group_nav": "菜单导航",
    "palette.group_tools": "实用工具",
    "palette.group_prompts": "AI 提示词",
    "palette.group_web": "网页作品",
    "palette.no_results": "未找到匹配结果。",

    // Weather & Telemetry Widget
    "weather.title": "天气与时间状态",
    "weather.local_time": "本地时间",
    "weather.condition": "天气状况",
    "weather.humidity": "湿度",
    "weather.wind": "风速",
    "weather.uv": "紫外线指数",
    "weather.detected_loc": "检测到的位置",
    "weather.search_placeholder": "更改城市 (例如 北京, 上海, 广州)...",
    "weather.search_btn": "搜索",
    "weather.use_gps": "使用精确 GPS",
    "weather.reset": "重置",

    // Footer
    "footer.title": "个人工作区与工具中心",
    "footer.desc": "极简设计，高效轻量，100% 浏览器本地安全与加密。",
    "footer.terms": "使用条款与免责声明",
    "footer.changelog": "更新日志",
    "footer.crafted": "专为高效生产力精心打造",
  },

  ar: {
    // Navigation
    "nav.home": "الرئيسية",
    "nav.tools": "مركز الأدوات",
    "nav.prompts": "أوامر الذكاء الاصطناعي",
    "nav.web": "أعمال الويب",
    "nav.member_vault": "خزينة الأعضاء",
    "nav.search": "بحث",
    "nav.search_placeholder": "بحث سريع (Ctrl+K)...",

    // Notice Banner
    "banner.early_access": "منصة Clyra (وصول مبكر)",
    "banner.subtitle": "مجموعة أدوات الإنتاجية والمطورين 100% تعمل محلياً",
    "banner.changelog_btn": "سجل التحديثات v2.5.0",

    // Hero Section
    "hero.badge_pro": "ميزات احترافية مفتوحة",
    "hero.badge_free": "مجاني 100% بلا حدود",
    "hero.title_main": "جميع الميزات المميزة،",
    "hero.title_highlight": "أصبحت مجانية",
    "hero.title_end": "وبلا أي قيود.",
    "hero.description":
      "لا توجد جدران دفع، ولا قيود على حجم الملفات، ولا علامات مائية، وبدون تسجيل. تعمل جميع الأدوات محلياً وخصوصية تامة داخل متصفحك.",
    "hero.input_placeholder": "ابحث عن أداة (مثل ضغط الصور، QR، TypeScript، الأوامر)...",
    "hero.btn_tools": "استكشف جميع الأدوات",
    "hero.btn_prompts": "معرض أوامر الذكاء الاصطناعي",
    "hero.feat_unlimited": "ميزات احترافية 100%",
    "hero.feat_privacy": "بدون تتبع على السيرفر",
    "hero.feat_ready": "أداء سريع وفائق الاستجابة",

    // Section Titles
    "sec.diff_badge": "لماذا تختار CLYRA؟",
    "sec.diff_title": "خالٍ تماماً من قيود الدفع",
    "sec.other_tools_title": "أدوات الويب الأخرى",
    "sec.clyra_title": "منصة CLYRA",
    "sec.trending_badge": "الأكثر استخداماً",
    "sec.trending_title": "أدوات الإنتاجية الاحترافية",
    "sec.trending_desc": "ترتيب تلقائي بناءً على وتيرة استخدامك اليومية.",
    "sec.see_all_tools": "عرض الكتالوج الكامل",
    "sec.prompts_badge": "معرض الأوامر",
    "sec.prompts_title": "أوامr الذكاء الاصطناعي والصور",
    "sec.prompts_desc": "احفظ واستخدم أوامر ذكاء اصطناعي عالية الجودة مع معاينات الصور.",
    "sec.see_all_prompts": "فتح المعرض بالكامل",
    "sec.web_badge": "أعمال الويب",
    "sec.web_title": "مواقع وتطبيقات تم بناؤها",
    "sec.web_desc": "مجموعة من مشاريع وتطبيقات الويب الحديثة.",
    "sec.see_all_web": "عرض جميع المشاريع",

    // Tools Page
    "tools.page_badge": "حزمة الأدوات المحلية",
    "tools.page_title": "كتالوج الأدوات والتطبيقات المصغرة",
    "tools.page_desc": "تتم جميع معالجة البيانات والملفات محلياً في متصفحك دون رفعها إلى أي سيرفر.",
    "tools.search_placeholder": "ابحث عن اسم الأداة أو الوظيفة...",
    "tools.filter_all": "جميع الفئات",
    "tools.sort_usage": "الأكثر استخداماً",
    "tools.sort_popular": "شائع",
    "tools.sort_alpha": "الاسم أ - ي",
    "tools.pinned_title": "الأدوات المثبتة",
    "tools.recent_title": "المستخدمة مؤخراً",
    "tools.all_tools_title": "جميع الأدوات",
    "tools.total_count": "إجمالي {count} أداة متاحة",
    "tools.no_results": "لم يتم العثور على أي أدوات مطابقة.",
    "tools.reset_filter": "إعادة ضبط التصفية",
    "tools.open_tool": "فتح الأداة",
    "tools.pin": "تثبيت",
    "tools.unpin": "إلغاء التثبيت",

    // Prompts Page
    "prompts.page_badge": "خزينة أوامر الذكاء الاصطناعي",
    "prompts.page_title": "معرض الأوامر والإبداع البصري",
    "prompts.page_desc": "أوامر واقعية وسينمائية مجربة مع أبعاد الصور ودليل النماذج.",
    "prompts.search_placeholder": "ابحث عن الأوامر حسب الموضوع أو النمط البصري...",
    "prompts.filter_all": "جميع النماذج",
    "prompts.copy_prompt": "نسخ الأمر",
    "prompts.copied": "تم النسخ!",
    "prompts.aspect_ratio": "نسبة الأبعاد",
    "prompts.model_label": "نموذج الذكاء الاصطناعي",
    "prompts.negative_prompt": "الأمر السلبي",
    "prompts.click_detail": "انقر للتفاصيل الكاملة",
    "prompts.modal_title": "تفاصيل الأمر الكاملة",

    // Web Projects Page
    "web.page_badge": "معرض الأعمال الرقمية",
    "web.page_title": "مشاريع وتطبيقات الويب",
    "web.page_desc": "استكشف أحدث واجهات الويب والأنظمة التفاعلية عالية الأداء.",
    "web.visit_btn": "زيارة الموقع",
    "web.source_btn": "كود المصدر",
    "web.tech_stack": "التقنيات",

    // Terms & Disclaimer Page
    "terms.page_badge": "السياسات والخصوصية",
    "terms.page_title": "الشروط والأحكام وإخلاء المسؤولية",
    "terms.page_desc": "صُممت Clyra مع أقصى درجات الخصوصية والتنفيذ الآمن محلياً.",
    "terms.back_home": "العودة للرئيسية",
    "terms.client_side_rule": "تشغيل محلي 100% في المتصفح",
    "terms.client_side_desc": "تتم جميع عمليات تحويل الصور وتشفير كلمات المرور في متصفحك بالكامل دون جمع أي بيانات شخصية.",
    "terms.accept_btn": "أفهم وأوافق",

    // Member Vault & Auth
    "member.vault_badge": "خزينة الأعضاء المميزين",
    "member.activate_title": "تفعيل حساب المشتري",
    "member.activate_desc": "أدخل بريدك الإلكتروني لفتح الوصول الحصري للمواد الرقمية ومساحة العمل.",
    "member.email_label": "البريد الإلكتروني للطلب",
    "member.password_label": "إنشاء كلمة مرور جديدة",
    "member.confirm_password_label": "تأكيد كلمة المرور",
    "member.activate_btn": "إنشاء الحساب ودخول مساحة العمل",
    "member.login_title": "تسجيل دخول أعضاء Clyra",
    "member.login_desc": "سجل الدخول إلى مساحة العمل المتزامنة للوصول إلى كافة منتجاتك الرقمية.",
    "member.login_btn": "الدخول إلى مساحة العمل",
    "member.workspace_title": "مساحة عمل الأعضاء الحصرية",
    "member.workspace_desc": "مركز قراءة المواد الرقمية ونسخ الأكواد وحفظ الملاحظات السحابية الشخصية.",
    "member.my_products": "منتجاتي المشتراة",
    "member.notes_title": "الملاحظات السحابية الخاصة",
    "member.logout": "تسجيل الخروج",

    // Command Palette
    "palette.placeholder": "اكتب اسم الأداة أو الأمر أو المسار...",
    "palette.group_nav": "قائمة التنقل",
    "palette.group_tools": "الأدوات والتطبيقات",
    "palette.group_prompts": "أوامر الذكاء الاصطناعي",
    "palette.group_web": "أعمال الويب",
    "palette.no_results": "لم يتم العثور على نتائج.",

    // Weather & Telemetry Widget
    "weather.title": "حالة الطقس والوقت",
    "weather.local_time": "الوقت المحلي",
    "weather.condition": "حالة الطقس",
    "weather.humidity": "الرطوبة",
    "weather.wind": "سرعة الرياح",
    "weather.uv": "مؤشر الأشعة فوق البنفسجية",
    "weather.detected_loc": "الموقع المكتشف",
    "weather.search_placeholder": "تغيير المدينة (مثل القاهرة, الرياض, دبي)...",
    "weather.search_btn": "بحث",
    "weather.use_gps": "استخدام GPS الدقيق",
    "weather.reset": "إعادة ضبط",

    // Footer
    "footer.title": "مساحة العمل الشخصية ومركز الأدوات",
    "footer.desc": "تصميم أنيق وسريع وآمن 100% محلياً ومشفر.",
    "footer.terms": "الشروط وإخلاء المسؤولية",
    "footer.changelog": "سجل التحديثات",
    "footer.crafted": "صُمم لتحقيق أعلى درجات الإنتاجية",
  },
};
