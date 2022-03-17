import * as yup from "yup";

export const crudCommentSchema = yup.object().shape({
    message: yup.string().min(4).max(50).required(),
});
