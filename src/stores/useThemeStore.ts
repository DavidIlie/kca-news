import create from "zustand";
import type { ColorScheme } from "@mantine/core";

type Store = {
   colorScheme: ColorScheme | undefined;
   updateColorScheme: (colorScheme: ColorScheme | undefined) => void;
};

export const useThemeStore = create<Store>((set) => ({
   colorScheme: undefined,
   updateColorScheme(colorScheme: ColorScheme | undefined) {
      set((state) => ({
         ...state,
         colorScheme: colorScheme,
      }));
   },
}));
