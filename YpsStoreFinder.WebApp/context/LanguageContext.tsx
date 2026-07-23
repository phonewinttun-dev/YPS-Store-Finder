'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'my' | 'en';

interface TranslationData {
  [key: string]: any;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  tCategory: (categoryName: string) => string;
  tAddress: (address: string | null | undefined) => string;
}

const addressRules: [RegExp, string][] = [
  // Numbers & Prefixes
  [/\bNo\.\s*/gi, 'အမှတ် '],
  [/\bNo\b/gi, 'အမှတ်'],

  // Floors / Levels
  [/\bGround Floor\b/gi, 'မြေညီထပ်'],
  [/\b1st Floor\b/gi, 'ပထမထပ်'],
  [/\b2nd Floor\b/gi, 'ဒုတိယထပ်'],
  [/\b3rd Floor\b/gi, 'တတိယထပ်'],
  [/\bFloor\b/gi, 'ထပ်'],

  // Wards & Directions
  [/\bNorth Ward\b/gi, 'မြောက်ရပ်ကွက်'],
  [/\bSouth Ward\b/gi, 'တောင်ရပ်ကွက်'],
  [/\bEast Ward\b/gi, 'အရှေ့ရပ်ကွက်'],
  [/\bWest Ward\b/gi, 'အနောက်ရပ်ကွက်'],
  [/\bNorth\b/gi, 'မြောက်'],
  [/\bSouth\b/gi, 'တောင်'],
  [/\bEast\b/gi, 'အရှေ့'],
  [/\bWest\b/gi, 'အနောက်'],
  [/\bWard\b/gi, 'ရပ်ကွက်'],

  // Roads / Streets
  [/\bStreet\b/gi, 'လမ်း'],
  [/\bRoad\b/gi, 'လမ်း'],
  [/\bRd\.?\b/gi, 'လမ်း'],
  [/\bSt\.?\b/gi, 'လမ်း'],
  [/\bCorner of\b/gi, 'ထောင့်'],
  [/\bCorner\b/gi, 'ထောင့်'],
  [/\bJunction\b/gi, 'လမ်းဆုံ'],
  [/\bBridge\b/gi, 'တံတား'],
  [/\bNear\b/gi, 'အနီး'],
  [/\bBeside\b/gi, 'ဘေး'],
  [/\bOpposite\b/gi, 'မျက်နှာချင်းဆိုင်'],

  // Administrative / Landmarks
  [/\bTownship\b/gi, 'မြို့နယ်'],
  [/\bYangon\b/gi, 'ရန်ကုန်'],
  [/\bMarket\b/gi, 'ဈေး'],
  [/\bShopping Mall\b/gi, 'စျေးဝယ်စင်တာ'],
  [/\bMall\b/gi, 'စင်တာ'],
  [/\bCity\b/gi, 'မြို့'],

  // Townships
  [/\bSan Chaung\b/gi, 'စမ်းချောင်း'],
  [/\bSanchaung\b/gi, 'စမ်းချောင်း'],
  [/\bKyun Taw\b/gi, 'ကျွန်းတော'],
  [/\bKyun-Taw\b/gi, 'ကျွန်းတော'],
  [/\bKyauktada\b/gi, 'ကျောက်တံတား'],
  [/\bPabedan\b/gi, 'ပန်းဘဲတန်း'],
  [/\bLatha\b/gi, 'လသာ'],
  [/\bLanmadaw\b/gi, 'လမ်းမတော်'],
  [/\bAhlone\b/gi, 'အလုံ'],
  [/\bKamayut\b/gi, 'ကမာရွတ်'],
  [/\bBahan\b/gi, 'ဗဟန်း'],
  [/\bDagon\b/gi, 'ဒဂုံ'],
  [/\bYankin\b/gi, 'ရန်ကင်း'],
  [/\bMayangone\b/gi, 'မရမ်းကုန်း'],
  [/\bMayangon\b/gi, 'မရမ်းကုန်း'],
  [/\bInsein\b/gi, 'အင်းစိန်'],
  [/\bMingaladon\b/gi, 'မင်္ဂလာဒုံ'],
  [/\bMingalar Taung Nyunt\b/gi, 'မင်္ဂလာတောင်ညွန့်'],
  [/\bTamwe\b/gi, 'တာမွေ'],
  [/\bThingangyun\b/gi, 'သင်္ဃန်းကျွန်း'],
  [/\bSouth Okkalapa\b/gi, 'တောင်ဥက္ကလာပ'],
  [/\bNorth Okkalapa\b/gi, 'မြောက်ဥက္ကလာပ'],
  [/\bThaketa\b/gi, 'သာကေတ'],
  [/\bDawbon\b/gi, 'ဒေါပုံ'],
  [/\bPazundaung\b/gi, 'ပုဇွန်တောင်'],
  [/\bBotahtaung\b/gi, 'ဗိုလ်တထောင်'],
  [/\bHlaing\b/gi, 'လှိုင်'],
  [/\bHlaingthaya\b/gi, 'လှိုင်သာယာ'],
  [/\bShwepyitha\b/gi, 'ရွှေပြည်သာ'],
  [/\bSeikkan\b/gi, 'ဆိပ်ကမ်း'],
  [/\bKyeemyindaing\b/gi, 'ကြည့်မြင်တိုင်'],
  [/\bKyimyindaing\b/gi, 'ကြည့်မြင်တိုင်'],

  // Roads
  [/\bPyay\b/gi, 'ပြည်'],
  [/\bKaba Aye\b/gi, 'ကမ္ဘာအေး'],
  [/\bKabaaye\b/gi, 'ကမ္ဘာအေး'],
  [/\bAnawrahta\b/gi, 'အနော်ရထာ'],
  [/\bMaha Bandula\b/gi, 'မဟာဗန္ဓုလ'],
  [/\bMahabandula\b/gi, 'မဟာဗန္ဓုလ'],
  [/\bSule Pagoda\b/gi, 'ဆူလေဘုရား'],
  [/\bSule\b/gi, 'ဆူလေ'],
  [/\bInya\b/gi, 'အင်းလျား'],
  [/\bBogyoke\b/gi, 'ဗိုလ်ချုပ်'],
  [/\bBogyoke Aung San\b/gi, 'ဗိုလ်ချုပ်အောင်ဆန်း'],
  [/\bMerchant\b/gi, 'ကုန်သည်'],
  [/\bStrand\b/gi, 'ကမ်းနား'],
  [/\bUniversity Avenue\b/gi, 'တက္ကသိုလ်ရိပ်သာလမ်း']
];

const digitMap: Record<string, string> = {
  '0': '၀', '1': '၁', '2': '၂', '3': '၃', '4': '၄',
  '5': '၅', '6': '၆', '7': '၇', '8': '၈', '9': '၉'
};

const defaultTranslations: Record<Language, TranslationData> = {
  my: {
    appTitle: "YPS စတိုးဆိုင်များ ရှာဖွေရန်",
    appSubtitle: "ရန်ကုန် သွားလာရေးနှင့် ဝန်ဆောင်မှုနေရာများ",
    searchPlaceholder: "စတိုးဆိုင်၊ ဆိုင်ခွဲ သို့မဟုတ် လိပ်စာ ရှာဖွေပါ...",
    locateMe: "လက်ရှိနေရာ ရှာရန်",
    gpsActive: "GPS ဖွင့်ထားသည်",
    stopGps: "GPS ပိတ်ရန်",
    deviceLocation: "စက်ပစ္စည်း တည်နေရာ",
    deviceLocationActive: "တိုက်ရိုက် တည်နေရာ မျှဝေနေသည်",
    deviceLocationInactive: "အနီးဆုံးဆိုင်များ ရှာရန် GPS ဖွင့်ပါ",
    searchRadiusFilter: "ရှာဖွေရန် အကွာအဝေး အကန့်အသတ်",
    km: "ကီလိုမီတာ",
    kmAway: "ကီလိုမီတာ အကွာအဝေး",
    allCategories: "အမျိုးအစား အားလုံး",
    noStoresFound: "စတိုးဆိုင် မတွေ့ရှိပါ",
    noStoresSub: "ရှာဖွေမှု သို့မဟုတ် အကွာအဝေးကို ပြန်လည်ပြင်ဆင်ကြည့်ပါ",
    directions: "လမ်းကြောင်းရှာရန်",
    updatingStores: "စတိုးဆိုင်များ ယူနေသည်...",
    storesCount: "ဆိုင် အရေအတွက်",
    store: "ဆိုင်",
    stores: "ဆိုင်များ",
    retryConnection: "ပြန်လည် ကြိုးစားရန်",
    apiErrorTitle: "YPS Store Finder API သို့ ချိတ်ဆက်၍ မရပါ",
    language: "ဘာသာစကား",
    myanmar: "မြန်မာ",
    english: "English",
    lat: "မြောက်လတ္တီတွဒ်",
    lng: "အရှေ့လောင်ဂျီတွဒ်",
    categories: {
      "YPS Service Kios": "YPS ဝန်ဆောင်မှု ကောင်တာများ",
      "YPS Agents": "YPS ကိုယ်စားလှယ်များ",
      "Mingalar Cinemas": "မင်္ဂလာ ရုပ်ရှင်ရုံများ",
      "Capital HyperMarkets": "Capital ဟိုက်ပါမားကတ်များ",
      "G&G stores": "G&G စတိုးဆိုင်များ",
      "YPS Bus Terminal": "YPS ဘတ်စ်ကား ဂိတ်များ"
    }
  },
  en: {
    appTitle: "YPS Store Finder",
    appSubtitle: "Yangon Transit & Service Locator",
    searchPlaceholder: "Search stores, kiosks, or addresses...",
    locateMe: "Locate Me",
    gpsActive: "GPS Active",
    stopGps: "Stop GPS",
    deviceLocation: "Device Location",
    deviceLocationActive: "Tracking live coordinates",
    deviceLocationInactive: "Turn on GPS to find nearest stores",
    searchRadiusFilter: "Search Radius Filter",
    km: "km",
    kmAway: "km away",
    allCategories: "All Categories",
    noStoresFound: "No stores found",
    noStoresSub: "Try adjusting your search query or radius filter.",
    directions: "Directions",
    updatingStores: "Updating Stores...",
    storesCount: "Stores",
    store: "Store",
    stores: "Stores",
    retryConnection: "Retry Connection",
    apiErrorTitle: "Unable to connect to YPS Store Finder API",
    language: "Language",
    myanmar: "မြန်မာ",
    english: "English",
    lat: "Lat",
    lng: "Lng",
    categories: {
      "YPS Service Kios": "YPS Service Kiosks",
      "YPS Agents": "YPS Agents",
      "Mingalar Cinemas": "Mingalar Cinemas",
      "Capital HyperMarkets": "Capital HyperMarkets",
      "G&G stores": "G&G stores",
      "YPS Bus Terminal": "YPS Bus Terminal"
    }
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('my');
  const [translations, setTranslations] = useState<Record<Language, TranslationData>>(defaultTranslations);

  useEffect(() => {
    const savedLang = localStorage.getItem('yps_lang') as Language;
    if (savedLang === 'my' || savedLang === 'en') {
      setLanguageState(savedLang);
    } else {
      // Default to Myanmar per user request
      setLanguageState('my');
    }

    // Try fetching external translation.json if available
    fetch('/translation.json')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.my && data.en) {
          setTranslations(data);
        }
      })
      .catch((err) => {
        console.warn('Using fallback translations:', err);
      });
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('yps_lang', lang);
  };

  const toggleLanguage = () => {
    const nextLang = language === 'my' ? 'en' : 'my';
    setLanguage(nextLang);
  };

  const t = (key: string): string => {
    const currentDict = translations[language] || defaultTranslations[language] || defaultTranslations.my;
    return currentDict[key] || defaultTranslations['my'][key] || key;
  };

  const tCategory = (categoryName: string): string => {
    const currentDict = translations[language] || defaultTranslations[language] || defaultTranslations.my;
    if (currentDict.categories && currentDict.categories[categoryName]) {
      return currentDict.categories[categoryName];
    }
    return categoryName;
  };

  const tAddress = (address: string | null | undefined): string => {
    if (!address) return '';
    if (language !== 'my') return address;

    let result = address;
    for (const [pattern, replacement] of addressRules) {
      result = result.replace(pattern, replacement);
    }

    // Convert digits to Myanmar numerals for Burmese display
    result = result.replace(/[0-9]/g, (match) => digitMap[match] || match);

    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, tCategory, tAddress }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
