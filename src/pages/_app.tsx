import type { AppProps } from "next/app";
import { GetServerSidePropsContext } from "next";
import { useEffect } from "react";
import { DefaultSeo } from "next-seo";
import NextNprogress from "nextjs-progressbar";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { getCookie } from "cookies-next";
import { ColorScheme } from "@mantine/core";

import "../styles/globals.css";

import AppLayout from "../components/AppLayout";
import { useThemeStore } from "../stores/useThemeStore";

const KingsNews = ({
   Component,
   colorScheme,
   pageProps: { session, ...pageProps },
}: AppProps & { colorScheme: ColorScheme }) => {
   const { colorScheme: stateColorScheme, updateColorScheme } = useThemeStore();

   useEffect(() => {
      updateColorScheme(colorScheme);
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
                     url: ``,
                     alt: `Logo`,
                  },
               ],
            }}
            description="KCA News is a website run by the students for other students or teachers to visit in King's College Alicante. KCA News has many articles written for many categories and topics occuring throughout the world. Make the school cool."
         />
         <NextNprogress
            color="#156896"
            startPosition={0.3}
            stopDelayMs={200}
            height={3}
            showOnShallow={true}
         />
         <SessionProvider session={session}>
            {stateColorScheme !== undefined && (
               <ThemeProvider attribute="class">
                  <AppLayout>
                     <Component {...pageProps} />
                  </AppLayout>
               </ThemeProvider>
            )}
         </SessionProvider>
      </>
   );
};

KingsNews.getInitialProps = ({ ctx }: { ctx: GetServerSidePropsContext }) => ({
   colorScheme: getCookie("mantine-color-scheme", ctx) || "light",
});

export default KingsNews;
