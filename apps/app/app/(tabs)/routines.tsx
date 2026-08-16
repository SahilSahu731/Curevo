import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { TextField } from "@/components/TextField";
import { useCurevo } from "@/state/useCurevoStore";
import { colors, radii } from "@/theme/tokens";

const week = [
  ["mon", "M"],
  ["tue", "T"],
  ["wed", "W"],
  ["thu", "T"],
  ["fri", "F"],
  ["sat", "S"],
  ["sun", "S"],
] as const;

const tones: Record<"forest" | "clay" | "amber" | "sky" | "plum", string> = {
  forest: colors.primarySoft,
  clay: colors.accentSoft,
  amber: colors.warningSoft,
  sky: "#d9ecf4",
  plum: "#e6dbef",
};

export default function RoutinesScreen() {
  const { state, createRoutine, toggleRoutine, completeRoutine, deleteRoutine } = useCurevo();
  const [title, setTitle] = useState("");
  const [cue, setCue] = useState("");
  const [duration, setDuration] = useState("5");
  const [time, setTime] = useState("09:00");
  const [color, setColor] = useState<"forest" | "clay" | "amber" | "sky" | "plum">("forest");
  const [days, setDays] = useState<string[]>(["mon", "tue", "wed", "thu", "fri"]);

  const activeCount = useMemo(() => state.routines.filter((routine) => routine.active).length, [state.routines]);

  function toggleDay(day: string) {
    setDays((current) => (current.includes(day) ? current.filter((value) => value !== day) : [...current, day]));
  }

  return (
    <Screen>
      <SectionHeader eyebrow="Routines" title="Make the helpful thing easier to find." body="Routines stay flexible. They are cues, not commitments to perfection." right={<Text style={styles.badge}>{activeCount} active</Text>} />

      <Card>
        <View style={styles.form}>
          <Text style={styles.formTitle}>Create a routine</Text>
          <TextField label="Small action" value={title} onChangeText={setTitle} placeholder="Clear the desk for five minutes" />
          <TextField label="When or after what?" value={cue} onChangeText={setCue} placeholder="After I make my morning drink..." multiline />
          <View style={styles.twoCol}>
            <TextField label="Minutes" value={duration} onChangeText={setDuration} keyboardType="numeric" placeholder="5" />
            <TextField label="Preferred time" value={time} onChangeText={setTime} placeholder="09:00" />
          </View>

          <View style={styles.daysRow}>
            {week.map(([key, label]) => (
              <Pressable key={key} onPress={() => toggleDay(key)} style={[styles.dayPill, days.includes(key) && styles.dayPillActive]}>
                <Text style={[styles.dayLabel, days.includes(key) && styles.dayLabelActive]}>{label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.toneRow}>
            {Object.keys(tones).map((tone) => {
              const active = color === tone;
              return (
                <Pressable key={tone} onPress={() => setColor(tone as typeof color)} style={[styles.tonePill, { backgroundColor: tones[tone as keyof typeof tones] }, active && styles.toneActive]}>
                  <Text style={styles.toneLabel}>{tone}</Text>
                </Pressable>
              );
            })}
          </View>

          <Button
            label="Create routine"
            onPress={() => {
              if (title.trim().length < 2 || days.length === 0) return;
              createRoutine({
                title: title.trim(),
                cue: cue.trim() || undefined,
                durationMinutes: Number(duration) || 5,
                days,
                preferredTime: time,
                color,
              });
              setTitle("");
              setCue("");
            }}
          />
        </View>
      </Card>

      <SectionHeader eyebrow="Your routines" title="What is already helping" />
      <View style={{ gap: 12 }}>
        {state.routines.map((routine) => (
          <Card key={routine.id}>
            <View style={styles.routineRow}>
              <Pressable onPress={() => completeRoutine(routine.id)} style={[styles.checkBadge, { backgroundColor: tones[routine.color] }]}>
                <MaterialCommunityIcons name="check" size={20} color={colors.primary} />
              </Pressable>
              <View style={styles.routineBody}>
                <Text style={styles.routineTitle}>{routine.title}</Text>
                {routine.cue ? <Text style={styles.routineCue}>{routine.cue}</Text> : null}
                <Text style={styles.routineMeta}>{routine.preferredTime} · {routine.durationMinutes} min · {routine.days.map((day) => day[0].toUpperCase()).join(" · ")} · {routine.completionCount} times completed</Text>
                {!routine.active ? <Text style={styles.paused}>Paused</Text> : null}
              </View>
              <View style={styles.routineActions}>
                <Button label={routine.active ? "Pause" : "Resume"} onPress={() => toggleRoutine(routine.id)} variant="secondary" compact />
                <Button label="Delete" onPress={() => deleteRoutine(routine.id)} variant="ghost" compact />
              </View>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: {
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontWeight: "800",
    overflow: "hidden",
  },
  form: {
    gap: 14,
  },
  formTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  twoCol: {
    flexDirection: "row",
    gap: 10,
  },
  daysRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  dayPill: {
    width: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  dayPillActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  dayLabel: {
    color: colors.subtext,
    fontWeight: "800",
  },
  dayLabelActive: {
    color: colors.primary,
  },
  toneRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  tonePill: {
    minWidth: 74,
    borderRadius: radii.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  toneActive: {
    borderColor: colors.primary,
  },
  toneLabel: {
    color: colors.text,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  routineRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  checkBadge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  routineBody: {
    flex: 1,
    gap: 4,
  },
  routineTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  routineCue: {
    color: colors.subtext,
    fontSize: 13,
    lineHeight: 19,
  },
  routineMeta: {
    color: colors.subtext,
    fontSize: 11,
    lineHeight: 16,
  },
  paused: {
    color: colors.warning,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  routineActions: {
    gap: 8,
    alignItems: "flex-end",
  },
});
