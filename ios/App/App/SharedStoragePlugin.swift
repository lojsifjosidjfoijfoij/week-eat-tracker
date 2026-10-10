import Capacitor
import Foundation
import WidgetKit

/// Lets the web app write to the App Group so the home-screen widget can read it.
@objc(SharedStoragePlugin)
public class SharedStoragePlugin: CAPPlugin {
    private let appGroup = "group.com.louis.dinrr"
    private let allowedKeys: Set<String> = ["mealWeekPlanner"]

    @objc func set(_ call: CAPPluginCall) {
        guard let key = call.getString("key"), let value = call.getString("value") else {
            call.reject("Missing key or value"); return
        }
        guard allowedKeys.contains(key), value.utf8.count < 64_000 else {
            call.reject("Key not allowed"); return
        }
        guard let defaults = UserDefaults(suiteName: appGroup) else {
            call.reject("App Group unavailable"); return
        }
        if defaults.string(forKey: key) != value {
            defaults.set(value, forKey: key)
            WidgetCenter.shared.reloadAllTimelines()
        }
        call.resolve()
    }

    @objc func get(_ call: CAPPluginCall) {
        guard let key = call.getString("key"), allowedKeys.contains(key) else {
            call.reject("Key not allowed"); return
        }
        call.resolve(["value": UserDefaults(suiteName: appGroup)?.string(forKey: key) as Any])
    }
}
