import 'dart:convert';
import 'dart:developer';

import 'package:get/get.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/ui/select_address_screen/model/address_select_or_not_model.dart';
import 'package:salon_2/ui/select_address_screen/model/get_all_address_model.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/utils/utils.dart';
import 'package:http/http.dart' as http;

class SelectAddressController extends GetxController {
  dynamic args = Get.arguments;
  int selectAddress = -1;
  String? firstName;
  String? lastName;
  String? address1;
  String? address2;
  String? totalAmount;

  String? productId;
  int? quantity;
  List<Map<String, dynamic>>? attributes;
  bool? withoutCart;

  @override
  void onInit() async {
    await getDataFromArgs();
    await onGetAllAddressApiCall();
    super.onInit();
  }

  getDataFromArgs() {
    if (args != null) {
      if (args[0] != null || args[1] != null || args[2] != null || args[3] != null || args[4] != null) {
        totalAmount = args[0];
        productId = args[1];
        quantity = args[2];
        attributes = args[3];
        withoutCart = args[4];
      }
      log("Total Amount :: $totalAmount");
      log("Product Id :: $productId");
      log("Quantity :: $quantity");
      log("Attributes :: $attributes");
      log("WithoutCart :: $withoutCart");
    }
  }

  onSelectAddress({required int index, required String addressId}) async {
    await onAddressSelectOrNotApiCall(
      userId: Constant.storage.read<String>('userId') ?? "",
      addressId: addressId,
    );

    if (selectAddress == index) {
      selectAddress = -1;
    } else {
      selectAddress = index;
    }

    update([Constant.idSelectAddress, Constant.idProgressView]);
  }

  onGetName({required String name}) {
    List<String> parts = name.split(' ');
    firstName = parts[0];
    lastName = parts.sublist(1).join(' ');

    log('First Name :: $firstName');
    log('Last Name :: $lastName');
  }

  onGetAddress({required String address}) {
    List<String> parts = address.split(',');
    address1 = parts[0];
    address2 = parts.sublist(1).join(' ');

    log('Address 1 :: $address1');
    log('Address 2 :: $address2');
  }

  onEditAddress() {
    onGetName(name: getAllAddressModel?.address?[selectAddress].name ?? "");
    onGetAddress(address: getAllAddressModel?.address?[selectAddress].address ?? "");

    Get.toNamed(
      AppRoutes.addNewAddress,
      arguments: [
        firstName,
        lastName,
        address1,
        address2,
        getAllAddressModel?.address?[selectAddress].city,
        getAllAddressModel?.address?[selectAddress].state,
        getAllAddressModel?.address?[selectAddress].country,
        getAllAddressModel?.address?[selectAddress].zipCode.toString(),
        true,
        getAllAddressModel?.address?[selectAddress].isSelect,
        getAllAddressModel?.address?[selectAddress].id,
      ],
    )?.then(
      (value) async {
        await onGetAllAddressApiCall();
      },
    );
  }

  //----------- API Variables -----------//
  GetAllAddressModel? getAllAddressModel;
  AddressSelectOrNotModel? addressSelectOrNotModel;
  RxBool isLoading = false.obs;

  onGetAllAddressApiCall() async {
    try {
      isLoading(true);
      update([Constant.idSelectAddress, Constant.idProgressView]);

      final queryParameters = {"userId": Constant.storage.read<String>('userId') ?? ""};

      String queryString = Uri(queryParameters: queryParameters).query;

      log("Get All Address Params :: $queryParameters");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.getAllAddress + queryString);
      log("Get All Address Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Get All Address Headers :: $headers");

      final response = await http.get(url, headers: headers);

      log("Get All Address StatusCode :: ${response.statusCode}");
      log("Get All Address Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        getAllAddressModel = GetAllAddressModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Get All Address Api :: $e");
    } finally {
      isLoading(false);
      update([Constant.idSelectAddress, Constant.idProgressView]);
    }
  }

  onAddressSelectOrNotApiCall({required String userId, required String addressId}) async {
    try {
      // isLoading(true);
      update([Constant.idSelectAddress, Constant.idProgressView]);

      final queryParameters = {
        "userId": userId,
        "addressId": addressId,
      };

      String queryString = Uri(queryParameters: queryParameters).query;

      log("Address Select Or Not Params :: $queryParameters");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.selectAddressOrNot + queryString);
      log("Address Select Or Not Url :: $url");

      final headers = {"key": ApiConstant.SECRET_KEY, 'Content-Type': 'application/json'};
      log("Address Select Or Not Headers :: $headers");

      final response = await http.patch(url, headers: headers);

      log("Address Select Or Not StatusCode :: ${response.statusCode}");
      log("Address Select Or Not Body :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        addressSelectOrNotModel = AddressSelectOrNotModel.fromJson(jsonResponse);
      }
    } on AppException catch (exception) {
      Utils.showToast(Get.context!, exception.message);
    } catch (e) {
      log("Error call Address Select Or Not Api :: $e");
    } finally {
      // isLoading(false);
      update([Constant.idSelectAddress, Constant.idProgressView]);
    }
  }
}
