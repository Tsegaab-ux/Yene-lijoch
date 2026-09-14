import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { TeacherColors as C } from "../../constants/teacherTheme";
import { TeacherEventsProvider } from "../../contexts/TeacherEventsContext";
import { TeacherStudentsProvider } from "../../contexts/TeacherStudentsContext";
import { useLanguage } from "../../contexts/LanguageContext";

export default function TeacherLayout() {
  const { t } = useLanguage();

  return (
    <TeacherEventsProvider>
      <TeacherStudentsProvider>
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
                  shadowColor: "#2C2A26",
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
              title: t("tabs.home"),
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
            name="curriculum"
            options={{
              title: t("tabs.curriculum"),
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
            name="classes"
            options={{
              title: t("tabs.students"),
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
            name="schedule"
            options={{
              title: t("tabs.events"),
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
              title: t("tabs.messages"),
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? "chatbubble" : "chatbubble-outline"}
                  size={24}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              href: null,
              title: t("tabs.profile"),
            }}
          />
        </Tabs>
      </TeacherStudentsProvider>
    </TeacherEventsProvider>
  );
}
