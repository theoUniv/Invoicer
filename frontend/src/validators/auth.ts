import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string()
    .min(1, "L'email est requis")
    .email("L'email doit être valide"),
  password: z.string()
    .min(1, "Le mot de passe est requis")
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
});

export const registerSchema = z.object({
  name: z.string()
    .min(1, "Le nom est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string()
    .min(1, "L'email est requis")
    .email("L'email doit être valide"),
  password: z.string()
    .min(1, "Le mot de passe est requis")
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string()
    .min(1, "La confirmation du mot de passe est requise")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

export const forgetPasswordSchema = z.object({
  email: z.string()
    .min(1, "L'email est requis")
    .email("L'email doit être valide")
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgetPasswordFormData = z.infer<typeof forgetPasswordSchema>;
