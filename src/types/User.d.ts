import { Comment } from "./Comment";
import { Upvote, Downvote } from "@prisma/client";
import { Tag } from "./Tag";
import { Article } from "./Article";

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
}
