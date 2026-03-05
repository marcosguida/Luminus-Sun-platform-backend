import { UnauthorizedError } from "@/lib/errors/AppError";
import { verifyToken } from "@/lib/jwt";
import Elysia from "elysia";

export const isAuthenticated = new Elysia({ name: "middleware:isAuthenticated" })
    .derive(async ({ cookie }) => {
        const { authToken } = cookie

        if (!authToken?.value) {
            throw new UnauthorizedError('Não autorizado: Sessão não encontrada');
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
    