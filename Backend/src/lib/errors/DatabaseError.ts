export class DatabaseError extends Error {
    public statusCode: number;
    public code?: string;
    public detail?: string;

    constructor(message: string, originalError?: any, statusCode = 500) {
        const code = originalError?.code;
        const detail = originalError?.detail || originalError?.message;

        const fullMessage = [
            message,
            code ? `Código: ${code}` : null,
            detail ? `Detalhe: ${detail}` : null,
        ]
            .filter(Boolean)
            .join(" | ");

        super(fullMessage);

        this.name = "DatabaseError";
        this.statusCode = statusCode;
        this.code = code;
        this.detail = detail;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, DatabaseError);
        }
    }
}
