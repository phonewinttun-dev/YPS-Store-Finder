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

  static final Map<String, Map<String, dynamic>> _fallbackTranslations = {
    "my": {
      "appTitle": "YPS စတိုးဆိုင်များ ရှာဖွေရန်",
      "appSubtitle": "ရန်ကုန် သွားလာရေးနှင့် ဝန်ဆောင်မှုနေရာများ",
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
      "appSubtitle": "Yangon Transit & Service Locator",
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
