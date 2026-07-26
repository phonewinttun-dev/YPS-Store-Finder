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
  final int stopOrder;

  BusStopModel({
    required this.stopName,
    this.roadTownship,
    required this.stopOrder,
  });

  factory BusStopModel.fromJson(Map<String, dynamic> json) {
    return BusStopModel(
      stopName: json['stopName'] ?? json['StopName'] ?? json['stop_name'] ?? '',
      roadTownship: json['roadTownship'] ?? json['RoadTownship'],
      stopOrder: json['stopOrder'] ?? json['StopOrder'] ?? json['sequenceOrder'] ?? json['stop_order'] ?? 0,
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
    var outList = (json['outboundStops'] as List?)
            ?.map((e) => BusStopModel.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];
    var retList = (json['returnStops'] as List?)
            ?.map((e) => BusStopModel.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];

    return BusRouteDetailModel(
      busNumber: json['busNumber'] ?? '',
      routeId: json['routeId'] ?? '',
      isYpsSupported: json['isYpsSupported'] ?? false,
      outboundTitle: json['outboundTitle'],
      outboundStops: outList,
      returnTitle: json['returnTitle'],
      returnStops: retList,
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
      servicingBusNumbers: (json['servicingBusNumbers'] as List?)?.map((e) => e.toString()).toList() ?? [],
      ypsSupportedBusNumbers: (json['ypsSupportedBusNumbers'] as List?)?.map((e) => e.toString()).toList() ?? [],
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
    var list = (json['nearbyBusStops'] as List?)
            ?.map((e) => NearbyBusStopItemModel.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];
    return StoreNearbyBusStopsModel(
      storeId: json['storeId'] ?? 0,
      storeName: json['storeName'] ?? '',
      township: json['township'],
      nearbyBusStops: list,
    );
  }
}
