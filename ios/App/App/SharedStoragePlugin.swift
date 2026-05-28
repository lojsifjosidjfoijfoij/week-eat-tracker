import Capacitor
import Foundation
import WidgetKit

@objc(SharedStoragePlugin)
public class SharedStoragePlugin: CAPPlugin {
    private let appGroup = "group.com.Louis.weekplate"

    @objc func set(_ call: CAPPluginCall) {
        guard let key = call.getString("key"),
              let value = call.getString("value") else {
            call.reject("Missing key or value"); return
        }
        UserDefaults(suiteName: appGroup)?.set(value, forKey: key)
        UserDefaults(suiteName: appGroup)?.synchronize()
        if #available(iOS 14.0, *) { WidgetCenter.shared.reloadAllTimelines() }
        call.resolve()
    }

    @objc func get(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else { call.reject("Missing key"); return }
        call.resolve(["value": UserDefaults(suiteName: appGroup)?.string(forKey: key) as Any])
    }
}
