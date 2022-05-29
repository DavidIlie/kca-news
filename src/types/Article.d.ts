import { User } from "./User";
import { Comment } from "./Comment";
import { Downvote, Upvote } from "@prisma/client";
import { Location } from "../lib/categories";

export interface Article {
   id: string;
   title: string;
   createdAt: Date;
   lastUpdated: Date;
   cover: string;
   description: string;
   published: boolean;
   categoryId: string[];
   filter: string[];
   featured: boolean;
   mdx: string;
   anonymous: boolean;
   writer?: User;
   coWriters: User[];
   underReview: boolean;
   comments?: Comment[];
   upvotes?: Upvote[];
   downvotes?: Downvote[];
   tags: string[];
   location?: Locations;
   shared: boolean;
   sharedToTeam: boolean;
   sharedId: string;
   slug: string;
}
