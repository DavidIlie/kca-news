import type { AppProps } from "next/app";
import { useEffect } from "react";
import { DefaultSeo } from "next-seo";
import NextNprogress from "nextjs-progressbar";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider, useTheme } from "next-themes";
import { getCookie } from "cookies-next";
import { useHotkeys } from "@mantine/hooks";

import "../styles/globals.css";

import AppLayout from "../components/AppLayout";
import { useThemeStore } from "../stores/useThemeStore";
import useColorScheme from "../hooks/useColorScheme";

const KingsNews = ({
   Component,
   pageProps: { session, ...pageProps },
}: AppProps) => {
   const { updateColorScheme } = useThemeStore();

   useEffect(() => {
      updateColorScheme((getCookie("mantine-color-scheme") as any) || "light");
   }, []);

   return (
      <>
         <DefaultSeo
            defaultTitle="KCA News"
            titleTemplate="%s | KCA News"
            openGraph={{
               title: `KCA News`,
               type: `website`,
               site_name: `KCA News`,
               images: [
                  {
                     url: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
                     alt: `Logo`,
                  },
               ],
            }}
            description="KCA News is a student-led newspaper of King's College Alicante. Here, we publish articles about the school news, world politics, fashion, entertainment, environment, and sports. Educate yourself about the global world events, or indulge in detailed horoscope predictions for you and your friends. Enjoy your time during breaks, registration, and study periods reading all about the latest at KCA and beyond!"
         />
         <NextNprogress
            color="#156896"
            startPosition={0.3}
            stopDelayMs={200}
            height={3}
            showOnShallow={true}
         />
         <SessionProvider session={session}>
            <ThemeProvider attribute="class">
               <ThemeHandler>
                  <AppLayout>
                     <Component {...pageProps} />
                  </AppLayout>
               </ThemeHandler>
            </ThemeProvider>
         </SessionProvider>
      </>
   );
};

const ThemeHandler: React.FC = ({ children }) => {
   const { setTheme } = useTheme();

   const { colorScheme, toggleColorScheme } = useColorScheme();

   useEffect(() => setTheme(colorScheme || "light"));

   useHotkeys([
      [
         "ctrl+shift+e",
         () =>
            colorScheme === "dark"
               ? toggleColorScheme("light")
               : toggleColorScheme("dark"),
      ],
   ]);

   return <>{children}</>;
};

export default KingsNews;
