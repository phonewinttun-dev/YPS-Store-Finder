import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:flutter/material.dart';

class TranslationService extends ChangeNotifier {
  static final TranslationService _instance = TranslationService._internal();
  factory TranslationService() => _instance;
  TranslationService._internal();

  String _currentLanguage = 'my'; // Default to Myanmar per user request
  Map<String, dynamic> _translations = {};
  bool _isLoaded = false;

  String get currentLanguage => _currentLanguage;
  bool get isLoaded => _isLoaded;

  Future<void> loadTranslations() async {
    try {
      final jsonString = await rootBundle.loadString('assets/translation.json');
      _translations = json.decode(jsonString);
      _isLoaded = true;
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading translation asset: $e');
      // Fallback translation memory dictionary
      _translations = _fallbackTranslations;
      _isLoaded = true;
      notifyListeners();
    }
  }

  void setLanguage(String lang) {
    if (_currentLanguage != lang) {
      _currentLanguage = lang;
      notifyListeners();
    }
  }

  void toggleLanguage() {
    setLanguage(_currentLanguage == 'my' ? 'en' : 'my');
  }

  String t(String key) {
    if (!_isLoaded || !_translations.containsKey(_currentLanguage)) {
      return _fallbackTranslations[_currentLanguage]?[key] ?? key;
    }
    final dict = _translations[_currentLanguage] as Map<String, dynamic>?;
    return dict?[key]?.toString() ?? _fallbackTranslations['my']?[key] ?? key;
  }

  String tCategory(String categoryName) {
    if (!_isLoaded || !_translations.containsKey(_currentLanguage)) {
      final categoriesDict = _fallbackTranslations[_currentLanguage]?['categories'] as Map<String, dynamic>?;
      return categoriesDict?[categoryName]?.toString() ?? categoryName;
    }

    final dict = _translations[_currentLanguage] as Map<String, dynamic>?;
    final categoriesDict = dict?['categories'] as Map<String, dynamic>?;
    return categoriesDict?[categoryName]?.toString() ?? categoryName;
  }

  String tAddress(String? address) {
    if (address == null || address.isEmpty) return '';
    if (_currentLanguage != 'my') return address;

    String result = address;
    final rules = <MapEntry<RegExp, String>>[
      MapEntry(RegExp(r'\bNo\.\s*', caseSensitive: false), 'အမှတ် '),
      MapEntry(RegExp(r'\bNo\b', caseSensitive: false), 'အမှတ်'),
      MapEntry(RegExp(r'\bGround Floor\b', caseSensitive: false), 'မြေညီထပ်'),
      MapEntry(RegExp(r'\b1st Floor\b', caseSensitive: false), 'ပထမထပ်'),
      MapEntry(RegExp(r'\b2nd Floor\b', caseSensitive: false), 'ဒုတိယထပ်'),
      MapEntry(RegExp(r'\b3rd Floor\b', caseSensitive: false), 'တတိယထပ်'),
      MapEntry(RegExp(r'\bFloor\b', caseSensitive: false), 'ထပ်'),
      MapEntry(RegExp(r'\bNorth Ward\b', caseSensitive: false), 'မြောက်ရပ်ကွက်'),
      MapEntry(RegExp(r'\bSouth Ward\b', caseSensitive: false), 'တောင်ရပ်ကွက်'),
      MapEntry(RegExp(r'\bEast Ward\b', caseSensitive: false), 'အရှေ့ရပ်ကွက်'),
      MapEntry(RegExp(r'\bWest Ward\b', caseSensitive: false), 'အနောက်ရပ်ကွက်'),
      MapEntry(RegExp(r'\bWard\b', caseSensitive: false), 'ရပ်ကွက်'),
      MapEntry(RegExp(r'\bStreet\b', caseSensitive: false), 'လမ်း'),
      MapEntry(RegExp(r'\bRoad\b', caseSensitive: false), 'လမ်း'),
      MapEntry(RegExp(r'\bRd\.?\b', caseSensitive: false), 'လမ်း'),
      MapEntry(RegExp(r'\bSt\.?\b', caseSensitive: false), 'လမ်း'),
      MapEntry(RegExp(r'\bCorner of\b', caseSensitive: false), 'ထောင့်'),
      MapEntry(RegExp(r'\bCorner\b', caseSensitive: false), 'ထောင့်'),
      MapEntry(RegExp(r'\bJunction\b', caseSensitive: false), 'လမ်းဆုံ'),
      MapEntry(RegExp(r'\bBridge\b', caseSensitive: false), 'တံတား'),
      MapEntry(RegExp(r'\bNear\b', caseSensitive: false), 'အနီး'),
      MapEntry(RegExp(r'\bBeside\b', caseSensitive: false), 'ဘေး'),
      MapEntry(RegExp(r'\bOpposite\b', caseSensitive: false), 'မျက်နှာချင်းဆိုင်'),
      MapEntry(RegExp(r'\bTownship\b', caseSensitive: false), 'မြို့နယ်'),
      MapEntry(RegExp(r'\bYangon\b', caseSensitive: false), 'ရန်ကုန်'),
      MapEntry(RegExp(r'\bMarket\b', caseSensitive: false), 'ဈေး'),
      MapEntry(RegExp(r'\bSan Chaung\b', caseSensitive: false), 'စမ်းချောင်း'),
      MapEntry(RegExp(r'\bSanchaung\b', caseSensitive: false), 'စမ်းချောင်း'),
      MapEntry(RegExp(r'\bKyun Taw\b', caseSensitive: false), 'ကျွန်းတော'),
      MapEntry(RegExp(r'\bKyun-Taw\b', caseSensitive: false), 'ကျွန်းတော'),
      MapEntry(RegExp(r'\bKyauktada\b', caseSensitive: false), 'ကျောက်တံတား'),
      MapEntry(RegExp(r'\bPabedan\b', caseSensitive: false), 'ပန်းဘဲတန်း'),
      MapEntry(RegExp(r'\bLatha\b', caseSensitive: false), 'လသာ'),
      MapEntry(RegExp(r'\bLanmadaw\b', caseSensitive: false), 'လမ်းမတော်'),
      MapEntry(RegExp(r'\bAhlone\b', caseSensitive: false), 'အလုံ'),
      MapEntry(RegExp(r'\bKamayut\b', caseSensitive: false), 'ကမာရွတ်'),
      MapEntry(RegExp(r'\bBahan\b', caseSensitive: false), 'ဗဟန်း'),
      MapEntry(RegExp(r'\bDagon\b', caseSensitive: false), 'ဒဂုံ'),
      MapEntry(RegExp(r'\bYankin\b', caseSensitive: false), 'ရန်ကင်း'),
      MapEntry(RegExp(r'\bMayangone\b', caseSensitive: false), 'မရမ်းကုန်း'),
      MapEntry(RegExp(r'\bInsein\b', caseSensitive: false), 'အင်းစိန်'),
      MapEntry(RegExp(r'\bMingaladon\b', caseSensitive: false), 'မင်္ဂလာဒုံ'),
      MapEntry(RegExp(r'\bTamwe\b', caseSensitive: false), 'တာမွေ'),
      MapEntry(RegExp(r'\bThingangyun\b', caseSensitive: false), 'သင်္ဃန်းကျွန်း'),
      MapEntry(RegExp(r'\bSouth Okkalapa\b', caseSensitive: false), 'တောင်ဥက္ကလာပ'),
      MapEntry(RegExp(r'\bNorth Okkalapa\b', caseSensitive: false), 'မြောက်ဥက္ကလာပ'),
      MapEntry(RegExp(r'\bThaketa\b', caseSensitive: false), 'သာကေတ'),
      MapEntry(RegExp(r'\bDawbon\b', caseSensitive: false), 'ဒေါပုံ'),
      MapEntry(RegExp(r'\bPazundaung\b', caseSensitive: false), 'ပုဇွန်တောင်'),
      MapEntry(RegExp(r'\bBotahtaung\b', caseSensitive: false), 'ဗိုလ်တထောင်'),
      MapEntry(RegExp(r'\bHlaing\b', caseSensitive: false), 'လှိုင်'),
      MapEntry(RegExp(r'\bHlaingthaya\b', caseSensitive: false), 'လှိုင်သာယာ'),
      MapEntry(RegExp(r'\bShwepyitha\b', caseSensitive: false), 'ရွှေပြည်သာ'),
      MapEntry(RegExp(r'\bPyay\b', caseSensitive: false), 'ပြည်'),
      MapEntry(RegExp(r'\bKaba Aye\b', caseSensitive: false), 'ကမ္ဘာအေး'),
      MapEntry(RegExp(r'\bAnawrahta\b', caseSensitive: false), 'အနော်ရထာ'),
      MapEntry(RegExp(r'\bMaha Bandula\b', caseSensitive: false), 'မဟာဗန္ဓုလ'),
      MapEntry(RegExp(r'\bSule Pagoda\b', caseSensitive: false), 'ဆူလေဘုရား'),
      MapEntry(RegExp(r'\bSule\b', caseSensitive: false), 'ဆူလေ'),
      MapEntry(RegExp(r'\bInya\b', caseSensitive: false), 'အင်းလျား'),
      MapEntry(RegExp(r'\bBogyoke\b', caseSensitive: false), 'ဗိုလ်ချုပ်'),
    ];

    for (final rule in rules) {
      result = result.replaceAll(rule.key, rule.value);
    }

    const digitMap = {
      '0': '၀', '1': '၁', '2': '၂', '3': '၃', '4': '၄',
      '5': '၅', '6': '၆', '7': '၇', '8': '၈', '9': '၉'
    };

    result = result.replaceAllMapped(RegExp(r'[0-9]'), (m) => digitMap[m.group(0)] ?? m.group(0)!);

    return result;
  }

  static final Map<String, Map<String, dynamic>> _fallbackTranslations = {
    "my": {
      "appTitle": "YPS စတိုးဆိုင်များ ရှာဖွေရန်",
      "appSubtitle": "YPS စတိုးဆိုင်များအား တစ်နေရာတည်းတွင် အလွယ်တကူ ရှာဖွေပါ",
      "searchPlaceholder": "စတိုးဆိုင်၊ ဆိုင်ခွဲ သို့မဟုတ် လိပ်စာ ရှာဖွေပါ...",
      "locateMe": "လက်ရှိနေရာ ရှာရန်",
      "gpsActive": "GPS ဖွင့်ထားသည်",
      "stopGps": "GPS ပိတ်ရန်",
      "deviceLocation": "စက်ပစ္စည်း တည်နေရာ",
      "searchRadiusFilter": "ရှာဖွေရန် အကွာအဝေး အကန့်အသတ်",
      "km": "ကီလိုမီတာ",
      "kmAway": "ကီလိုမီတာ အကွာအဝေး",
      "allCategories": "အမျိုးအစား အားလုံး",
      "noStoresFound": "စတိုးဆိုင် မတွေ့ရှိပါ",
      "directions": "လမ်းကြောင်းရှာရန်",
      "loading": "ရယူနေသည်...",
      "storesCount": "ဆိုင် အရေအတွက်",
      "gpsError": "စက်ပစ္စည်း GPS တည်နေရာ မရရှိပါ။ Location ခွင့်ပြုချက်ကို စစ်ဆေးပါ။",
      "categories": {
        "YPS Service Kios": "YPS ဝန်ဆောင်မှု ကောင်တာများ",
        "YPS Agents": "YPS ကိုယ်စားလှယ်များ",
        "Mingalar Cinemas": "မင်္ဂလာ ရုပ်ရှင်ရုံများ",
        "Capital HyperMarkets": "Capital ဟိုက်ပါမားကတ်များ",
        "G&G stores": "G&G စတိုးဆိုင်များ",
        "YPS Bus Terminal": "YPS ဘတ်စ်ကား ဂိတ်များ"
      }
    },
    "en": {
      "appTitle": "YPS Store Finder",
      "appSubtitle": "Easily locate YPS stores",
      "searchPlaceholder": "Search stores or locations...",
      "locateMe": "Locate Me",
      "gpsActive": "GPS Active",
      "stopGps": "Stop GPS",
      "deviceLocation": "Device Location",
      "searchRadiusFilter": "Search Radius Filter",
      "km": "km",
      "kmAway": "km away",
      "allCategories": "All Categories",
      "noStoresFound": "No stores found",
      "directions": "Directions",
      "loading": "Loading...",
      "storesCount": "Stores",
      "gpsError": "Could not obtain device GPS position. Check location permissions.",
      "categories": {
        "YPS Service Kios": "YPS Service Kiosks",
        "YPS Agents": "YPS Agents",
        "Mingalar Cinemas": "Mingalar Cinemas",
        "Capital HyperMarkets": "Capital HyperMarkets",
        "G&G stores": "G&G stores",
        "YPS Bus Terminal": "YPS Bus Terminal"
      }
    }
  };
}
