import { useRouter } from "next/router";

interface ValidQueryTypes {
   menu: boolean;
   visibility: boolean;
}

type Symbol = "?" | "&";

const useDetermineCustomQueryEditor = (which: "menu" | "visibility") => {
   const { asPath, query } = useRouter();
   const { menu } = query as any as ValidQueryTypes;

   const beforePath = asPath.split("?")[0];

   const visibilitySymbol = asPath.substring(
      asPath.indexOf("visibility=true")
   ) as Symbol;

   let finalString = beforePath;

   if (which === "visibility")
      menu && visibilitySymbol === "?"
         ? (finalString = finalString + `?menu=true`)
         : (finalString = finalString + `?menu=true`);

   if (which === "menu") finalString = finalString;

   return finalString;
};

export default useDetermineCustomQueryEditor;
