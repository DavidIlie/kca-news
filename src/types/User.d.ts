export interface User {
   id: string;
   name: string;
   email: string;
   image: string;
   description?: string;
   status?: string;
   nickname?: string;
   tags: string[];
   isAdmin: boolean;
   isWriter: boolean;
   isReviewer: boolean;
   nameIndex: number;
   names: string[];
   year: string;
   showYear: boolean;
   extraName?: string;
}
