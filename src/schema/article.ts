import * as yup from "yup";

import { links } from "../lib/categories";

export const updateArticleSchema = yup.object().shape({
   title: yup.string().min(4).max(32).required(),
   description: yup.string().min(24).max(1000).required(),
   content: yup.string().required(),
});

export const updateArticleRestSchema = yup.object().shape({
   categories: yup
      .array()
      .of(
         yup
            .string()
            .test((val) => {
               const categories = links.map((link) => link.id);
               if (!categories?.includes(val as string)) return false;
               return true;
            })
            .required()
      )
      .min(1)
      .required(),
});
