import React from "react";
import { useSession } from "next-auth/react";
import { Select, TextInput, Tooltip } from "@mantine/core";
import { Formik, Field, Form } from "formik";
import { useNotifications } from "@mantine/notifications";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { AiOutlineClose } from "react-icons/ai";

import Modal from "../../ui/Modal";
import { User } from "../../types/User";
import { computeKCAName } from "../../lib/computeKCAName";
import Radio from "../../ui/Radio";
import { Button } from "../../ui/Button";
import { updateProfileSchema } from "../../schema/user";

interface Props {
   isOpen: boolean;
   handleChangeState: () => void;
   user: User;
   updateUser: React.Dispatch<React.SetStateAction<User>>;
}

const ProfileEditor: React.FC<Props> = ({
   isOpen,
   handleChangeState,
   user,
   updateUser,
}) => {
   const { data } = useSession();
   const notifications = useNotifications();

   return (
      <Modal
         isOpen={isOpen}
         updateModalState={handleChangeState}
         title={`Edit ${
            data?.user?.id === user.id ? "my profile" : computeKCAName(user)
         }`}
         width="2xl"
         noAutoClose
      >
         <div className="mt-4 px-0.5">
            <p className="text-gray-800 dark:text-gray-300">
               Below you can see the options that are available to be modified.
            </p>
            <div className="mt-2">
               <Formik
                  validateOnChange={false}
                  validateOnBlur={false}
                  validationSchema={updateProfileSchema}
                  initialValues={{
                     nameIndex: user.nameIndex,
                     extraName: user.extraName || "",
                     showYear: user.showYear,
                     description: user.description || "",
                     nickname: user.nickname || "",
                     status: user.status || "",
                  }}
                  onSubmit={async (data, { setSubmitting }) => {
                     setSubmitting(true);

                     const r = await fetch(`/api/profile/${user.id}`, {
                        method: "POST",
                        credentials: "include",
                        body: JSON.stringify(data),
                     });
                     const response = await r.json();

                     if (r.status === 200) {
                        updateUser(response.user);
                        handleChangeState();
                     } else {
                        notifications.showNotification({
                           color: "red",
                           title: "Edit - Error",
                           message: response.message || "Unknown Error",
                           icon: <AiOutlineClose />,
                           autoClose: 5000,
                        });
                     }

                     setSubmitting(false);
                  }}
               >
                  {({ errors, isSubmitting, values, setFieldValue }) => (
                     <Form>
                        <h1 className="borderColor border-b-2 pb-2 text-xl font-semibold">
                           Name Settings
                        </h1>
                        <div className="mt-2 flex justify-evenly gap-2">
                           <Field
                              as={Select}
                              label="Preferred Name"
                              data={user.names.map((name, index) => ({
                                 value: index.toString(),
                                 label: name,
                              }))}
                              value={values.nameIndex.toString()}
                              onChange={(v: string) =>
                                 setFieldValue("nameIndex", parseInt(v))
                              }
                              name="nameIndex"
                              className="w-1/2"
                              description="Change to your preffered name."
                              classNames={{
                                 filledVariant:
                                    "dark:bg-dark-bg border-2 dark:border-gray-800 border-gray-300",
                                 dropdown:
                                    "dark:bg-dark-bg border-2 dark:border-gray-800 border-gray-300",
                                 selected: "dark:bg-foot",
                              }}
                              error={errors.nameIndex}
                           />
                           <Field
                              as={TextInput}
                              placeholder={
                                 user.names[user.nameIndex]
                                    .charAt(0)
                                    .toUpperCase() + "."
                              }
                              name="extraName"
                              label="Extra Name"
                              description="To not confuse yourself from others."
                              classNames={{
                                 filledVariant:
                                    "dark:bg-dark-bg border-2 dark:border-gray-800 border-gray-300",
                              }}
                              className="w-1/2"
                              error={errors.extraName}
                           />
                        </div>
                        {user.email.endsWith("kcpupils.org") ? (
                           <div className="mx-1 mt-4 mb-3 flex items-center gap-2">
                              <Field
                                 name="showYear"
                                 label="Show Year Group"
                                 as={Radio}
                                 checked={values.showYear}
                              />
                              <Tooltip
                                 label={`Displayed next to your name, such as ${
                                    user.names[values.nameIndex]
                                 } ${user.year}`}
                              >
                                 <IoMdInformationCircleOutline className="mt-0.5" />
                              </Tooltip>
                           </div>
                        ) : (
                           <div className="mt-3" />
                        )}
                        <h1 className="borderColor mb-2 border-b-2 pb-2 text-xl font-semibold">
                           Misc Settings
                        </h1>
                        <Field
                           as={TextInput}
                           placeholder="Enter description..."
                           name="description"
                           label="Description"
                           description="Who are you?"
                           classNames={{
                              filledVariant:
                                 "dark:bg-dark-bg border-2 dark:border-gray-800 border-gray-300",
                           }}
                           error={errors.description}
                        />
                        <div className="mt-2" />
                        <div className="mt-4 mb-3 flex items-center gap-2">
                           <Field
                              as={TextInput}
                              placeholder="Enter nickname..."
                              name="nickname"
                              label="Nickname"
                              description="A informal way to address yourself."
                              classNames={{
                                 filledVariant:
                                    "dark:bg-dark-bg border-2 dark:border-gray-800 border-gray-300",
                              }}
                              error={errors.nickname}
                              className="w-1/2"
                           />
                           <div className="mt-2" />
                           <Field
                              as={TextInput}
                              placeholder="Enter status..."
                              name="status"
                              label="Status"
                              description="What's on your mind?"
                              classNames={{
                                 filledVariant:
                                    "dark:bg-dark-bg border-2 dark:border-gray-800 border-gray-300",
                              }}
                              error={errors.status}
                              className="w-1/2"
                           />
                        </div>
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
            </div>
         </div>
      </Modal>
   );
};

export default ProfileEditor;
