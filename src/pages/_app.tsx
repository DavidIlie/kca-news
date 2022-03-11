import type { AppProps } from 'next/app'
import { DefaultSeo } from 'next-seo'

import '../styles/globals.css'

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
      <Component {...pageProps} />
    </>
  )
}

export default KingsNews
