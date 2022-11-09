export const createSlug = (s: string): string =>
   s
      .replace(/[$-/:-?{-~!"^_`\[\]]/, "")
      .toLowerCase()
      .split(" ")
      .join("-")
      .replaceAll(/['?’]/g, "");
