import * as yup from "yup";

export const updateProfileSchema = yup.object().shape({
   nameIndex: yup.number().min(0).required(),
   extraName: yup.string().min(0).max(8),
   showYear: yup.boolean().required(),
   description: yup.string().min(0).max(240),
   nickname: yup.string().min(0).max(16),
   status: yup.string().min(0).max(120),
});
