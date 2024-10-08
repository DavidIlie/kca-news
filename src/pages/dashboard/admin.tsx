import React, { useState, Fragment } from "react";
import Link from "next/link";
import { NextSeo } from "next-seo";
import { GetServerSideProps } from "next";
import { Formik, Field, Form } from "formik";
import { getSession } from "next-auth/react";
import { Menu, Tab, Transition } from "@headlessui/react";
import { useSession } from "next-auth/react";
import {
   Badge,
   LoadingOverlay,
   Tooltip,
   MultiSelect,
   TextInput,
   Select,
} from "@mantine/core";
import { useNotifications } from "@mantine/notifications";
import { BsHammer, BsThreeDotsVertical } from "react-icons/bs";
import { BiUserCircle } from "react-icons/bi";
import { MdAccessibility } from "react-icons/md";
import {
   AiOutlineCheck,
   AiOutlineClose,
   AiOutlineFilter,
   AiOutlineSearch,
   AiOutlineTags,
} from "react-icons/ai";
import * as yup from "yup";

import DashboardStatistics from "@/components/DashboardStatistics";
import ProfileTags from "@/components/ProfileTags";
import DropdownElement from "@/ui/DropdownElement";
import Modal from "@/ui/Modal";
import { Button } from "@/ui/Button";
import NextLink from "@/ui/NextLink";
import prisma from "@/lib/prisma";
import { User } from "@/types/User";
import { computeKCAName } from "@/lib/computeKCAName";
import { tagArray } from "@/types/Tag";
import { departmentSchema, tagSchema } from "@/schema/admin";
import classNames from "@/lib/classNames";
import { fullLocations, getFormmatedLocation } from "@/lib/categories";
import ConfirmModal from "@/ui/ConfirmModal";

import { Statistics } from "./writer";

const emailSchema = yup
   .object()
   .shape({ email: yup.string().email().required() });

interface Props {
   statistics: Statistics;
   users: User[];
}

const AdminPage: React.FC<Props> = ({ statistics, users }) => {
   const { data } = useSession();
   const notifications = useNotifications();
   const [bigLoading, setBigLoading] = useState<boolean>(false);
   const [baseUsers, _setBaseUsers] = useState<User[]>(users);
   const [usersState, setUsersState] = useState<User[]>(baseUsers);

   const [openTagEditor, setOpenTagEditor] = useState<boolean>(false);
   const [tagEditorUser, setTagEditorUser] = useState<User | null>(null);
   const [openAccessEditor, setOpenAccessEditor] = useState<boolean>(false);
   const [accessEditorUser, setAccessEditorUser] = useState<User | null>(null);

   const [searchQuery, setSearchQuery] = useState<string>("");
   const [hasSearched, setHasSearched] = useState<boolean>(false);
   const [filter, setFilter] = useState<string | null>(null);

   const [confirmModalEmail, setConfirmModalEmail] = useState<string | null>(
      null
   );

   const [openRestoreAccountModal, setOpenRestoreAccountModal] =
      useState<boolean>(false);

   const options = ["Users", "Articles", "Comments"];

   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;

      setHasSearched(true);
      setSearchQuery(val);

      setUsersState(
         baseUsers.filter(
            (user) =>
               user.name.toLowerCase().includes(val.toLowerCase()) ||
               user.email.toLowerCase().includes(val.toLowerCase())
         )
      );
   };

   const handleFilter = (v: string) => {
      setFilter(v);
      setSearchQuery("");
      setUsersState(baseUsers);

      switch (v) {
         case "writer":
            setUsersState(baseUsers.filter((user) => user.isWriter));
            break;
         case "reviewer":
            setUsersState(baseUsers.filter((user) => user.isReviewer));
            break;
         case "admin":
            setUsersState(baseUsers.filter((user) => user.isAdmin));
            break;
         case "muted":
            setUsersState(baseUsers.filter((user) => !user.canComment));
            break;
         case "newest":
            setUsersState(
               baseUsers.sort(
                  (a, b) =>
                     new Date(b.joinedAt).getTime() -
                     new Date(a.joinedAt).getTime()
               )
            );
            break;
         case "oldest":
            setUsersState(
               baseUsers.sort(
                  (a, b) =>
                     new Date(a.joinedAt).getTime() -
                     new Date(b.joinedAt).getTime()
               )
            );
            break;
         case "most-articles":
            setUsersState(
               baseUsers.sort((a, b) => b._count!.articles - a._count!.articles)
            );
            break;
         case "most-coarticles":
            setUsersState(
               baseUsers.sort(
                  (a, b) => b._count!.coArticles - a._count!.coArticles
               )
            );
            break;
         case "most-comments":
            setUsersState(
               baseUsers.sort((a, b) => b._count!.comments - a._count!.comments)
            );
            break;
         case "most-upvotes":
            setUsersState(
               baseUsers.sort((a, b) => b._count!.upvotes - a._count!.upvotes)
            );
            break;
         case "most-downvotes":
            setUsersState(
               baseUsers.sort(
                  (a, b) => b._count!.downvotes - a._count!.downvotes
               )
            );
            break;
         default:
            setUsersState(
               baseUsers.sort(
                  (a, b) =>
                     new Date(b.joinedAt).getTime() -
                     new Date(a.joinedAt).getTime()
               )
            );
            break;
      }
   };

   return (
      <>
         <NextSeo title="Admin" />
         <LoadingOverlay visible={bigLoading} className="fixed" />
         <div className="flex flex-grow px-4 pt-10 dark:bg-dark-bg sm:pt-32">
            <div className="container mx-auto max-w-7xl">
               <DashboardStatistics
                  isAdmin={true}
                  {...statistics}
                  className="mx-auto max-w-7xl lg:px-8"
               />
               <Tab.Group as="div" className="mx-2 mt-6 mb-8 sm:mx-8">
                  <Tab.List className="flex p-1 space-x-1 bg-gray-100 border-2 border-gray-200 rounded-xl dark:border-gray-800 dark:bg-foot">
                     {options.map((option, index) => {
                        if (index > 0) {
                           return (
                              <Link
                                 href={
                                    index === 1
                                       ? "/dashboard/writer"
                                       : index === 2
                                       ? "/dashboard/reviewer"
                                       : ""
                                 }
                                 key={index}
                              >
                                 <a
                                    className={classNames(
                                       "w-full rounded-lg py-2.5 text-center text-sm font-medium leading-5 duration-150",
                                       "text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-dark-bg dark:hover:bg-opacity-60"
                                    )}
                                 >
                                    {option}
                                 </a>
                              </Link>
                           );
                        } else {
                           return (
                              <Tab
                                 key={index}
                                 className={({ selected }) =>
                                    classNames(
                                       "w-full rounded-lg py-2.5 text-sm font-medium leading-5 duration-150",
                                       selected
                                          ? "bg-white text-gray-800 shadow dark:bg-dark-bg dark:text-gray-100"
                                          : "text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:text-gray-300"
                                    )
                                 }
                              >
                                 {option}
                              </Tab>
                           );
                        }
                     })}
                  </Tab.List>
                  <div className="flex items-center justify-between mt-4">
                     <div className="flex items-center gap-2">
                        <TextInput
                           icon={<AiOutlineSearch />}
                           placeholder="Search"
                           value={searchQuery}
                           onChange={handleSearch}
                           error={usersState.length === 0 && hasSearched}
                           classNames={{
                              filledVariant:
                                 "dark:bg-foot border-2 dark:border-gray-800 border-gray-300",
                           }}
                           className="w-full sm:w-auto"
                           size="md"
                        />
                        <Select
                           placeholder="Filter"
                           clearable
                           allowDeselect
                           nothingFound="No options"
                           maxDropdownHeight={180}
                           icon={<AiOutlineFilter />}
                           data={[
                              { value: "writer", label: "Writer" },
                              { value: "reviewer", label: "Reviewer" },
                              { value: "muted", label: "Muted" },
                              { value: "admin", label: "Administrator" },
                              {
                                 value: "most-articles",
                                 label: "Most Articles",
                              },
                              {
                                 value: "most-coarticles",
                                 label: "Most Co Articles",
                              },
                              {
                                 value: "most-comments",
                                 label: "Most Comments",
                              },
                              { value: "most-upvotes", label: "Most Likes" },
                              {
                                 value: "most-downvotes",
                                 label: "Most Dislikes",
                              },
                              { value: "newest", label: "Newest" },
                              { value: "oldest", label: "Oldest" },
                           ]}
                           value={filter}
                           onChange={handleFilter}
                           classNames={{
                              filledVariant:
                                 "dark:bg-foot border-2 dark:border-gray-800 border-gray-300",
                              dropdown:
                                 "dark:bg-foot border-2 dark:border-gray-800 border-gray-300",
                           }}
                           className="w-full sm:w-auto"
                           size="md"
                        />
                        <p className="font-medium">
                           Total Users: {usersState.length}
                        </p>
                     </div>
                     {data?.user?.isAdmin && (
                        <Button
                           onClick={() => setOpenRestoreAccountModal(true)}
                           disabled={openRestoreAccountModal}
                        >
                           Restore Account
                        </Button>
                     )}
                  </div>
                  <div className="mt-2">
                     {usersState.length === 0 && (
                        <h1 className="mt-4 text-4xl font-semibold text-center">
                           No users...
                        </h1>
                     )}
                     {usersState.map((user, index) => (
                        <div
                           className={`flex items-center justify-between rounded-md border-2 border-gray-100 bg-gray-50 px-6 py-2 dark:border-gray-800 dark:bg-foot ${
                              index !== usersState.length - 1 && "mb-2"
                           }`}
                           key={index}
                        >
                           <div className="items-center gap-4 sm:flex">
                              <div className="flex items-center gap-2 mr-0">
                                 <img
                                    src={user.image}
                                    alt={`${computeKCAName(
                                       user
                                    )}'s profile image`}
                                    className="w-16 rounded-full"
                                    referrerPolicy="no-referrer"
                                 />
                                 <Link href={`/profile/${user.id}`}>
                                    <a className="text-xl font-medium duration-150 cursor-pointer hover:text-blue-500">
                                       {computeKCAName(user)}{" "}
                                       {user.id === data?.user?.id && "(you)"}
                                    </a>
                                 </Link>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mt-2 sm:mt-0">
                                 {(user.isAdmin || user.isWriter) && (
                                    <>
                                       <Tooltip
                                          label={`${
                                             user._count!.coArticles
                                          } Co ${
                                             user._count!.coArticles !== 1
                                                ? "Articles"
                                                : "Article"
                                          }`}
                                          className="w-full"
                                       >
                                          <Badge className="w-full">
                                             {user._count!.articles} Article
                                             {user._count!.articles !== 1 &&
                                                "s"}
                                          </Badge>
                                       </Tooltip>
                                    </>
                                 )}
                                 <Badge
                                    className={`${
                                       (user.isAdmin || user.isWriter) && "mt-1"
                                    }`}
                                 >
                                    {user._count!.comments} Comment
                                    {user._count!.comments !== 1 && "s"}
                                 </Badge>
                                 <Badge>
                                    {user._count!.upvotes} Like
                                    {user._count!.upvotes !== 1 && "s"}
                                 </Badge>
                                 <Badge>
                                    {user._count!.downvotes} Dislike
                                    {user._count!.downvotes !== 1 && "s"}
                                 </Badge>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                              <ProfileTags user={user} />
                              <Menu as="div" className="relative">
                                 <Menu.Button
                                    as={BsThreeDotsVertical}
                                    size={25}
                                    className="cursor-pointer"
                                 />
                                 <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                 >
                                    <Menu.Items className="absolute right-0 z-10 mt-2 -mr-4 border-2 border-gray-200 rounded-md shadow-lg w-36 bg-gray-50 ring-1 ring-black ring-opacity-5 focus:outline-none dark:border-gray-800 dark:bg-foot">
                                       <Menu.Item
                                          as={NextLink}
                                          href={`/profile/${user.id}`}
                                       >
                                          <DropdownElement>
                                             <BiUserCircle className="mx-0.5 text-xl" />
                                             View Profile
                                          </DropdownElement>
                                       </Menu.Item>
                                       <Menu.Item
                                          onClick={() => {
                                             setOpenTagEditor(true);
                                             setTagEditorUser(user);
                                          }}
                                       >
                                          <DropdownElement>
                                             <AiOutlineTags className="mx-0.5 text-xl" />
                                             Change Tags
                                          </DropdownElement>
                                       </Menu.Item>
                                       <Menu.Item
                                          onClick={() => {
                                             setOpenAccessEditor(true);
                                             setAccessEditorUser(user);
                                          }}
                                       >
                                          <DropdownElement>
                                             <MdAccessibility className="mx-0.5 text-xl" />
                                             Change Access
                                          </DropdownElement>
                                       </Menu.Item>
                                       {user.id !== data?.user?.id &&
                                          data?.user?.isAdmin && (
                                             <Menu.Item
                                                onClick={() =>
                                                   setConfirmModalEmail(
                                                      user.email
                                                   )
                                                }
                                             >
                                                <DropdownElement color="red">
                                                   <BsHammer className="mx-0.5 text-xl" />
                                                   Ban User
                                                </DropdownElement>
                                             </Menu.Item>
                                          )}
                                    </Menu.Items>
                                 </Transition>
                              </Menu>
                           </div>
                        </div>
                     ))}
                  </div>
               </Tab.Group>
            </div>
         </div>
         <ConfirmModal
            isOpen={confirmModalEmail !== null}
            updateModalState={() => setConfirmModalEmail(null)}
            successFunction={async () => {
               setBigLoading(true);
               const r = await fetch(`/api/admin/delete/${confirmModalEmail}`, {
                  credentials: "include",
               });
               if (r.status !== 200) {
                  const response = await r.json();
                  notifications.showNotification({
                     color: "red",
                     title: "Ban User - Error",
                     message: response.message || "Unknown Error",
                     icon: <AiOutlineClose />,
                     autoClose: 5000,
                  });
               } else {
                  setUsersState(
                     usersState.filter((u) => u.email !== confirmModalEmail)
                  );
               }
               setBigLoading(false);
            }}
         />
         <Modal
            isOpen={openTagEditor}
            updateModalState={() => {
               setOpenTagEditor(!openTagEditor);
               setTagEditorUser(null);
            }}
            title="User Tag Editor"
            noAutoClose
            width="xl"
         >
            <div className="mt-2">
               {tagEditorUser !== null && (
                  <Formik
                     validateOnChange={false}
                     validateOnBlur={false}
                     validationSchema={tagSchema}
                     initialValues={{
                        tags: tagEditorUser.tags,
                     }}
                     onSubmit={async (data, { setSubmitting }) => {
                        setSubmitting(true);
                        setBigLoading(true);

                        const r = await fetch(
                           `/api/admin/tags?id=${tagEditorUser.id}`,
                           {
                              credentials: "include",
                              method: "POST",
                              body: JSON.stringify(data),
                           }
                        );
                        const response = await r.json();

                        if (r.status === 200) {
                           let final = [] as User[];
                           usersState.forEach((user) => {
                              if (user.id === tagEditorUser?.id) {
                                 let cUser = user;
                                 cUser.tags = data.tags;
                                 final.push(cUser);
                              } else {
                                 final.push(user);
                              }
                           });
                           setUsersState(final);
                        } else {
                           notifications.showNotification({
                              color: "red",
                              title: "Edit Tags - Error",
                              message: response.message || "Unknown Error",
                              icon: <AiOutlineClose />,
                              autoClose: 5000,
                           });
                        }

                        setBigLoading(false);
                        setSubmitting(false);
                     }}
                  >
                     {({ errors, isSubmitting, values, setFieldValue }) => (
                        <Form>
                           <Field
                              as={MultiSelect}
                              value={values.tags}
                              onChange={(v: string) => setFieldValue("tags", v)}
                              data={tagArray.map((tag) => ({
                                 value: tag,
                                 label:
                                    tag.charAt(0).toUpperCase() + tag.slice(1),
                              }))}
                              label="Tags"
                              placeholder="Select tags"
                              name="tags"
                              classNames={{
                                 filledVariant:
                                    "dark:bg-dark-bg border-2 dark:border-gray-800 border-gray-300",
                                 dropdown:
                                    "dark:bg-dark-bg border-2 dark:border-gray-800 border-gray-300",
                                 selected: "dark:bg-foot",
                              }}
                              error={errors.tags}
                           />
                           <div className="mt-4">
                              <Button
                                 className="w-full"
                                 loading={isSubmitting}
                                 disabled={isSubmitting}
                              >
                                 Update
                              </Button>
                           </div>
                        </Form>
                     )}
                  </Formik>
               )}
            </div>
         </Modal>
         <Modal
            isOpen={openAccessEditor}
            updateModalState={() => {
               setOpenAccessEditor(!openAccessEditor);
               setAccessEditorUser(null);
            }}
            title="User Access Editor"
            width="xl"
            noAutoClose
         >
            <div className="mt-2">
               {accessEditorUser?.isAdmin && (
                  <p className="mb-2 font-medium">
                     Contact developer to remove administrator privileges.
                  </p>
               )}
               <div className="flex gap-2 justify-evenly">
                  <Button
                     className="w-full"
                     disabled={accessEditorUser?.isAdmin}
                     color={
                        accessEditorUser?.isWriter ? "secondary" : "primary"
                     }
                     onClick={async () => {
                        setBigLoading(true);

                        const r = await fetch(
                           `/api/admin/setWriter?id=${accessEditorUser?.id}`,
                           {
                              credentials: "include",
                           }
                        );
                        const response = await r.json();

                        if (r.status === 200) {
                           let final = [] as User[];
                           usersState.forEach((user) => {
                              if (user.id === accessEditorUser?.id) {
                                 let cUser = user;
                                 cUser.isWriter = !cUser.isWriter;
                                 final.push(cUser);
                              } else {
                                 final.push(user);
                              }
                           });
                           setUsersState(final);
                        } else {
                           notifications.showNotification({
                              color: "red",
                              title: "Toggle Writer - Error",
                              message: response.message || "Unknown Error",
                              icon: <AiOutlineClose />,
                              autoClose: 5000,
                           });
                        }

                        setBigLoading(false);
                     }}
                  >
                     {accessEditorUser?.isWriter
                        ? "Remove Writer"
                        : "Set Writer"}
                  </Button>
                  <Button
                     className="w-full"
                     disabled={accessEditorUser?.isAdmin}
                     color={
                        accessEditorUser?.isReviewer ? "secondary" : "primary"
                     }
                     onClick={async () => {
                        setBigLoading(true);

                        const r = await fetch(
                           `/api/admin/setReviewer?id=${accessEditorUser?.id}`,
                           {
                              credentials: "include",
                           }
                        );
                        const response = await r.json();

                        if (r.status === 200) {
                           let final = [] as User[];
                           usersState.forEach((user) => {
                              if (user.id === accessEditorUser?.id) {
                                 let cUser = user;
                                 cUser.isReviewer = !cUser.isReviewer;
                                 final.push(cUser);
                              } else {
                                 final.push(user);
                              }
                           });
                           setUsersState(final);
                        } else {
                           notifications.showNotification({
                              color: "red",
                              title: "Toggle Reviewer - Error",
                              message: response.message || "Unknown Error",
                              icon: <AiOutlineClose />,
                              autoClose: 5000,
                           });
                        }

                        setBigLoading(false);
                     }}
                  >
                     {accessEditorUser?.isReviewer
                        ? "Remove Reviewer"
                        : "Set Reviewer"}
                  </Button>
                  <Button
                     className="w-full"
                     disabled={data?.user?.isAdmin ? false : true}
                     color={
                        accessEditorUser?.isEditorial ? "secondary" : "primary"
                     }
                     onClick={async () => {
                        setBigLoading(true);

                        const r = await fetch(
                           `/api/admin/setEditorial?id=${accessEditorUser?.id}`,
                           {
                              credentials: "include",
                           }
                        );
                        const response = await r.json();

                        if (r.status === 200) {
                           let final = [] as User[];
                           usersState.forEach((user) => {
                              if (user.id === accessEditorUser?.id) {
                                 let cUser = user;
                                 cUser.isEditorial = !cUser.isEditorial;
                                 if (cUser.isEditorial) {
                                    cUser.isWriter = true;
                                    cUser.isReviewer = true;
                                    cUser.department = fullLocations;
                                 } else {
                                    cUser.isWriter = false;
                                    cUser.isReviewer = false;
                                    cUser.department = [];
                                 }
                                 final.push(cUser);
                              } else {
                                 final.push(user);
                              }
                           });
                           setUsersState(final);
                        } else {
                           notifications.showNotification({
                              color: "red",
                              title: "Toggle Editorial - Error",
                              message: response.message || "Unknown Error",
                              icon: <AiOutlineClose />,
                              autoClose: 5000,
                           });
                        }

                        setBigLoading(false);
                     }}
                  >
                     {accessEditorUser?.isEditorial
                        ? "Remove Editorial"
                        : "Set Editorial"}
                  </Button>
               </div>
               <Button
                  className="w-1/3 mx-auto mt-2"
                  color={accessEditorUser?.canComment ? "secondary" : "sky"}
                  onClick={async () => {
                     setBigLoading(true);

                     const r = await fetch(
                        `/api/admin/setMute?id=${accessEditorUser?.id}`,
                        {
                           credentials: "include",
                        }
                     );
                     const response = await r.json();

                     if (r.status === 200) {
                        let final = [] as User[];
                        usersState.forEach((user) => {
                           if (user.id === accessEditorUser?.id) {
                              let cUser = user;
                              cUser.canComment = !cUser.canComment;
                              final.push(cUser);
                           } else {
                              final.push(user);
                           }
                        });
                        setUsersState(final);
                     } else {
                        notifications.showNotification({
                           color: "red",
                           title: "Toggle Mute - Error",
                           message: response.message || "Unknown Error",
                           icon: <AiOutlineClose />,
                           autoClose: 5000,
                        });
                     }

                     setBigLoading(false);
                  }}
               >
                  {accessEditorUser?.canComment ? "Mute" : "Unmute"}
               </Button>
               {accessEditorUser !== undefined && !accessEditorUser?.isAdmin && (
                  <>
                     {(accessEditorUser?.isWriter ||
                        accessEditorUser?.isReviewer) &&
                        !accessEditorUser.isEditorial && (
                           <div className="pt-2 mt-4 border-t-2 borderColor">
                              <h1 className="text-xl font-medium">
                                 Change Department
                              </h1>
                              <Formik
                                 validateOnChange={false}
                                 validateOnBlur={false}
                                 validationSchema={departmentSchema}
                                 initialValues={{
                                    department: accessEditorUser.department,
                                 }}
                                 onSubmit={async (data, { setSubmitting }) => {
                                    setSubmitting(true);
                                    setBigLoading(true);

                                    const r = await fetch(
                                       `/api/admin/setDepartment?id=${accessEditorUser.id}`,
                                       {
                                          credentials: "include",
                                          method: "POST",
                                          body: JSON.stringify(data),
                                       }
                                    );
                                    const response = await r.json();

                                    if (r.status === 200) {
                                       let final = [] as User[];
                                       usersState.forEach((user) => {
                                          if (user.id === tagEditorUser?.id) {
                                             let cUser = user;
                                             cUser.department = data.department;
                                             final.push(cUser);
                                          } else {
                                             final.push(user);
                                          }
                                       });
                                       setUsersState(final);
                                    } else {
                                       notifications.showNotification({
                                          color: "red",
                                          title: "Change Department - Error",
                                          message:
                                             response.message ||
                                             "Unknown Error",
                                          icon: <AiOutlineClose />,
                                          autoClose: 5000,
                                       });
                                    }

                                    setBigLoading(false);
                                    setSubmitting(false);
                                 }}
                              >
                                 {({
                                    errors,
                                    isSubmitting,
                                    values,
                                    setFieldValue,
                                 }) => (
                                    <Form className="mt-2">
                                       <Field
                                          as={MultiSelect}
                                          value={values.department}
                                          onChange={(v: string) =>
                                             setFieldValue("department", v)
                                          }
                                          data={fullLocations.map(
                                             (location) => ({
                                                value: location,
                                                label: getFormmatedLocation(
                                                   location
                                                ),
                                             })
                                          )}
                                          placeholder="Select departments"
                                          name="tags"
                                          classNames={{
                                             filledVariant:
                                                "dark:bg-dark-bg border-2 dark:border-gray-800 border-gray-300",
                                             dropdown:
                                                "dark:bg-dark-bg border-2 dark:border-gray-800 border-gray-300",
                                             selected: "dark:bg-foot",
                                          }}
                                          error={errors.department}
                                          size="md"
                                       />
                                       <Button
                                          className="w-full mt-3"
                                          type="submit"
                                          loading={isSubmitting}
                                          disabled={isSubmitting}
                                       >
                                          Update
                                       </Button>
                                    </Form>
                                 )}
                              </Formik>
                           </div>
                        )}
                  </>
               )}
            </div>
         </Modal>
         <Modal
            isOpen={openRestoreAccountModal}
            updateModalState={() =>
               setOpenRestoreAccountModal(!openRestoreAccountModal)
            }
            title="Restore Account"
            width="xl"
         >
            <Formik
               initialValues={{ email: "" }}
               validateOnChange={false}
               validateOnBlur={false}
               validationSchema={emailSchema}
               onSubmit={async (
                  data,
                  { setSubmitting, setFieldError, resetForm }
               ) => {
                  setBigLoading(true);
                  setSubmitting(true);
                  const r = await fetch(`/api/admin/restore/${data.email}`, {
                     credentials: "include",
                  });
                  if (r.status !== 200) {
                     const response = await r.json();
                     setFieldError("email", response.message || "Unkown Error");
                  } else {
                     notifications.showNotification({
                        title: "Unban Account",
                        message: "Account unbanned! They can now log in!",
                        icon: <AiOutlineCheck />,
                        autoClose: 5000,
                     });
                     resetForm();
                     setOpenRestoreAccountModal(false);
                  }
                  setSubmitting(false);
                  setBigLoading(false);
               }}
            >
               {({ errors, isSubmitting, setFieldValue, values }) => (
                  <Form>
                     <TextInput
                        label="Email"
                        onChange={(e) =>
                           setFieldValue("email", e.currentTarget.value)
                        }
                        value={values.email}
                        required
                        error={errors.email}
                     />
                     <Button
                        className="w-full mt-3"
                        type="submit"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                     >
                        Restore
                     </Button>
                  </Form>
               )}
            </Formik>
         </Modal>
      </>
   );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
   const session = await getSession({ req });

   if (
      !session ||
      (session?.user?.isAdmin
         ? false
         : session?.user?.isEditorial
         ? false
         : true)
   )
      return {
         redirect: {
            destination: "/",
            permanent: false,
         },
      };

   const totalArticles = await prisma.article.count();
   const publishedArticles = await prisma.article.count({
      where: { published: true },
   });
   const totalComments = await prisma.comment.count();
   const totalUpvotes = await prisma.upvote.count();
   const totalDownvotes = await prisma.downvote.count();

   const users = await prisma.user.findMany({
      include: {
         _count: {
            select: {
               articles: true,
               coArticles: true,
               comments: true,
               upvotes: true,
               downvotes: true,
            },
         },
      },
      orderBy: {
         joinedAt: "desc",
      },
   });

   return {
      props: {
         statistics: {
            totalArticles,
            publishedArticles,
            totalComments,
            totalUpvotes,
            totalDownvotes,
         },
         users: JSON.parse(JSON.stringify(users)),
      },
   };
};

export default AdminPage;
