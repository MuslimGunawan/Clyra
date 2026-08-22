/**
 * Clyra Native Multi-Language Translation Dictionaries
 * Supports: id (Indonesian), en (English), zh (Chinese Simplified), ar (Arabic RTL)
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
    "nav.search": "Cari",
    "nav.search_placeholder": "Cari cepat (Ctrl+K)...",

    // Notice Banner
    "banner.early_access": "EARLY ACCESS",
    "banner.subtitle": "Clyra Workspace — utilitas cepat, modern & serbaguna.",

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
    "hero.feat_ready": "Unlimited & Vercel Ready",

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

    // Footer
    "footer.title": "Personal Workspace & Tool Hub",
    "footer.desc": "Dirancang minimalis, efisien, 100% Client-side safe & terenkripsi.",
    "footer.terms": "Syarat & Disclaimer",
    "footer.crafted": "Crafted for high productivity",
  },

  en: {
    // Navigation
    "nav.home": "Home",
    "nav.tools": "Tools Hub",
    "nav.prompts": "AI Prompts",
    "nav.web": "Web Works",
    "nav.search": "Search",
    "nav.search_placeholder": "Quick search (Ctrl+K)...",

    // Notice Banner
    "banner.early_access": "EARLY ACCESS",
    "banner.subtitle": "Clyra Workspace — fast, modern & versatile productivity hub.",

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
    "hero.feat_ready": "Unlimited & Production Ready",

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

    // Footer
    "footer.title": "Personal Workspace & Tool Hub",
    "footer.desc": "Designed minimal, fast, 100% client-side safe & encrypted.",
    "footer.terms": "Terms & Disclaimer",
    "footer.crafted": "Crafted for high productivity",
  },

  zh: {
    // Navigation
    "nav.home": "首页",
    "nav.tools": "工具中心",
    "nav.prompts": "AI 提示词",
    "nav.web": "网页作品",
    "nav.search": "搜索",
    "nav.search_placeholder": "快捷搜索 (Ctrl+K)...",

    // Notice Banner
    "banner.early_access": "抢先体验",
    "banner.subtitle": "Clyra 工作空间 — 快速、现代、全能的生产力中心。",

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
    "hero.feat_ready": "无限使用 & 部署就绪",

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

    // Footer
    "footer.title": "个人工作区与工具中心",
    "footer.desc": "极简设计，高效轻量，100% 浏览器本地安全与加密。",
    "footer.terms": "使用条款与免责声明",
    "footer.crafted": "专为高效生产力精心打造",
  },

  ar: {
    // Navigation
    "nav.home": "الرئيسية",
    "nav.tools": "مركز الأدوات",
    "nav.prompts": "أوامر الذكاء الاصطناعي",
    "nav.web": "أعمال الويب",
    "nav.search": "بحث",
    "nav.search_placeholder": "بحث سريع (Ctrl+K)...",

    // Notice Banner
    "banner.early_access": "وصول مبكر",
    "banner.subtitle": "مساحة عمل كليرا — أدوات إنتاجية سريعة وحديثة ومتكاملة.",

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
    "hero.feat_ready": "غير محدود وجاهز للنشر",

    // Section Titles
    "sec.diff_badge": "لماذا تختار كليرا؟",
    "sec.diff_title": "خالٍ تماماً من قيود الدفع",
    "sec.other_tools_title": "أدوات الويب الأخرى",
    "sec.clyra_title": "منصة كليرا",
    "sec.trending_badge": "الأكثر استخداماً",
    "sec.trending_title": "أدوات الإنتاجية الاحترافية",
    "sec.trending_desc": "ترتيب تلقائي بناءً على وتيرة استخدامك اليومية.",
    "sec.see_all_tools": "عرض الكتالوج الكامل",
    "sec.prompts_badge": "معرض الأوامر",
    "sec.prompts_title": "أوامر الذكاء الاصطناعي والصور",
    "sec.prompts_desc": "احفظ واستخدم أوامر ذكاء اصطناعي عالية الجودة مع معاينات الصور.",
    "sec.see_all_prompts": "فتح المعرض بالكامل",
    "sec.web_badge": "أعمال الويب",
    "sec.web_title": "مواقع وتطبيقات تم بناؤها",
    "sec.web_desc": "مجموعة من مشاريع وتطبيقات الويب الحديثة.",
    "sec.see_all_web": "عرض جميع المشاريع",

    // Footer
    "footer.title": "مساحة العمل الشخصية ومركز الأدوات",
    "footer.desc": "تصميم أنيق وسريع وآمن 100% محلياً ومشفر.",
    "footer.terms": "الشروط وإخلاء المسؤولية",
    "footer.crafted": "صُمم لتحقيق أعلى درجات الإنتاجية",
  },
};
