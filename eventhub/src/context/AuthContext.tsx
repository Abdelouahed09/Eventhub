import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getMe, login as loginRequest } from "../api/auth";
import { queryKeys } from "../api/queryKeys";
import type { User } from "../types";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const TOKEN_KEY = "eventhub_token";
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );

  const meQuery = useQuery({
    queryKey: queryKeys.me,
    queryFn: () => getMe(token ?? undefined),
    enabled: Boolean(token),
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginRequest(email, password),
    onSuccess: (result) => {
      localStorage.setItem(TOKEN_KEY, result.token);
      setToken(result.token);
      queryClient.setQueryData(queryKeys.me, result.user);
    },
  });

  useEffect(() => {
    if (!meQuery.isError || !token) return;
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    void queryClient.removeQueries({ queryKey: queryKeys.me });
  }, [meQuery.isError, token, queryClient]);

  const login = useCallback(
    async (email: string, password: string) => {
      await loginMutation.mutateAsync({ email, password });
    },
    [loginMutation],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    void queryClient.removeQueries({ queryKey: queryKeys.me });
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: meQuery.data ?? null,
      token,
      loading: Boolean(token) && meQuery.isPending,
      login,
      logout,
    }),
    [meQuery.data, meQuery.isPending, token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
