import { Alert, Platform } from "react-native";

/** Alert.alert is unreliable on web — fall back to window.alert. */
export function notify(title: string, message?: string) {
  const text = message ? `${title}\n\n${message}` : title;
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.alert(text);
    return;
  }
  Alert.alert(title, message);
}

export function notifyConfirm(
  title: string,
  message: string,
  confirmLabel: string,
  onConfirm: () => void
) {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    // eslint-disable-next-line no-alert
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    { text: confirmLabel, onPress: onConfirm },
  ]);
}
