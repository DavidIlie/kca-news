import React from "react";
import Image from "next/image";
import { NextSeo } from "next-seo";
import { Fade } from "react-awesome-reveal";

import { Button } from "../ui/Button";
import { shimmer } from "../lib/shimmer";
import { getFormmatedLocation, Locations } from "../lib/categories";

interface TeamMember {
   name: string;
   department: Locations;
   photo: string;
}

const team: TeamMember[] = [
   {
      name: "Adina Tursyn",
      department: "news",
      photo: "/static/adina.jpg",
   },
   {
      name: "Sara Campos",
      department: "society",
      photo: "/static/sara.jpg",
   },
   {
      name: "Antonio López",
      department: "entertainment",
      photo: "/static/antonio.jpeg",
   },
   {
      name: "Paz Casamitjana",
      department: "sports",
      photo: "/static/paz.jpg",
   },
   {
      name: "Vadim Rikunov",
      department: "humanities",
      photo: "/static/vadim.jpg",
   },
];

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
                     KCA News is a student-led newspaper of King's College
                     Alicante. Here, we publish articles about the school news,
                     world politics, fashion, entertainment, environment, and
                     sports. Educate yourself about the global world events, or
                     indulge in detailed horoscope predictions for you and your
                     friends. Enjoy your time during breaks, registration, and
                     study periods reading all about the latest at KCA and
                     beyond!
                  </p>
                  <div className="py-6" />
                  <div className="justify-evenly gap-12 sm:flex">
                     <div>
                        <h1 className="mb-4 text-5xl font-medium">
                           Welcome from the editor
                        </h1>
                        <p className="text-justify">
                           Welcome to all the young, aspiring readers of KCA
                           News! Here, we publish articles every week on various
                           topics, including our own school, the world news, the
                           latest films, horoscopes, and recent sports events.
                           KCA News is a student-led initiative that was
                           inspired by the desire to strengthen the school
                           community by uniting KCA students as readers,
                           thinkers, and dreamers. It is our job to deliver you
                           a fruitful reading experience that you can enjoy in
                           your free time. So get comfy, open up your favorite
                           KCA News section, and enthrall yourself with the
                           stories it hides!
                        </p>
                     </div>
                     <div className="mt-4 object-cover sm:mt-0 sm:w-[200%]">
                        <Image
                           src="/static/rocio.jpg"
                           className="rounded-xl duration-150 hover:shadow-md"
                           width={500}
                           height={300}
                           blurDataURL={shimmer(1905 / 2, 957 / 2)}
                           placeholder="blur"
                           objectFit="cover"
                        />
                        <h1 className="mt-1 text-center text-lg font-semibold">
                           Rocio De La Fuente Andrade
                        </h1>
                     </div>
                  </div>
                  <h1 className="mt-8 text-center text-5xl font-medium">
                     The Team
                  </h1>
                  <div className="mx-auto mt-12 grid grid-cols-2 gap-12 sm:grid-cols-5">
                     {team.map((member, index) => (
                        <div className="hoverItem duration-150" key={index}>
                           <Image
                              src={member.photo}
                              className="mx-auto rounded-full ring-1 ring-gray-800 duration-150 hover:shadow-md"
                              width={300}
                              height={300}
                              blurDataURL={shimmer(1905 / 2, 957 / 2)}
                              placeholder="blur"
                              objectFit="cover"
                           />
                           <div className="mt-1 text-center">
                              <h1 className="text-lg font-semibold">
                                 {member.name}
                              </h1>
                              <p className="-mt-1 italic text-gray-600 dark:text-gray-300">
                                 {getFormmatedLocation(member.department)}
                              </p>
                           </div>
                        </div>
                     ))}
                  </div>
                  <div className="mt-24 mb-20 flex justify-evenly dark:bg-dark-bg">
                     <div>
                        <div className="-mt-4 flex h-full items-center">
                           <div className="container max-w-[30rem]">
                              <h1 className="mb-4 w-full text-center text-5xl font-semibold">
                                 The Creative Team
                              </h1>
                              <h1 className="mb-4 text-center">
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

export default OurTeam;
