import React from "react";
import { Redirect } from "expo-router";

export default function LegacyTeacherDetailRedirect() {
  return <Redirect href={"/admin/groups" as any} />;
}
