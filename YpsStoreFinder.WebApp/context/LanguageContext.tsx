'use client';

import React, { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from 'react';
import translationFile from '../public/translation.json';

export type Language = 'my' | 'en';
type Dictionary = Record<string, unknown>;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  tCategory: (categoryName: string) => string;
  tAddress: (address: string | null | undefined) => string;
  tStoreName: (name: string) => string;
  toMmNum: (value: number | string | null | undefined) => string;
  tStoreCount: (count: number | string | null | undefined) => string;
}

const uiStrings: Record<Language, Record<string, string>> = {
  my: {
    appTitle: 'YPS ဆိုင်များ ရှာဖွေရန်',
    appShortTitle: 'YPS Finder',
    map: 'မြေပုံ',
    stores: 'ဆိုင်များ',
    buses: 'ဘတ်စ်ကား',
    appearance: 'အပြင်အဆင်',
    systemTheme: 'System',
    lightTheme: 'အလင်း',
    darkTheme: 'အမှောင်',
    openExplorer: 'ရှာဖွေရေးကို ဖွင့်ရန်',
    collapseExplorer: 'ရှာဖွေရေးကို ချုံ့ရန်',
    expandExplorer: 'ရှာဖွေရေးကို ချဲ့ရန်',
    explorerHandle: 'ရှာဖွေရေး panel အရွယ် ပြောင်းရန်',
    nearby: 'အနီးဆုံး',
    allStores: 'ဆိုင်အားလုံး',
    storeDetails: 'အသေးစိတ်',
    viewOnMap: 'မြေပုံပေါ် ကြည့်ရန်',
    close: 'ပိတ်ရန်',
    loadingMap: 'မြေပုံ ဖွင့်နေသည်…',
    calculatingRoute: 'လမ်းကြောင်း တွက်ချက်နေသည်…',
    minutes: 'မိနစ်',
    back: 'နောက်သို့',
    backToBuses: 'ယာဉ်လိုင်းများသို့ ပြန်ရန်',
    searchBusPlaceholder: 'YBS နံပါတ် သို့မဟုတ် လမ်းကြောင်း ရှာရန်…',
    loadingBuses: 'YBS ယာဉ်လိုင်းများ ရှာနေသည်…',
    noBuses: 'YBS ယာဉ်လိုင်း မတွေ့ရှိပါ',
    loadingMoreBuses: 'နောက်ထပ် ယာဉ်လိုင်းများ ဆွဲယူနေသည်…',
    noRoute: 'လမ်းကြောင်း အချက်အလက် မရှိပါ',
    busStop: 'မှတ်တိုင်',
    allStoresShown: 'ဆိုင်များ အားလုံး ပြသပြီးပါပြီ',
    gpsOn: 'GPS ဖွင့်ထား',
    gpsOff: 'တည်နေရာ',
    navigation: 'အဓိက လမ်းညွှန်',
    languageToggle: 'ဘာသာစကား ပြောင်းရန်',
    themeSelector: 'Theme ရွေးရန်',
    skipToContent: 'အဓိကအကြောင်းအရာသို့ ကျော်ရန်',
    resultCount: 'ဆိုင်',
    allBusLines: 'ယာဉ်လိုင်းအားလုံး',
    ypsOnlyLines: 'YPS ကတ် အသုံးပြုနိုင်သော ယာဉ်လိုင်းများ',
    showBusStops: 'အနီးရှိ မှတ်တိုင်များ',
    servicingLines: 'ပြေးဆွဲသည့် ယာဉ်လိုင်းများ',
  },
  en: {
    appTitle: 'YPS Store Finder',
    appShortTitle: 'YPS Finder',
    map: 'Map',
    stores: 'Stores',
    buses: 'Buses',
    appearance: 'Appearance',
    systemTheme: 'System',
    lightTheme: 'Light',
    darkTheme: 'Dark',
    openExplorer: 'Open explorer',
    collapseExplorer: 'Collapse explorer',
    expandExplorer: 'Expand explorer',
    explorerHandle: 'Resize explorer panel',
    nearby: 'Nearby',
    allStores: 'All stores',
    storeDetails: 'Details',
    viewOnMap: 'View on map',
    close: 'Close',
    loadingMap: 'Loading map…',
    calculatingRoute: 'Calculating route…',
    minutes: 'min',
    back: 'Back',
    backToBuses: 'Back to bus lines',
    searchBusPlaceholder: 'Search a YBS number or route…',
    loadingBuses: 'Finding YBS bus lines…',
    noBuses: 'No YBS bus lines found',
    loadingMoreBuses: 'Loading more bus lines…',
    noRoute: 'Route information is unavailable',
    busStop: 'Stop',
    allStoresShown: 'All stores are shown',
    gpsOn: 'GPS on',
    gpsOff: 'Location',
    navigation: 'Primary navigation',
    languageToggle: 'Change language',
    themeSelector: 'Choose theme',
    skipToContent: 'Skip to main content',
    resultCount: 'stores',
    allBusLines: 'All bus lines',
    ypsOnlyLines: 'YPS-supported only',
    showBusStops: 'Nearby bus stops',
    servicingLines: 'Servicing lines',
  },
};

const digitMap: Record<string, string> = {
  '0': '၀', '1': '၁', '2': '၂', '3': '၃', '4': '၄',
  '5': '၅', '6': '၆', '7': '၇', '8': '၈', '9': '၉',
};

const addressRules: Array<[RegExp, string]> = [
  [/\bNo\.\s*/gi, 'အမှတ် '],
  [/\bGround Floor\b/gi, 'မြေညီထပ်'],
  [/\bStreet\b|\bRoad\b|\bRd\.?\b|\bSt\.?\b/gi, 'လမ်း'],
  [/\bTownship\b/gi, 'မြို့နယ်'],
  [/\bYangon\b/gi, 'ရန်ကုန်'],
  [/\bMarket\b/gi, 'ဈေး'],
  [/\bNorth\b/gi, 'မြောက်'],
  [/\bSouth\b/gi, 'တောင်'],
  [/\bEast\b/gi, 'အရှေ့'],
  [/\bWest\b/gi, 'အနောက်'],
];

const LanguageContext = createContext<LanguageContextType | null>(null);
const translations = translationFile as unknown as Record<Language, Dictionary>;
const LANGUAGE_STORAGE_KEY = 'yps_lang';
const LANGUAGE_CHANGE_EVENT = 'yps-language-change';

function getLanguageSnapshot(): Language {
  try {
    return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'en' ? 'en' : 'my';
  } catch {
    return 'my';
  }
}

function getLanguageServerSnapshot(): Language {
  return 'my';
}

function subscribeLanguage(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === LANGUAGE_STORAGE_KEY || event.key === null) onStoreChange();
  };
  window.addEventListener('storage', handleStorage);
  window.addEventListener(LANGUAGE_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, onStoreChange);
  };
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(subscribeLanguage, getLanguageSnapshot, getLanguageServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = language === 'my' ? 'my' : 'en';
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      return;
    }
    window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
  }, []);

  const t = (key: string) => {
    const value = translations[language]?.[key];
    return typeof value === 'string' ? value : uiStrings[language][key] ?? key;
  };

  const tCategory = (categoryName: string) => {
    if (language === 'en') return categoryName;
    const categories = translations.my.categories;
    if (categories && typeof categories === 'object') {
      const translated = (categories as Record<string, unknown>)[categoryName];
      if (typeof translated === 'string') return translated;
    }
    return categoryName;
  };

  const tAddress = (address: string | null | undefined) => {
    if (!address) return '';
    if (language === 'en') return address;
    return addressRules.reduce((result, [pattern, replacement]) => result.replace(pattern, replacement), address);
  };

  const tStoreName = (name: string) => name;
  const toMmNum = (value: number | string | null | undefined) => {
    if (value === null || value === undefined) return '';
    const text = String(value);
    return language === 'my' ? text.replace(/[0-9]/g, (digit) => digitMap[digit]) : text;
  };

  const tStoreCount = (count: number | string | null | undefined) => {
    if (count === null || count === undefined) return '';
    const numText = toMmNum(count);
    return language === 'my' ? `ဆိုင် ${numText}` : `${numText} stores`;
  };

  const toggleLanguage = useCallback(
    () => setLanguage(language === 'my' ? 'en' : 'my'),
    [language, setLanguage]
  );

  const value: LanguageContextType = {
    language,
    setLanguage,
    toggleLanguage,
    t,
    tCategory,
    tAddress,
    tStoreName,
    toMmNum,
    tStoreCount,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
