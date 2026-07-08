import { useUiStore } from "@/store/useUiStore";
import { TRANSLATIONS } from "@/utils/i18n";

export function useTranslation() {
  const language = useUiStore((s) => s.language);
  const setLanguage = useUiStore((s) => s.setLanguage);

  const t = (key: keyof typeof TRANSLATIONS["en"]): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS["en"];
    return (dict as any)[key] || (TRANSLATIONS["en"] as any)[key] || String(key);
  };

  return { t, language, setLanguage };
}
