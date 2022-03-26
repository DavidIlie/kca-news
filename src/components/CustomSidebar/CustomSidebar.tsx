import React from "react";
import { Drawer } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

export const { Provider, Consumer } = React.createContext({ mobile: false });

interface CustomSidebarProps {
   children: React.ReactNode | React.ReactNode[];
   drawerProps: any;
   normalProps: any;
}

const CustomSidebar: React.FC<CustomSidebarProps> = ({
   children,
   drawerProps,
   normalProps,
}) => {
   const needDrawer = useMediaQuery("(min-width: 1240px)");

   return !needDrawer ? (
      <Provider value={{ mobile: true }}>
         <Drawer {...drawerProps}>{children}</Drawer>
      </Provider>
   ) : (
      <Provider value={{ mobile: false }}>
         <div {...normalProps}>{children}</div>
      </Provider>
   );
};

export default CustomSidebar;
