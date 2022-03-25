import * as yup from "yup";

export const updateArticleSchema = yup.object().shape({
   title: yup.string().required(),
   description: yup.string().required(),
   content: yup.string().required(),
});
