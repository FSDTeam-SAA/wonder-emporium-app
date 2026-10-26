import { useMutation } from "@tanstack/react-query";
import { Keyboard } from "react-native";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store";
import type { LoginDto } from "../types";

export function useLogin() {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: LoginDto) => authService.login(payload),
    onSuccess: (data) => {
      Keyboard.dismiss();
      setTimeout(() => {
        setUser(data.user);
      }, 150);
    },
  });
}
