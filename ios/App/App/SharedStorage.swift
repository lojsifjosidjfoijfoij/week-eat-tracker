import Foundation
import Capacitor
import WidgetKit

@objc(SharedStorage)
public class SharedStorage: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SharedStorage"
    public let jsName = "SharedStorage"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "set", returnType: CAPPluginReturnPromise)
    ]

    @objc func set(_ call: CAPPluginCall) {
        guard let key = call.getString("key"),
              let value = call.getString("value") else {
            call.reject("Missing key or value")
            return
        }
        let defaults = UserDefaults(suiteName: "group.com.Louis.weekplate")
        defaults?.set(value, forKey: key)
        defaults?.synchronize()
        WidgetCenter.shared.reloadAllTimelines()
        call.resolve()
    }
}//
//  SharedStorage.swift
//  App
//
//  Created by Louis Kjær on 30/03/2026.
//

