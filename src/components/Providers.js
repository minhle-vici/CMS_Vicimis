"use client";

import { SessionProvider } from "next-auth/react";
import { NotificationProvider } from "./Notification";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </SessionProvider>
  );
}
