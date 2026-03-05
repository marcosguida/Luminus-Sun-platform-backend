import { AppError } from "@/lib/errors/AppError";
import { DatabaseError } from "@/lib/errors/DatabaseError";
import Elysia from "elysia";

export const onError = new Elysia({ name: 'middleware:onError' })
    .onError(({ code, error, set, status }) => {
        console.log(code)

        if (code === "NOT_FOUND") {
            set.status = 404;
            return {
                type: "not_found",
                message: "A rota solicitada não foi encontrada.",
                status: 404
            };
        }

        if (code === "PARSE") {
            set.status = 400;
            return {
                type: "parse_error",
                message: "Erro ao parsear a requisição.",
                details: error.message,
            };
        }

        if (code === "VALIDATION") {
            set.status = 400;
            let details;

            try {
                details = JSON.parse(error.message);
            } catch {
                details = error.message;
            }

            return {
                type: "validation_error",
                message: "Erro de validação no corpo da requisição",
                details,
            };
        }

        if (error instanceof AppError) {
            set.status = error.statusCode;
            return {
                success: false,
                error: error.message
            };
        }

        if (error instanceof DatabaseError) {
            set.status = error.statusCode;
            return {
                type: "database_error",
                message: error.message,
                code: error.code,
                detail: error.detail,
                status: error.statusCode,
            };
        }

        set.status = 500;
        return {
            type: "error",
            message: "Erro interno no servidor",
        };
    })
    .as("global")