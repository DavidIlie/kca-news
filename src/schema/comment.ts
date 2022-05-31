import * as yup from "yup";

export const crudCommentSchema = yup.object().shape({
   message: yup
      .string()
      .min(2, "Your message cannot be less than 2 characters!")
      .max(500, "Your message cannot be more than 500 characters!")
      .required(),
});
