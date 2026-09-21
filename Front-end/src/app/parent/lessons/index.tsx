import React from "react";
import { Redirect } from "expo-router";

export default function LessonsRedirect() {
  return <Redirect href={"/parent/courses" as any} />;
}
