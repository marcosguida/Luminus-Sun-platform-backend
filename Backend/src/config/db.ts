import mongoose from 'mongoose';

export const connectDatabase = async (uri: string) => {
    try {
        await mongoose.connect(uri, {
            dbName: 'hackathon2025',
        });
        console.log('✅ MongoDB conectado');
    } catch (err) {
        console.error('❌ Erro ao conectar ao MongoDB:', err);
        throw err;
    }
}
