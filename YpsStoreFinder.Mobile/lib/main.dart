import 'package:flutter/material.dart';
import 'features/home/home_screen.dart';
import 'services/translation_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await TranslationService().loadTranslations();
  runApp(const YpsStoreFinderApp());
}

class YpsStoreFinderApp extends StatelessWidget {
  const YpsStoreFinderApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'YPS Store Finder',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        fontFamily: 'WorkSans',
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1D5FA8),
          primary: const Color(0xFF1D5FA8),
          secondary: const Color(0xFFFFD200),
          surface: const Color(0xFFF9F9FC),
        ),
        scaffoldBackgroundColor: const Color(0xFFF9F9FC),
      ),
      home: const HomeScreen(),
    );
  }
}
