import z from "zod";
import { userResponseSchema } from "../user/user.dto";
import { validatePassword, validatePhone } from "./../../lib/validators/validators";
import { UserRoles } from "../user/user.model";
import { zodId } from "../../lib/validators/zod.helpers";

export const userUserJwtPayloadSchema = z.object({
    sub: z.string().uuid(),
    role: z.enum(UserRoles),
    name: z.string(),
    email: z.string().email(),
});

export const loginRequestSchema = z.object({
    email: z.string().email({ message: "Formato de e-mail inválido." }),
    password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres." })
}).strict();

export const loginResponseSchema = z.object({
    token: z.string(),
    user: userResponseSchema
});

export const registerRequestSchema = z.object({
    name: z.string().min(1, { message: "Nome é obrigatório." }),
    email: z.string().email({ message: "Email inválido." }),
    phone: validatePhone,
    regionId: zodId.optional(),
    password: validatePassword,
}).strict();

export type UserJwtPayload = z.infer<typeof userUserJwtPayloadSchema>;

export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
