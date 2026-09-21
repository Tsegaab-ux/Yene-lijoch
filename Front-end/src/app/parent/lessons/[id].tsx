import React from "react";
import { Redirect } from "expo-router";

export default function LessonDetailRedirect() {
  return <Redirect href={"/parent/courses" as any} />;
}
