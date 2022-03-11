import type { AppProps } from "next/app";
import { DefaultSeo } from "next-seo";
import { Toaster } from "react-hot-toast";
import NextNprogress from "nextjs-progressbar";

import "../styles/globals.css";

function KingsNews({ Component, pageProps }: AppProps) {
    return (
        <>
            <DefaultSeo
                defaultTitle="King's News"
                titleTemplate="%s | King's News"
                openGraph={{
                    title: `King's News`,
                    type: `website`,
                    site_name: `King's News`,
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
            <Component {...pageProps} />
        </>
    );
}

export default KingsNews;
