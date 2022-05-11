export type Locations =
   | "news"
   | "humanities"
   | "sports"
   | "society"
   | "science-environment"
   | "entertainment"
   | "arts";

export const visibleLocations: Locations[] = ["news", "humanities", "sports"];

export const moreLocations: Locations[] = [
   "society",
   "science-environment",
   "entertainment",
   "arts",
];

export const fullLocations = visibleLocations.concat(moreLocations);

export const getFormmatedLocation = (l: Locations) => {
   return l.includes("-")
      ? l
           .split("-")
           .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
           .join(" & ")
      : l.charAt(0).toUpperCase() + l.slice(1);
};

export type Category = {
   id: string;
   name: string;
   location: Array<Locations>;
};

export const links: Category[] = [
   {
      id: "our-school",
      name: "Our School",
      location: fullLocations,
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
      id: "world",
      name: "Worldwide",
      location: fullLocations.filter((s) => s !== "news"),
   },
   {
      id: "politics",
      name: "Politics",
      location: ["humanities"],
   },
   {
      id: "history",
      name: "History",
      location: ["humanities"],
   },
   {
      id: "economics",
      name: "Economics",
      location: ["humanities"],
   },
   {
      id: "travel",
      name: "Travel",
      location: ["society"],
   },
   {
      id: "well-being",
      name: "Well-Being",
      location: ["society"],
   },
   {
      id: "food",
      name: "Food",
      location: ["society"],
   },
   {
      id: "culture",
      name: "Culture",
      location: ["society"],
   },
   {
      id: "celebrities",
      name: "Celebrities",
      location: ["society"],
   },
   {
      id: "gaming",
      name: "Gaming",
      location: ["entertainment"],
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
      location: ["arts"],
   },
   {
      id: "dance",
      name: "Dance",
      location: ["arts"],
   },
   {
      id: "art",
      name: "General Art",
      location: ["arts"],
   },
];
