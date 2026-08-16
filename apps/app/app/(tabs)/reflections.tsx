import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { TextField } from "@/components/TextField";
import { useCurevo } from "@/state/useCurevoStore";
import { colors, radii } from "@/theme/tokens";

const feelings = ["clear", "steady", "stretched", "restless", "low"] as const;

export default function ReflectionsScreen() {
  const { state, createReflection, deleteReflection } = useCurevo();
  const [focusLevel, setFocusLevel] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [feeling, setFeeling] = useState<(typeof feelings)[number]>("steady");
  const [win, setWin] = useState("");
  const [friction, setFriction] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [note, setNote] = useState("");

  return (
    <Screen>
      <SectionHeader eyebrow="Reflections" title="Notice without grading yourself." body="Keep it brief, plain, and private." />

      <Card>
        <View style={styles.form}>
          <Text style={styles.sectionLabel}>How available did your attention feel?</Text>
          <View style={styles.levelRow}>
            {[1, 2, 3, 4, 5].map((level) => (
              <Pressable key={level} onPress={() => setFocusLevel(level)} style={[styles.level, focusLevel === level && styles.levelActive]}>
                <Text style={[styles.levelText, focusLevel === level && styles.levelTextActive]}>{level}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionLabel}>How much usable energy did you have?</Text>
          <View style={styles.levelRow}>
            {[1, 2, 3, 4, 5].map((level) => (
              <Pressable key={level} onPress={() => setEnergyLevel(level)} style={[styles.level, energyLevel === level && styles.levelActive]}>
                <Text style={[styles.levelText, energyLevel === level && styles.levelTextActive]}>{level}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Closest feeling</Text>
          <View style={styles.feelingRow}>
            {feelings.map((item) => {
              const active = feeling === item;
              return (
                <Pressable key={item} onPress={() => setFeeling(item)} style={[styles.feelingPill, active && styles.feelingPillActive]}>
                  <Text style={[styles.feelingText, active && styles.feelingTextActive]}>{item}</Text>
                </Pressable>
              );
            })}
          </View>

          <TextField label="One thing that helped" value={win} onChangeText={setWin} placeholder="A small win counts." multiline />
          <TextField label="What created friction?" value={friction} onChangeText={setFriction} placeholder="An interruption, unclear next step, low energy..." multiline />
          <TextField label="Next small step" value={nextStep} onChangeText={setNextStep} placeholder="Make it visible and kind." multiline />
          <TextField label="Anything else?" value={note} onChangeText={setNote} placeholder="Optional notes" multiline />

          <Button
            label="Save reflection"
            onPress={() => {
              createReflection({
                focusLevel,
                energyLevel,
                feeling,
                win: win.trim() || undefined,
                friction: friction.trim() || undefined,
                nextStep: nextStep.trim() || undefined,
                note: note.trim() || undefined,
              });
              setWin("");
              setFriction("");
              setNextStep("");
              setNote("");
            }}
          />
        </View>
      </Card>

      <SectionHeader eyebrow="Saved" title="Your recent notes" />
      <View style={{ gap: 12 }}>
        {state.reflections.map((reflection) => (
          <Card key={reflection.id}>
            <View style={styles.noteHeader}>
              <View style={styles.iconBadge}>
                <MaterialCommunityIcons name="notebook-outline" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.noteTitle}>{reflection.feeling}</Text>
                <Text style={styles.noteMeta}>{new Date(reflection.createdAt).toLocaleString()}</Text>
              </View>
              <Button label="Delete" onPress={() => deleteReflection(reflection.id)} variant="ghost" compact />
            </View>
            <Text style={styles.noteBody}>{reflection.win || reflection.nextStep || reflection.note || "A moment was noticed."}</Text>
            <View style={styles.detailGrid}>
              <Text style={styles.detail}>Attention {reflection.focusLevel}/5</Text>
              <Text style={styles.detail}>Energy {reflection.energyLevel}/5</Text>
            </View>
            {reflection.friction ? <Text style={styles.noteDetail}>Friction: {reflection.friction}</Text> : null}
            {reflection.nextStep ? <Text style={styles.noteDetail}>Next step: {reflection.nextStep}</Text> : null}
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 14,
  },
  sectionLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  levelRow: {
    flexDirection: "row",
    gap: 8,
  },
  level: {
    flex: 1,
    height: 44,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  levelActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  levelText: {
    color: colors.subtext,
    fontWeight: "900",
  },
  levelTextActive: {
    color: colors.primary,
  },
  feelingRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  feelingPill: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  feelingPillActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  feelingText: {
    color: colors.subtext,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  feelingTextActive: {
    color: colors.primary,
  },
  noteHeader: {
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
  noteTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  noteMeta: {
    color: colors.subtext,
    fontSize: 12,
    marginTop: 2,
  },
  noteBody: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 14,
    fontWeight: "700",
  },
  detailGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  detail: {
    flex: 1,
    color: colors.subtext,
    backgroundColor: colors.surfaceSoft,
    borderRadius: radii.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontWeight: "700",
  },
  noteDetail: {
    color: colors.subtext,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
});
