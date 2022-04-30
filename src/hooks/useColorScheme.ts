import { ColorScheme } from "@mantine/core";
import { useTheme } from "next-themes";
import { setCookies } from "cookies-next";

import { useThemeStore } from "../stores/useThemeStore";

const useColorScheme = () => {
   const { colorScheme, updateColorScheme } = useThemeStore();
   const { setTheme } = useTheme();

   const toggleColorScheme = (value?: ColorScheme) => {
      const nextColorScheme =
         value || (colorScheme === "dark" ? "light" : "dark");
      setTheme(nextColorScheme);
      updateColorScheme(nextColorScheme);
      setCookies("mantine-color-scheme", nextColorScheme, {
         maxAge: 60 * 60 * 24 * 30,
      });
   };

   return { colorScheme, toggleColorScheme };
};

export default useColorScheme;
