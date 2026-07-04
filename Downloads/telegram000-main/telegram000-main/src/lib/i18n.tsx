import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ru" | "uz" | "en" | "ar" | "es" | "zh";

const dict: Record<Lang, Record<string, string>> = {
  ru: {
    appName: "Мессенджер",
    login: "Вход", signup: "Регистрация", email: "Email", username: "Никнейм",
    password: "Пароль", remember: "Запомнить меня", signIn: "Войти", signUp: "Зарегистрироваться",
    haveAccount: "Уже есть аккаунт?", noAccount: "Нет аккаунта?",
    search: "Поиск...", chats: "Чаты", contacts: "Мои контакты", settings: "Настройки",
    myProfile: "Мой профиль", newGroup: "Создать группу", display: "Дисплей",
    language: "Язык", theme: "Оформление", themeDark: "Тёмный премиум", themeLight: "Белый",
    size: "Размер элементов", small: "Маленький", medium: "Средний", large: "Крупный",
    bio: "О себе", displayName: "Имя", save: "Сохранить", logout: "Выйти",
    typeMessage: "Сообщение...", send: "Отправить", noChat: "Выберите чат, чтобы начать общение",
    file: "Файл", voice: "Голосовое", sticker: "Стикер", attach: "Прикрепить",
    record: "Записать голосовое", stopRecord: "Остановить", users: "Пользователи",
    groups: "Группы", bots: "Боты", noResults: "Ничего не найдено",
    groupName: "Название группы", create: "Создать", cancel: "Отмена",
    addMembers: "Добавить участников", changePhoto: "Изменить фото",
    bot: "Бот", you: "Вы",
  },
  en: {
    appName: "Messenger",
    login: "Sign in", signup: "Sign up", email: "Email", username: "Username",
    password: "Password", remember: "Remember me", signIn: "Sign in", signUp: "Sign up",
    haveAccount: "Have an account?", noAccount: "No account?",
    search: "Search...", chats: "Chats", contacts: "My contacts", settings: "Settings",
    myProfile: "My profile", newGroup: "New group", display: "Display",
    language: "Language", theme: "Theme", themeDark: "Dark premium", themeLight: "Light",
    size: "Element size", small: "Small", medium: "Medium", large: "Large",
    bio: "About", displayName: "Name", save: "Save", logout: "Log out",
    typeMessage: "Message...", send: "Send", noChat: "Select a chat to start messaging",
    file: "File", voice: "Voice", sticker: "Sticker", attach: "Attach",
    record: "Record voice", stopRecord: "Stop", users: "Users",
    groups: "Groups", bots: "Bots", noResults: "Nothing found",
    groupName: "Group name", create: "Create", cancel: "Cancel",
    addMembers: "Add members", changePhoto: "Change photo",
    bot: "Bot", you: "You",
  },
  uz: {
    appName: "Messenjer",
    login: "Kirish", signup: "Roʻyxatdan oʻtish", email: "Email", username: "Foydalanuvchi nomi",
    password: "Parol", remember: "Eslab qolish", signIn: "Kirish", signUp: "Roʻyxatdan oʻtish",
    haveAccount: "Hisob bormi?", noAccount: "Hisob yoʻqmi?",
    search: "Qidirish...", chats: "Suhbatlar", contacts: "Kontaktlarim", settings: "Sozlamalar",
    myProfile: "Mening profilim", newGroup: "Guruh yaratish", display: "Ekran",
    language: "Til", theme: "Mavzu", themeDark: "Tungi premium", themeLight: "Oq",
    size: "Hajm", small: "Kichik", medium: "Oʻrta", large: "Katta",
    bio: "Men haqimda", displayName: "Ism", save: "Saqlash", logout: "Chiqish",
    typeMessage: "Xabar...", send: "Yuborish", noChat: "Suhbatni tanlang",
    file: "Fayl", voice: "Ovoz", sticker: "Stiker", attach: "Biriktirish",
    record: "Yozib olish", stopRecord: "Toxtatish", users: "Foydalanuvchilar",
    groups: "Guruhlar", bots: "Botlar", noResults: "Topilmadi",
    groupName: "Guruh nomi", create: "Yaratish", cancel: "Bekor",
    addMembers: "Aʼzo qoʻshish", changePhoto: "Rasm",
    bot: "Bot", you: "Siz",
  },
  ar: {
    appName: "ماسنجر",
    login: "تسجيل الدخول", signup: "تسجيل", email: "البريد", username: "اسم المستخدم",
    password: "كلمة المرور", remember: "تذكرني", signIn: "دخول", signUp: "تسجيل",
    haveAccount: "لديك حساب؟", noAccount: "لا حساب؟",
    search: "بحث...", chats: "الدردشات", contacts: "جهات الاتصال", settings: "الإعدادات",
    myProfile: "ملفي", newGroup: "مجموعة جديدة", display: "العرض",
    language: "اللغة", theme: "السمة", themeDark: "داكن", themeLight: "فاتح",
    size: "الحجم", small: "صغير", medium: "متوسط", large: "كبير",
    bio: "نبذة", displayName: "الاسم", save: "حفظ", logout: "خروج",
    typeMessage: "رسالة...", send: "إرسال", noChat: "اختر دردشة",
    file: "ملف", voice: "صوت", sticker: "ملصق", attach: "إرفاق",
    record: "تسجيل", stopRecord: "إيقاف", users: "مستخدمون",
    groups: "مجموعات", bots: "بوتات", noResults: "لا شيء",
    groupName: "اسم المجموعة", create: "إنشاء", cancel: "إلغاء",
    addMembers: "إضافة", changePhoto: "تغيير",
    bot: "بوت", you: "أنت",
  },
  es: {
    appName: "Mensajero",
    login: "Entrar", signup: "Registro", email: "Correo", username: "Usuario",
    password: "Contraseña", remember: "Recordarme", signIn: "Entrar", signUp: "Registrarse",
    haveAccount: "¿Ya tienes cuenta?", noAccount: "¿Sin cuenta?",
    search: "Buscar...", chats: "Chats", contacts: "Mis contactos", settings: "Ajustes",
    myProfile: "Mi perfil", newGroup: "Nuevo grupo", display: "Pantalla",
    language: "Idioma", theme: "Tema", themeDark: "Oscuro premium", themeLight: "Claro",
    size: "Tamaño", small: "Pequeño", medium: "Medio", large: "Grande",
    bio: "Sobre mí", displayName: "Nombre", save: "Guardar", logout: "Salir",
    typeMessage: "Mensaje...", send: "Enviar", noChat: "Selecciona un chat",
    file: "Archivo", voice: "Voz", sticker: "Sticker", attach: "Adjuntar",
    record: "Grabar", stopRecord: "Parar", users: "Usuarios",
    groups: "Grupos", bots: "Bots", noResults: "Sin resultados",
    groupName: "Nombre del grupo", create: "Crear", cancel: "Cancelar",
    addMembers: "Añadir", changePhoto: "Cambiar foto",
    bot: "Bot", you: "Tú",
  },
  zh: {
    appName: "信使",
    login: "登录", signup: "注册", email: "邮箱", username: "用户名",
    password: "密码", remember: "记住我", signIn: "登录", signUp: "注册",
    haveAccount: "已有账号?", noAccount: "没有账号?",
    search: "搜索...", chats: "聊天", contacts: "联系人", settings: "设置",
    myProfile: "我的资料", newGroup: "新群组", display: "显示",
    language: "语言", theme: "主题", themeDark: "暗夜高级", themeLight: "明亮",
    size: "大小", small: "小", medium: "中", large: "大",
    bio: "简介", displayName: "名称", save: "保存", logout: "退出",
    typeMessage: "消息...", send: "发送", noChat: "选择聊天",
    file: "文件", voice: "语音", sticker: "贴纸", attach: "附件",
    record: "录音", stopRecord: "停止", users: "用户",
    groups: "群组", bots: "机器人", noResults: "无结果",
    groupName: "群名称", create: "创建", cancel: "取消",
    addMembers: "添加成员", changePhoto: "更换照片",
    bot: "机器人", you: "你",
  },
};

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string }>({
  lang: "ru", setLang: () => {}, t: (k) => k,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");
  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved && dict[saved]) setLangState(saved);
  }, []);
  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem("lang", l); };
  const t = (k: string) => dict[lang][k] ?? dict.en[k] ?? k;
  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}
export const useI18n = () => useContext(LangCtx);
export const LANGS: { code: Lang; label: string }[] = [
  { code: "ru", label: "Русский" }, { code: "uz", label: "Oʻzbek" },
  { code: "en", label: "English" }, { code: "ar", label: "العربية" },
  { code: "es", label: "Español" }, { code: "zh", label: "中文" },
];
