import React from "react";
import { Redirect } from "expo-router";

export default function LegacyMoreEventsRedirect() {
  return <Redirect href={"/admin/events" as any} />;
}
