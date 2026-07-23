class StoreModel {
  final int id;
  final String category;
  final String name;
  final double latitude;
  final double longitude;
  final String? address;
  final String? description;
  final String? rawAttributes;
  final double? distanceKm;

  StoreModel({
    required this.id,
    required this.category,
    required this.name,
    required this.latitude,
    required this.longitude,
    this.address,
    this.description,
    this.rawAttributes,
    this.distanceKm,
  });

  factory StoreModel.fromJson(Map<String, dynamic> json) {
    return StoreModel(
      id: json['id'] ?? 0,
      category: json['category'] ?? 'Uncategorized',
      name: json['name'] ?? 'Store',
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      address: json['address'],
      description: json['description'],
      rawAttributes: json['rawAttributes'],
      distanceKm: json['distanceKm'] != null ? (json['distanceKm'] as num).toDouble() : null,
    );
  }
}

class CategorySummaryModel {
  final String category;
  final int count;

  CategorySummaryModel({
    required this.category,
    required this.count,
  });

  factory CategorySummaryModel.fromJson(Map<String, dynamic> json) {
    return CategorySummaryModel(
      category: json['category'] ?? '',
      count: json['count'] ?? 0,
    );
  }
}

class ApiResultModel<T> {
  final bool isSuccess;
  final String message;
  final T? data;

  ApiResultModel({
    required this.isSuccess,
    required this.message,
    this.data,
  });

  factory ApiResultModel.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic dataJson) fromDataJson,
  ) {
    return ApiResultModel<T>(
      isSuccess: json['isSuccess'] ?? false,
      message: json['message'] ?? '',
      data: json['data'] != null ? fromDataJson(json['data']) : null,
    );
  }
}
