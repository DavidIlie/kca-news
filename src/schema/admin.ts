import * as yup from "yup";

import { tagArray } from "../types/Tag";
import { fullLocations } from "../lib/categories";

export const tagSchema = yup.object().shape({
   tags: yup
      .array()
      .of(
         yup
            .string()
            .test((val) => {
               if (!tagArray.includes(val as any)) return false;
               return true;
            })
            .required()
      )
      .required(),
});

export const departmentSchema = yup.object().shape({
   department: yup
      .array()
      .of(
         yup
            .string()
            .test((val) => {
               if (!fullLocations.includes(val as any)) return false;
               return true;
            })
            .required()
      )
      .required(),
});
