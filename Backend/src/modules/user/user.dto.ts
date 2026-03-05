import { z } from "zod";
import { isValidPhone, validatePassword, validatePhone } from "../../lib/validators/validators";
import { password } from "bun";
import { zodId, zodTimestamps } from "../../lib/validators/zod.helpers";
import { UserRoles } from "./user.model";
import { regionStationResponseSchema } from "../region/regionStation.dto";

export const createUserRequestSchema = z.object({
    name: z.string().min(1, { message: "Nome é obrigatório." }),
    email: z.string().email({ message: "Email inválido." }),
    phone: validatePhone,
    role: z.enum(UserRoles).default(UserRoles.USER),
    city: z.string().optional(),
    state: z.string().optional(),
    password: validatePassword,
}).strict()

export const updateUserRequestSchema = z.object({
    name: z.string().min(1, { message: "Nome é obrigatório." }),
    email: z.string().email({ message: "Email inválido." }),
    phone: validatePhone,
    role: z.enum(UserRoles).default(UserRoles.USER),
    city: z.string().optional(),
    state: z.string().optional(),
    password: validatePassword.optional(),
    isActive: z.boolean().optional(),
}).strict().partial()

export const userResponseSchema = z.object({
    _id: zodId,
    isActive: z.boolean(),
    passwordHash: z.string().optional(),
    name: z.string().min(1, { message: "Nome é obrigatório." }),
    email: z.string().email({ message: "Email inválido." }),
    phone: validatePhone,
    role: z.enum(UserRoles).default(UserRoles.USER),
    regionId: regionStationResponseSchema.optional(),
    ...zodTimestamps.shape,
}).strict()

export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>;

export type UserResponse = z.infer<typeof userResponseSchema>;