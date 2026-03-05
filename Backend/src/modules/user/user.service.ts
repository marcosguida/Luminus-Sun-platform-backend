import { IUser } from "./user.model";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from '../../lib/errors/AppError'
import { userRepository } from "./user.repository";
import { CreateUserRequest, UpdateUserRequest, UserResponse } from "./user.dto";
import { convertToObjectId, hashPassword } from "@/lib/utils";
import { Types } from "mongoose";
import { geocodingService } from "@/services/geocoding/geocoding.service";
import { weatherService } from "../weather/weather.service";
import { forecastEnergyService } from "../forecast/forecastEnergy.service";

const Query = {
    findUsersWithRegion: async (): Promise<UserResponse[]> => {
        try {
            const users = await userRepository.Query.findUsersWithRegion();
            return users;
        } catch (error) {
            throw error;
        }
    },
    findUserById: async (userId: string): Promise<UserResponse | null> => {
        try {
            if (!userId) {
                throw new BadRequestError("ID do usuário é obrigatório.");
            }

            const user = await userRepository.Query.findUserById(userId);
            if (!user) {
                throw new NotFoundError("Usuário não encontrado.");
            }

            return user;
        } catch (error) {
            throw error;
        }
    },
    findUserByEmail: async (email: string): Promise<UserResponse | null> => {
        try {
            if (!email) {
                throw new BadRequestError("Email do usuário é obrigatório.");
            }

            const user = await userRepository.Query.findUserByEmail(email);
            if (!user) {
                throw new NotFoundError("Usuário não encontrado.");
            }

            return user;
        } catch (error) {
            throw error;
        }
    },
    findAllUsers: async (): Promise<UserResponse[]> => {
        try {
            return await userRepository.Query.findAllUsers();
        } catch (error) {
            throw error;
        }
    }
}

const Mutation = {
    createUser: async (userData: CreateUserRequest): Promise<UserResponse> => {
        try {
            const { email, name, password, phone, role, city, state } = userData;

            const existingUser = await userRepository.Query.findUserByEmail(email);
            if (existingUser) {
                throw new ConflictError("Email já está em uso.");
            }

            let regionId: Types.ObjectId | undefined;
            if (city && state) {
                const region = await geocodingService.findNearestStationByCity({ city, state });
                regionId = convertToObjectId(region._id as string);
            }

            const passwordHash = await hashPassword(password);

            const user = await userRepository.Mutation.createUser({
                email,
                name,
                passwordHash,
                phone,
                role: role,
                regionId,
            });

            return user;
        } catch (error) {
            throw error;
        }
    },
    updateUser: async (userId: string, userData: UpdateUserRequest): Promise<UserResponse> => {
        try {
            if (!userId) {
                throw new BadRequestError("ID do usuário é obrigatório.");
            }

            const existingUser = await userRepository.Query.findUserById(userId);
            if (!existingUser) {
                throw new NotFoundError("Usuário não encontrado.");
            }

            const { name, email, password, phone, isActive, city, state } = userData;

            let regionId: Types.ObjectId | undefined;
            if (city && state) {
                const region = await geocodingService.findNearestStationByCity({ city, state });
                regionId = convertToObjectId(region._id as string);
            }

            if (email) {
                const userWithEmail = await userRepository.Query.findUserByEmail(email);
                if (userWithEmail && userWithEmail._id !== userId) {
                    throw new ConflictError("Email já está em uso por outro usuário.");
                }
            }

            let passwordHash: string | undefined;
            if (password) {
                passwordHash = await hashPassword(password);
            }

            const updatedUser = await userRepository.Mutation.updateUser({
                userId, userData: {
                    name,
                    email,
                    passwordHash,
                    phone,
                    isActive,
                    regionId
                }
            });

            if (!updatedUser) {
                throw new BadRequestError("Falha ao atualizar o usuário.");
            }

            return updatedUser;
        } catch (error) {
            throw error;
        }
    },

    deleteUser: async (userId: string): Promise<{ message: string }> => {
        try {
            if (!userId) {
                throw new BadRequestError("ID do usuário é obrigatório.");
            }

            const existingUser = await userRepository.Query.findUserById(userId);
            if (!existingUser) {
                throw new NotFoundError("Usuário não encontrado.");
            }

            const deleted = await userRepository.Mutation.deleteUser(userId);
            if (!deleted) {
                throw new BadRequestError("Falha ao deletar o usuário.");
            }

            return { message: "Usuário deletado com sucesso." };
        } catch (error) {
            throw error;
        }
    }
}

export const userService = {
    Query,
    Mutation
}