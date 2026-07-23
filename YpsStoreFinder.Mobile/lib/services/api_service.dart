import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/store_model.dart';

class ApiService {
  static String get baseUrl {
    const envUrl = String.fromEnvironment('API_URL');
    if (envUrl.isNotEmpty) {
      return envUrl;
    }
    if (kIsWeb) {
      return 'http://localhost:5257';
    }
    return 'http://10.0.2.2:5257';
  }

  // Returns ALL stores (cached on backend) for complete map rendering
  Future<ApiResultModel<List<StoreModel>>> getStores({String? category}) async {
    final Map<String, String> queryParams = {};
    if (category != null && category.isNotEmpty) queryParams['category'] = category;

    final uri = Uri.parse('$baseUrl/api/stores').replace(queryParameters: queryParams.isNotEmpty ? queryParams : null);

    try {
      final response = await http.get(uri);
      if (response.statusCode == 200) {
        final jsonMap = json.decode(response.body);
        return ApiResultModel.fromJson(
          jsonMap,
          (data) => (data as List).map((item) => StoreModel.fromJson(item)).toList(),
        );
      }
      return ApiResultModel(isSuccess: false, message: 'Server returned HTTP ${response.statusCode}');
    } catch (e) {
      return ApiResultModel(isSuccess: false, message: 'Network error: $e');
    }
  }

  // Paginated search results
  Future<PagedResultModel<StoreModel>> searchStores({
    String? query,
    String? category,
    int pageNumber = 1,
    int pageSize = 10,
  }) async {
    final Map<String, String> queryParams = {
      'pageNumber': pageNumber.toString(),
      'pageSize': pageSize.toString(),
    };
    if (query != null && query.isNotEmpty) queryParams['query'] = query;
    if (category != null && category.isNotEmpty) queryParams['category'] = category;

    final uri = Uri.parse('$baseUrl/api/stores/search').replace(queryParameters: queryParams);

    try {
      final response = await http.get(uri);
      if (response.statusCode == 200) {
        final jsonMap = json.decode(response.body);
        return PagedResultModel.fromJson(jsonMap, (item) => StoreModel.fromJson(item));
      }
      return PagedResultModel(isSuccess: false, message: 'Server returned HTTP ${response.statusCode}', data: []);
    } catch (e) {
      return PagedResultModel(isSuccess: false, message: 'Network error: $e', data: []);
    }
  }

  Future<ApiResultModel<List<CategorySummaryModel>>> getCategoriesSummary() async {
    final uri = Uri.parse('$baseUrl/api/stores/categories');

    try {
      final response = await http.get(uri);
      if (response.statusCode == 200) {
        final jsonMap = json.decode(response.body);
        return ApiResultModel.fromJson(
          jsonMap,
          (data) => (data as List).map((item) => CategorySummaryModel.fromJson(item)).toList(),
        );
      }
      return ApiResultModel(isSuccess: false, message: 'Server returned HTTP ${response.statusCode}');
    } catch (e) {
      return ApiResultModel(isSuccess: false, message: 'Network error: $e');
    }
  }

  // Paginated geo-spatial nearby results
  Future<PagedResultModel<StoreModel>> getNearbyStores({
    required double latitude,
    required double longitude,
    double radiusKm = 5.0,
    String? category,
    int pageNumber = 1,
    int pageSize = 10,
  }) async {
    final Map<String, String> queryParams = {
      'latitude': latitude.toString(),
      'longitude': longitude.toString(),
      'radiusKm': radiusKm.toString(),
      'pageNumber': pageNumber.toString(),
      'pageSize': pageSize.toString(),
    };
    if (category != null && category.isNotEmpty) queryParams['category'] = category;

    final uri = Uri.parse('$baseUrl/api/stores/nearby').replace(queryParameters: queryParams);

    try {
      final response = await http.get(uri);
      if (response.statusCode == 200) {
        final jsonMap = json.decode(response.body);
        return PagedResultModel.fromJson(jsonMap, (item) => StoreModel.fromJson(item));
      }
      return PagedResultModel(isSuccess: false, message: 'Server returned HTTP ${response.statusCode}', data: []);
    } catch (e) {
      return PagedResultModel(isSuccess: false, message: 'Network error: $e', data: []);
    }
  }
}
