import NextDocument, { Html, Head, Main, NextScript } from "next/document";
import { createGetInitialProps } from "@mantine/next";

const getInitialProps = createGetInitialProps();

export default class _Document extends NextDocument {
   static getInitialProps = getInitialProps;
   render() {
      return (
         <Html lang="en">
            <Head />
            <body className="dark:bg-dark-bg">
               <Main />
               <NextScript />
            </body>
         </Html>
      );
   }
}
