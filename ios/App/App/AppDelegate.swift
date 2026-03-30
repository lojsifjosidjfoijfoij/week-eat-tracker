import UIKit
import Capacitor
import WidgetKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {}
    func applicationDidEnterBackground(_ application: UIApplication) {}
    func applicationWillEnterForeground(_ application: UIApplication) {}

    func applicationDidBecomeActive(_ application: UIApplication) {
        syncMealDataToWidget()
    }

    func applicationWillTerminate(_ application: UIApplication) {}

    func syncMealDataToWidget() {
        DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
            guard let bridge = (self.window?.rootViewController as? CAPBridgeViewController)?.bridge else { return }
            bridge.webView?.evaluateJavaScript("localStorage.getItem('mealWeekPlanner')") { result, error in
                if let data = result as? String {
                    let sharedDefaults = UserDefaults(suiteName: "group.com.Louis.weekplate")
                    sharedDefaults?.set(data, forKey: "mealWeekPlanner")
                    sharedDefaults?.synchronize()
                    WidgetCenter.shared.reloadAllTimelines()
                }
            }
        }
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}