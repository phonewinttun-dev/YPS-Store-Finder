import 'package:flutter/material.dart';
import '../../models/bus_model.dart';
import '../../services/api_service.dart';
import '../../services/translation_service.dart';

class YbsBusLinesView extends StatefulWidget {
  const YbsBusLinesView({Key? key}) : super(key: key);

  @override
  State<YbsBusLinesView> createState() => _YbsBusLinesViewState();
}

class _YbsBusLinesViewState extends State<YbsBusLinesView> {
  final ApiService _apiService = ApiService();
  final TranslationService _ts = TranslationService();

  List<BusLineModel> _busLines = [];
  bool _isLoading = true;
  bool _filterYpsOnly = false;
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  String? _selectedBusNumber;
  BusRouteDetailModel? _routeDetail;
  bool _isLoadingRoute = false;
  int _selectedRouteTab = 0; // 0 for Outbound, 1 for Return

  @override
  void initState() {
    super.initState();
    _fetchBusLines();
  }

  Future<void> _fetchBusLines() async {
    setState(() => _isLoading = true);
    try {
      final res = _filterYpsOnly
          ? await _apiService.getYpsBusLines(keyword: _searchQuery, pageNumber: 1, pageSize: 50)
          : await _apiService.getBusLines(keyword: _searchQuery, pageNumber: 1, pageSize: 50);

      if (res.isSuccess) {
        setState(() => _busLines = res.data);
      } else {
        setState(() => _busLines = []);
      }
    } catch (e) {
      setState(() => _busLines = []);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _selectBusLine(String busNumber) async {
    setState(() {
      _selectedBusNumber = busNumber;
      _isLoadingRoute = true;
      _routeDetail = null;
    });

    try {
      final res = await _apiService.getBusRouteDetail(busNumber);
      if (res.isSuccess) {
        setState(() => _routeDetail = res.data);
      }
    } catch (e) {
      debugPrint('Error fetching bus route detail: $e');
    } finally {
      setState(() => _isLoadingRoute = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Header Bar
        Container(
          padding: const EdgeInsets.all(16.0),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1D5FA8),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.directions_bus, color: Colors.white, size: 24),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _ts.t('ybsBusLines'),
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        Text(
                          _ts.currentLanguage == 'my'
                              ? 'YBS ဘတ်စ်ကား လိုင်းများနှင့် မှတ်တိုင်များ'
                              : 'Yangon Bus Service (YBS) Routes',
                          style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              if (_selectedBusNumber == null) ...[
                const SizedBox(height: 12),
                // Search Field
                TextField(
                  controller: _searchController,
                  onChanged: (val) {
                    _searchQuery = val;
                    _fetchBusLines();
                  },
                  decoration: InputDecoration(
                    hintText: _ts.currentLanguage == 'my'
                        ? 'YBS ယာဉ်လိုင်းနံပါတ် သို့မဟုတ် လမ်းကြောင်း ရှာရန်...'
                        : 'Search bus line number or route...',
                    prefixIcon: const Icon(Icons.search, size: 20),
                    contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                    filled: true,
                    fillColor: const Color(0xFFF9F9FC),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(30),
                      borderSide: const BorderSide(color: Color(0xFFD1C6AB)),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                // Filter Buttons
                Row(
                  children: [
                    FilterChip(
                      selected: !_filterYpsOnly,
                      label: Text(_ts.t('allBusLines')),
                      selectedColor: const Color(0xFF1D5FA8),
                      labelStyle: TextStyle(
                        color: !_filterYpsOnly ? Colors.white : Colors.black87,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                      onSelected: (val) {
                        setState(() => _filterYpsOnly = false);
                        _fetchBusLines();
                      },
                    ),
                    const SizedBox(width: 8),
                    FilterChip(
                      selected: _filterYpsOnly,
                      avatar: const Icon(Icons.credit_card, size: 16, color: Colors.emerald),
                      label: Text(_ts.t('ypsOnlyLines')),
                      selectedColor: Colors.emerald,
                      labelStyle: TextStyle(
                        color: _filterYpsOnly ? Colors.white : Colors.emerald[800],
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                      onSelected: (val) {
                        setState(() => _filterYpsOnly = true);
                        _fetchBusLines();
                      },
                    ),
                  ],
                ),
              ] else ...[
                const SizedBox(height: 8),
                Align(
                  alignment: Alignment.centerLeft,
                  child: TextButton.icon(
                    onPressed: () {
                      setState(() {
                        _selectedBusNumber = null;
                        _routeDetail = null;
                      });
                    },
                    icon: const Icon(Icons.arrow_back, size: 18),
                    label: Text(
                      _ts.currentLanguage == 'my' ? 'ယာဉ်လိုင်းများ စာရင်းသို့ ပြန်သွားရန်' : 'Back to Bus Lines List',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),

        // Main List or Detail View
        Expanded(
          child: _selectedBusNumber != null
              ? _buildRouteDetailView()
              : _buildBusLinesListView(),
        ),
      ],
    );
  }

  Widget _buildBusLinesListView() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_busLines.isEmpty) {
      return Center(
        child: Text(
          _ts.currentLanguage == 'my' ? 'YBS ယာဉ်လိုင်း မတွေ့ရှိပါ' : 'No YBS bus lines found.',
          style: TextStyle(color: Colors.grey[600], fontWeight: FontWeight.bold),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: _busLines.length,
      itemBuilder: (context, index) {
        final bus = _busLines[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 10),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: ListTile(
            onTap: () => _selectBusLine(bus.busNumber),
            leading: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFEBF2F8),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'YBS ${bus.busNumber}',
                style: const TextStyle(
                  color: Color(0xFF1D5FA8),
                  fontWeight: FontWeight.w900,
                  fontSize: 14,
                ),
              ),
            ),
            title: Text(
              bus.outboundTitle ?? '',
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            subtitle: Row(
              children: [
                if (bus.isYpsSupported) ...[
                  Container(
                    margin: const EdgeInsets.only(top: 4),
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.emerald[50],
                      border: Border.all(color: Colors.emerald[200]!),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.check_circle, size: 12, color: Colors.emerald),
                        const SizedBox(width: 4),
                        Text(
                          _ts.t('ypsCardAccepted'),
                          style: const TextStyle(color: Colors.emerald, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
            trailing: const Icon(Icons.chevron_right),
          ),
        );
      },
    );
  }

  Widget _buildRouteDetailView() {
    if (_isLoadingRoute) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_routeDetail == null) {
      return Center(
        child: Text(
          _ts.currentLanguage == 'my' ? 'လမ်းကြောင်း အချက်အလက် မရှိပါ' : 'No route details available.',
        ),
      );
    }

    final stops = _selectedRouteTab == 0 ? _routeDetail!.outboundStops : _routeDetail!.returnStops;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey[200]!),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'YBS ${_routeDetail!.busNumber}',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.extrabold, color: Color(0xFF1D5FA8)),
                    ),
                    if (_routeDetail!.isYpsSupported)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.emerald[50],
                          border: Border.all(color: Colors.emerald[300]!),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          _ts.t('ypsCardAccepted'),
                          style: const TextStyle(color: Colors.emerald, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _selectedRouteTab == 0 ? const Color(0xFF1D5FA8) : Colors.grey[200],
                          foregroundColor: _selectedRouteTab == 0 ? Colors.white : Colors.black87,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        onPressed: () => setState(() => _selectedRouteTab = 0),
                        child: Text('${_ts.t('outboundRoute')} (${_routeDetail!.outboundStops.length})'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _selectedRouteTab == 1 ? const Color(0xFF1D5FA8) : Colors.grey[200],
                          foregroundColor: _selectedRouteTab == 1 ? Colors.white : Colors.black87,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        onPressed: () => setState(() => _selectedRouteTab = 1),
                        child: Text('${_ts.t('returnRoute')} (${_routeDetail!.returnStops.length})'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Route Stops Timeline List
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey[200]!),
            ),
            child: ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: stops.length,
              separatorBuilder: (context, index) => const Divider(height: 16),
              itemBuilder: (context, index) {
                final stop = stops[index];
                return Row(
                  children: [
                    CircleAvatar(
                      radius: 12,
                      backgroundColor: const Color(0xFF1D5FA8).withOpacity(0.1),
                      child: Text(
                        '${stop.sequenceOrder}',
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF1D5FA8)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(stop.stopName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          if (stop.roadTownship != null)
                            Text(stop.roadTownship!, style: TextStyle(fontSize: 11, color: Colors.grey[600])),
                        ],
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
