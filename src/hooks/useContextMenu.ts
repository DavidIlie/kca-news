import { useEffect, useCallback, useState } from "react";

const useContextMenu = (shouldOpen = true) => {
   const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
   const [showContextMenu, setShowContextMenu] = useState(false);

   console.log("outside", shouldOpen);

   const handleContextMenu = useCallback(
      (event) => {
         console.log("inside", shouldOpen);
         if (shouldOpen) {
            event.preventDefault();
            setAnchorPoint({ x: event.pageX, y: event.pageY });
            setShowContextMenu(true);
         }
      },
      [setShowContextMenu, setAnchorPoint, shouldOpen]
   );

   const handleClick = useCallback(
      () => (showContextMenu ? setShowContextMenu(false) : null),
      [showContextMenu]
   );

   useEffect(() => {
      document.addEventListener("click", handleClick);
      document.addEventListener("contextmenu", handleContextMenu);
      return () => {
         document.removeEventListener("click", handleClick);
         document.removeEventListener("contextmenu", handleContextMenu);
      };
   });
   return { anchorPoint, showContextMenu };
};

export default useContextMenu;
