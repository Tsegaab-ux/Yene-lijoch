import React from "react";
import { Redirect } from "expo-router";

export default function LegacyTeachersRedirect() {
  return <Redirect href={"/admin/groups" as any} />;
}
