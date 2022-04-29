import * as yup from "yup";

import { tagArray } from "../types/Tag";

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
