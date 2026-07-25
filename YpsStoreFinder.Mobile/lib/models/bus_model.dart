class BusLineModel {
  final String busNumber;
  final String routeId;
  final bool isYpsSupported;
  final String? outboundTitle;
  final int outboundTotalStops;
  final String? returnTitle;
  final int returnTotalStops;

  BusLineModel({
    required this.busNumber,
    required this.routeId,
    required this.isYpsSupported,
    this.outboundTitle,
    required this.outboundTotalStops,
    this.returnTitle,
    required this.returnTotalStops,
  });

  factory BusLineModel.fromJson(Map<String, dynamic> json) {
    return BusLineModel(
      busNumber: json['busNumber'] ?? '',
      routeId: json['routeId'] ?? '',
      isYpsSupported: json['isYpsSupported'] ?? false,
      outboundTitle: json['outboundTitle'],
      outboundTotalStops: json['outboundTotalStops'] ?? 0,
      returnTitle: json['returnTitle'],
      returnTotalStops: json['returnTotalStops'] ?? 0,
    );
  }
}

class BusStopModel {
  final String stopName;
  final String? roadTownship;
  final int sequenceOrder;

  BusStopModel({
    required this.stopName,
    this.roadTownship,
    required this.sequenceOrder,
  });

  factory BusStopModel.fromJson(Map<String, dynamic> json) {
    return BusStopModel(
      stopName: json['stopName'] ?? '',
      roadTownship: json['roadTownship'],
      sequenceOrder: json['sequenceOrder'] ?? 0,
    );
  }
}

class BusRouteDetailModel {
  final String busNumber;
  final String routeId;
  final bool isYpsSupported;
  final String? outboundTitle;
  final List<BusStopModel> outboundStops;
  final String? returnTitle;
  final List<BusStopModel> returnStops;

  BusRouteDetailModel({
    required this.busNumber,
    required this.routeId,
    required this.isYpsSupported,
    this.outboundTitle,
    required this.outboundStops,
    this.returnTitle,
    required this.returnStops,
  });

  factory BusRouteDetailModel.fromJson(Map<String, dynamic> json) {
    return BusRouteDetailModel(
      busNumber: json['busNumber'] ?? '',
      routeId: json['routeId'] ?? '',
      isYpsSupported: json['isYpsSupported'] ?? false,
      outboundTitle: json['outboundTitle'],
      outboundStops: (json['outboundStops'] as List? ?? [])
          .map((item) => BusStopModel.fromJson(item))
          .toList(),
      returnTitle: json['returnTitle'],
      returnStops: (json['returnStops'] as List? ?? [])
          .map((item) => BusStopModel.fromJson(item))
          .toList(),
    );
  }
}

class NearbyBusStopItemModel {
  final String stopName;
  final String? roadTownship;
  final List<String> servicingBusNumbers;
  final List<String> ypsSupportedBusNumbers;

  NearbyBusStopItemModel({
    required this.stopName,
    this.roadTownship,
    required this.servicingBusNumbers,
    required this.ypsSupportedBusNumbers,
  });

  factory NearbyBusStopItemModel.fromJson(Map<String, dynamic> json) {
    return NearbyBusStopItemModel(
      stopName: json['stopName'] ?? '',
      roadTownship: json['roadTownship'],
      servicingBusNumbers: (json['servicingBusNumbers'] as List? ?? [])
          .map((e) => e.toString())
          .toList(),
      ypsSupportedBusNumbers: (json['ypsSupportedBusNumbers'] as List? ?? [])
          .map((e) => e.toString())
          .toList(),
    );
  }
}

class StoreNearbyBusStopsModel {
  final int storeId;
  final String storeName;
  final String? township;
  final List<NearbyBusStopItemModel> nearbyBusStops;

  StoreNearbyBusStopsModel({
    required this.storeId,
    required this.storeName,
    this.township,
    required this.nearbyBusStops,
  });

  factory StoreNearbyBusStopsModel.fromJson(Map<String, dynamic> json) {
    return StoreNearbyBusStopsModel(
      storeId: json['storeId'] ?? 0,
      storeName: json['storeName'] ?? '',
      township: json['township'],
      nearbyBusStops: (json['nearbyBusStops'] as List? ?? [])
          .map((item) => NearbyBusStopItemModel.fromJson(item))
          .toList(),
    );
  }
}
