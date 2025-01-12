"use client";

import { Provider } from "react-redux";
import { store } from "../redux/store";
import AuthSync from "./AuthSync";
import { SessionProvider } from "next-auth/react";

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <Provider store={store}>
        <AuthSync />
        {children}
      </Provider>
    </SessionProvider>
  );
}
