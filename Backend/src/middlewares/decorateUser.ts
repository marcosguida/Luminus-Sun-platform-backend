import { UnauthorizedError } from "@/lib/errors/AppError";
import { verifyToken } from "@/lib/jwt";
import Elysia from "elysia";

export const decorateUser = new Elysia({ name: "middleware:decorateUser" })
    .derive(async ({ cookie }) => {
        const { authToken } = cookie

        if (!authToken?.value) {
            return { currentUser: null };
        }

        try {
            const userPayload = await verifyToken(authToken.value.toString());
            console.log('Payload do usuário autenticado:', userPayload);

            return {
                currentUser: userPayload
            }
        } catch (error) {
            throw new UnauthorizedError('Não autorizado: Token inválido ou expirado');
        }
    })
    .as("global")
    