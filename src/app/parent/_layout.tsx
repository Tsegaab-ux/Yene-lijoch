import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { SelectedChildProvider } from "../../contexts/SelectedChildContext";
import { ParentColors as C } from "../../constants/parentTheme";

export default function ParentLayout() {
  return (
    <SelectedChildProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: C.primary,
          tabBarInactiveTintColor: C.muted,
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopColor: C.border,
            borderTopWidth: 1,
            height: Platform.OS === "ios" ? 84 : 68,
            paddingBottom: Platform.OS === "ios" ? 24 : 10,
            paddingTop: 8,
            ...Platform.select({
              ios: {
                shadowColor: C.shadow,
                shadowOpacity: 0.06,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: -2 },
              },
              default: {},
            }),
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="courses"
          options={{
            title: "Courses",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "book" : "book-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="attendance"
          options={{
            title: "Attendance",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "checkmark-done" : "checkmark-done-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: "Events",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "calendar" : "calendar-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: "Messages",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "chatbubble" : "chatbubble-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen name="profile" options={{ href: null, title: "Profile" }} />
        <Tabs.Screen
          name="notifications"
          options={{ href: null, title: "Notifications" }}
        />
        <Tabs.Screen name="lessons" options={{ href: null }} />
        <Tabs.Screen name="progress" options={{ href: null }} />
      </Tabs>
    </SelectedChildProvider>
  );
}
