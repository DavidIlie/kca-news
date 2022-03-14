export interface Category {
    id: string;
    name: string;
    url?: string;
}

export const newsLinks: Category[] = [
    {
        id: "our-school",
        name: "Our School",
        url: "/our-school?filter=entertainment",
    },
    {
        id: "latest-news",
        name: "Latest News",
    },
    {
        id: "global",
        name: "Global",
    },
];

export const entertainmentLinks: Category[] = [
    {
        id: "our-school",
        name: "Our School",
        url: "/our-school?filter=entertainment",
    },
    {
        id: "cinema",
        name: "Cinema",
    },
    {
        id: "books",
        name: "Books",
    },
    {
        id: "music",
        name: "Music",
    },
    {
        id: "fashion",
        name: "Fashion",
    },
];

export const sportLinks: Category[] = [
    {
        id: "our-school",
        name: "Our School",
        url: "/our-school?filter=sport",
    },
    {
        id: "worldwide",
        name: "Worldwide",
    },
];

export const lifestyleLinks: Category[] = [
    {
        id: "our-school",
        name: "Our School",
        url: "/our-school?filter=lifestyle",
    },
    {
        id: "well-being",
        name: "Well Being",
    },
    {
        id: "travel",
        name: "Travel",
    },
    {
        id: "tips",
        name: "Tips",
    },
    {
        id: "food",
        name: "Food",
    },
    {
        id: "culture",
        name: "Culture",
    },
];
