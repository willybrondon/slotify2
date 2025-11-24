class VerifyMobileModel {
  bool? status;
  String? message;
  String? messageSid;
  String? error;

  VerifyMobileModel({this.status, this.message, this.messageSid, this.error});

  VerifyMobileModel.fromJson(Map<String, dynamic> json) {
    status = json['status'];
    message = json['message'];
    messageSid = json['messageSid'];
    error = json['error'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['status'] = status;
    data['message'] = message;
    data['messageSid'] = messageSid;
    data['error'] = error;
    return data;
  }
}
