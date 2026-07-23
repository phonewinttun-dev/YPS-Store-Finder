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

class PaginationModel {
  final int pageNumber;
  final int pageSize;
  final int totalCount;
  final int totalPages;
  final bool hasPreviousPage;
  final bool hasNextPage;

  PaginationModel({
    required this.pageNumber,
    required this.pageSize,
    required this.totalCount,
    required this.totalPages,
    required this.hasPreviousPage,
    required this.hasNextPage,
  });

  factory PaginationModel.fromJson(Map<String, dynamic> json) {
    return PaginationModel(
      pageNumber: json['pageNumber'] ?? 1,
      pageSize: json['pageSize'] ?? 10,
      totalCount: json['totalCount'] ?? 0,
      totalPages: json['totalPages'] ?? 0,
      hasPreviousPage: json['hasPreviousPage'] ?? false,
      hasNextPage: json['hasNextPage'] ?? false,
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

class PagedResultModel<T> {
  final bool isSuccess;
  final String message;
  final List<T> data;
  final PaginationModel? pagination;

  PagedResultModel({
    required this.isSuccess,
    required this.message,
    required this.data,
    this.pagination,
  });

  factory PagedResultModel.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic itemJson) fromDataJson,
  ) {
    var list = <T>[];
    if (json['data'] != null && json['data'] is List) {
      list = (json['data'] as List).map((item) => fromDataJson(item)).toList();
    }
    return PagedResultModel<T>(
      isSuccess: json['isSuccess'] ?? false,
      message: json['message'] ?? '',
      data: list,
      pagination: json['pagination'] != null ? PaginationModel.fromJson(json['pagination']) : null,
    );
  }
}
