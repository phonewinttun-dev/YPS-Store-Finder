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
}

const uiStrings: Record<Language, Record<string, string>> = {
  my: {
    appTitle: 'YPS ဆိုင်များ ရှာဖွေရန်',
    appShortTitle: 'YPS Finder',
    map: 'မြေပုံ',
    stores: 'ဆိုင်များ',
    buses: 'ဘတ်စ်ကား',
    appearance: 'အပြင်အဆင်',
    systemTheme: 'စနစ်အလိုက်',
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
    resultCount: 'ရှာဖွေတွေ့ရှိမှု',
    allBusLines: 'ယာဉ်လိုင်းအားလုံး',
    ypsOnlyLines: 'YPS ကတ် အသုံးပြုနိုင်သော ယာဉ်လိုင်းများ',
    showBusStops: 'အနီးရှိ မှတ်တိုင်များ',
    servicingLines: 'ပြေးဆွဲသည့် ယာဉ်လိုင်းများ',
    systemStatus: 'စနစ်အခြေအနေ',
    dataLink: 'ဒေတာချိတ်ဆက်မှု',
    position: 'တည်နေရာ',
    visibleStores: 'မြင်ရသော ဆိုင်များ',
    syncing: 'ရယူနေသည်',
    online: 'အဆင်သင့်',
    offline: 'ချိတ်ဆက်မရ',
    mapReady: 'မြေပုံ အသင့်',
    syncingStores: 'ဆိုင်များ ရယူနေသည်',
    connectionUnavailable: 'ချိတ်ဆက်၍ မရပါ',
    routeActive: 'လမ်းကြောင်း ပြထားသည်',
    storeSelected: 'ဆိုင် ရွေးထားသည်',
    manualPosition: 'မူလတည်နေရာ',
    targetSelector: 'ဆိုင်ရွေးချယ်ရန်',
    soundEffects: 'အသံအကျိုးသက်ရောက်မှု',
    soundOn: 'အသံ ဖွင့်ထားသည်',
    soundOff: 'အသံ ပိတ်ထားသည်',
    enableSound: 'အသံ ဖွင့်ရန်',
    disableSound: 'အသံ ပိတ်ရန်',
    walking: 'လမ်းလျှောက်',
    bus: 'ဘတ်စ်',
    taxi: 'တက္ကစီ',
    lines: 'လိုင်း',
    travelMode: 'သွားလာမည့် ပုံစံ',
    estimateLabel: 'ခန့်မှန်းချိန်',
    fastest: 'အမြန်ဆုံး',
    fastestEstimate: 'အမြန်ဆုံး ခန့်မှန်းချက်',
    nearestTarget: 'အနီးဆုံး',
    comparingTravelModes: 'သွားလာချိန်များ နှိုင်းယှဉ်နေသည်…',
    gpsRequired: 'GPS လိုအပ်သည်',
    gpsNeededForRoutes: 'အနီးဆုံးဆိုင်နှင့် သွားလာလမ်းကြောင်းများကို တွက်ရန် တည်နေရာ ဖွင့်ပေးပါ။',
    enableLocation: 'တည်နေရာ ဖွင့်ရန်',
    etaUnavailable: 'ကြာချိန် မရနိုင်သေး',
    roadRoute: 'လမ်းမ လမ်းကြောင်း',
    pedestrianRoute: 'လူသွားလမ်း လမ်းကြောင်း',
    findingBusRoute: 'ရှာနေသည်…',
    findingRelatedStops: 'သင့်အနီးနှင့် ဆိုင်အနီးရှိ မှတ်တိုင်များကြား တိုက်ရိုက် YBS လမ်းကြောင်း ရှာနေသည်…',
    nearbyStopsChecked: 'အနီးရှိမှတ်တိုင်များကို စစ်ဆေးပြီး',
    noDirectBusRoute: 'တိုက်ရိုက်လိုင်း မတွေ့',
    noVerifiedDirectBus: 'သင့်တည်နေရာအနီးရှိ မှတ်တိုင်မှ ဆိုင်အနီးရှိ မှတ်တိုင်သို့ တိုက်ရိုက်ပြေးဆွဲသော YBS လိုင်းကို အတည်ပြု၍ မတွေ့ပါ။',
    directYbsRoute: 'အတည်ပြုထားသော တိုက်ရိုက် YBS လမ်းကြောင်း',
    walkToStop: 'လမ်းလျှောက်၍ မှတ်တိုင်သို့သွားပါ —',
    rideYbs: 'YBS စီးပါ —',
    boardAt: 'တက်ရန်',
    getOffAt: 'ဆင်းရန်',
    thenWalkToStore: 'ထို့နောက် ဆိုင်သို့ လမ်းလျှောက်ပါ',
    nearbyYbsLines: 'ဆိုင်အနီးရှိ YBS လိုင်းများ',
    openWalkingDirections: 'လမ်းလျှောက် လမ်းညွှန် ဖွင့်ရန်',
    openBusDirections: 'ဘတ်စ် လမ်းညွှန် ဖွင့်ရန်',
    openTaxiDirections: 'တက္ကစီ လမ်းညွှန် ဖွင့်ရန်',
    opensInNewTab: 'တက်ဘ်အသစ်တွင် ဖွင့်မည်',
    walkingEstimateNote: 'OpenStreetMap လူသွားလမ်းများကို လိုက်နာသော အမှန်တကယ် pedestrian route နှင့် ခန့်မှန်းသွားချိန်ကို ပြထားသည်။',
    busEstimateNote: 'လက်ရှိဒေတာတွင် ဆိုင်အနီးရှိ YBS လိုင်းများသာ ပါရှိပြီး အချိန်ဇယား၊ လွှဲပြောင်းမှုနှင့် တိုက်ရိုက်ယာဉ်အခြေအနေ မပါသဖြင့် ဘတ်စ်ကြာချိန်ကို မခန့်မှန်းထားပါ။',
    busRouteNote: 'မြေပုံပေါ်ရှိ အစိမ်းရောင်ပြတ်လိုင်းများသည် မှတ်တိုင်အဝင်/အထွက် လမ်းလျှောက်လမ်းကြောင်းဖြစ်ပြီး အပြာရောင်လိုင်းသည် အတည်ပြုထားသော YBS လမ်းကြောင်းဖြစ်သည်။',
    taxiEstimateNote: 'တက္ကစီချိန်သည် လမ်းမလမ်းကြောင်း ခန့်မှန်းချက်ဖြစ်ပြီး ကားလာကြိုရန် စောင့်ချိန်နှင့် လက်ရှိယာဉ်ကြောပိတ်ဆို့မှု မပါဝင်ပါ။',
    notAvailable: 'မရနိုင်ပါ',
    connectionHelp: 'YPS ဒေတာဝန်ဆောင်မှုကို ချိတ်ဆက်မရပါ။ ပြန်လည်ကြိုးစားပါ။',
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
    resultCount: 'results',
    allBusLines: 'All bus lines',
    ypsOnlyLines: 'YPS-supported only',
    showBusStops: 'Nearby bus stops',
    servicingLines: 'Servicing lines',
    systemStatus: 'System status',
    dataLink: 'Data link',
    position: 'Position',
    visibleStores: 'Visible stores',
    syncing: 'Syncing',
    online: 'Ready',
    offline: 'Offline',
    mapReady: 'Map ready',
    syncingStores: 'Finding stores',
    connectionUnavailable: 'Connection unavailable',
    routeActive: 'Route active',
    storeSelected: 'Store selected',
    manualPosition: 'Default area',
    targetSelector: 'Store selector',
    soundEffects: 'Sound effects',
    soundOn: 'Sound on',
    soundOff: 'Sound off',
    enableSound: 'Turn sound on',
    disableSound: 'Turn sound off',
    walking: 'Walk',
    bus: 'Bus',
    taxi: 'Taxi',
    lines: 'lines',
    travelMode: 'Travel mode',
    estimateLabel: 'Estimated',
    fastest: 'Fastest',
    fastestEstimate: 'Fastest estimate',
    nearestTarget: 'Nearest',
    comparingTravelModes: 'Comparing travel modes…',
    gpsRequired: 'GPS required',
    gpsNeededForRoutes: 'Turn on location to find the nearest store and compare travel directions.',
    enableLocation: 'Turn on location',
    etaUnavailable: 'ETA unavailable',
    roadRoute: 'Road route',
    pedestrianRoute: 'Pedestrian road route',
    findingBusRoute: 'Finding…',
    findingRelatedStops: 'Finding a direct YBS route between stops near you and stops near this store…',
    nearbyStopsChecked: 'Nearby stops checked',
    noDirectBusRoute: 'No direct line',
    noVerifiedDirectBus: 'No verified direct YBS line was found from a stop near your location to a stop near this store.',
    directYbsRoute: 'Verified direct YBS route',
    walkToStop: 'Walk to the boarding stop —',
    rideYbs: 'Ride YBS —',
    boardAt: 'Board at',
    getOffAt: 'Get off at',
    thenWalkToStore: 'then walk to the store',
    nearbyYbsLines: 'YBS lines near this store',
    openWalkingDirections: 'Open walking directions',
    openBusDirections: 'Open bus directions',
    openTaxiDirections: 'Open taxi directions',
    opensInNewTab: 'opens in a new tab',
    walkingEstimateNote: 'Shows an actual pedestrian route along OpenStreetMap walkable roads and its estimated travel time.',
    busEstimateNote: 'Current data identifies YBS lines near the store but has no timetable, transfer, or live vehicle data, so no bus ETA is claimed.',
    busRouteNote: 'Green dashed segments are the real walking access and exit routes. The solid blue segment is the verified YBS route.',
    taxiEstimateNote: 'Taxi time is a road-route estimate. Pickup wait and live traffic are not included.',
    notAvailable: 'Not available',
    connectionHelp: 'YPS data is unavailable. Try again.',
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
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
