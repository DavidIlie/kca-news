import type { User } from "@/types/User";
import { Article } from "@/types/Article";

export interface Comment {
   id: string;
   userId: string;
   articleId: string;
   createdAt: string;
   comment: string;
   name: string;
   pfp: string;
   user?: User;
   article?: Article;
   underReview: boolean;
}
