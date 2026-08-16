import { Stack } from "expo-router";

import { CurevoProvider } from "@/state/useCurevoStore";
import { colors } from "@/theme/tokens";

export default function RootLayout() {
  return (
    <CurevoProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
    </CurevoProvider>
  );
}
