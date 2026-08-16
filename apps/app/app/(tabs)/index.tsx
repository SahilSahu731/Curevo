import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { useCurevo } from "@/state/useCurevoStore";
import { colors, radii } from "@/theme/tokens";

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricHint}>{hint}</Text>
    </View>
  );
}

export default function TodayScreen() {
  const { state, overview } = useCurevo();
  const router = useRouter();
  const unread = state.notifications.filter((item) => !item.isRead).length;
  const latestRoutine = state.routines[0];
  const latestReflection = overview.latestReflection;
  const firstName = state.user?.name.split(" ")[0] ?? "there";

  return (
    <Screen>
      <View style={styles.topRow}>
        <View style={styles.greeting}>
          <Text style={styles.eyebrow}>Good to see you</Text>
          <Text style={styles.title}>Hello, {firstName}.</Text>
          <Text style={styles.subtitle}>Today is for a small step, not a perfect day.</Text>
        </View>
        <View style={styles.actions}>
          <Pressable onPress={() => router.push("/notifications")} style={styles.iconButton}>
            <MaterialCommunityIcons name="bell-outline" size={20} color={colors.text} />
            {unread ? <View style={styles.dot} /> : null}
          </Pressable>
          <Pressable onPress={() => router.push("/profile")} style={styles.avatar}>
            <Text style={styles.avatarText}>{firstName.slice(0, 1)}</Text>
          </Pressable>
        </View>
      </View>

      <Card tone="primary">
        <Text style={styles.surfaceEyebrow}>This week</Text>
        <Text style={styles.surfaceTitle}>{overview.weekMinutes} focused minutes</Text>
        <Text style={styles.surfaceBody}>{overview.completedSessions} completed blocks · {overview.reflectionsThisWeek} reflections · {overview.activeRoutines} active routines</Text>
        <View style={styles.metricGrid}>
          <Metric label="Today" value={`${overview.todayMinutes}m`} hint="focused minutes" />
          <Metric label="Latest" value={latestReflection ? latestReflection.feeling : "—"} hint="reflection mood" />
        </View>
      </Card>

      <SectionHeader eyebrow="Quick actions" title="Continue where you left off" />
      <View style={styles.quickRow}>
        <Card tone="soft">
          <Text style={styles.cardTitle}>Focus session</Text>
          <Text style={styles.cardBody}>Return to the next visible action.</Text>
          <Button label="Open" onPress={() => router.push("/focus")} compact />
        </Card>
        <Card tone="soft">
          <Text style={styles.cardTitle}>Reflection</Text>
          <Text style={styles.cardBody}>Notice what helped today.</Text>
          <Button label="Write" onPress={() => router.push("/reflections")} compact variant="secondary" />
        </Card>
      </View>

      <SectionHeader eyebrow="Routines" title="Your next anchor" />
      <Card>
        <Text style={styles.cardTitle}>{latestRoutine?.title ?? "No routines yet"}</Text>
        <Text style={styles.cardBody}>{latestRoutine?.cue ?? "Add a routine that makes the day easier to start."}</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.smallText}>{latestRoutine ? `${latestRoutine.durationMinutes} min · ${latestRoutine.preferredTime}` : "Start tiny"}</Text>
          <Button label="Manage" onPress={() => router.push("/routines")} compact variant="secondary" />
        </View>
      </Card>

      <SectionHeader eyebrow="Recent" title="What happened most recently" />
      <Card>
        <Text style={styles.cardTitle}>Last focus block</Text>
        <Text style={styles.cardBody}>{state.focusSessions[0]?.intention ?? "No focus blocks yet."}</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.smallText}>{state.focusSessions[0] ? `${state.focusSessions[0].durationMinutes} min · ${state.focusSessions[0].distractionCount} distractions` : "Start a block to see history"}</Text>
          <Button label="Open" onPress={() => router.push("/focus")} compact variant="secondary" />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  greeting: {
    flex: 1,
    gap: 6,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.subtext,
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.primary,
    fontWeight: "900",
  },
  surfaceEyebrow: {
    color: "#fffdf8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  surfaceTitle: {
    color: "#fffdf8",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    marginTop: 6,
  },
  surfaceBody: {
    color: "#eef4ef",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  metricGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  metric: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: radii.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  metricLabel: {
    color: "#eef4ef",
    fontSize: 12,
    fontWeight: "700",
  },
  metricValue: {
    color: "#fffdf8",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 8,
  },
  metricHint: {
    color: "#eef4ef",
    fontSize: 11,
    marginTop: 4,
  },
  quickRow: {
    flexDirection: "row",
    gap: 12,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  cardBody: {
    color: colors.subtext,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 14,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  smallText: {
    color: colors.subtext,
    fontSize: 12,
    flex: 1,
  },
});
