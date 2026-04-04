/**
 * واجهة المساعد الذكي — نصوص عربي / إنجليزي وتعليمات النظام
 */
import { MONA_DEVELOPER_NAME, MONA_SITE_ABOUT_SUMMARY } from "@/lib/site-context";

export type AssistantUILang = "ar" | "en";

export const ASSISTANT_LANG_STORAGE_KEY = "monalab-assistant-ui-lang";

export function readStoredAssistantLang(): AssistantUILang {
  try {
    const v = localStorage.getItem(ASSISTANT_LANG_STORAGE_KEY);
    if (v === "en" || v === "ar") return v;
  } catch {
    /* ignore */
  }
  return "ar";
}

export function persistAssistantLang(lang: AssistantUILang) {
  try {
    localStorage.setItem(ASSISTANT_LANG_STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
}

/** قيمة افتراضية لحوار التصدير تتماشى مع لغة واجهة المساعد */
export function defaultExportLanguageForAssistant(lang: AssistantUILang): "ar" | "en" {
  return lang === "en" ? "en" : "ar";
}

export function buildAssistantSystemInstruction(lang: AssistantUILang): string {
  if (lang === "en") {
    return [
      "You are an intelligent academic assistant for MonaLab. Help users with research writing, outlines, paraphrasing, summarizing, and structured academic reports.",
      "Always respond in **English** using a calm, scholarly tone. For report-style answers, be thorough: clear sections, logical flow, and actionable structure suitable for export to PDF or Word. Use Markdown when it helps (headings ## and ###, lists, tables). Do not use raw HTML tags (e.g. <a name=...>). Do not put Markdown heading markup on the same line as HTML tags.",
      "",
      "### Exceptions: questions about the site or the developer",
      `If asked (in any wording) who built you, who created the platform, the developer's name, who founded MonaLab, or similar: state clearly that the developer and founder is **${MONA_DEVELOPER_NAME}**, and you may briefly describe their role. Do not invent other names.`,
      "If asked about MonaLab, the platform, its idea, vision, mission, or purpose: answer politely and briefly. The reference below may be in Arabic — when you explain in English, convey the same meaning accurately without inventing facts:",
      MONA_SITE_ABOUT_SUMMARY,
      "",
      "### Academic scope",
      "For all other topics, stay within academic and research writing. Politely decline cooking, casual programming, or unrelated topics and note that you are focused on academic and research use.",
    ].join("\n");
  }

  return [
    "أنت مساعد ذكي للباحثين الأكاديميين (مونالاب). مهمتك مساعدة المستخدمين في كتابة الأبحاث، توليد المخططات، إعادة الصياغة، وتلخيص النصوص.",
    "أجب دائماً باللغة العربية وبأسلوب أكاديمي رصين ومنسق باستخدام Markdown عند الحاجة. في الإجابات على شكل تقارير، كن مفصلاً: أقسام واضحة، تسلسل منطقي، وهيكل يناسب التصدير إلى PDF أو Word. لا تستخدم وسوم HTML خام (مثل <a name=...>) ولا تضع عناوين Markdown في نفس سطر وسوم؛ اكتفِ بعناوين ## و### وقوائم Markdown.",
    "",
    "### استثناءات: أسئلة عن الموقع أو المطوّر",
    `إذا سُئلت (بأي صيغة) عن: من طوّرك، من صنعك، من أنشأ المنصة، من هو المطور، ما اسم المطور، من مؤسس مونالاب، من أنت، تعرّف على المطور، أو ما شابه: أجب بوضوح أن المطوّر والمؤسس هو **${MONA_DEVELOPER_NAME}**، ويمكنك وصف دوره باختصار كما في المعلومات أدناه دون اختلاق أسماء أخرى.`,
    "إذا سُئلت عن موقع مونالاب أو المنصة أو ما هي الفكرة أو الرؤية أو المهمة أو الهدف من الموقع: اشرح بصورة عامة ومهذبة ومختصرة، متسقة مع النص التالي (من صفحة «من نحن») دون اختلاق تفاصيل غير موجودة:",
    MONA_SITE_ABOUT_SUMMARY,
    "",
    "### المهام الأكاديمية (القاعدة العامة)",
    "في غير أسئلة الموقع/المطوّر أعلاه، التزم بمهام البحث والكتابة الأكاديمية فقط. رفض الطبخ والبرمجة الترفيهية وغيرها من المواضيع غير الأكاديمية بلطف، واذكر أنك مخصص للأغراض الأكاديمية والبحثية.",
  ].join("\n");
}

export const assistantChatCopy = {
  ar: {
    langToggleAria: "لغة التقارير والردود",
    langArabic: "العربية",
    langEnglish: "English",
    howItWorksLinkEmpty: "آلية العمل: كيف تخرج بتقرير قوي؟",
    welcomeTitle: "مرحباً بك في مساعد مونالاب",
    welcomeSubtitle:
      "أنا هنا لمساعدتك في كتابة أبحاثك، توليد الأفكار، وتنسيق تقاريرك الأكاديمية. كيف يمكنني مساعدتك اليوم؟",
    suggestions: [
      "اكتب لي خطة بحث عن تأثير الذكاء الاصطناعي على التعليم المدمج",
      "لخص لي أهم النظريات في علم النفس المعرفي",
      "أعد صياغة هذه الفقرة بأسلوب أكاديمي رصين...",
    ],
    tipBanner: "نصيحة: افتح آلية العمل للحصول على خطة كتابة تقرير جاهز للتسليم.",
    howItWorksShort: "آلية العمل",
    thinking: "جاري التفكير...",
    copy: "نسخ",
    copied: "تم النسخ",
    print: "طباعة",
    exportDialogTitle: "يمكنك ترك الحقول فارغة وسيتم التصدير بتنسيق احترافي.",
    errorConnection:
      "عذراً، حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.",
    errPdf: "تعذر إنشاء ملف PDF.",
    errWord: "تعذر إنشاء ملف Word.",
    placeholderConversation: "اكتب رسالتك… (Enter للإرسال، Shift+Enter سطر جديد)",
    placeholderWelcome: "اكتب رسالتك هنا… (Enter للإرسال، Shift+Enter سطر جديد)",
    disclaimer1: "قد يرتكب المساعد أخطاء؛ راجع المعلومات المهمة قبل الاعتماد عليها.",
    disclaimer2:
      "المحادثة مؤقتة ولا تُحفظ — مغادرة القسم قد تمسحها. صدّر التقرير أو انسخه قبل الانتقال إن أردت الاحتفاظ به.",
  },
  en: {
    langToggleAria: "Language for replies and reports",
    langArabic: "العربية",
    langEnglish: "English",
    howItWorksLinkEmpty: "How it works: build a stronger report",
    welcomeTitle: "Welcome to MonaLab Assistant",
    welcomeSubtitle:
      "I can help you draft research, generate ideas, and format detailed academic reports. How can I help you today?",
    suggestions: [
      "Draft a research plan on the impact of AI on blended learning",
      "Summarize key theories in cognitive psychology",
      "Rewrite this paragraph in a formal academic style…",
    ],
    tipBanner: "Tip: open “How it works” for a ready-to-submit report workflow.",
    howItWorksShort: "How it works",
    thinking: "Thinking…",
    copy: "Copy",
    copied: "Copied",
    print: "Print",
    exportDialogTitle: "Leave fields empty for a clean, professional export.",
    errorConnection: "Sorry, something went wrong connecting to the server. Please try again.",
    errPdf: "Could not create the PDF file.",
    errWord: "Could not create the Word file.",
    placeholderConversation: "Message… (Enter to send, Shift+Enter for new line)",
    placeholderWelcome: "Type your message… (Enter to send, Shift+Enter for new line)",
    disclaimer1: "The assistant may make mistakes; verify important information before relying on it.",
    disclaimer2:
      "Chats are temporary and not saved — leaving this page may clear them. Export or copy your report if you need to keep it.",
  },
} as const;

export const exportCoverCopy = {
  ar: {
    closeAria: "إغلاق",
    headerTitle: "بيانات الغلاف والتنسيق",
    headerSubtitleFallback: "اختر ما تريد تضمينه داخل الملف النهائي",
    reportTitle: "عنوان التقرير",
    reportTitlePh: "مثال: تأثير الذكاء الاصطناعي على التعليم",
    subtitle: "العنوان الفرعي (اختياري)",
    subtitlePh: "مثال: دراسة تحليلية مختصرة",
    author: "الاسم (اختياري)",
    authorPh: "اسم الطالب/الباحث",
    institution: "الجهة/الجامعة (اختياري)",
    institutionPh: "الجامعة/الكلية",
    course: "المقرر (اختياري)",
    coursePh: "اسم المقرر",
    supervisor: "المشرف (اختياري)",
    supervisorPh: "اسم المشرف",
    date: "التاريخ (اختياري)",
    datePh: "اتركه فارغاً ليكون تلقائياً",
    language: "اللغة",
    langAuto: "تلقائي",
    langAr: "عربي (RTL)",
    langEn: "English (LTR)",
    toc: "تضمين فهرس (TOC)",
    header: "إظهار Header",
    footer: "إظهار Footer (رقم الصفحة)",
    cancel: "إلغاء",
    export: "تصدير",
  },
  en: {
    closeAria: "Close",
    headerTitle: "Cover & layout",
    headerSubtitleFallback: "Choose what to include in the exported file",
    reportTitle: "Report title",
    reportTitlePh: "e.g. The impact of AI on education",
    subtitle: "Subtitle (optional)",
    subtitlePh: "e.g. A concise analytical study",
    author: "Name (optional)",
    authorPh: "Student / author name",
    institution: "Institution (optional)",
    institutionPh: "University / school",
    course: "Course (optional)",
    coursePh: "Course name",
    supervisor: "Supervisor (optional)",
    supervisorPh: "Supervisor name",
    date: "Date (optional)",
    datePh: "Leave blank to use today’s date",
    language: "Document language",
    langAuto: "Auto-detect",
    langAr: "Arabic (RTL)",
    langEn: "English (LTR)",
    toc: "Include table of contents",
    header: "Show header",
    footer: "Show footer (page numbers)",
    cancel: "Cancel",
    export: "Export",
  },
} as const;

export type AssistantChatStrings = (typeof assistantChatCopy)["ar"];
export type ExportCoverStrings = (typeof exportCoverCopy)["ar"];

export const promptInputChromeCopy = {
  ar: {
    attachAria: "إضافة — قريباً",
    attachTooltip: "المرفقات والوسائط ستدعم لاحقاً",
    micStop: "إيقاف التسجيل",
    micStart: "تحدث الآن",
    send: "إرسال",
  },
  en: {
    attachAria: "Add — coming soon",
    attachTooltip: "Attachments and media will be supported later",
    micStop: "Stop recording",
    micStart: "Speak now",
    send: "Send",
  },
} as const;
