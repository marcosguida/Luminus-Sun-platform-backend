import { toPlainObject } from "@/lib/utils";
import { DatabaseError } from "../../lib/errors/DatabaseError";
import { UserResponse } from "./user.dto";
import { ICreateUser, IUpdateUser, IUser, UserModel, UserRoles } from "./user.model";

const Query = {
    findUsersWithRegion: async (): Promise<UserResponse[]> => {
        try {
            const users = await UserModel.find({
                regionId: { $exists: true, $ne: null },
                isActive: true,
            }).populate("regionId");

            return users.map(user => toPlainObject<UserResponse>(user));
        } catch (error) {
            throw new DatabaseError("Erro ao buscar usuários com região no banco de dados.");
        }
    },
    findUserById: async (userId: string): Promise<UserResponse | null> => {
        try {
            return await UserModel.findById(userId);
        } catch (error) {
            throw new DatabaseError("Erro ao buscar usuário por ID no banco de dados.");
        }
    },
    findUserByEmail: async (email: string): Promise<UserResponse | null> => {
        try {
            return await UserModel.findOne({ email });
        } catch (error) {
            throw new DatabaseError("Erro ao buscar usuário por email no banco de dados.");
        }
    },
    findUserByPhone: async (phone: string): Promise<UserResponse | null> => {
        try {
            return await UserModel.findOne({ phone });
        } catch (error) {
            throw new DatabaseError("Erro ao buscar usuário por telefone no banco de dados.");
        }
    },
    findAllUsers: async (): Promise<UserResponse[]> => {
        try {
            return await UserModel.find();
        } catch (error) {
            throw new DatabaseError("Erro ao buscar todos os usuários no banco de dados.");
        }
    }
}

const Mutation = {
    createUser: async (userData: ICreateUser): Promise<UserResponse> => {
        try {
            const { email, name, passwordHash, phone, role, regionId } = userData;
            const newUser = await UserModel.create({
                email,
                name,
                passwordHash,
                phone,
                role: role || UserRoles.USER,
                isActive: true,
                regionId,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            return toPlainObject<UserResponse>(newUser);
        } catch (error) {
            throw new DatabaseError("Erro ao criar usuário no banco de dados.");
        }
    },
    updateUser: async ({ userId, userData }: { userId: string, userData: IUpdateUser }): Promise<UserResponse | null> => {
        try {
            const { name, phone, isActive, regionId } = userData;

            const updatedUser = await UserModel.findByIdAndUpdate(
                userId,
                { $set: { name, phone, isActive: !!isActive, regionId, updatedAt: new Date() } },
                { new: true }
            );

            if (!updatedUser) {
                return null;
            }

            return toPlainObject<UserResponse>(updatedUser);
        } catch (error) {
            throw new DatabaseError("Erro ao atualizar usuário no banco de dados.");
        }
    },
    deleteUser: async (userId: string): Promise<boolean> => {
        try {
            const deletedUser = await UserModel.findByIdAndDelete(userId);

            return !!deletedUser;
        } catch (error) {
            throw new DatabaseError("Erro ao deletar usuário no banco de dados.");
        }
    }
}

export const userRepository = {
    Query,
    Mutation
}