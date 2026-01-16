package com.investa.pigeon

import io.flutter.plugin.common.BasicMessageChannel
import io.flutter.plugin.common.BinaryMessenger
import io.flutter.plugin.common.StandardMessageCodec

data class UserInfo(
  var uid: String,
  var phoneNumber: String?,
  var email: String?,
  var displayName: String?,
  var isAnonymous: Boolean,
  var isEmailVerified: Boolean
){
  fun toList(): List<Any?> {
    return listOf<Any?>(uid, phoneNumber, email, displayName, isAnonymous, isEmailVerified)
  }

  companion object {
    fun fromList(list: List<Any?>): UserInfo {
      return UserInfo(
        list[0] as String,
        list[1] as String?,
        list[2] as String?,
        list[3] as String?,
        list[4] as Boolean,
        list[5] as Boolean
      )
    }
  }
}

data class UserDetails(
  var userInfo: UserInfo,
  var providerData: List<Map<String?, Any?>?>
){
  fun toList(): List<Any?> {
    return listOf<Any?>(userInfo.toList(), providerData)
  }

  companion object {
    fun fromList(list: List<Any?>): UserDetails {
      @Suppress("UNCHECKED_CAST")
      val provider = list[1] as List<Map<String?, Any?>?>
      return UserDetails(
        UserInfo.fromList(list[0] as List<Any?>),
        provider
      )
    }
  }
}

private object AuthBridgeCodec : StandardMessageCodec() {
  // Use default behavior; types are Lists and Maps
}

interface AuthBridge {
  fun currentUser(): UserDetails?
}

fun AuthBridgeHostSetup(binaryMessenger: BinaryMessenger, api: AuthBridge?) {
  val channel = BasicMessageChannel<Any?>(binaryMessenger, "dev.flutter.pigeon.AuthBridge.currentUser", AuthBridgeCodec)
  if (api == null) {
    channel.setMessageHandler(null)
  } else {
    channel.setMessageHandler { _, reply ->
      try {
        val result = api.currentUser()
        if (result == null) {
          reply.reply(null)
        } else {
          val ui = result.userInfo
          val userInfoMap: Map<String, Any?> = mapOf(
            "uid" to ui.uid,
            "phoneNumber" to ui.phoneNumber,
            "email" to ui.email,
            "displayName" to ui.displayName,
            "isAnonymous" to ui.isAnonymous,
            "isEmailVerified" to ui.isEmailVerified
          )
          val providerList: List<Map<String?, Any?>?> = result.providerData
          val payload: Map<String, Any?> = mapOf(
            "userInfo" to userInfoMap,
            "providerData" to providerList
          )
          reply.reply(payload)
        }
      } catch (e: Exception) {
        reply.reply(mapOf("error" to e.toString()))
      }
    }
  }
}
