import type { User } from "./User";

export interface Comment {
    id: string;
    userId: string;
    articleId: string;
    createdAt: string;
    comment: string;
    name: string;
    pfp: string;
    user?: User;
}
