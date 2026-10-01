package com.expensemanager

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.database.Cursor
import android.net.Uri
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*

class SmsReaderModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "SmsReaderModule"
    }

    private val prefsName = "sms_fetch_prefs"
    private val keyLastFetch = "last_fetch_timestamp"

    @ReactMethod
    fun hasPermission(promise: Promise) {
        try {
            val granted = ContextCompat.checkSelfPermission(
                reactContext,
                Manifest.permission.READ_SMS
            ) == PackageManager.PERMISSION_GRANTED
            promise.resolve(granted)
        } catch (e: Exception) {
            promise.reject("PERMISSION_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getLastFetchDate(promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences(prefsName, Context.MODE_PRIVATE)
            val lastDate = prefs.getLong(keyLastFetch, 0L)
            promise.resolve(lastDate.toDouble())
        } catch (e: Exception) {
            promise.resolve(0.0)
        }
    }

    @ReactMethod
    fun setLastFetchDate(timestamp: Double, promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences(prefsName, Context.MODE_PRIVATE)
            prefs.edit().putLong(keyLastFetch, timestamp.toLong()).apply()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun getSms(options: ReadableMap?, promise: Promise) {
        try {
            val hasPerm = ContextCompat.checkSelfPermission(
                reactContext,
                Manifest.permission.READ_SMS
            ) == PackageManager.PERMISSION_GRANTED

            if (!hasPerm) {
                promise.reject("PERMISSION_DENIED", "READ_SMS permission is not granted")
                return
            }

            val maxCount = if (options != null && options.hasKey("maxCount")) {
                options.getInt("maxCount")
            } else {
                100
            }

            val minDate = if (options != null && options.hasKey("minDate")) {
                options.getDouble("minDate").toLong()
            } else {
                0L
            }

            val uri = Uri.parse("content://sms/inbox")
            val projection = arrayOf("_id", "address", "body", "date")
            val selection = if (minDate > 0) "date > ?" else null
            val selectionArgs = if (minDate > 0) arrayOf(minDate.toString()) else null
            val sortOrder = "date DESC"

            val cursor: Cursor? = reactContext.contentResolver.query(
                uri,
                projection,
                selection,
                selectionArgs,
                sortOrder
            )

            val smsList = Arguments.createArray()

            cursor?.use {
                val idIndex = it.getColumnIndex("_id")
                val addressIndex = it.getColumnIndex("address")
                val bodyIndex = it.getColumnIndex("body")
                val dateIndex = it.getColumnIndex("date")

                var count = 0
                while (it.moveToNext() && count < maxCount) {
                    val map = Arguments.createMap()
                    if (idIndex != -1) map.putString("id", it.getString(idIndex))
                    if (addressIndex != -1) map.putString("address", it.getString(addressIndex))
                    if (bodyIndex != -1) map.putString("body", it.getString(bodyIndex))
                    if (dateIndex != -1) map.putDouble("date", it.getLong(dateIndex).toDouble())

                    smsList.pushMap(map)
                    count++
                }
            }

            promise.resolve(smsList)
        } catch (e: Exception) {
            promise.reject("SMS_FETCH_ERROR", e.message, e)
        }
    }
}
