import React from "react";
import { Tooltip } from "@mantine/core";
import readingTime from "reading-time";
import { useLocalStorage } from "@mantine/hooks";

import Modal from "@/ui/Modal";
import Radio from "@/ui/Radio";
import { Button } from "@/ui/Button";

const EditorWordCount: React.FC<{
   content: string;
   isOpen: boolean;
   toggleIsOpen: () => void;
}> = ({ content, isOpen, toggleIsOpen }) => {
   const readingTimeInfo = readingTime(content);

   const [openWordCountOverlay, setOpenWordCountOverlay] =
      useLocalStorage<boolean>({
         key: "wordCountOverlay",
         defaultValue: false,
      });

   return (
      <Modal
         title="Word Count"
         isOpen={isOpen}
         updateModalState={toggleIsOpen}
         width="md"
      >
         <div className="mt-3">
            <div className="flex items-center justify-between mb-4 border-b-2 borderColor">
               <p>
                  <Tooltip label="*Estimated*">Reading Time</Tooltip>
               </p>
               <p className="font-medium">{readingTimeInfo.text}</p>
            </div>
            <div className="flex items-center justify-between mb-4 border-b-2 borderColor">
               <p>Words</p>
               <p className="font-medium">{readingTimeInfo.words}</p>
            </div>
            <div className="flex items-center justify-between mb-3 border-b-2 borderColor">
               <p>Characters</p>
               <p className="font-medium">
                  {content.replace(/^#+\s/g, "").length}
               </p>
            </div>
            <Radio
               label="Display word count while typing"
               checked={openWordCountOverlay}
               onChange={() => setOpenWordCountOverlay(!openWordCountOverlay)}
               labelSize="md"
            />
            <div className="flex justify-end">
               <Button onClick={toggleIsOpen}>Perfect</Button>
            </div>
         </div>
      </Modal>
   );
};

export default EditorWordCount;
