import { Document, model, Schema, Types } from 'mongoose';

export enum UserRoles {
    USER = 'user',
    ADMIN = 'admin',
}

export interface IUserBase {
    name: string;
    email: string;
    passwordHash: string;
    regionId?: Types.ObjectId;
    isActive: boolean;
    phone: string;
    role: UserRoles;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUser extends IUserBase, Document { }

export interface ICreateUser extends Omit<IUserBase, 'role' | 'isActive' | 'createdAt' | 'updatedAt'> {
    role?: UserRoles;
    isActive?: boolean;
}

export interface IUpdateUser extends Partial<Omit<IUserBase, 'createdAt' | 'updatedAt'>> { }

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    regionId: { type: Schema.Types.ObjectId, ref: 'RegionStation' },
    role: { type: String, enum: Object.values(UserRoles), default: UserRoles.USER },
    phone: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export const UserModel = model<IUser>('User', UserSchema);
