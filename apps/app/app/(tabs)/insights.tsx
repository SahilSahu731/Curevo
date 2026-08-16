import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { useCurevo } from "@/state/useCurevoStore";
import { colors, radii } from "@/theme/tokens";

export default function InsightsScreen() {
  const { state, overview } = useCurevo();
  const averageMinutes = useMemo(() => {
    const completed = state.focusSessions.filter((item) => item.status === "completed");
    return completed.length ? Math.round(completed.reduce((sum, item) => sum + item.durationMinutes, 0) / completed.length) : 0;
  }, [state.focusSessions]);

  const commonFeeling = useMemo(() => {
    const counts = state.reflections.reduce<Record<string, number>>((acc, reflection) => {
      acc[reflection.feeling] = (acc[reflection.feeling] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "not enough notes yet";
  }, [state.reflections]);

  const maxMinutes = Math.max(30, ...overview.daily.map((item) => item.minutes));

  return (
    <Screen>
      <SectionHeader eyebrow="Insights" title="Look for conditions, not perfection." body="These are descriptive patterns, not scores or labels." />

      <View style={styles.metricGrid}>
        <Card><Metric label="Week minutes" value={`${overview.weekMinutes}`} hint="focused minutes" /></Card>
        <Card><Metric label="Blocks" value={`${overview.completedSessions}`} hint="completed this week" /></Card>
      </View>
      <View style={styles.metricGrid}>
        <Card><Metric label="Average" value={`${averageMinutes}m`} hint="per completed block" /></Card>
        <Card><Metric label="Active" value={`${overview.activeRoutines}`} hint="routines running" /></Card>
      </View>

      <Card tone="soft">
        <Text style={styles.cardTitle}>Last seven days</Text>
        <Text style={styles.cardBody}>Focused minutes recorded each day.</Text>
        <View style={styles.chartRow}>
          {overview.daily.map((item) => (
            <View key={item.day} style={styles.chartCol}>
              <View style={styles.chartTrack}>
                <View style={[styles.chartFill, { height: `${Math.max(8, (item.minutes / maxMinutes) * 100)}%` }]} />
              </View>
              <Text style={styles.chartValue}>{item.minutes || "·"}</Text>
              <Text style={styles.chartLabel}>{item.day}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <View style={styles.patternRow}>
          <View style={styles.iconBadge}>
            <MaterialCommunityIcons name="sparkles" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Patterns worth noticing</Text>
            <Text style={styles.cardBody}>Common reflection word: {commonFeeling}</Text>
            <Text style={styles.cardBody}>Fewest distractions noticed: {Math.min(...state.focusSessions.map((item) => item.distractionCount || 0)) || 0}</Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Recent completed blocks</Text>
        <View style={{ gap: 10, marginTop: 12 }}>
          {state.focusSessions.slice(0, 6).map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <Text style={styles.sessionTitle}>{session.intention}</Text>
              <Text style={styles.sessionMeta}>{session.durationMinutes}m · {session.distractionCount} distractions</Text>
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricHint}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  metricGrid: {
    flexDirection: "row",
    gap: 12,
  },
  metric: {
    gap: 8,
  },
  metricLabel: {
    color: colors.subtext,
    fontSize: 12,
    fontWeight: "700",
  },
  metricValue: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "900",
  },
  metricHint: {
    color: colors.subtext,
    fontSize: 11,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  cardBody: {
    color: colors.subtext,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginTop: 16,
  },
  chartCol: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  chartTrack: {
    width: "100%",
    height: 170,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceMuted,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  chartFill: {
    width: "100%",
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
  },
  chartValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },
  chartLabel: {
    color: colors.subtext,
    fontSize: 11,
    fontWeight: "700",
  },
  patternRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  sessionCard: {
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceSoft,
    padding: 14,
    gap: 4,
  },
  sessionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  sessionMeta: {
    color: colors.subtext,
    fontSize: 12,
  },
});
