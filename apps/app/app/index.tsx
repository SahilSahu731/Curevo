import { Redirect } from "expo-router";

import { useCurevo } from "@/state/useCurevoStore";

export default function Index() {
  const { state } = useCurevo();
  return <Redirect href={state.user ? "/(tabs)" : "/sign-in"} />;
}
