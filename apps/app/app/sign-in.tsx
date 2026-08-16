import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Redirect } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { TextField } from "@/components/TextField";
import { useCurevo } from "@/state/useCurevoStore";
import { colors, radii } from "@/theme/tokens";

export default function SignInScreen() {
  const { state, signIn } = useCurevo();
  const [email, setEmail] = useState(state.user?.email ?? "avery@curevo.app");
  const [password, setPassword] = useState("focus-first");
  const [role, setRole] = useState<"member" | "admin">("member");

  const presets = useMemo(
    () => [
      { label: "Member", value: "member" as const },
      { label: "Admin", value: "admin" as const },
    ],
    [],
  );

  if (state.user) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <MaterialCommunityIcons name="sprout-outline" size={24} color="#fffdf8" />
          </View>
          <View>
            <Text style={styles.brandName}>Curevo</Text>
            <Text style={styles.brandTag}>Self-guided wellbeing</Text>
          </View>
        </View>
        <SectionHeader
          eyebrow="Welcome back"
          title="Start with one small, clear step."
          body="This mobile app mirrors the focus, routines, reflection, and privacy flow from the web experience with a calm, flat interface."
        />
      </View>

      <Card>
        <View style={styles.stack}>
          <TextField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="you@example.com" />
          <TextField label="Password" value={password} onChangeText={setPassword} placeholder="Your password" />

          <View style={styles.segmentRow}>
            {presets.map((preset) => {
              const active = role === preset.value;
              return (
                <Pressable key={preset.value} onPress={() => setRole(preset.value)} style={[styles.segment, active && styles.segmentActive]}>
                  <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>{preset.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Button
            label="Continue"
            onPress={() => {
              if (!email.trim()) {
                Alert.alert("Email required", "Enter an email address to continue.");
                return;
              }
              signIn({ email: email.trim(), password, role });
            }}
          />

          <Text style={styles.helper}>Demo credentials are enough here; the app is wired for future backend auth integration.</Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 18,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  brandMark: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  brandTag: {
    color: colors.subtext,
    fontSize: 12,
    fontWeight: "700",
  },
  stack: {
    gap: 14,
  },
  segmentRow: {
    flexDirection: "row",
    gap: 10,
  },
  segment: {
    flex: 1,
    minHeight: 46,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  segmentLabel: {
    color: colors.subtext,
    fontWeight: "800",
  },
  segmentLabelActive: {
    color: colors.primary,
  },
  helper: {
    color: colors.subtext,
    fontSize: 12,
    lineHeight: 18,
  },
});
