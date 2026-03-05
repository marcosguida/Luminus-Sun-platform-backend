const toRad = (deg: number) => (Math.PI / 180) * deg;
const toDeg = (rad: number) => (180 / Math.PI) * rad;
const clamp = (x: number, min: number, max: number) => Math.max(min, Math.min(max, x));

const dayOfYear = (d: Date) => {
    const start = Date.UTC(d.getUTCFullYear(), 0, 0);
    const diff = d.getTime() - start;
    return Math.floor(diff / 86400000);
};

const solarPosition = (lat: number, lon: number, date: Date) => {
    const n = dayOfYear(date);

    const fracDay = (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24;
    const gamma = 2 * Math.PI * (n - 1 + fracDay) / 365;

    const decl =
        0.006918
        - 0.399912 * Math.cos(gamma)
        + 0.070257 * Math.sin(gamma)
        - 0.006758 * Math.cos(2 * gamma)
        + 0.000907 * Math.sin(2 * gamma)
        - 0.002697 * Math.cos(3 * gamma)
        + 0.00148 * Math.sin(3 * gamma);

    const eqTime = 229.18 * (
        0.000075
        + 0.001868 * Math.cos(gamma)
        - 0.032077 * Math.sin(gamma)
        - 0.014615 * Math.cos(2 * gamma)
        - 0.040849 * Math.sin(2 * gamma)
    );

    const timeOffset = eqTime + 4 * lon;
    const tst = (date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60 + timeOffset) % (24 * 60); // min
    const hourAngle = (tst / 4) - 180; 

    const latRad = toRad(lat);
    const haRad = toRad(hourAngle);
    const cosZenith = Math.sin(latRad) * Math.sin(decl) + Math.cos(latRad) * Math.cos(decl) * Math.cos(haRad);
    const zenith = toDeg(Math.acos(clamp(cosZenith, -1, 1)));
    const elevation = 90 - zenith;

    const sinAz = -Math.sin(haRad) * Math.cos(decl) / Math.sqrt(1 - cosZenith * cosZenith);
    const cosAz = (Math.sin(decl) - Math.sin(latRad) * cosZenith) / (Math.cos(latRad) * Math.sqrt(1 - cosZenith * cosZenith));
    const azimuth = (toDeg(Math.atan2(sinAz, cosAz)) + 360) % 360;

    return { elevation, zenith, azimuth };
}

const extraterrestrialIrradiance = (n: number) => {
    const Isc = 1367;
    return Isc * (1 + 0.033 * Math.cos(2 * Math.PI * n / 365));
}

const airMassKY = (zenithDeg: number) => {
    const z = Math.min(zenithDeg, 89.9);
    return 1 / (Math.cos(toRad(z)) + 0.50572 * Math.pow(96.07995 - z, -1.6364));
}


const clearSkyGHI = (zenithDeg: number, n: number, altitudeM: number = 0) => {
    if (zenithDeg >= 90) return 0;
    const mu = Math.cos(toRad(zenithDeg));
    const I0 = extraterrestrialIrradiance(n);
    const am = airMassKY(zenithDeg);

    const tau = 0.8
    const altitudeFactor = 1 + 0.0001 * altitudeM; 
    const trans = Math.exp(- (1 - tau) * am);

    return Math.max(0, I0 * mu * trans * altitudeFactor);
}


const cloudModificationFactor = (cloudsPct: number) => {
    const C = clamp(cloudsPct / 100, 0, 1);
    return clamp(1 - 0.75 * Math.pow(C, 3), 0, 1);
}


export const estimateGHI = ({
    lat,
    lon,
    date = new Date(),
    clouds = 0,
    altitudeM = 0,
}: {
    lat: number;
    lon: number;
    date?: Date;
    clouds?: number;
    altitudeM?: number;
}): number => {
    const { elevation, zenith } = solarPosition(lat, lon, date);

    if (elevation <= 0) return 0;

    const n = dayOfYear(date);
    const ghiClear = clearSkyGHI(zenith, n, altitudeM);
    const cmf = cloudModificationFactor(clouds);
    return Math.round(ghiClear * cmf);
}
