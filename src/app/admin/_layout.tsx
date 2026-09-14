import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { AdminColors as C } from "../../constants/adminTheme";
import { AdminDataProvider } from "../../contexts/AdminDataContext";

export default function AdminLayout() {
  return (
    <AdminDataProvider>
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
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginTop: 2 },
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
        name="videos"
        options={{
          title: "Videos",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "videocam" : "videocam-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="curriculum"
        options={{
          title: "Curriculum",
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
        name="groups"
        options={{
          title: "Groups",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
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
        name="notifications"
        options={{ href: null, title: "Notifications" }}
      />
      <Tabs.Screen name="teachers" options={{ href: null }} />
      <Tabs.Screen name="children" options={{ href: null }} />
      <Tabs.Screen name="classes" options={{ href: null }} />
      <Tabs.Screen name="more" options={{ href: null }} />
    </Tabs>
    </AdminDataProvider>
  );
}
