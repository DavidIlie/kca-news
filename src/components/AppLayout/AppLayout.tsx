import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { useHotkeys } from "@mantine/hooks";

import NavBar from "../NavBar";
import Footer from "../Footer";

import useColorScheme from "../../hooks/useColorScheme";

interface AppLayoutProps {
   children: React.ReactNode | React.ReactNode[];
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
   const router = useRouter();

   const { setTheme } = useTheme();

   const { colorScheme, toggleColorScheme } = useColorScheme();

   useEffect(() => setTheme(colorScheme), []);

   useHotkeys([
      [
         "ctrl+shift+e",
         () =>
            colorScheme === "dark"
               ? toggleColorScheme("light")
               : toggleColorScheme("dark"),
      ],
   ]);

   return (
      <MantineProvider theme={{ colorScheme: colorScheme }}>
         <NotificationsProvider>
            <div className="flex h-screen flex-col bg-white dark:bg-dark-bg">
               <NavBar />
               {children}
               {!router.asPath.includes("/dashboard/writer/edit") && <Footer />}
            </div>
         </NotificationsProvider>
      </MantineProvider>
   );
};

export default AppLayout;
