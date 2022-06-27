import React, { MouseEvent } from "react";
import { useState, useRef, useEffect } from "react";
import useFileUpload from "react-use-file-upload";
import { useNotifications } from "@mantine/notifications";
import { AiOutlineClose } from "react-icons/ai";

import sendPost from "@/lib/sendPost";
import { Article } from "@/types/Article";
import { Button } from "@/ui/Button";
import Modal from "@/ui/Modal";

interface ArticleCoverUploaderProps {
   article: Article;
   updateArticle: (a: Article) => void;
   setMainLoading: (e: boolean) => void;
   className?: string;
   modal?: boolean;
   closeModal?: () => void;
}

const ArticleCoverUploader: React.FC<ArticleCoverUploaderProps> = ({
   article,
   modal = false,
   updateArticle,
   setMainLoading,
   closeModal,
}) => {
   const notifications = useNotifications();
   const { files, setFiles, clearAllFiles } = useFileUpload();
   const inputRef = useRef<HTMLInputElement>();
   const [uploadFileState, setUploadFileState] = useState<boolean>(false);
   const [isLoading, setIsLoading] = useState<boolean>(false);
   const [uploadCycle, setUploadCycle] = useState<string>(
      Math.random().toString(36)
   );

   const isDefaultCover =
      article.cover !== "https://cdn.davidilie.com/kca-news/default-cover.jpg";

   const HandleUpload = async (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setIsLoading(true);
      setMainLoading(true);

      const formData = new FormData();
      formData.append("cover", files[0]);

      try {
         const { statusCode, response } = await sendPost(
            `/api/article/${article.id}/update/cover`,
            formData,
            true
         );

         if (statusCode !== 200) {
            notifications.showNotification({
               color: "red",
               title: "Cover - Error",
               message: response.message || "Unknown Error",
               icon: <AiOutlineClose />,
               autoClose: 5000,
            });
         } else {
            updateArticle(response.article);
            clearAllFiles();
            setUploadFileState(false);
            HandleClose();
         }
      } catch (error) {
         notifications.showNotification({
            color: "red",
            title: "Cover - Error",
            message: "Error uploading",
            icon: <AiOutlineClose />,
            autoClose: 5000,
         });
      }

      setMainLoading(false);
      setIsLoading(false);
   };

   const HandleClose = () => {
      try {
         //@ts-ignore
         inputRef.current.files = [];
      } catch (_err) {}
      clearAllFiles();
      setUploadFileState(false);
      if (modal) {
         closeModal!();
      } else {
         setUploadCycle(Math.random().toString(36));
      }
   };

   useEffect(() => {
      try {
         if (files.length >= 1) {
            if (inputRef.current?.files?.length !== 0) {
               setUploadFileState(true);
            }
         }
      } catch (_err) {}
   });

   const HandleResetCover = async () => {
      setMainLoading(true);
      const r = await fetch(`/api/article/${article.id}/update/resetCover`, {
         method: "DELETE",
         credentials: "include",
      });
      const response = await r.json();

      if (r.status === 200) {
         HandleClose();
         updateArticle(response.article);
      } else {
         notifications.showNotification({
            color: "red",
            title: "Cover - Error",
            message: response.message || "Unknown Error",
            icon: <AiOutlineClose />,
            autoClose: 5000,
         });
      }

      setUploadCycle(Math.random().toString(36));
      setMainLoading(false);
   };

   return (
      <>
         <div className={`${modal && "mt-4"}`}>
            <h1>
               Please upload your desired cover image using the button below.
            </h1>
            <div className="col-span-6 sm:col-span-4">
               <div className="flex items-center">
                  <input
                     ref={inputRef as any}
                     type="file"
                     className="hidden"
                     onChange={setFiles as any}
                     accept="image/*"
                     key={uploadCycle}
                  />
                  <Button
                     className={`mt-${modal ? "3" : "2"} ${
                        modal ? "mb-2" : files.length === 0 && "-mb-1"
                     } w-full`}
                     color="sky"
                     onClick={() => inputRef.current?.click()}
                  >
                     Select a file to upload
                  </Button>
               </div>
               {files.length !== 0 && (
                  <p
                     className={`px-0.5 ${
                        !modal &&
                        `mt-2 ${
                           files.length !== 0 && "-mb-2"
                        } text-sm dark:text-gray-300`
                     }`}
                  >
                     {(files as any)[0].name}
                  </p>
               )}
            </div>
         </div>
         <div className={`mt-3 ${modal && "flex"} justify-end gap-2`}>
            {isDefaultCover && (
               <Button
                  color="secondary"
                  className={`${
                     !modal && `w-full ${files.length === 0 ? "mb-2" : "mt-4"}`
                  }`}
                  onClick={() => HandleResetCover()}
               >
                  Reset Cover
               </Button>
            )}
            {(modal || files.length !== 0) && (
               <Button
                  color={!isDefaultCover ? "secondary" : "cyan"}
                  className={`${
                     !modal && `mb-2 ${article.cover ? "mt-2" : "mt-4"} w-full`
                  }`}
                  onClick={() => {
                     if (modal) return HandleClose();
                     setUploadFileState(false);
                     clearAllFiles();
                     setUploadCycle(Math.random().toString(36));
                  }}
               >
                  {modal ? "Close" : "Reset Upload"}
               </Button>
            )}
            {uploadFileState && (
               <Button
                  disabled={!uploadFileState}
                  className={`${!modal && "w-full"}`}
                  onClick={(e) => HandleUpload(e)}
               >
                  {isLoading ? "Uploading" : "Upload"}
               </Button>
            )}
         </div>
      </>
   );
};

interface Types {
   isOpen: boolean;
   updateModalState: () => void;
   article: Article;
   updateArticle: (a: Article) => void;
   setMainLoading: (e: boolean) => void;
}

export const ModalArticleCoverUploaderWrapper: React.FC<Types> = ({
   isOpen,
   updateModalState,
   setMainLoading,
   ...rest
}) => {
   return (
      <>
         <Modal
            isOpen={isOpen}
            updateModalState={updateModalState}
            title="Change cover photo"
            width="lg"
         >
            <ArticleCoverUploader
               {...rest}
               modal={true}
               closeModal={updateModalState}
               setMainLoading={setMainLoading}
            />
         </Modal>
      </>
   );
};

export default ArticleCoverUploader;
