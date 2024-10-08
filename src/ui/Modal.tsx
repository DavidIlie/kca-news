import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useRef } from "react";
import { AiOutlineCloseCircle } from "react-icons/ai";

export interface ModalProps extends Partial<typeof Dialog> {
   isOpen: boolean;
   updateModalState: () => void;
   title: string;
   children: JSX.Element;
   className?: string;
   noAutoClose?: boolean;
   width?: string;
}

const Modal: React.FC<ModalProps> = ({
   isOpen,
   updateModalState,
   title,
   children,
   className,
   noAutoClose = false,
   width = "md",
   ...rest
}) => {
   let refDiv = useRef(null);

   return (
      <Transition appear show={isOpen} as={Fragment}>
         <Dialog
            as="div"
            className={`container fixed inset-0 z-[150] mx-auto overflow-y-auto ${className}`}
            onClose={!noAutoClose ? updateModalState : () => true}
            initialFocus={refDiv}
            {...rest}
         >
            <div className="min-h-screen px-4 text-center" ref={refDiv}>
               <Dialog.Overlay className="fixed inset-0 bg-black opacity-[0.55]" />

               <span
                  className="inline-block h-screen align-middle"
                  aria-hidden="true"
               >
                  &#8203;
               </span>
               <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
               >
                  <div
                     className={`my-8 inline-block w-full max-w-${width} transform overflow-hidden rounded-md border-2 border-gray-200 bg-white p-6 text-left align-middle shadow-xl transition-all dark:border-gray-800 dark:bg-foot`}
                  >
                     <div className="borderColor mb-1 flex items-center justify-between border-b-2 pb-1">
                        <Dialog.Title
                           as="h3"
                           className="mb-2 w-full text-xl font-medium leading-6 text-gray-900 dark:text-gray-100"
                        >
                           {title}
                        </Dialog.Title>
                        <AiOutlineCloseCircle
                           className="cursor-pointer text-[1.75rem] text-black dark:text-white"
                           onClick={updateModalState}
                        />
                     </div>
                     <div>{children}</div>
                  </div>
               </Transition.Child>
            </div>
         </Dialog>
      </Transition>
   );
};

export default Modal;
