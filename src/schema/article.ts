import * as yup from "yup";

import { fullLocations, links } from "../lib/categories";

export const updateArticleSchema = yup.object().shape({
   title: yup.string().min(4).max(400).required(),
   description: yup.string().min(24).max(1000).required(),
   content: yup.string().required(),
});

export const updateArticleRestSchema = yup.object().shape({
   location: yup
      .string()
      .test((val) => {
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

export const updateDate = yup.object().shape({
   date: yup
      .date()
      .min(`${new Date().getFullYear()}-01-01T00:00:00.000Z`)
      .max(new Date())
      .required(),
});
