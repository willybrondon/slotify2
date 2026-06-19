import 'dart:async';
import 'dart:convert';
import 'dart:developer' as dev;
import 'dart:io';
import 'dart:math';
import 'package:crypto/crypto.dart';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'package:salon_2/main.dart';
import 'package:salon_2/routes/app_routes.dart';
import 'package:salon_2/ui/edit_profile_screen/controller/edit_profile_controller.dart';
import 'package:salon_2/ui/login_screen/login_screen/controller/login_screen_controller.dart';
import 'package:salon_2/ui/login_screen/sign_in_screen/model/check_user_model.dart';
import 'package:salon_2/ui/profile_screen/controller/profile_screen_controller.dart';
import 'package:salon_2/utils/api_constant.dart';
import 'package:http/http.dart' as http;
import 'package:salon_2/utils/constant.dart';
import 'package:salon_2/services/app_exception/app_exception.dart';
import 'package:salon_2/utils/utils.dart';

class SignInController extends GetxController {
  final LoginScreenController loginScreenController =
      Get.find<LoginScreenController>();
  final ProfileScreenController profileScreenController =
      Get.put(ProfileScreenController());
  final EditProfileScreenController editProfileScreenController =
      Get.put(EditProfileScreenController());

  bool isLogIn = Constant.storage.read<bool>('isLogIn') ?? false;
  bool? isDataSelected;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  final formKey = GlobalKey<FormState>();
  bool isRemember = false;
  TextEditingController emailController = TextEditingController();
  TextEditingController passwordController = TextEditingController();
  final GoogleSignIn googleSignIn = GoogleSignIn();
  GoogleSignInAccount? _user;
  bool isShowProgress = false;
  bool isObscure = false;

  //----------- API Variables -----------//
  CheckUserModel? checkUserCategory;
  RxBool isLoading = false.obs;

  @override
  void onInit() async {
    await getDataFromArgs();

    /// Google Controller
    _user = await googleSignIn.signInSilently();
    super.onInit();
  }

  getDataFromArgs() {
    dynamic args = Get.arguments;

    dev.log("Sign In Args :: $args");
    dev.log("Sign In Arguments :: ${Get.arguments}");

    if (args != null) {
      if (args[0] != null) {
        isDataSelected = args[0];
      }
    } else {
      isDataSelected = false;

      dev.log("Sign in Controller args :: $isDataSelected");
    }
    update([Constant.idProgressView]);
  }

  /// Sign In Controller

  onRememberClick() {
    isRemember = !isRemember;
    update([Constant.idRemember]);
  }

  onClickObscure() {
    isObscure = !isObscure;
    update();
  }

  bool isEmailValid(String email) {
    final emailRegex = RegExp(r'^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$');
    return emailRegex.hasMatch(email);
  }

  onClickSignIn() async {
    if (formKey.currentState!.validate()) {
      await onCheckUseApiCall(
        email: emailController.text.trim(),
        loginType: "1",
        password: passwordController.text.trim(),
      );

      try {
        isLoading(true);
        update([Constant.idProgressView]);

        if (checkUserCategory?.status == true) {
          if (checkUserCategory?.isLogin == true) {
            await loginScreenController.onLoginApiCall(
              loginType: "1",
              email: emailController.text,
              fcmToken: fcmToken!,
              password: passwordController.text,
            );
            dev.log(
                "isLogin :: ${loginScreenController.loginCategory?.user?.isUpdate}");
            dev.log(
                "isLogin :: ${loginScreenController.loginCategory?.user?.isUpdate}");

            if (loginScreenController.loginCategory!.status == true) {
              // Utils.showToast(Get.context!,
              //     ">>>>>>>>>>>>>${loginScreenController.loginCategory?.user?.id}");
              // log(">>>>>>>>>>>>>${loginScreenController.loginCategory?.user?.id}");
              Utils.showToast(Get.context!, "desLoginSuccess".tr);
              Constant.storage.write('isLogIn', true);
              Constant.storage.write(
                  'userId', loginScreenController.loginCategory?.user?.id);
              Constant.storage.write('mobileNumber',
                  loginScreenController.loginCategory?.user?.mobile.toString());
              Constant.storage.write('isUpdate',
                  loginScreenController.loginCategory?.user?.isUpdate);

              dev.log(
                  "is LogIn Controller :: ${Constant.storage.read<bool>('isLogIn')}");
              dev.log(
                  "is Update Controller :: ${Constant.storage.read<bool>('isUpdate')}");

              await profileScreenController.onGetUserApiCall(loginType: 1);
              if (profileScreenController.getUserCategory?.status == true) {
                Constant.storage.write('userId',
                    profileScreenController.getUserCategory?.user?.id);
                Constant.storage.write('userImage',
                    profileScreenController.getUserCategory?.user?.image);
                Constant.storage.write('fName',
                    profileScreenController.getUserCategory?.user?.fname);
                Constant.storage.write('lName',
                    profileScreenController.getUserCategory?.user?.lname);

                isLogIn = true;

                if (isDataSelected == true) {
                  Get.back();
                  Constant.storage.write('isUpdate', true);
                } else {
                  Get.offAllNamed(AppRoutes.bottom);
                  Constant.storage.write('isUpdate', true);
                }

                editProfileScreenController.signOnTap();
                update([Constant.idBookingAndLogin]);
              } else {
                Utils.showToast(Get.context!,
                    profileScreenController.getUserCategory?.message ?? "");
              }
            } else {
              Utils.showToast(Get.context!,
                  loginScreenController.loginCategory?.message ?? "");
            }

            dev.log("Log in Successfully");
          } else {
            Utils.showToast(Get.context!, checkUserCategory?.message ?? "");
          }
        } else {
          Utils.showToast(Get.context!, checkUserCategory?.message ?? "");
        }
      } catch (e) {
        dev.log("Error in Sign In :: $e");
      } finally {
        isLoading(false);
        update([Constant.idProgressView]);
      }
    }
  }

  onCheckUseApiCall(
      {required String email,
      required String loginType,
      required String password}) async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      final body = json.encode(
          {"email": email, "loginType": loginType, "password": password});

      dev.log("Check User Body :: $body");

      final url = Uri.parse(ApiConstant.BASE_URL + ApiConstant.checkUser);
      dev.log("Check User Url :: $url");

      final headers = {
        "key": ApiConstant.SECRET_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'MultiSalonCustomer/1.0',
      };

      dev.log("Check User Headers :: $headers");

      final response = await http
          .post(url, headers: headers, body: body)
          .timeout(const Duration(seconds: 30));

      dev.log("Check User Status Code :: ${response.statusCode}");
      dev.log("Check User Response :: ${response.body}");

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        checkUserCategory = CheckUserModel.fromJson(jsonResponse);
        dev.log("Check User successful: ${checkUserCategory?.status}");
      } else {
        dev.log("Check User failed with status code: ${response.statusCode}");
        Utils.showToast(Get.context!, "desCheckUserFailed".tr);
      }
    } on AppException catch (exception) {
      dev.log("App Exception in Check User: ${exception.message}");
      Utils.showToast(Get.context!, exception.message);
    } on SocketException catch (e) {
      dev.log("Network error in Check User: $e");
      Utils.showToast(Get.context!,
          "Network connection error. Please check your internet connection.");
    } on HandshakeException catch (e) {
      dev.log("SSL Handshake error in Check User: $e");
      Utils.showToast(Get.context!, "desSslConnectionError".tr);
    } on TimeoutException catch (e) {
      dev.log("Timeout error in Check User: $e");
      Utils.showToast(Get.context!,
          "Request timeout. Please check your connection and try again.");
    } catch (e) {
      dev.log("Error call Check User Api :: $e");
      Utils.showToast(Get.context!, 'desConnectionError'.tr);
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  /// Google Controller ===========================>

  GoogleSignInAccount? get user => _user;

  Future<GoogleSignInAccount?> signInWithGoogle() async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);
      GoogleSignInAccount? googleSignInAccount = await googleSignIn.signIn();

      final name = googleSignInAccount?.displayName;

      if (googleSignInAccount != null) {
        GoogleSignInAuthentication googleSignInAuthentication =
            await googleSignInAccount.authentication;

        dev.log(
            "googleSignInAuthentication.accessToken :: ${googleSignInAuthentication.accessToken}");

        AuthCredential credential = GoogleAuthProvider.credential(
          accessToken: googleSignInAuthentication.accessToken,
          idToken: googleSignInAuthentication.idToken,
        );
        UserCredential? userCredential =
            await _auth.signInWithCredential(credential).catchError((onErr) {
          return Utils.showToast(Get.context!, onErr.toString());
        });

        if (userCredential.user != null) {
          await loginScreenController.onLoginApiCall(
              loginType: "2",
              email: userCredential.user?.email,
              fcmToken: fcmToken!,
              password: "",
              mobile: "",
              age: "");

          if (loginScreenController.loginCategory?.status == true) {
            dev.log(
                "isLogin :: ${loginScreenController.loginCategory?.user?.isUpdate}");
            Utils.showToast(Get.context!, "desUserLoginSuccess".tr);

            await Constant.storage.write('isGoogle', true);
            await Constant.storage
                .write('userId', loginScreenController.loginCategory?.user?.id);
            Constant.storage.write(
                'email', loginScreenController.loginCategory?.user?.email);

            dev.log(
                "is LogIn Controller :: ${Constant.storage.read<bool>('isLogIn')}");
            dev.log("Email is :: ${Constant.storage.read<String>('email')}");
            dev.log(
                "Google Login is :: ${Constant.storage.read<bool>('isGoogle')}");
            dev.log(
                "is Update Controller :: ${Constant.storage.read<bool>('isUpdate')}");

            if (loginScreenController.loginCategory?.user?.isUpdate == false) {
              Constant.storage.write('userImage',
                  profileScreenController.getUserCategory?.user?.image);

              try {
                editProfileScreenController.isLoading(true);
                update([Constant.idBookingAndLogin, Constant.idProgressView]);

                await editProfileScreenController.onUpdateUserApiCall(
                  fName: name ?? "",
                  lName: "",
                  email: Constant.storage.read<String>('email').toString(),
                  age: "",
                  mobile:
                      loginScreenController.loginCategory?.user?.mobile ?? "",
                  gender: "Male",
                  bio: "",
                  selectImageFile: "",
                );

                if (editProfileScreenController.updateUserCategory != null &&
                    editProfileScreenController.updateUserCategory?.status ==
                        true) {
                  Constant.storage.write('isUpdate', true);
                  loginScreenController.isUpdate =
                      Constant.storage.read<bool>('isUpdate')!;

                  await profileScreenController.onGetUserApiCall();
                  if (profileScreenController.getUserCategory?.status == true) {
                    Constant.storage.write('userId',
                        profileScreenController.getUserCategory?.user?.id);
                    Constant.storage.write('userImage',
                        profileScreenController.getUserCategory?.user?.image);
                    Constant.storage.write(
                        'salonRequestSent',
                        profileScreenController
                            .getUserCategory?.user?.salonRequestSent);
                    Constant.storage.write('fName',
                        profileScreenController.getUserCategory?.user?.fname);
                    Constant.storage.write('lName',
                        profileScreenController.getUserCategory?.user?.lname);

                    if (isDataSelected == true) {
                      dev.log("enter first google service selected if");

                      Get.back();
                      Constant.storage.write('isLogIn', true);
                      Constant.storage.write('isUpdate', true);
                      // isLogIn = true;
                    } else {
                      dev.log("enter first google service else");
                      Get.offAllNamed(AppRoutes.bottom);
                      Constant.storage.write('isLogIn', true);
                      Constant.storage.write('isUpdate', true);
                      // isLogIn = true;
                    }

                    editProfileScreenController.signOnTap();
                    update([Constant.idBookingAndLogin]);
                  } else {
                    Utils.showToast(
                        Get.context!,
                        profileScreenController.getUserCategory?.message
                                .toString() ??
                            "");
                  }
                } else {
                  Utils.showToast(
                      Get.context!,
                      editProfileScreenController.updateUserCategory?.message
                              .toString() ??
                          "");
                }
              } catch (e) {
                dev.log("Error In Google Login Update :: $e");
              } finally {
                editProfileScreenController.isLoading(false);
                update([Constant.idBookingAndLogin, Constant.idProgressView]);
              }
            } else {
              await profileScreenController.onGetUserApiCall();
              if (profileScreenController.getUserCategory?.status == true) {
                Constant.storage.write('userId',
                    profileScreenController.getUserCategory?.user?.id);
                Constant.storage.write('userImage',
                    profileScreenController.getUserCategory?.user?.image);
                Constant.storage.write('fName',
                    profileScreenController.getUserCategory?.user?.fname);
                Constant.storage.write('lName',
                    profileScreenController.getUserCategory?.user?.lname);
                Constant.storage.write(
                    'salonRequestSent',
                    profileScreenController
                        .getUserCategory?.user?.salonRequestSent);

                dev.log("Sign in data selected :: $isDataSelected");
                if (isDataSelected == true) {
                  dev.log("enter second google service selected if");

                  Get.back();
                  Constant.storage.write('isLogIn', true);
                  Constant.storage.write('isUpdate', true);
                } else {
                  dev.log("enter second google service else");

                  Get.offAllNamed(AppRoutes.bottom);
                  Constant.storage.write('isLogIn', true);
                  Constant.storage.write('isUpdate',
                      loginScreenController.loginCategory?.user?.isUpdate);
                }
              }
            }
          } else {
            Utils.showToast(Get.context!,
                loginScreenController.loginCategory?.message ?? "");
          }
        } else {
          Utils.showToast(Get.context!,
              profileScreenController.getUserCategory?.message ?? "");
        }

        dev.log('success signing in with Google');
      } else {
        dev.log('Error signing in with Google');
      }
    } catch (error) {
      dev.log('Error signing in with Google: $error');
      return null;
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
    return null;
  }

  /// Apple Sign In Controller ===========================>

  /// Generates a cryptographically secure random nonce
  String generateNonce([int length = 32]) {
    const charset =
        '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._';
    final random = Random.secure();
    return List.generate(length, (_) => charset[random.nextInt(charset.length)])
        .join();
  }

  /// Returns the sha256 hash of [input] in hex notation
  String sha256ofString(String input) {
    final bytes = utf8.encode(input);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }

  Future<User?> signInWithApple() async {
    try {
      isLoading(true);
      update([Constant.idProgressView]);

      dev.log("Starting Apple Sign In process...");

      // Check if we're on iOS
      if (!Platform.isIOS) {
        Utils.showToast(Get.context!,
            "Sign in with Apple is only available on iOS devices");
        return null;
      }

      // Check if Sign in with Apple is available
      final isAvailable = await SignInWithApple.isAvailable();
      dev.log("Apple Sign In available: $isAvailable");

      if (!isAvailable) {
        Utils.showToast(Get.context!,
            "Sign in with Apple is not available on this device. Please ensure you're signed into iCloud.");
        return null;
      }

      // Generate nonce for security
      final rawNonce = generateNonce();
      final nonce = sha256ofString(rawNonce);

      // Request Apple ID credential
      final appleCredential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
        nonce: nonce,
      );

      dev.log("Apple Credential :: $appleCredential");
      dev.log("Apple Email :: ${appleCredential.email}");
      dev.log("Apple Given Name :: ${appleCredential.givenName}");
      dev.log("Apple Family Name :: ${appleCredential.familyName}");

      // Create Firebase credential
      final oauthCredential = OAuthProvider("apple.com").credential(
        idToken: appleCredential.identityToken,
        rawNonce: rawNonce,
      );

      // Sign in to Firebase
      UserCredential userCredential =
          await _auth.signInWithCredential(oauthCredential);

      if (userCredential.user != null) {
        User user = userCredential.user!;

        // Apple may not always provide email on subsequent logins
        String? email = appleCredential.email ?? user.email;

        // Construct full name from Apple credentials
        String? fullName;
        if (appleCredential.givenName != null ||
            appleCredential.familyName != null) {
          fullName =
              '${appleCredential.givenName ?? ''} ${appleCredential.familyName ?? ''}'
                  .trim();
        }

        dev.log("Apple User Email :: $email");
        dev.log("Apple User Name :: $fullName");

        // Call login API with loginType "4" for Apple
        await loginScreenController.onLoginApiCall(
          loginType: "4", // Apple login type
          email: email ?? user.uid, // Use UID if email is not available
          fcmToken: fcmToken!,
          password: "",
          mobile: "",
          age: "",
        );

        if (loginScreenController.loginCategory?.status == true) {
          dev.log(
              "isLogin :: ${loginScreenController.loginCategory?.user?.isUpdate}");
          Utils.showToast(Get.context!, "desAppleSignInSuccess".tr);

          await Constant.storage.write('isApple', true);
          await Constant.storage
              .write('userId', loginScreenController.loginCategory?.user?.id);
          Constant.storage
              .write('email', loginScreenController.loginCategory?.user?.email);

          dev.log(
              "is LogIn Controller :: ${Constant.storage.read<bool>('isLogIn')}");
          dev.log("Email is :: ${Constant.storage.read<String>('email')}");
          dev.log(
              "Apple Login is :: ${Constant.storage.read<bool>('isApple')}");
          dev.log(
              "is Update Controller :: ${Constant.storage.read<bool>('isUpdate')}");

          // Handle profile update flow
          if (loginScreenController.loginCategory?.user?.isUpdate == false) {
            Constant.storage.write('userImage',
                profileScreenController.getUserCategory?.user?.image);

            try {
              editProfileScreenController.isLoading(true);
              editProfileScreenController.update([Constant.idProgressView]);

              // If Apple provided a name, pre-fill it
              if (fullName != null && fullName.isNotEmpty) {
                List<String> nameParts = fullName.split(' ');
                editProfileScreenController.fNameEditingController.text =
                    nameParts.first;
                if (nameParts.length > 1) {
                  editProfileScreenController.lNameEditingController.text =
                      nameParts.sublist(1).join(' ');
                }
              }

              if (email != null) {
                editProfileScreenController.emailEditingController.text = email;
              }

              editProfileScreenController.isLoading(false);
              editProfileScreenController.update([Constant.idProgressView]);

              Get.offAllNamed(AppRoutes.editProfile);

              Constant.storage.write('isLogIn', true);
              Constant.storage.write('isUpdate',
                  loginScreenController.loginCategory?.user?.isUpdate);
            } catch (e) {
              dev.log("Error in Edit Profile :: $e");
              editProfileScreenController.isLoading(false);
              editProfileScreenController.update(
                  [Constant.idBookingAndLogin, Constant.idProgressView]);
            }
          } else {
            // User profile is already complete
            await profileScreenController.onGetUserApiCall();
            if (profileScreenController.getUserCategory?.status == true) {
              Constant.storage.write(
                  'userId', profileScreenController.getUserCategory?.user?.id);
              Constant.storage.write('userImage',
                  profileScreenController.getUserCategory?.user?.image);
              Constant.storage.write('fName',
                  profileScreenController.getUserCategory?.user?.fname);
              Constant.storage.write('lName',
                  profileScreenController.getUserCategory?.user?.lname);
              Constant.storage.write(
                  'salonRequestSent',
                  profileScreenController
                      .getUserCategory?.user?.salonRequestSent);

              dev.log("Sign in data selected :: $isDataSelected");
              if (isDataSelected == true) {
                dev.log("enter second apple service selected if");
                Get.back();
                Constant.storage.write('isLogIn', true);
                Constant.storage.write('isUpdate', true);
              } else {
                dev.log("enter second apple service else");
                Get.offAllNamed(AppRoutes.bottom);
                Constant.storage.write('isLogIn', true);
                Constant.storage.write('isUpdate',
                    loginScreenController.loginCategory?.user?.isUpdate);
              }
            }
          }
        } else {
          Utils.showToast(Get.context!,
              loginScreenController.loginCategory?.message ?? "Login failed");
        }

        dev.log('Success signing in with Apple');
        return user;
      } else {
        Utils.showToast(Get.context!, "desAppleSignInFailed".tr);
        dev.log('Apple sign in failed - no user');
        return null;
      }
    } on SignInWithAppleAuthorizationException catch (e) {
      dev.log('Apple Sign In Authorization Error: ${e.code} - ${e.message}');
      dev.log('Error details: $e');

      if (e.code == AuthorizationErrorCode.canceled) {
        Utils.showToast(Get.context!, "desSignInCancelled".tr);
      } else if (e.code == AuthorizationErrorCode.failed) {
        Utils.showToast(Get.context!,
            "Sign in failed. Please ensure Sign in with Apple is enabled in Settings.");
      } else if (e.code == AuthorizationErrorCode.invalidResponse) {
        Utils.showToast(
            Get.context!, "Invalid response from Apple. Please try again.");
      } else if (e.code == AuthorizationErrorCode.notHandled) {
        Utils.showToast(
            Get.context!, "Sign in not handled. Please contact support.");
      } else if (e.code == AuthorizationErrorCode.unknown) {
        Utils.showToast(Get.context!,
            "Apple Sign In error. Please check: 1) You're on real device 2) Signed into iCloud 3) iOS 13+");
      } else {
        Utils.showToast(Get.context!, "Error: ${e.message}");
      }
      return null;
    } on FirebaseAuthException catch (e) {
      dev.log('Firebase Auth Error: ${e.code} - ${e.message}');
      String errorMessage = "Authentication error";

      if (e.code == 'invalid-credential') {
        errorMessage = "Invalid Apple credentials. Please try again.";
      } else if (e.code == 'user-disabled') {
        errorMessage = "This account has been disabled.";
      } else if (e.code == 'operation-not-allowed') {
        errorMessage = "Apple Sign In is not enabled. Please contact support.";
      } else {
        errorMessage = e.message ?? "Authentication failed";
      }

      Utils.showToast(Get.context!, errorMessage);
      return null;
    } catch (error) {
      dev.log('Unexpected error signing in with Apple: $error');
      dev.log('Error type: ${error.runtimeType}');
      Utils.showToast(Get.context!,
          "Error: ${error.toString()}. Please check logs or contact support.");
      return null;
    } finally {
      isLoading(false);
      update([Constant.idProgressView]);
    }
  }

  Future<void> signOut() async {
    try {
      await googleSignIn.signOut();
      _user = null;
    } catch (error) {
      dev.log('Error signing out: $error');
    }
  }
}
