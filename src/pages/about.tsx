import React from "react";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";
import { Fade } from "react-awesome-reveal";

import { Button } from "../ui/Button";

const OurTeam: React.FC = () => {
   return (
      <>
         <NextSeo title="About" />
         <div className="flex flex-grow px-4 dark:bg-dark-bg sm:pt-24 lg:px-0">
            <div className="container mx-auto mt-10 max-w-7xl">
               <Fade cascade triggerOnce duration={300}>
                  <h1 className="mb-4 text-5xl font-medium">
                     What is KCA News?
                  </h1>
                  <p className="text-justify">
                     Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                     Donec auctor magna semper tortor finibus gravida. Donec
                     libero ante, dapibus ut orci sit amet, volutpat facilisis
                     massa. Aenean sed nulla ac nunc pharetra porttitor. Nullam
                     viverra nibh lectus. Pellentesque nisl felis, suscipit id
                     leo sed, accumsan accumsan mi. Mauris a lacus vehicula,
                     ullamcorper odio ut, venenatis dolor. Vivamus vel nisi ex.
                     Integer tempus turpis pellentesque nibh imperdiet, sed
                     molestie enim consequat.
                  </p>
                  <div className="py-6" />
                  <div className="justify-evenly gap-12 sm:flex">
                     <div>
                        <h1 className="mb-4 text-5xl font-medium">
                           Welcome from the editor
                        </h1>
                        <p className="text-justify">
                           Lorem ipsum dolor sit amet, consectetur adipiscing
                           elit. Donec auctor magna semper tortor finibus
                           gravida. Donec libero ante, dapibus ut orci sit amet,
                           volutpat facilisis massa. Aenean sed nulla ac nunc
                           pharetra porttitor. Nullam viverra nibh lectus.
                           Pellentesque nisl felis, suscipit id leo sed,
                           accumsan accumsan mi. Mauris a lacus vehicula,
                           ullamcorper odio ut, venenatis dolor. Vivamus vel
                           nisi ex. Integer tempus turpis pellentesque nibh
                           imperdiet, sed molestie enim consequat.
                        </p>
                     </div>
                     <div className="mt-4 object-cover sm:mt-0 sm:w-[200%]">
                        <img
                           src="./kings-alicante-1.jpg"
                           className="rounded-xl duration-150 hover:shadow-md"
                        />
                        <h1 className="mt-1 text-center text-lg font-semibold">
                           Name
                        </h1>
                     </div>
                  </div>
                  <h1 className="mt-8 text-center text-5xl font-medium">
                     The Team
                  </h1>
                  <div className="mx-auto mt-12 grid grid-cols-4 gap-12">
                     <div className="hoverItem duration-150">
                        <img
                           src="/no-pfp.jpg"
                           className="mx-auto w-[70%] rounded-full ring-1 ring-gray-800 duration-150 hover:shadow-md"
                        />
                        <h1 className="mt-1 text-center text-lg font-semibold">
                           Name
                        </h1>
                     </div>
                     <div className="hoverItem duration-150">
                        <img
                           src="/no-pfp.jpg"
                           className="mx-auto w-[70%] rounded-full ring-1 ring-gray-800 duration-150 hover:shadow-md"
                        />
                        <h1 className="mt-1 text-center text-lg font-semibold">
                           Name
                        </h1>
                     </div>
                     <div className="hoverItem duration-150">
                        <img
                           src="/no-pfp.jpg"
                           className="mx-auto w-[70%] rounded-full ring-1 ring-gray-800 duration-150 hover:shadow-md"
                        />
                        <h1 className="mt-1 text-center text-lg font-semibold">
                           Name
                        </h1>
                     </div>
                     <div className="hoverItem duration-150">
                        <img
                           src="/no-pfp.jpg"
                           className="mx-auto w-[70%] rounded-full ring-1 ring-gray-800 duration-150 hover:shadow-md"
                        />
                        <h1 className="mt-1 text-center text-lg font-semibold">
                           Name
                        </h1>
                     </div>
                  </div>
                  <div className="mt-24 mb-20 flex justify-evenly dark:bg-dark-bg">
                     <div>
                        <h1 className="text-5xl font-semibold">
                           The Creative Team
                        </h1>
                        <div className="-mt-4 flex h-full items-center">
                           <div className="container max-w-sm">
                              <h1 className="mb-4 text-center font-medium">
                                 Want to help with writing articles, contribute
                                 new ideas or show off to other KCA students?
                              </h1>
                              <Button className="mx-auto text-xl">
                                 <a href="" target="_blank" rel="noreferrer">
                                    Join the writer team
                                 </a>
                              </Button>
                           </div>
                        </div>
                     </div>
                     <img
                        src="./kings-alicante-1.jpg"
                        className="aspect-[3/2] w-[40%] rounded-xl object-cover duration-150 hover:shadow-md"
                     />
                  </div>
               </Fade>
            </div>
         </div>
      </>
   );
};

export const getServerSideProps: GetServerSideProps = async () => {
   return {
      props: {},
   };
};

export default OurTeam;
