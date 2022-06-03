import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import { Tooltip } from "@mantine/core";
import { format, formatDistance } from "date-fns";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { User } from "../../types/User";
import { ChangeableKCAName, computeKCAName } from "../../lib/computeKCAName";
import ProfileTags from "../ProfileTags";
import { Button } from "../../ui/Button";
import ArticleBadge from "../ArticleBadge";
import ProfileEditor from "./ProfileEditor";
import arrayToEnglish from "../../lib/arrayToEnglish";
import LinkifyText from "../Linkify";

interface ProfileViewerProps {
   user: User;
   editable?: boolean;
}

const ProfileViewer: React.FC<ProfileViewerProps> = ({
   user,
   editable = false,
}) => {
   const { data } = useSession();
   const router = useRouter();

   const [openEditorModal, setOpenEditorModal] = useState<boolean>(false);
   const toggleModal = () => setOpenEditorModal(!openEditorModal);

   const [userState, setUserState] = useState<User>(user);

   const writtenArticles =
      (userState._count?.articles || 0) + (userState._count?.coArticles || 0);

   const perms = [
      userState.isAdmin ? "administrator" : "",
      userState.isEditorial ? "editorial" : "",
      userState.isWriter ? "writer" : "",
      userState.isReviewer ? "reviewer" : "",
   ].filter((s) => s !== "");

   const description = `Profile about ${computeKCAName(userState)}${
      perms.length > 0
         ? `, ${
              userState.gender === "male" ? "he" : "she"
           } is part of the ${arrayToEnglish(perms)} group of permissions.`
         : "."
   } ${
      userState.isWriter && !userState.isAdmin && !userState.isEditorial
         ? `${
              userState.gender === "male" ? "He" : "She"
           } has written ${writtenArticles} article${
              writtenArticles !== 1 ? "s" : ""
           }`
         : userState.tags.length > 0
         ? `Tags: ${arrayToEnglish(userState.tags)}.`
         : ``
   }`;

   return (
      <>
         <NextSeo
            title={`${computeKCAName(userState)}'s profile`}
            description={description}
            canonical={`${process.env.NEXT_PUBLIC_APP_URL}/${router.asPath}`}
            openGraph={{
               title: `${computeKCAName(userState)}'s profile`,
               site_name: "KCA News",
               description: description,
               url: `${process.env.NEXT_PUBLIC_APP_URL}/${router.asPath}`,
               images: [
                  {
                     url: userState.image,
                     alt: `${computeKCAName(userState)}'s profile image`,
                  },
               ],
            }}
         />
         <div className="container max-w-5xl rounded-md border-2 border-gray-200 bg-white dark:border-gray-800 dark:bg-foot sm:flex">
            <div className="flex h-1/4 w-full border-b-2 border-gray-200 dark:border-gray-700 sm:block sm:h-full sm:w-1/4 sm:border-b-0 sm:border-r-2">
               <div className="w-1/3 px-6 pt-4 sm:h-1/2 sm:w-full">
                  <Tooltip
                     label="This can be changed by changing your Google profile picture."
                     disabled={!editable}
                     className="mb-2 flex w-full justify-center"
                  >
                     {editable ? (
                        <a
                           href="https://myaccount.google.com"
                           target="_blank"
                           rel="norefferrer"
                        >
                           <Image
                              src={
                                 userState.image.split("=")[0] ||
                                 userState.image
                              }
                              className="h-32 w-32 cursor-pointer rounded-full object-cover"
                              referrerPolicy="no-referrer"
                              width={150}
                              height={150}
                           />
                        </a>
                     ) : (
                        <Image
                           src={
                              userState.image.split("=")[0] || userState.image
                           }
                           className="h-32 w-32 rounded-full object-cover"
                           referrerPolicy="no-referrer"
                           width={150}
                           height={150}
                        />
                     )}
                  </Tooltip>
                  <div className="pb-4 text-center">
                     <h1 className="font-semibold sm:text-lg">
                        <ChangeableKCAName
                           user={userState}
                           showNickName={true}
                        />
                     </h1>
                     <p className="text-sm sm:text-base">
                        Joined{" "}
                        {formatDistance(
                           new Date(userState.joinedAt),
                           Date.now(),
                           {
                              addSuffix: true,
                           }
                        )}
                     </p>
                     <div className="mt-2 flex justify-center">
                        <ProfileTags user={userState} />
                     </div>
                  </div>
               </div>
               <div className="w-2/3 border-l-2 py-4 px-6 dark:border-gray-700 sm:h-1/2 sm:w-full sm:border-t-2 sm:border-l-0">
                  <div className="mb-2">
                     <h1 className="text-lg font-semibold">Description</h1>
                     <h1
                        className="mt-1 text-sm text-gray-700 line-clamp-3 dark:text-gray-200"
                        title={userState.description || "No Description"}
                     >
                        <LinkifyText>
                           {userState.description || "No description..."}
                        </LinkifyText>
                     </h1>
                  </div>
                  {user.email.endsWith("kcpupils.org") && (
                     <div className="mb-2">
                        <h1 className="text-lg font-semibold">Year Group</h1>
                        <h1
                           className={
                              userState.showYear
                                 ? "text-gray-700 dark:text-gray-200"
                                 : "font-semibold text-red-500"
                           }
                        >
                           {userState.showYear ? userState.year : "Classified"}
                        </h1>
                     </div>
                  )}
                  <div className="mb-4">
                     <h1 className="text-lg font-semibold">Status</h1>
                     <h1
                        className="text-gray-700 line-clamp-2 dark:text-gray-200"
                        title={userState.status || "No status..."}
                     >
                        <LinkifyText>
                           {userState.status || "No status..."}
                        </LinkifyText>
                     </h1>
                  </div>
                  <Button
                     className={`w-full ${
                        !(data?.user?.isAdmin || editable) && "invisible"
                     }`}
                     disabled={!(data?.user?.isAdmin || editable)}
                     onClick={toggleModal}
                  >
                     Edit
                  </Button>
               </div>
            </div>
            <div className="h-3/4 w-full flex-grow sm:h-full sm:w-3/4">
               <h1 className="borderColor border-b-2 p-4 text-2xl font-semibold">
                  Activity
               </h1>
               <div className="h-full p-4">
                  {user.articles!.length === 0 && user.comments!.length === 0 && (
                     <div className="my-12 text-center">
                        <h1 className="text-4xl font-semibold text-red-500">
                           Nothing here...
                        </h1>
                        <p className="mt-1 text-gray-500 dark:text-gray-300">
                           Embarassing...
                        </p>
                     </div>
                  )}
                  {user.articles!.length > 0 && (
                     <>
                        <h1 className="text-xl font-semibold">Top Articles:</h1>
                        <div className="mt-2">
                           {user.articles!.map((article, index) => (
                              <Link href={`/article/${article.id}`} key={index}>
                                 <a
                                    className={`hoverItem -mx-1.5 flex w-full items-center justify-between rounded-md border-2 border-gray-200 bg-gray-50 px-4 py-2 duration-150 dark:border-gray-800 dark:bg-dark-bg dark:bg-opacity-50 ${
                                       index !== user.articles!.length - 1 &&
                                       "mb-2"
                                    }`}
                                 >
                                    <p>{article.title}</p>
                                    <div className="mt-0.5 inline-flex gap-2">
                                       {article.categoryId
                                          .concat(article.tags)
                                          .map((tag, index) => (
                                             <ArticleBadge
                                                tag={tag}
                                                key={index}
                                             />
                                          ))}
                                    </div>
                                 </a>
                              </Link>
                           ))}
                        </div>
                     </>
                  )}
                  {user.comments!.length > 0 && (
                     <>
                        <h1 className="mt-2 text-xl font-semibold">
                           Latest Comment:
                        </h1>
                        <div className="hoverItem -mx-1.5 mt-2 flex gap-4 rounded-md border border-gray-200 bg-gray-50 py-4 px-4 duration-150 dark:border-gray-800 dark:bg-dark-bg dark:bg-opacity-50">
                           <Link
                              href={`/article/${user.comments![0].article!.id}`}
                           >
                              <a className="relative">
                                 <p className="w-full line-clamp-2">
                                    {user.comments![0].comment}
                                 </p>
                                 <div className="flex-col">
                                    <div className="flex items-center space-x-2">
                                       <p className="text-sm text-gray-500 dark:text-gray-300">
                                          On {user.comments![0].article!.title}
                                       </p>
                                       <span className="text-gray-800 dark:text-gray-200">
                                          /
                                       </span>
                                       <p className="text-sm text-gray-400 dark:text-gray-300">
                                          {format(
                                             new Date(
                                                user.comments![0].createdAt
                                             ),
                                             "d MMM yyyy 'at' h:mm bb"
                                          )}
                                       </p>
                                    </div>
                                 </div>
                              </a>
                           </Link>
                        </div>
                     </>
                  )}
               </div>
            </div>
         </div>
         {(data?.user?.isAdmin || editable) && (
            <ProfileEditor
               isOpen={openEditorModal}
               handleChangeState={toggleModal}
               user={userState}
               updateUser={setUserState}
            />
         )}
      </>
   );
};

export default ProfileViewer;
