import * as yup from "yup";

export const updateArticleSchema = yup.object().shape({
   title: yup.string().min(4).max(32).required(),
   description: yup.string().min(24).max(100).required(),
   content: yup.string().required(),
});
