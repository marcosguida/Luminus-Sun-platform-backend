import { Document, Types } from "mongoose";

export const hashPassword = async (password: string): Promise<string> => {
    return await Bun.password.hash(password);
}

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    return await Bun.password.verify(password, hash);
}

export const convertToObjectId = (id: string | undefined): Types.ObjectId | undefined => {
    return id ? new Types.ObjectId(id) : undefined;
};

export const toPlainObject = <T>(doc: Document): T => {
    const obj = doc.toObject();
    return {
        ...obj,
        _id: obj._id.toString(),
    } as T;
};

export const toBrazilianTime = (date: Date): Date => {
    return new Date(date.getTime() - 3 * 60 * 60 * 1000);
}

const convertMWToKW = (mw: number): number => mw * 1000;
