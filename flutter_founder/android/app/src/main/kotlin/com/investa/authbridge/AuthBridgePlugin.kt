package com.investa.authbridge

import io.flutter.embedding.engine.plugins.FlutterPlugin

/**
 * Simple plugin that wires up the generated Pigeon host API.
 * Currently sets up the Pigeon bridge with a null implementation so
 * Dart side can still use the generated channel without native logic.
 */
class AuthBridgePlugin: FlutterPlugin {
    override fun onAttachedToEngine(binding: FlutterPlugin.FlutterPluginBinding) {
        // Register the Pigeon host API with no implementation (null)
        com.investa.pigeon.AuthBridgeHostSetup(binding.binaryMessenger, null)
    }

    override fun onDetachedFromEngine(binding: FlutterPlugin.FlutterPluginBinding) {
        com.investa.pigeon.AuthBridgeHostSetup(binding.binaryMessenger, null)
    }
}
