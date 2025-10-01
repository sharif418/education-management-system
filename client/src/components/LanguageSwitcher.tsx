import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useState } from "react";

type Language = "en" | "bn" | "ar";

const languages = {
  en: { label: "English", flag: "🇬🇧" },
  bn: { label: "বাংলা", flag: "🇧🇩" },
  ar: { label: "عربي", flag: "🇸🇦" },
};

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState<Language>("en");

  const handleLanguageChange = (lang: Language) => {
    setCurrentLang(lang);
    // TODO: Implement actual i18n language switching
    console.log("Language changed to:", lang);
    
    // RTL support for Arabic
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" data-testid="button-language">
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languages).map(([code, { label, flag }]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code as Language)}
            className={currentLang === code ? "bg-accent" : ""}
            data-testid={`language-${code}`}
          >
            <span className="mr-2">{flag}</span>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
