export class AppError extends Error {
    public readonly statusCode: number;

    constructor(message: string, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AppError';
    }
}


export class BadRequestError extends AppError {
    constructor(message = 'Requisição inválida') {
        super(message, 400);
        this.name = 'BadRequestError';
    }
}


export class UnauthorizedError extends AppError {
    constructor(message = 'Não autorizado. Faça login para continuar.') {
        super(message, 401);
        this.name = 'UnauthorizedError';
    }
}


export class ForbiddenError extends AppError {
    constructor(message = 'Você não tem permissão para executar esta ação.') {
        super(message, 403);
        this.name = 'ForbiddenError';
    }
}


export class NotFoundError extends AppError {
    constructor(message = 'Recurso não encontrado.') {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}


export class ConflictError extends AppError {
    constructor(message = 'Os dados fornecidos entram em conflito com os dados existentes.') {
        super(message, 409);
        this.name = 'ConflictError';
    }
}
