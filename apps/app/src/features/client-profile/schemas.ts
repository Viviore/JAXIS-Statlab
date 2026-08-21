import { z } from "zod";

export const ClientProfileSchema = z.object({
  institutionSchool: z.string().min(2, "Institution name is required").max(100),
  academicProgram: z.string().min(2, "Academic program is required").max(100),
  contactNumber: z.string().min(5, "Contact number is required").max(30),
  region: z.string().min(2, "Region is required"),
});

export type ClientProfileFormData = z.infer<typeof ClientProfileSchema>;
