import 'package:pigeon/pigeon.dart';

// شلنا كلمة Pigeon من الاسم عشان الـ Tool تقبله
class UserInfo {
  late String uid;
  String? phoneNumber;
  String? email;
  String? displayName;
  late bool isAnonymous;
  late bool isEmailVerified;
}

class UserDetails {
  late UserInfo userInfo;
  // الـ Pigeon بيفضل استخدام List<Map?> للبيانات المعقدة
  late List<Map<String?, Object?>?> providerData;
}

@HostApi()
abstract class AuthBridge {
  UserDetails? currentUser();
}
