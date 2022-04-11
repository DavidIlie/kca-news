import type { AppProps } from "next/app";
import Head from "next/head";
import { DefaultSeo } from "next-seo";
import NextNprogress from "nextjs-progressbar";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

import "../styles/globals.css";

import AppLayout from "../components/AppLayout";

const KingsNews = ({
   Component,
   pageProps: { session, ...pageProps },
}: AppProps) => {
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
         <Head>
            <meta
               name="viewport"
               content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
            />
         </Head>
         <NextNprogress
            color="#156896"
            startPosition={0.3}
            stopDelayMs={200}
            height={3}
            showOnShallow={true}
         />
         <SessionProvider session={session}>
            <ThemeProvider attribute="class">
               <AppLayout>
                  <Component {...pageProps} />
               </AppLayout>
            </ThemeProvider>
         </SessionProvider>
      </>
   );
};

export default KingsNews;
