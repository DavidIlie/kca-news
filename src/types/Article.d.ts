import { User } from "./User";

export interface Article {
    id: string;
    writer: string;
    title: string;
    createdAt: Date;
    lastUpdated: Date;
    pdf: string;
    cover: string;
    description: string;
    published: boolean;
    categoryId: string[];
    filter: string[];
    featured: boolean;
    mdx?: string;
    anonymous: boolean;
    writer?: User;
    coWriters: User[];
}
