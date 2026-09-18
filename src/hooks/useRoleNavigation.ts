// hooks/useRoleNavigation.ts
import { useRouter } from "expo-router";
import { useAuth } from "./useAuth";
import { User } from "@/types/authTypes";

export const useRoleNavigation = () => {
  const router = useRouter();

  const navigateBasedOnRole = (user: User) => {
    const userRole = user?.role_name || '';

    switch (userRole.toLowerCase()) {
      case 'teacher':
        router.replace("/teacher");
        break;
      case 'parent':
        router.replace("/parent");
        break;
      case 'admin':
        router.replace("/admin");
        break;
      default:
        router.replace("/");
        break;
    }
  };

  const getDashboardRoute = (user: User): string => {
    const userRole = user?.role_name || '';

    switch (userRole.toLowerCase()) {
      case 'teacher':
        return "/teacher";
      case 'parent':
        return "/parent";
      case 'admin':
        return "/admin";
      default:
        return "/";
    }
  };

  return { navigateBasedOnRole, getDashboardRoute };
};