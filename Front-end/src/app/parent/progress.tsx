import React from "react";
import { Redirect } from "expo-router";

export default function ProgressRedirect() {
  return <Redirect href={"/parent/attendance" as any} />;
}
