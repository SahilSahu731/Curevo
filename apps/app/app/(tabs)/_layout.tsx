import { Tabs, Redirect } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useCurevo } from "@/state/useCurevoStore";
import { colors } from "@/theme/tokens";

function icon(name: keyof typeof MaterialCommunityIcons.glyphMap) {
  return ({ color, size }: { color: string; size: number }) => <MaterialCommunityIcons name={name} size={size} color={color} />;
}

export default function TabsLayout() {
  const { state } = useCurevo();

  if (!state.user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 64,
          paddingTop: 8,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Today", tabBarIcon: icon("view-dashboard-outline") }} />
      <Tabs.Screen name="focus" options={{ title: "Focus", tabBarIcon: icon("timer-outline") }} />
      <Tabs.Screen name="routines" options={{ title: "Routines", tabBarIcon: icon("check-circle-outline") }} />
      <Tabs.Screen name="reflections" options={{ title: "Notes", tabBarIcon: icon("notebook-outline") }} />
      <Tabs.Screen name="insights" options={{ title: "Insights", tabBarIcon: icon("chart-bar") }} />
    </Tabs>
  );
}
