import type { AppProps } from "next/app";
import { DefaultSeo } from "next-seo";
import { Toaster } from "react-hot-toast";
import NextNprogress from "nextjs-progressbar";
import { SessionProvider } from "next-auth/react";

import "../styles/globals.css";

import { isServer } from "../lib/isServer";

import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const KingsNews = ({
    Component,
    pageProps: { session, ...pageProps },
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
            <Toaster position="top-center" />
            <SessionProvider session={session}>
                <NavBar />
                <Component {...pageProps} />
                <Footer />
            </SessionProvider>
        </>
    );
};

export default KingsNews;
