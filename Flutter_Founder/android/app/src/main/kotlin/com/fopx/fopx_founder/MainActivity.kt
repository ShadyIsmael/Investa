package com.fopx.fopx_founder

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.provider.OpenableColumns
import java.io.ByteArrayOutputStream
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.embedding.android.FlutterActivity
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val mediaChannelName = "com.fopx.founder/media"
    private val mediaImageRequestCode = 5417
    private val maxMediaImageBytes = 10 * 1024 * 1024
    private var pendingCoverImageResult: MethodChannel.Result? = null
    private var pendingImageFallbackName = "selected-image"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, mediaChannelName)
            .setMethodCallHandler { call, result ->
                if (call.method != "pickCoverImage" && call.method != "pickProjectLogo") {
                    result.notImplemented()
                } else if (pendingCoverImageResult != null) {
                    result.error("PICKER_BUSY", "An image selection is already in progress.", null)
                } else {
                    pendingCoverImageResult = result
                    pendingImageFallbackName =
                        if (call.method == "pickProjectLogo") "project-logo.png" else "opportunity-cover.png"
                    try {
                        val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                            type = "image/*"
                            addCategory(Intent.CATEGORY_OPENABLE)
                        }
                        startActivityForResult(intent, mediaImageRequestCode)
                    } catch (error: Exception) {
                        pendingCoverImageResult = null
                        result.error("PICKER_UNAVAILABLE", error.message, null)
                    }
                }
            }
    }

    @Deprecated("Deprecated in Android, retained for FlutterActivity compatibility")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode != mediaImageRequestCode) return

        val result = pendingCoverImageResult ?: return
        pendingCoverImageResult = null
        if (resultCode != Activity.RESULT_OK || data?.data == null) {
            result.success(null)
            return
        }

        try {
            val uri = data.data!!
            val name = displayName(uri) ?: pendingImageFallbackName
            val bytes = readCoverImage(uri)
            result.success(
                mapOf(
                    "bytes" to bytes,
                    "name" to name,
                    "size" to bytes.size,
                    "mimeType" to contentResolver.getType(uri),
                ),
            )
        } catch (error: ImageTooLargeException) {
            result.error("FILE_TOO_LARGE", error.message, null)
        } catch (error: Exception) {
            result.error("IMAGE_READ_FAILED", error.message, null)
        }
    }

    private fun displayName(uri: Uri): String? =
        contentResolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)
            ?.use { cursor ->
                if (cursor.moveToFirst()) {
                    cursor.getString(cursor.getColumnIndexOrThrow(OpenableColumns.DISPLAY_NAME))
                } else null
            }

    private fun readCoverImage(uri: Uri): ByteArray {
        val output = ByteArrayOutputStream()
        val input = contentResolver.openInputStream(uri)
            ?: throw IllegalStateException("The selected image could not be opened.")
        input.use { stream ->
            val buffer = ByteArray(8192)
            var total = 0
            while (true) {
                val count = stream.read(buffer)
                if (count < 0) break
                total += count
                if (total > maxMediaImageBytes) {
                    throw ImageTooLargeException()
                }
                output.write(buffer, 0, count)
            }
        }
        if (output.size() == 0) throw IllegalArgumentException("The selected image is empty.")
        return output.toByteArray()
    }

    private class ImageTooLargeException : IllegalArgumentException("The selected image exceeds 10 MB.")
}
