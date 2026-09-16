// utils/notify.ts
import { Alert, Platform } from "react-native";

type NotifyButton = {
  text: string;
  style?: "cancel" | "destructive" | "default";
  onPress?: () => void;
};

export function notify(
  title: string,
  message: string,
  buttons?: NotifyButton[]
) {
  if (Platform.OS === "web") {
    const ok = buttons?.find((b) => b.style !== "cancel");
    // eslint-disable-next-line no-alert
    if (window.confirm(`${title}\n\n${message}`)) {
      ok?.onPress?.();
    }
  } else {
    Alert.alert(title, message, buttons);
  }
}