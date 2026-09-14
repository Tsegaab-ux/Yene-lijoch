import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform } from "react-native";
import { am, en, Lang } from "../i18n/translations";

const STORAGE_KEY = "yene-lijoch-lang";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (path: string, vars?: Record<string, string | number>) => string;
  isAmharic: boolean;
};

const dictionaries: Record<Lang, typeof en> = { en, am: am as typeof en };

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getByPath(obj: unknown, path: string): string | undefined {
  const parts = path.split(".");
  let cur: any = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = cur[part];
  }
  return typeof cur === "string" ? cur : undefined;
}

function readStoredLang(): Lang {
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "am" || stored === "en") return stored;
  }
  return "en";
}

function writeStoredLang(lang: Lang) {
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, lang);
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState(readStoredLang());
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    writeStoredLang(next);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const next = prev === "en" ? "am" : "en";
      writeStoredLang(next);
      return next;
    });
  }, []);

  const t = useCallback(
    (path: string, vars?: Record<string, string | number>) => {
      const dict = dictionaries[lang];
      let value =
        getByPath(dict, path) ?? getByPath(dictionaries.en, path) ?? path;
      if (vars) {
        Object.entries(vars).forEach(([key, val]) => {
          value = value.replace(new RegExp(`\\{${key}\\}`, "g"), String(val));
        });
      }
      return value;
    },
    [lang]
  );

  const value = useMemo(
    () => ({
      lang,
      setLang,
      toggleLang,
      t,
      isAmharic: lang === "am",
    }),
    [lang, setLang, toggleLang, t]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
