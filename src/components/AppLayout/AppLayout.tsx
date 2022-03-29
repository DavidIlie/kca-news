import React from "react";
import { useRouter } from "next/router";
import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { useTheme } from "next-themes";
import { useHotkeys } from "@mantine/hooks";

import NavBar from "../NavBar";
import Footer from "../Footer";

interface AppLayoutProps {
   children: React.ReactNode | React.ReactNode[];
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
   const router = useRouter();
   const { resolvedTheme, setTheme } = useTheme();

   useHotkeys([
      [
         "ctrl+shift+e",
         () =>
            resolvedTheme === "dark" ? setTheme("light") : setTheme("dark"),
      ],
   ]);

   return (
      <MantineProvider theme={{ colorScheme: resolvedTheme }}>
         <NotificationsProvider>
            <div className="flex h-screen flex-col bg-white dark:bg-gray-900">
               <NavBar />
               {children}
               {!router.asPath.includes("/dashboard/writer/edit") && <Footer />}
            </div>
         </NotificationsProvider>
      </MantineProvider>
   );
};

export default AppLayout;
