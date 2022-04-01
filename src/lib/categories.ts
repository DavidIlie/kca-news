export type Locations =
   | "news"
   | "humanities"
   | "sports"
   | "society"
   | "science-environment"
   | "fashion"
   | "entertainment";

export const visibleLocations: Locations[] = ["news", "humanities", "sports"];

export const moreLocations: Locations[] = [
   "society",
   "science-environment",
   "fashion",
   "entertainment",
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
      location: visibleLocations.concat(moreLocations),
   },
   {
      id: "world",
      name: "World",
      location: visibleLocations.concat(moreLocations),
   },
   {
      id: "politics",
      name: "Politics",
      location: ["news"],
   },
];
