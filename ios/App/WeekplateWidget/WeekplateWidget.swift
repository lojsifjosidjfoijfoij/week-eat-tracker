import WidgetKit
import SwiftUI

struct MealEntry: TimelineEntry {
    let date: Date
    let meal: String
}

struct Provider: TimelineProvider {
    let appGroup = "group.com.louis.dinrr"

    func placeholder(in context: Context) -> MealEntry {
        MealEntry(date: Date(), meal: "Pasta Carbonara")
    }

    func getSnapshot(in context: Context, completion: @escaping (MealEntry) -> Void) {
        completion(MealEntry(date: Date(), meal: getMealForToday()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<MealEntry>) -> Void) {
        let entry = MealEntry(date: Date(), meal: getMealForToday())
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: Date())!
        completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
    }

    func getMealForToday() -> String {
        guard let data = UserDefaults(suiteName: appGroup)?.string(forKey: "mealWeekPlanner"),
              let jsonData = data.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: jsonData) as? [String: Any] else {
            return "No meal planned"
        }
        let weekday = Calendar.current.component(.weekday, from: Date())
        let dayIndex = weekday == 1 ? 6 : weekday - 2
        if let day = json[String(dayIndex)] as? [String: Any],
           let meal = day["meal"] as? String, !meal.isEmpty {
            return meal
        }
        return "No meal planned"
    }
}

struct DinerrWidgetView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    // App colours
    let bg        = Color(hex: "F2EFE9")
    let ink       = Color(hex: "1A1714")
    let ink3      = Color(hex: "A39C95")
    let green     = Color(hex: "2A4D0F")
    let greenMid  = Color(hex: "3D7016")
    let greenTint = Color(hex: "EBF2E2")
    let border    = Color(hex: "E8E4DC")

    var todayShort: String {
        let f = DateFormatter(); f.dateFormat = "EEE"
        return f.string(from: Date()).uppercased()
    }
    var todayFull: String {
        let f = DateFormatter(); f.dateFormat = "EEEE"
        return f.string(from: Date()).uppercased()
    }
    var hasMeal: Bool { entry.meal != "No meal planned" }

    var body: some View {
        if family == .systemMedium {
            mediumView
        } else {
            smallView
        }
    }

    var smallView: some View {
        ZStack {
            bg
            VStack(alignment: .leading, spacing: 0) {
                HStack(alignment: .firstTextBaseline) {
                    Text("dinrr")
                        .font(.system(size: 12)).italic()
                        .foregroundColor(ink3)
                    Spacer()
                    Text(todayShort)
                        .font(.system(size: 9, weight: .bold)).tracking(0.8)
                        .foregroundColor(ink3)
                }
                Spacer()
                if hasMeal {
                    Text(entry.meal)
                        .font(.system(size: 17, weight: .regular, design: .serif))
                        .foregroundColor(ink)
                        .lineLimit(3).minimumScaleFactor(0.75)
                } else {
                    Text("Nothing planned yet")
                        .font(.system(size: 12, weight: .light)).italic()
                        .foregroundColor(ink3)
                }
                Spacer()
                HStack(spacing: 5) {
                    Circle().fill(green).frame(width: 5, height: 5)
                    Text("tonight")
                        .font(.system(size: 9, weight: .semibold)).tracking(0.5)
                        .foregroundColor(greenMid)
                }
            }
            .padding(14)
        }
    }

    var mediumView: some View {
        ZStack {
            bg
            HStack(spacing: 0) {
                VStack(alignment: .leading, spacing: 0) {
                    Text("dinrr")
                        .font(.system(size: 13)).italic()
                        .foregroundColor(ink3)
                    Spacer()
                    VStack(alignment: .leading, spacing: 4) {
                        Text(todayFull)
                            .font(.system(size: 9, weight: .bold)).tracking(0.7)
                            .foregroundColor(ink3)
                        if hasMeal {
                            Text(entry.meal)
                                .font(.system(size: 20, weight: .regular, design: .serif))
                                .foregroundColor(ink)
                                .lineLimit(2).minimumScaleFactor(0.8)
                        } else {
                            Text("Nothing planned yet")
                                .font(.system(size: 13, weight: .light)).italic()
                                .foregroundColor(ink3)
                        }
                    }
                }
                .padding(16)
                .frame(maxWidth: .infinity, alignment: .leading)

                Rectangle().fill(border).frame(width: 1).padding(.vertical, 14)

                VStack(spacing: 8) {
                    ZStack {
                        Circle().fill(greenTint).frame(width: 44, height: 44)
                        Image(systemName: "fork.knife")
                            .font(.system(size: 18)).foregroundColor(green)
                    }
                    Text("Plan\nweek")
                        .font(.system(size: 9, weight: .medium))
                        .multilineTextAlignment(.center)
                        .foregroundColor(greenMid)
                }
                .frame(width: 76)
            }
        }
    }
}

extension Color {
    init(hex: String) {
        let h = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: h).scanHexInt64(&int)
        self.init(
            red:   Double((int >> 16) & 0xFF) / 255,
            green: Double((int >>  8) & 0xFF) / 255,
            blue:  Double( int        & 0xFF) / 255
        )
    }
}

@main
struct WeekplateWidget: Widget {
    let kind: String = "WeekplateWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            DinerrWidgetView(entry: entry)
                .containerBackground(Color(hex: "F2EFE9"), for: .widget)
        }
        .configurationDisplayName("dinrr")
        .description("See tonight's dinner at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
