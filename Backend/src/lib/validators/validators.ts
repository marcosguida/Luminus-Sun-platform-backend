import z from "zod";

export const isStrongPassword = (password: string) => {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
        password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumber &&
        hasSpecialChar
    );
};

export const isValidPhone = (phone: string) => {
    const cleanedPhone = phone.replace(/[^\d]/g, "");

    if (cleanedPhone.length !== 10 && cleanedPhone.length !== 11) {
        return false;
    }

    if (/^(\d)\1+$/.test(cleanedPhone)) {
        return false;
    }

    const ddd = parseInt(cleanedPhone.substring(0, 2), 10);
    if (ddd < 11) {
        return false;
    }

    if (cleanedPhone.length === 11 && cleanedPhone.charAt(2) !== '9') {
        return false;
    }

    return true;
};

export const validatePassword = z.string()
    .min(6, {
        message: "Senha deve ter pelo menos 6 caracteres."
    })
    .refine(isStrongPassword, {
        message: "Senha deve conter ao menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.",
    });

export const validatePhone = z.string()
    .min(10, {
        message: "O telefone deve ter no mínimo 10 caracteres, incluindo DDD."
    })
    .refine(isValidPhone, {
        message: "O número de telefone fornecido é inválido.",
    });