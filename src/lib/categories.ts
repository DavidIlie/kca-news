export type Category = {
   id: string;
   name: string;
   location: Array<"news" | "entertainment" | "sport" | "lifestyle">;
};

export const links: Category[] = [
   {
      id: "our-school",
      name: "Our School",
      location: ["news", "entertainment", "sport", "lifestyle"],
   },
   {
      id: "latest-news",
      name: "Latest News",
      location: ["news"],
   },
   {
      id: "global",
      name: "Global",
      location: ["news"],
   },
   {
      id: "cinema",
      name: "Cinema",
      location: ["entertainment"],
   },
   {
      id: "books",
      name: "Books",
      location: ["entertainment"],
   },
   {
      id: "music",
      name: "Music",
      location: ["entertainment"],
   },
   {
      id: "fashion",
      name: "Fashion",
      location: ["entertainment"],
   },
   {
      id: "worldwide",
      name: "Worldwide",
      location: ["sport"],
   },
   {
      id: "well-being",
      name: "Well Being",
      location: ["lifestyle"],
   },
   {
      id: "travel",
      name: "Travel",
      location: ["lifestyle"],
   },
   {
      id: "tips",
      name: "Tips",
      location: ["lifestyle"],
   },
   {
      id: "food",
      name: "Food",
      location: ["lifestyle"],
   },
   {
      id: "culture",
      name: "Culture",
      location: ["lifestyle"],
   },
];
