import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store";
import { authService } from "@/services/auth.service";

export function useDeleteAccount() {
  const reset = useAuthStore((state) => state.reset);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload?: { password?: string }) =>
      authService.deleteAccount(payload),
    onSettled: () => {
      reset();
      queryClient.clear();
    },
  });
}
