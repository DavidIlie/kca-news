import type { User } from "./User";
import { Article } from "./Article";

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
}
