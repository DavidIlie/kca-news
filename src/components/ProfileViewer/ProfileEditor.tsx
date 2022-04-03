import React from "react";
import { useSession } from "next-auth/react";
import { Select, TextInput } from "@mantine/core";
import { Formik, Field, Form } from "formik";

import Modal from "../../ui/Modal";
import { User } from "../../types/User";
import { computeKCAName } from "../../lib/computeKCAName";

interface Props {
   isOpen: boolean;
   handleOpen: () => void;
   user: User;
}

const ProfileEditor: React.FC<Props> = ({ isOpen, handleOpen, user }) => {
   const { data } = useSession();

   return (
      <Modal
         isOpen={isOpen}
         updateModalState={handleOpen}
         title={`Edit ${
            data?.user?.id === user.id ? "my profile" : computeKCAName(user)
         }`}
         width="lg"
         noAutoClose
      >
         <div className="mt-4 px-0.5">
            <p>
               Below you can see the options that are available to be modified.
            </p>

            <div className="mt-4">
               <Formik
                  validateOnChange={false}
                  validateOnBlur={false}
                  initialValues={{
                     nameIndex: user.nameIndex,
                     extraName: user.extraName || "",
                     showYear: user.showYear,
                     nickname: user.nickname || "",
                     status: user.status || "",
                  }}
                  onSubmit={async (data, { setSubmitting, resetForm }) => {
                     console.log("yo");
                  }}
               >
                  {({ errors, isSubmitting, values, setFieldValue }) => (
                     <Form>
                        <h1 className="borderColor border-b-2 pb-2 text-xl font-semibold">
                           Name Settings
                        </h1>
                        <div className="-ml-3 mt-2 flex justify-evenly">
                           <Field
                              as={Select}
                              label="Preferred Name"
                              data={user.names.map((name, index) => ({
                                 value: index,
                                 label: name,
                              }))}
                              //BUG
                              value=""
                              onChange={(v: number) =>
                                 setFieldValue("nameIndex", v)
                              }
                              name="nameIndex"
                              className="w-1/2"
                              description="Change if wrong by default."
                              classNames={{
                                 filledVariant:
                                    "dark:bg-dark-bg border-2 dark:border-gray-800 border-gray-300",
                                 dropdown:
                                    "dark:bg-dark-bg border-2 dark:border-gray-800 border-gray-300",
                              }}
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
                           />
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
