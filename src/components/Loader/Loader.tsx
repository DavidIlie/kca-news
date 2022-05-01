import { NextSeo } from "next-seo";
import { Fade } from "react-awesome-reveal";

const Loader = (): JSX.Element => {
   return (
      <>
         <NextSeo title="Loading" />
         <section className="flex h-screen items-center justify-center bg-white dark:bg-dark-bg">
            <Fade>
               <div className="loading-loader">
                  <span />
                  <span />
                  <span />
                  <span />
               </div>
            </Fade>
         </section>
      </>
   );
};

export default Loader;
