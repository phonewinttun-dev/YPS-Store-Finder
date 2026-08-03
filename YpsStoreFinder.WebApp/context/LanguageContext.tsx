'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'my';

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
  tStoreName: (name: string) => string;
  toMmNum: (val: number | string | null | undefined) => string;
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

export function toMmNum(val: number | string | null | undefined): string {
  if (val === null || val === undefined) return '';
  return String(val).replace(/[0-9]/g, (match) => digitMap[match] || match);
}

const defaultTranslations: TranslationData = {
  appTitle: "YPS စတိုးဆိုင်များ ရှာဖွေရန်",
  appSubtitle: "YPS စတိုးဆိုင်များအား တစ်နေရာတည်းတွင် အလွယ်တကူ ရှာဖွေပါ",
  searchPlaceholder: "စတိုးဆိုင်၊ ဆိုင်ခွဲ သို့မဟုတ် လိပ်စာ ရှာဖွေပါ",
  locateMe: "လက်ရှိနေရာ",
  gpsActive: "GPS ဖွင့်ထားသည်",
  stopGps: "GPS ပိတ်ရန်",
  deviceLocation: "တည်နေရာ",
  deviceLocationActive: "တိုက်ရိုက် တည်နေရာ မျှဝေနေသည်",
  deviceLocationInactive: "အနီးဆုံးဆိုင်များ ရှာရန် GPS ဖွင့်ပါ",
  searchRadiusFilter: "ရှာဖွေရန် အကွာအဝေး အကန့်အသတ်",
  km: "ကီလိုမီတာ",
  kmAway: "ကီလိုမီတာ အကွာအဝေး",
  allCategories: "အမျိုးအစား အားလုံး",
  noStoresFound: "စတိုးဆိုင် မတွေ့ရှိပါ",
  noStoresSub: "ရှာဖွေမှု သို့မဟုတ် အကွာအဝေးကို ပြန်လည်ပြင်ဆင်ကြည့်ပါ",
  directions: "လမ်းကြောင်းရှာရန်",
  stores: "YPS ဆိုင်များ",
  ybsBusLines: "YBS ယာဉ်လိုင်းများ",
  showDirection: "လမ်းကြောင်းကြည့်ရန်",
  showBusLines: "ယာဉ်လိုင်းကြည့်ရန်",
  nearestBusStops: "ဆိုင်အနီးရှိ မှတ်တိုင်များ",
  ypsCardUnavailable: "YPS ကဒ် အသုံးပြု၍မရနိုင်ပါ",
  ypsCardAccepted: "YPS ကဒ် အသုံးပြု၍ရပါသည်",
  allBusLines: "ယာဉ်လိုင်းအားလုံး",
  ypsOnlyLines: "YPS ကဒ် အသုံးပြုနိုင်သော ယာဉ်လိုင်းများ",
  outbound: "အသွား",
  return: "အပြန်",
  outboundRoute: "အသွား",
  returnRoute: "အပြန်",
  updatingStores: "စတိုးဆိုင်များ ရယူနေသည်...",
  storesCount: "ဆိုင် အရေအတွက်",
  store: "ဆိုင်",
  retryConnection: "ပြန်လည် ကြိုးစားရန်",
  apiErrorTitle: "ချိတ်ဆက်၍ မရနိုင်ပါ",
  language: "ဘာသာစကား",
  myanmar: "မြန်မာ",
  english: "English",
  meters: "မီတာ",
  enableGpsTitle: "တည်နေရာ ဝန်ဆောင်မှု ဖွင့်ရန်",
  enableGpsMessage: "ဆိုင်သို့ သွားရောက်ရန် လမ်းကြောင်းနှင့် အကွာအဝေးကို ကြည့်ရှုနိုင်ရန် တည်နေရာ ဝန်ဆောင်မှုကို ဖွင့်ပေးပါ",
  enableGpsBtn: "ဖွင့်မည်",
  cancel: "မလုပ်တော့ပါ",
  locationPermissionTitle: "တည်နေရာ ခွင့်ပြုချက် လိုအပ်ပါသည်",
  locationPermissionMsg: "အနီးဆုံး YPS ဆိုင်များနှင့် လမ်းကြောင်းများ ပြသနိုင်ရန် သင့်စက်၏ တည်နေရာအသုံးပြုခွင့် ပေးပါ",
  allowLocation: "ခွင့်ပြုမည်",
  locationDenied: "တည်နေရာခွင့်ပြုချက်မရရှိပါ။ လက်ရှိတည်နေရာကို ရှာဖွေနိုင်ရန် တည်နေရာခွင့်ပြုချက်ကို အတည်ပြုပေးပါ",
  locationUnavailable: "လက်ရှိ တည်နေရာအချက်အလက် မရရှိနိုင်ပါ။ ခဏစောင့်ပြီး ပြန်လည်ကြိုးစားကြည့်ပါ",
  locationTimeout: "တည်နေရာရှာဖွေမှု အချိန်ကုန်သွားပါသည်။ ပြန်လည်ကြိုးစားကြည့်ပါ",
  locationUnsupported: "ဤ browser တွင် တည်နေရာ ရှာဖွေခြင်း မပံ့ပိုးပါ",
  categories: {
    "YPS Service Kios": "YPS ဝန်ဆောင်မှု ကောင်တာများ",
    "YPS Agents": "YPS ကိုယ်စားလှယ်များ",
    "Mingalar Cinemas": "မင်္ဂလာ ရုပ်ရှင်ရုံများ",
    "Capital HyperMarkets": "Capital ဟိုက်ပါမားကတ်များ",
    "G&G stores": "G&G စတိုးဆိုင်များ",
    "YPS Bus Terminal": "YPS ဘတ်စ်ကား ဂိတ်များ"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const language: Language = 'my';
  const [translations, setTranslations] = useState<TranslationData>(defaultTranslations);

  useEffect(() => {
    localStorage.setItem('yps_lang', 'my');
    fetch('/translation.json')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.my) {
          setTranslations(data.my);
        }
      })
      .catch((err) => {
        console.warn('Using fallback translations:', err);
      });
  }, []);

  const setLanguage = (_lang: Language) => {
    // Language toggling disabled - forced to Burmese ('my')
  };

  const toggleLanguage = () => {
    // Language toggling disabled - forced to Burmese ('my')
  };

  const t = (key: string): string => {
    return translations[key] || defaultTranslations[key] || key;
  };

  const tCategory = (categoryName: string): string => {
    if (translations.categories && translations.categories[categoryName]) {
      return translations.categories[categoryName];
    }
    if (defaultTranslations.categories && defaultTranslations.categories[categoryName]) {
      return defaultTranslations.categories[categoryName];
    }
    return categoryName;
  };

  const tAddress = (address: string | null | undefined): string => {
    if (!address) return '';
    let result = address;
    for (const [pattern, replacement] of addressRules) {
      result = result.replace(pattern, replacement);
    }
    // Convert digits to Myanmar numerals for Burmese display
    return toMmNum(result);
  };

  const tStoreName = (name: string): string => {
    if (!name) return '';
    return name
      .replace(/Sule City Hall/g, 'ဆူးလေ YPS ဝန်ဆောင်မှုဆိုင်')
      .replace(/Tha Khin Mya Pan Chan/g, 'သခင်မြပန်းခြံ YPS ဝန်ဆောင်မှုဆိုင်')
      .replace(/Myanmar Plaza/g, 'မြန်မာပလာဇာ YPS ဝန်ဆောင်မှုဆိုင်')
      .replace(/Hleden Kios/g, 'လှည်းတန်း YPS ဝန်ဆောင်မှုဆိုင်')
      .replace(/Yuzana Plaza/g, 'ယုဇနပလာဇာ YPS ဝန်ဆောင်မှုဆိုင်')
      .replace(/Dagon Seikkan/g, 'ဒဂုံဆိပ်ကမ်း YPS ဝန်ဆောင်မှုဆိုင်')
      .replace(/YPS Service Kios/g, 'YPS ဝန်ဆောင်မှုဆိုင်')
      .replace(/YPS Service Counter/g, 'YPS ဝန်ဆောင်မှု ကောင်တာ')
      .replace(/Counter/g, 'ကောင်တာ')
      .replace(/Store/g, 'စတိုး');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, tCategory, tAddress, tStoreName, toMmNum }}>
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
