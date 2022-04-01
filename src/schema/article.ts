import * as yup from "yup";

import { links, moreLocations, visibleLocations } from "../lib/categories";

export const updateArticleSchema = yup.object().shape({
   title: yup.string().min(4).max(200).required(),
   description: yup.string().min(24).max(1000).required(),
   content: yup.string().required(),
});

const fullLocations = visibleLocations.concat(moreLocations);

export const updateArticleRestSchema = yup.object().shape({
   location: yup
      .string()
      .test((val) => {
         console.log("here");
         if (!fullLocations.includes(val as any)) return false;
         return true;
      })
      .required(),
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
   tags: yup.array().of(yup.string().required()).optional(),
});

export const coWriterSchema = yup.object().shape({
   coWriters: yup.array().of(yup.string().required()).required(),
});
