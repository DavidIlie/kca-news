import React from "react";
import { useRouter } from "next/router";
import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";

import NavBar from "../NavBar";
import Footer from "../Footer";

import useColorScheme from "../../hooks/useColorScheme";

interface AppLayoutProps {
   children: React.ReactNode | React.ReactNode[];
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
   const router = useRouter();
   const { colorScheme } = useColorScheme();

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
