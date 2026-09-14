import React from "react";
import { Redirect } from "expo-router";

export default function LegacyClassesRedirect() {
  return <Redirect href={"/admin/groups" as any} />;
}
