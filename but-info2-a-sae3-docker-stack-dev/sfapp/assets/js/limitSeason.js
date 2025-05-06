export const getSeason = () => {
    const now = new Date();
    const month = now.getMonth() + 1; // Mois de 0 à 11, donc on ajoute 1
    const day = now.getDate();

    if ((month === 12 && day >= 21) || month === 1 || month === 2 || (month === 3 && day < 20)) {
        return 'winter';
    } else if ((month === 3 && day >= 20) || month === 4 || month === 5 || (month === 6 && day < 21)) {
        return 'spring';
    } else if ((month === 6 && day >= 21) || month === 7 || month === 8 || (month === 9 && day < 23)) {
        return 'summer';
    } else {
        return 'autumn';
    }
};

export const getLimits = (season) => {
    const limits = {
        spring: {
            temp: { min: 18, max: 21 },
            hum: { min: 40, max: 80 },
            co2: { min: 400, max: 1200 }
        },
        summer: {
            temp: { min: 18, max: 25 },
            hum: { min: 35, max: 75 },
            co2: { min: 400, max: 1200 },
        },
        autumn: {
            temp: { min: 17, max: 21 },
            hum: { min: 40, max: 80 },
            co2: { min: 400, max: 1200 },
        },
        winter: {
            temp: { min: 17, max: 23 },
            hum: { min: 40  , max: 80 },
            co2: { min: 400, max: 1200 },
        },
    };
    return limits[season] || {}; // Retourne un objet vide si la saison est inconnue
};