import type { AppProps } from "next/app";
import { DefaultSeo } from "next-seo";
import NextNprogress from "nextjs-progressbar";
import { SessionProvider } from "next-auth/react";
import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";

import "../styles/globals.css";

import { isServer } from "../lib/isServer";

import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const KingsNews = ({
   Component,
   pageProps: { session, ...pageProps },
   router,
}: AppProps) => {
   if (isServer && !Component.getInitialProps) {
      return null;
   }

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
            description="Make the school cool."
         />
         <NextNprogress
            color="#156896"
            startPosition={0.3}
            stopDelayMs={200}
            height={3}
            showOnShallow={true}
         />
         <SessionProvider session={session}>
            <MantineProvider
               withGlobalStyles
               withNormalizeCSS
               theme={{
                  colorScheme: "light",
               }}
            >
               <NotificationsProvider>
                  <div className="flex h-screen flex-col">
                     <NavBar />
                     <Component {...pageProps} />
                     {!router.asPath.includes("/dashboard/writer/edit") && (
                        <Footer />
                     )}
                  </div>
               </NotificationsProvider>
            </MantineProvider>
         </SessionProvider>
      </>
   );
};

export default KingsNews;
