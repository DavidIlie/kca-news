import React, { useState } from "react";
import { Button } from "./Button";
import Modal, { ModalProps } from "./Modal";

interface Props extends Partial<ModalProps> {
   isOpen: boolean;
   updateModalState: () => void;
   successFunction: () => void;
}

const ConfirmModal: React.FC<Props> = ({
   isOpen,
   updateModalState,
   successFunction,
   ...rest
}) => {
   const [string, setString] = useState<string>("Nevermind");
   const [delayHandler, setDelayHandler] = useState<any>(null);

   return (
      <Modal
         isOpen={isOpen}
         updateModalState={updateModalState}
         title="Are you sure?"
         width="lg"
         {...rest}
      >
         <>
            <div className="mt-2">
               <h1 className="text-gray-800 dark:text-gray-200">
                  There is no going back once you do this.
               </h1>
            </div>
            <div className="mt-4 flex justify-end gap-2">
               <Button
                  onClick={() => {
                     updateModalState();
                     setString("Nevermind");
                  }}
                  onMouseEnter={() =>
                     setDelayHandler(
                        setTimeout(() => {
                           setString("It's a no from me");
                        }, 5000)
                     )
                  }
                  onMouseLeave={() => clearTimeout(delayHandler)}
               >
                  {string}
               </Button>
               <Button
                  color="secondary"
                  onClick={() => {
                     successFunction();
                     updateModalState();
                  }}
               >
                  Confirm
               </Button>
            </div>
         </>
      </Modal>
   );
};

export default ConfirmModal;
