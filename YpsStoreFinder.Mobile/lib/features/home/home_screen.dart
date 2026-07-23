import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import '../../models/store_model.dart';
import '../../services/api_service.dart';
import '../../services/location_service.dart';
import '../../services/translation_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ApiService _apiService = ApiService();
  final LocationService _locationService = LocationService();
  final TranslationService _trans = TranslationService();
  final MapController _mapController = MapController();

  List<StoreModel> _stores = [];
  List<CategorySummaryModel> _categories = [];
  String? _selectedCategory;
  String _searchQuery = '';
  double _radiusKm = 5.0;

  bool _isTracking = false;
  bool _isLoading = true;
  Position? _currentPosition;
  StoreModel? _selectedStore;

  @override
  void initState() {
    super.initState();
    _trans.addListener(_onTranslationChanged);
    _loadCategories();
    _loadStores();
  }

  @override
  void dispose() {
    _trans.removeListener(_onTranslationChanged);
    super.dispose();
  }

  void _onTranslationChanged() {
    if (mounted) {
      setState(() {});
    }
  }

  Future<void> _loadCategories() async {
    final result = await _apiService.getCategoriesSummary();
    if (result.isSuccess && result.data != null) {
      setState(() {
        _categories = result.data!;
      });
    }
  }

  Future<void> _loadStores() async {
    setState(() => _isLoading = true);

    ApiResultModel<List<StoreModel>> result;
    if (_searchQuery.isNotEmpty) {
      result = await _apiService.searchStores(query: _searchQuery, category: _selectedCategory);
    } else if (_isTracking && _currentPosition != null) {
      result = await _apiService.getNearbyStores(
        latitude: _currentPosition!.latitude,
        longitude: _currentPosition!.longitude,
        radiusKm: _radiusKm,
        category: _selectedCategory,
      );
    } else {
      result = await _apiService.getStores(category: _selectedCategory);
    }

    if (result.isSuccess && result.data != null) {
      setState(() {
        _stores = result.data!;
        _isLoading = false;
      });
    } else {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _toggleLocationTracking() async {
    if (_isTracking) {
      setState(() {
        _isTracking = false;
        _currentPosition = null;
      });
      _loadStores();
    } else {
      final pos = await _locationService.getCurrentPosition();
      if (pos != null) {
        setState(() {
          _isTracking = true;
          _currentPosition = pos;
        });
        _mapController.move(LatLng(pos.latitude, pos.longitude), 14.5);
        _loadStores();
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(_trans.t('gpsError')),
              backgroundColor: const Color(0xFFBA1A1A),
            ),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final centerLatLng = _currentPosition != null
        ? LatLng(_currentPosition!.latitude, _currentPosition!.longitude)
        : const LatLng(LocationService.defaultLat, LocationService.defaultLng);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const CircleAvatar(
              radius: 14,
              backgroundColor: Color(0xFFFFD200),
              child: Text('YPS', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 10)),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                _trans.t('appTitle'),
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF1D5FA8),
        foregroundColor: Colors.white,
        actions: [
          // Easy-to-use Language Toggle Switcher Button
          InkWell(
            onTap: () {
              _trans.toggleLanguage();
            },
            borderRadius: BorderRadius.circular(20),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              margin: const EdgeInsets.only(right: 4),
              decoration: BoxDecoration(
                color: const Color(0x33FFFFFF),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white30),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.language, size: 14, color: Colors.white),
                  const SizedBox(width: 4),
                  Text(
                    _trans.currentLanguage == 'my' ? 'မြန်မာ' : 'English',
                    style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ),
          IconButton(
            icon: Icon(_isTracking ? Icons.my_location : Icons.location_searching,
                color: _isTracking ? const Color(0xFFFFD200) : Colors.white),
            onPressed: _toggleLocationTracking,
            tooltip: _isTracking ? _trans.t('gpsActive') : _trans.t('locateMe'),
          ),
        ],
      ),
      body: Stack(
        children: [
          // Flutter Map View
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: centerLatLng,
              initialZoom: 13.5,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.yps.storefinder',
              ),

              // User Location Marker
              if (_currentPosition != null)
                MarkerLayer(
                  markers: [
                    Marker(
                      point: LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
                      width: 40,
                      height: 40,
                      child: Container(
                        decoration: BoxDecoration(
                          color: const Color(0x4D1D5FA8),
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Container(
                            width: 18,
                            height: 18,
                            decoration: BoxDecoration(
                              color: const Color(0xFF1D5FA8),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2.5),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),

              // Store Markers
              MarkerLayer(
                markers: _stores.map((store) {
                  final isSelected = _selectedStore?.id == store.id;
                  return Marker(
                    point: LatLng(store.latitude, store.longitude),
                    width: 36,
                    height: 36,
                    child: GestureDetector(
                      onTap: () {
                        setState(() => _selectedStore = store);
                        _mapController.move(LatLng(store.latitude, store.longitude), 15);
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFFFFD200) : const Color(0xFF1D5FA8),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2),
                          boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 4)],
                        ),
                        child: Icon(
                          Icons.location_on,
                          color: isSelected ? Colors.black : Colors.white,
                          size: 20,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),

          // Loading Overlay Indicator
          if (_isLoading)
            Positioned(
              top: 16,
              right: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 6)],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const SizedBox(
                      width: 14,
                      height: 14,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF1D5FA8)),
                    ),
                    const SizedBox(width: 8),
                    Text(_trans.t('loading'), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            ),

          // Draggable Bottom Sheet for Search & Stores List
          DraggableScrollableSheet(
            initialChildSize: 0.35,
            minChildSize: 0.15,
            maxChildSize: 0.85,
            builder: (context, scrollController) {
              return Container(
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                  boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10)],
                ),
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(16),
                  children: [
                    // Handle Bar
                    Center(
                      child: Container(
                        width: 36,
                        height: 4,
                        decoration: BoxDecoration(
                          color: Colors.grey[300],
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Search Field
                    TextField(
                      decoration: InputDecoration(
                        hintText: _trans.t('searchPlaceholder'),
                        prefixIcon: const Icon(Icons.search, color: Colors.grey),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        filled: true,
                        fillColor: const Color(0xFFF9F9FC),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(30),
                          borderSide: const BorderSide(color: Color(0xFFD1C6AB)),
                        ),
                      ),
                      onChanged: (val) {
                        _searchQuery = val;
                        _loadStores();
                      },
                    ),
                    const SizedBox(height: 12),

                    // Category Chips
                    SizedBox(
                      height: 36,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: _categories.length + 1,
                        separatorBuilder: (_, __) => const SizedBox(width: 8),
                        itemBuilder: (context, index) {
                          if (index == 0) {
                            final isSelected = _selectedCategory == null;
                            return ChoiceChip(
                              label: Text(_trans.t('allCategories')),
                              selected: isSelected,
                              selectedColor: const Color(0xFF1D5FA8),
                              labelStyle: TextStyle(
                                color: isSelected ? Colors.white : Colors.black87,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                              onSelected: (_) {
                                setState(() => _selectedCategory = null);
                                _loadStores();
                              },
                            );
                          }
                          final cat = _categories[index - 1];
                          final isSelected = _selectedCategory == cat.category;
                          final translatedCategoryName = _trans.tCategory(cat.category);
                          return ChoiceChip(
                            label: Text('$translatedCategoryName (${cat.count})'),
                            selected: isSelected,
                            selectedColor: const Color(0xFF1D5FA8),
                            labelStyle: TextStyle(
                              color: isSelected ? Colors.white : const Color(0xFF1D5FA8),
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                            backgroundColor: const Color(0xFFEBF2F8),
                            onSelected: (_) {
                              setState(() => _selectedCategory = cat.category);
                              _loadStores();
                            },
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Store Cards List
                    if (_stores.isEmpty)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 32),
                        child: Center(
                          child: Column(
                            children: [
                              const Icon(Icons.location_off_outlined, size: 48, color: Colors.grey),
                              const SizedBox(height: 8),
                              Text(
                                _trans.t('noStoresFound'),
                                style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.grey),
                              ),
                            ],
                          ),
                        ),
                      )
                    else
                      ..._stores.map((store) {
                        final isSelected = _selectedStore?.id == store.id;
                        final translatedCat = _trans.tCategory(store.category);
                        return Card(
                          margin: const EdgeInsets.only(bottom: 10),
                          elevation: isSelected ? 3 : 1,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                            side: BorderSide(
                              color: isSelected ? const Color(0xFF1D5FA8) : const Color(0xFFE2E2E5),
                              width: isSelected ? 2 : 1,
                            ),
                          ),
                          child: ListTile(
                            title: Text(
                              store.name,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                            subtitle: Text(
                              store.address ?? translatedCat,
                              style: const TextStyle(fontSize: 12, color: Colors.grey),
                            ),
                            trailing: store.distanceKm != null
                                ? Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFFFE07C),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      '${store.distanceKm} ${_trans.t('km')}',
                                      style: const TextStyle(
                                        fontFamily: 'monospace',
                                        fontWeight: FontWeight.bold,
                                        fontSize: 11,
                                        color: Color(0xFF725C00),
                                      ),
                                    ),
                                  )
                                : null,
                            onTap: () {
                              setState(() => _selectedStore = store);
                              _mapController.move(LatLng(store.latitude, store.longitude), 15);
                            },
                          ),
                        );
                      }).toList(),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
