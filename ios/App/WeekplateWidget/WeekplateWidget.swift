import WidgetKit
import SwiftUI

struct MealEntry: TimelineEntry {
    let date: Date
    let meal: String
    let dayName: String
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> MealEntry {
        MealEntry(date: Date(), meal: "Pasta carbonara", dayName: "Tonight")
    }

    func getSnapshot(in context: Context, completion: @escaping (MealEntry) -> Void) {
        let entry = MealEntry(date: Date(), meal: getMealForToday(), dayName: "Tonight")
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<MealEntry>) -> Void) {
        let entry = MealEntry(date: Date(), meal: getMealForToday(), dayName: "Tonight")
        let nextUpdate = Calendar.current.startOfDay(for: Calendar.current.date(byAdding: .day, value: 1, to: Date())!)
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }

    func getMealForToday() -> String {
        let sharedDefaults = UserDefaults(suiteName: "group.com.Louis.weekplate")
        
        // Try shared defaults first
        if let data = sharedDefaults?.string(forKey: "mealWeekPlanner") {
            return parseMeal(from: data)
        }
        
        // Fall back to standard defaults
        if let data = UserDefaults.standard.string(forKey: "mealWeekPlanner") {
            return parseMeal(from: data)
        }
        
        return "No meal planned"
    }

    func parseMeal(from data: String) -> String {
        guard let jsonData = data.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: jsonData) as? [String: Any] else {
            return "No meal planned"
        }
        
        let weekday = Calendar.current.component(.weekday, from: Date())
        let dayIndex = weekday == 1 ? 6 : weekday - 2
        
        if let day = json[String(dayIndex)] as? [String: Any],
           let meal = day["meal"] as? String,
           !meal.isEmpty {
            return meal
        }
        
        return "No meal planned"
    }
}

struct WeekplateWidgetEntryView: View {
    var entry: Provider.Entry

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("TONIGHT")
                .font(.system(size: 10, weight: .semibold))
                .foregroundColor(.secondary)
                .tracking(1.5)
            
            Spacer()
            
            Text(entry.meal)
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.primary)
                .lineLimit(3)
                .minimumScaleFactor(0.8)
            
            Spacer()
            
            Text("Weekplate")
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(.secondary)
        }
        .padding(16)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .containerBackground(.background, for: .widget)
    }
}

@main
struct WeekplateWidget: Widget {
    let kind: String = "WeekplateWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            WeekplateWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Weekplate")
        .description("See tonight's meal on your home screen.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
