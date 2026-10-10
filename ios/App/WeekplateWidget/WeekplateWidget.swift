import WidgetKit
import SwiftUI

// MARK: - Data

struct MealEntry: TimelineEntry {
    let date: Date
    let meal: String?      // nil = nothing planned for this day
    let language: String
}

/// Reads the plan the app writes to the App Group (see src/lib/sharedStorage.ts):
/// { "lang": "da", "0": { "meal": "Tacos" }, … "6": { "meal": "" } }   (0 = Monday)
struct PlanStore {
    static let appGroup = "group.com.louis.dinrr"
    static let key = "mealWeekPlanner"

    static func load() -> [String: Any] {
        guard let raw = UserDefaults(suiteName: appGroup)?.string(forKey: key),
              let data = raw.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return [:] }
        return json
    }

    static func meal(on date: Date, in json: [String: Any]) -> String? {
        let weekday = Calendar.current.component(.weekday, from: date) // 1 = Sunday
        let dayIndex = weekday == 1 ? 6 : weekday - 2
        let day = json[String(dayIndex)] as? [String: Any]
        let meal = (day?["meal"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        return meal.isEmpty ? nil : meal
    }

    static func language(in json: [String: Any]) -> String {
        let lang = json["lang"] as? String ?? Locale.current.language.languageCode?.identifier ?? "en"
        return Strings.all[lang] == nil ? "en" : lang
    }
}

struct Strings {
    let nothingPlanned: String
    let tonight: String
    let planWeek: String

    static let all: [String: Strings] = [
        "en": Strings(nothingPlanned: "Nothing planned yet", tonight: "tonight", planWeek: "Plan\nweek"),
        "da": Strings(nothingPlanned: "Intet planlagt endnu", tonight: "i aften", planWeek: "Planlæg\nugen"),
        "de": Strings(nothingPlanned: "Noch nichts geplant", tonight: "heute Abend", planWeek: "Woche\nplanen"),
        "fr": Strings(nothingPlanned: "Rien de prévu", tonight: "ce soir", planWeek: "Planifier\nla semaine"),
        "es": Strings(nothingPlanned: "Nada planeado aún", tonight: "esta noche", planWeek: "Planificar\nsemana"),
    ]
    static func of(_ lang: String) -> Strings { all[lang] ?? all["en"]! }
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> MealEntry {
        MealEntry(date: Date(), meal: "Pasta carbonara", language: "en")
    }

    func getSnapshot(in context: Context, completion: @escaping (MealEntry) -> Void) {
        let json = PlanStore.load()
        let entry = MealEntry(date: Date(), meal: PlanStore.meal(on: Date(), in: json) ?? (context.isPreview ? "Pasta carbonara" : nil),
                              language: PlanStore.language(in: json))
        completion(entry)
    }

    /// One entry for now and one at every midnight for the rest of the week, so
    /// "tonight" flips to the next day even if the app isn't opened.
    func getTimeline(in context: Context, completion: @escaping (Timeline<MealEntry>) -> Void) {
        let json = PlanStore.load()
        let lang = PlanStore.language(in: json)
        let cal = Calendar.current
        let now = Date()
        var entries = [MealEntry(date: now, meal: PlanStore.meal(on: now, in: json), language: lang)]
        var day = cal.startOfDay(for: now)
        for _ in 0..<6 {
            guard let next = cal.date(byAdding: .day, value: 1, to: day) else { break }
            day = next
            entries.append(MealEntry(date: day, meal: PlanStore.meal(on: day, in: json), language: lang))
        }
        completion(Timeline(entries: entries, policy: .atEnd))
    }
}

// MARK: - Views

struct DinerrWidgetView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    let bg        = Color(hex: "F2EFE9")
    let ink       = Color(hex: "1A1714")
    let ink3      = Color(hex: "A39C95")
    let green     = Color(hex: "2A4D0F")
    let greenMid  = Color(hex: "3D7016")
    let greenTint = Color(hex: "EBF2E2")
    let border    = Color(hex: "E8E4DC")

    private var strings: Strings { Strings.of(entry.language) }
    private var locale: Locale { Locale(identifier: entry.language) }

    private func dayName(_ format: String) -> String {
        let f = DateFormatter()
        f.locale = locale
        f.dateFormat = format
        return f.string(from: entry.date).uppercased(with: locale)
    }

    var body: some View {
        Group {
            if family == .systemMedium { mediumView } else { smallView }
        }
        .widgetURL(URL(string: "dinrr://today"))
    }

    var smallView: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .firstTextBaseline) {
                Text("dinrr").font(.system(size: 12)).italic().foregroundColor(ink3)
                Spacer()
                Text(dayName("EEE")).font(.system(size: 9, weight: .bold)).tracking(0.8).foregroundColor(ink3)
            }
            Spacer()
            if let meal = entry.meal {
                Text(meal)
                    .font(.system(size: 17, weight: .regular, design: .serif))
                    .foregroundColor(ink)
                    .lineLimit(3).minimumScaleFactor(0.75)
            } else {
                Text(strings.nothingPlanned)
                    .font(.system(size: 12, weight: .light)).italic()
                    .foregroundColor(ink3)
            }
            Spacer()
            HStack(spacing: 5) {
                Circle().fill(green).frame(width: 5, height: 5)
                Text(strings.tonight).font(.system(size: 9, weight: .semibold)).tracking(0.5).foregroundColor(greenMid)
            }
        }
        .padding(14)
    }

    var mediumView: some View {
        HStack(spacing: 0) {
            VStack(alignment: .leading, spacing: 0) {
                Text("dinrr").font(.system(size: 13)).italic().foregroundColor(ink3)
                Spacer()
                VStack(alignment: .leading, spacing: 4) {
                    Text(dayName("EEEE")).font(.system(size: 9, weight: .bold)).tracking(0.7).foregroundColor(ink3)
                    if let meal = entry.meal {
                        Text(meal)
                            .font(.system(size: 20, weight: .regular, design: .serif))
                            .foregroundColor(ink)
                            .lineLimit(2).minimumScaleFactor(0.8)
                    } else {
                        Text(strings.nothingPlanned)
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
                    Image(systemName: "fork.knife").font(.system(size: 18)).foregroundColor(green)
                }
                Text(strings.planWeek)
                    .font(.system(size: 9, weight: .medium))
                    .multilineTextAlignment(.center)
                    .foregroundColor(greenMid)
            }
            .frame(width: 76)
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
        .description("Tonight's dinner at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
