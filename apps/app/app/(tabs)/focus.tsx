import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { TextField } from "@/components/TextField";
import { useCurevo } from "@/state/useCurevoStore";
import { colors, radii } from "@/theme/tokens";

const presets = [10, 25, 45];

export default function FocusScreen() {
  const { state, completeFocusSession, deleteFocusSession } = useCurevo();
  const [minutes, setMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [intention, setIntention] = useState("");
  const [closingNote, setClosingNote] = useState("");
  const [distractions, setDistractions] = useState(0);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          clearInterval(timer);
          setRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [running]);

  const progress = useMemo(() => (minutes * 60 - secondsLeft) / (minutes * 60), [minutes, secondsLeft]);
  const display = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;
  const canSave = intention.trim().length >= 2 && secondsLeft < minutes * 60;

  function choosePreset(value: number) {
    if (running) return;
    setMinutes(value);
    setSecondsLeft(value * 60);
    setStartedAt(null);
  }

  function toggle() {
    if (!intention.trim()) return;
    if (!startedAt) setStartedAt(new Date().toISOString());
    setRunning((value) => !value);
  }

  function reset() {
    setRunning(false);
    setStartedAt(null);
    setSecondsLeft(minutes * 60);
    setDistractions(0);
  }

  return (
    <Screen>
      <SectionHeader eyebrow="Focus" title="Protect one clear block." body="Short blocks give attention a safe beginning and a safe ending." />

      <Card tone="primary">
        <View style={styles.presetRow}>
          {presets.map((preset) => (
            <Pressable key={preset} onPress={() => choosePreset(preset)} style={[styles.preset, minutes === preset && styles.presetActive]}>
              <Text style={[styles.presetLabel, minutes === preset && styles.presetLabelActive]}>{preset} min</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.timerShell}>
          <View style={[styles.progressRing, { borderColor: colors.primarySoft, borderTopColor: colors.primary, borderRightColor: progress > 0.25 ? colors.primary : colors.primarySoft, transform: [{ rotate: `${Math.max(progress, 0) * 180}deg` }] }]} />
          <View style={styles.timerInner}>
            <Text style={styles.timerText}>{display}</Text>
            <Text style={styles.timerCaption}>{running ? "gently focused" : secondsLeft === 0 ? "block complete" : startedAt ? "paused" : "ready when you are"}</Text>
          </View>
        </View>

        <TextField label="What are you returning to?" value={intention} onChangeText={setIntention} placeholder="For example: outline the first section" />

        <View style={styles.buttonRow}>
          <Button label={running ? "Pause" : startedAt ? "Continue" : "Begin"} onPress={toggle} />
          <Button label="Reset" onPress={reset} variant="secondary" />
        </View>

        {startedAt ? (
          <Button label={`Noticed a distraction · ${distractions}`} onPress={() => setDistractions((value) => value + 1)} variant="ghost" />
        ) : null}

        <TextField label="What helped you return?" value={closingNote} onChangeText={setClosingNote} placeholder="Phone in another room; started with a rough version..." multiline />

        <Button
          label="Finish and record this block"
          onPress={() => {
            if (!canSave) return;
            const elapsed = Math.max(1, Math.round((minutes * 60 - secondsLeft) / 60));
            completeFocusSession({ intention: intention.trim(), durationMinutes: elapsed, distractionCount: distractions, closingNote: closingNote.trim() || undefined });
            setRunning(false);
            setStartedAt(null);
            setSecondsLeft(minutes * 60);
            setClosingNote("");
            setDistractions(0);
            setIntention("");
          }}
        />
      </Card>

      <SectionHeader eyebrow="Recent" title="Your completed blocks" />
      <View style={{ gap: 12 }}>
        {state.focusSessions.map((session) => (
          <Card key={session.id}>
            <View style={styles.sessionRow}>
              <View style={styles.iconBadge}>
                <MaterialCommunityIcons name="timer-outline" size={18} color={colors.primary} />
              </View>
              <View style={styles.sessionBody}>
                <Text style={styles.sessionTitle}>{session.intention}</Text>
                <Text style={styles.sessionMeta}>{new Date(session.startedAt).toLocaleString()} · {session.distractionCount} distractions noticed{session.closingNote ? ` · ${session.closingNote}` : ""}</Text>
              </View>
              <Text style={styles.sessionDuration}>{session.durationMinutes}m</Text>
            </View>
            <View style={styles.sessionActions}>
              <Button label="Delete" onPress={() => deleteFocusSession(session.id)} variant="ghost" compact />
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  presetRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginBottom: 18,
  },
  preset: {
    minWidth: 76,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
  },
  presetActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  presetLabel: {
    color: colors.subtext,
    fontWeight: "800",
  },
  presetLabelActive: {
    color: colors.primary,
  },
  timerShell: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  progressRing: {
    position: "absolute",
    width: 228,
    height: 228,
    borderRadius: 999,
    borderWidth: 14,
    borderStyle: "solid",
  },
  timerInner: {
    width: 196,
    height: 196,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  timerText: {
    color: colors.text,
    fontSize: 46,
    fontWeight: "900",
    letterSpacing: -1.5,
  },
  timerCaption: {
    color: colors.subtext,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  sessionBody: {
    flex: 1,
    gap: 4,
  },
  sessionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  sessionMeta: {
    color: colors.subtext,
    fontSize: 12,
    lineHeight: 18,
  },
  sessionDuration: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  sessionActions: {
    alignItems: "flex-end",
    marginTop: 8,
  },
});
