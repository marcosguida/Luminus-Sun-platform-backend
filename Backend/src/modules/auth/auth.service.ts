import { NotFoundError, BadRequestError, ConflictError, ForbiddenError, UnauthorizedError } from "@/lib/errors/AppError";
import { UserResponse } from "../user/user.dto"
import { LoginRequest, LoginResponse, RegisterRequest } from "./auth.dto"
import { convertToObjectId, hashPassword, verifyPassword } from "@/lib/utils";
import { generateToken } from "@/lib/jwt";
import { userRepository } from "../user/user.repository";
import { UserRoles } from "../user/user.model";
import { forecastEnergyService } from "../forecast/forecastEnergy.service";
import { weatherService } from "../weather/weather.service";

export const authService = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        try {
            const { email, password } = data;

            const user = await userRepository.Query.findUserByEmail(email);
            if (!user) {
                throw new UnauthorizedError("Credenciais inválidas.");
            }

            if (!user.isActive) {
                throw new ForbiddenError("Usuário inativo. Contate o administrador.");
            }

            const isPasswordValid = await verifyPassword(password, user?.passwordHash || "");
            if (!isPasswordValid) {
                throw new UnauthorizedError("Credenciais inválidas.");
            }

            const token = await generateToken({
                sub: user._id.toString(),
                role: user.role,
                name: user.name,
                email: user.email,
            })

            return {
                user,
                token
            };
        } catch (error) {
            throw error;
        }
    },
    register: async (data: RegisterRequest): Promise<UserResponse> => {
        try {
            const { email, password, name, phone, regionId } = data;

            const existingUserByEmail = await userRepository.Query.findUserByEmail(email);
            if (existingUserByEmail) {
                throw new ConflictError("Um usuário com este e-mail já existe.");
            }

            const existingUserByPhone = await userRepository.Query.findUserByPhone(phone);
            if (existingUserByPhone) {
                throw new ConflictError("Um usuário com este telefone já existe.");
            }

            const passwordHash = await hashPassword(password);

            const newUser = await userRepository.Mutation.createUser({
                email,
                phone,
                passwordHash,
                name,
                regionId: convertToObjectId(regionId),
                role: UserRoles.USER
            });

            return newUser;
        } catch (error) {
            throw error;
        }
    }
}