import { Elysia } from 'elysia';
import { inmetStationService } from './inmetStation.service';

export const inmetRoutes = new Elysia({ name: 'externalServices:routes:inmet', prefix: '/inmet' })
    .post('/sync', async ({ set }) => {
        try {
            const result = await inmetStationService.syncStations();
            return { message: 'Estações INMET sincronizadas com sucesso.', ...result };
        } catch (error) {
            throw error
        }
    })
