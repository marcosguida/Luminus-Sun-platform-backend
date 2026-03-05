// services/ibgeGeocoding/ibgeGeocoding.types.ts

export interface IBGERegion {
    id: number;
    sigla: string;
    nome: string;
}

export interface IBGEStateResponse {
    id: number;
    sigla: string;
    nome: string;
    regiao: IBGERegion;
}

export interface IBGEMesoRegion {
    id: number;
    nome: string;
    UF: IBGEStateResponse;
}

export interface IBGEMicroRegion {
    id: number;
    nome: string;
    mesorregiao: IBGEMesoRegion;
}

// Novo: Região Imediata
export interface IBGERegiaoIntermediaria {
    id: number;
    nome: string;
    UF: IBGEStateResponse;
}

export interface IBGERegiaoImediata {
    id: number;
    nome: string;
    "regiao-intermediaria": IBGERegiaoIntermediaria;
}

export interface IBGECityResponse {
    id: number;
    nome: string;
    microrregiao?: IBGEMicroRegion;
    "regiao-imediata"?: IBGERegiaoImediata;
}

export interface State {
    id: number;
    name: string;
    uf: string;
    regionName: string;
    regionCode: string;
}

export interface City {
    id: number;
    name: string;
    uf: string;
    stateName: string;
    regionName: string;
}