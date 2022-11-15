import { Upvote, Downvote, User } from "@prisma/client";

import { Comment } from "@/types/Comment";
import { Tag } from "@/types/Tag";
import { Article } from "@/types/Article";
import { Locations } from "@/lib/categories";

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
  coArticles?: Article[];
  canComment: boolean;
  department: Locations[];
  isEditorial: boolean;
  gender: "male" | "female";
  _count?: UserCount;
}
