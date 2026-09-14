import React from "react";
import { Redirect } from "expo-router";

export default function LegacyLessonsRedirect() {
  return <Redirect href={"/admin/curriculum" as any} />;
}
