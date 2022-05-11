import { Upvote, Downvote } from "@prisma/client";

import { Comment } from "./Comment";
import { Tag } from "./Tag";
import { Article } from "./Article";
import { Locations } from "../lib/categories";

export interface UserCount {
   articles: number;
   coArticles: number;
   comments: number;
   upvotes: number;
   downvotes: number;
}

export interface User {
   id: string;
   name: string;
   email: string;
   image: string;
   description?: string;
   status?: string;
   nickname?: string;
   tags: Tag[];
   isAdmin: boolean;
   isWriter: boolean;
   isReviewer: boolean;
   nameIndex: number;
   names: string[];
   year: string;
   showYear: boolean;
   extraName?: string;
   joinedAt: Date;
   comments?: Comment[];
   upvotes?: Upvote[];
   downvotes?: Downvote[];
   articles?: Article[];
   canComment: boolean;
   department: Locations[];
   isEditorial: boolean;
   gender: "male" | "female";
   _count?: UserCount;
}
