import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AdminDataProvider } from "../../contexts/AdminDataContext";
import { AdminColors as C } from "../../constants/adminTheme";

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
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="grid-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="teachers"
          options={{
            title: "Teachers",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="school-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="children"
          options={{
            title: "Children",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="happy-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="classes"
          options={{
            title: "Classes",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            title: "More",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="ellipsis-horizontal" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </AdminDataProvider>
  );
}
