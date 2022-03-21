import * as yup from "yup";

export const crudCommentSchema = yup.object().shape({
    message: yup.string().min(2).max(100).required(),
});
