import 'package:flutter/material.dart';
import '../../models/bus_model.dart';
import '../../services/api_service.dart';
import '../../services/translation_service.dart';

class YbsBusLinesView extends StatefulWidget {
  const YbsBusLinesView({super.key});

  @override
  State<YbsBusLinesView> createState() => _YbsBusLinesViewState();
}

class _YbsBusLinesViewState extends State<YbsBusLinesView> {
  final ApiService _apiService = ApiService();
  final TranslationService _trans = TranslationService();

  List<BusLineModel> _busLines = [];
  bool _filterYpsOnly = false;
  String _searchQuery = '';
  bool _isLoading = true;

  String? _selectedBusNumber;
  BusRouteDetailModel? _routeDetail;
  bool _isLoadingRoute = false;
  int _activeRouteTabIndex = 0; // 0: Outbound, 1: Return

  @override
  void initState() {
    super.initState();
    _trans.addListener(_onTranslationChanged);
    _loadBusLines();
  }

  @override
  void dispose() {
    _trans.removeListener(_onTranslationChanged);
    super.dispose();
  }

  void _onTranslationChanged() {
    if (mounted) setState(() {});
  }

  Future<void> _loadBusLines() async {
    setState(() => _isLoading = true);
    final res = _filterYpsOnly
        ? await _apiService.getYpsBusLines(keyword: _searchQuery, pageNumber: 1, pageSize: 50)
        : await _apiService.getBusLines(keyword: _searchQuery, pageNumber: 1, pageSize: 50);

    if (mounted) {
      setState(() {
        _busLines = res.isSuccess ? res.data : [];
        _isLoading = false;
      });
    }
  }

  Future<void> _handleSelectBusLine(String busNumber) async {
    setState(() {
      _selectedBusNumber = busNumber;
      _isLoadingRoute = true;
    });

    final res = await _apiService.getBusRouteByNumber(busNumber);
    if (mounted) {
      setState(() {
        _routeDetail = res.isSuccess ? res.data : null;
        _isLoadingRoute = false;
      });
    }
  }

  void _handleBackToList() {
    setState(() {
      _selectedBusNumber = null;
      _routeDetail = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFFF9F9FC),
      child: Column(
        children: [
          // YPS Gold Header Banner
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Color(0xFFFFD200),
              border: Border(bottom: BorderSide(color: Color(0xFFE5BC00))),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: const Color(0xFF725C00),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.directions_bus, color: Colors.white, size: 20),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _trans.t('ybsBusLines'),
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF1A1C1E)),
                          ),
                          Text(
                            _trans.currentLanguage == 'my' ? 'YBS ဘတ်စ်ကား လိုင်းများနှင့် မှတ်တိုင်များ' : 'YBS Routes & Stops',
                            style: const TextStyle(fontSize: 11, color: Color(0xFF4D4632)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                if (_selectedBusNumber == null) ...[
                  // Search TextField
                  TextField(
                    decoration: InputDecoration(
                      hintText: _trans.currentLanguage == 'my' ? 'YBS ယာဉ်လိုင်းနံပါတ် ရှာရန်...' : 'Search bus number...',
                      prefixIcon: const Icon(Icons.search, size: 18, color: Colors.grey),
                      suffixIcon: _searchQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear, size: 16),
                              onPressed: () {
                                setState(() => _searchQuery = '');
                                _loadBusLines();
                              },
                            )
                          : null,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(30),
                        borderSide: const BorderSide(color: Color(0xFFD1C6AB)),
                      ),
                    ),
                    onChanged: (val) {
                      _searchQuery = val;
                      _loadBusLines();
                    },
                  ),
                  const SizedBox(height: 10),

                  // Filter Buttons
                  Row(
                    children: [
                      ChoiceChip(
                        label: Text(_trans.t('allBusLines')),
                        selected: !_filterYpsOnly,
                        selectedColor: const Color(0xFF725C00),
                        labelStyle: TextStyle(
                          color: !_filterYpsOnly ? Colors.white : const Color(0xFF1A1C1E),
                          fontWeight: FontWeight.bold,
                          fontSize: 11,
                        ),
                        backgroundColor: Colors.white,
                        onSelected: (_) {
                          setState(() => _filterYpsOnly = false);
                          _loadBusLines();
                        },
                      ),
                      const SizedBox(width: 8),
                      ChoiceChip(
                        avatar: const Icon(Icons.credit_card, size: 14, color: Color(0xFF725C00)),
                        label: Text(_trans.t('ypsOnlyLines')),
                        selected: _filterYpsOnly,
                        selectedColor: Colors.white,
                        labelStyle: const TextStyle(
                          color: Color(0xFF725C00),
                          fontWeight: FontWeight.bold,
                          fontSize: 11,
                        ),
                        backgroundColor: const Color(0xFFFFF9E6),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                          side: const BorderSide(color: Color(0xFFFFE07C)),
                        ),
                        onSelected: (_) {
                          setState(() => _filterYpsOnly = true);
                          _loadBusLines();
                        },
                      ),
                    ],
                  ),
                ] else ...[
                  ElevatedButton.icon(
                    onPressed: _handleBackToList,
                    icon: const Icon(Icons.arrow_back, size: 14),
                    label: Text(_trans.currentLanguage == 'my' ? 'ယာဉ်လိုင်းများ စာရင်းသို့ ပြန်သွားရန်' : 'Back to Bus Lines'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: const Color(0xFF1A1C1E),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      elevation: 0,
                    ),
                  ),
                ],
              ],
            ),
          ),

          // Main List View
          Expanded(
            child: _selectedBusNumber != null
                ? (_isLoadingRoute
                    ? const Center(child: CircularProgressIndicator(color: Color(0xFF725C00)))
                    : _routeDetail != null
                        ? _buildRouteDetailView(_routeDetail!)
                        : Center(child: Text(_trans.t('noStoresFound'))))
                : (_isLoading
                    ? const Center(child: CircularProgressIndicator(color: Color(0xFF725C00)))
                    : _busLines.isEmpty
                        ? Center(child: Text(_trans.t('noStoresFound')))
                        : ListView.builder(
                            padding: const EdgeInsets.all(12),
                            itemCount: _busLines.length,
                            itemBuilder: (context, index) {
                              final bus = _busLines[index];
                              return Card(
                                margin: const EdgeInsets.only(bottom: 10),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                child: InkWell(
                                  onTap: () => _handleSelectBusLine(bus.busNumber),
                                  borderRadius: BorderRadius.circular(12),
                                  child: Padding(
                                    padding: const EdgeInsets.all(12),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                              decoration: BoxDecoration(
                                                color: const Color(0xFFFFD200),
                                                borderRadius: BorderRadius.circular(8),
                                                border: Border.all(color: const Color(0xFFE5BC00)),
                                              ),
                                              child: Text(
                                                'YBS ${bus.busNumber}',
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.extrabold,
                                                  fontSize: 13,
                                                  color: Color(0xFF1A1C1E),
                                                ),
                                              ),
                                            ),
                                            if (bus.isYpsSupported)
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                                decoration: BoxDecoration(
                                                  color: const Color(0xFFFFF9E6),
                                                  borderRadius: BorderRadius.circular(6),
                                                  border: Border.all(color: const Color(0xFFFFE07C)),
                                                ),
                                                child: Row(
                                                  children: [
                                                    const Icon(Icons.check_circle, size: 12, color: Color(0xFF725C00)),
                                                    const SizedBox(width: 4),
                                                    Text(
                                                      _trans.t('ypsCardAccepted'),
                                                      style: const TextStyle(
                                                        fontSize: 10,
                                                        fontWeight: FontWeight.bold,
                                                        color: Color(0xFF725C00),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                          ],
                                        ),
                                        if (bus.outboundTitle != null) ...[
                                          const SizedBox(height: 8),
                                          Row(
                                            children: [
                                              const Icon(Icons.location_on, size: 14, color: Colors.grey),
                                              const SizedBox(width: 4),
                                              Expanded(
                                                child: Text(
                                                  bus.outboundTitle!,
                                                  style: const TextStyle(fontSize: 12, color: Color(0xFF374151)),
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ],
                                    ),
                                  ),
                                ),
                              );
                            },
                          )),
          ),
        ],
      ),
    );
  }

  Widget _buildRouteDetailView(BusRouteDetailModel route) {
    final stops = _activeRouteTabIndex == 0 ? route.outboundStops : route.returnStops;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Bus Title Header
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE2E2E5)),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'YBS ${route.busNumber}',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF1A1C1E)),
                    ),
                    if (route.isYpsSupported)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFF9E6),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFFFFE07C)),
                        ),
                        child: Text(
                          _trans.t('ypsCardAccepted'),
                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF725C00)),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 10),

                // Direction Selector Tabs
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () => setState(() => _activeRouteTabIndex = 0),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _activeRouteTabIndex == 0 ? const Color(0xFF725C00) : const Color(0xFFE8E8EA),
                          foregroundColor: _activeRouteTabIndex == 0 ? Colors.white : const Color(0xFF374151),
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                          elevation: 0,
                        ),
                        child: Text('${_trans.t('outboundRoute')} (${route.outboundStops.length})'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () => setState(() => _activeRouteTabIndex = 1),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _activeRouteTabIndex == 1 ? const Color(0xFF725C00) : const Color(0xFFE8E8EA),
                          foregroundColor: _activeRouteTabIndex == 1 ? Colors.white : const Color(0xFF374151),
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                          elevation: 0,
                        ),
                        child: Text('${_trans.t('returnRoute')} (${route.returnStops.length})'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Route Stops Timeline without '#' symbol
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE2E2E5)),
            ),
            child: ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: stops.length,
              separatorBuilder: (_, __) => const Divider(height: 16),
              itemBuilder: (context, index) {
                final stop = stops[index];
                final orderNum = stop.stopOrder > 0 ? stop.stopOrder : (index + 1);

                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 10,
                      height: 10,
                      margin: const EdgeInsets.only(top: 4, right: 8),
                      decoration: const BoxDecoration(
                        color: Color(0xFF725C00),
                        shape: BoxShape.circle,
                      ),
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            stop.stopName.isNotEmpty ? stop.stopName : 'Stop $orderNum',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1A1C1E)),
                          ),
                          if (stop.roadTownship != null && stop.roadTownship!.isNotEmpty)
                            Text(
                              stop.roadTownship!,
                              style: const TextStyle(fontSize: 10, color: Colors.grey),
                            ),
                        ],
                      ),
                    ),
                    // Clean order number badge without '#' sign
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF9E6),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: const Color(0xFFFFE07C)),
                      ),
                      child: Text(
                        '$orderNum',
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF725C00)),
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
