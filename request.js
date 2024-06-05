const axios = require('axios');
const fs = require('fs');

const apiKey = "RGAPI-3838197b-a125-4fcb-844d-4a34b0147752";
const apiRegion = "americas"; // americas, europe, asia, esports
const url = `https://${apiRegion}.api.riotgames.com`;

const playersNames = [
    "Tio_Heimer#LAS",
    "Nando8#Nando"
];

// Pausa la ejecución durante el tiempo especificado (en milisegundos)
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Obtiene el puuid
const getPuuid = async (gameName, tagLine) => {
    const getPuuidUrl = `${url}/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${apiKey}`;
    let data;
    try {
        const response = await axios.get(getPuuidUrl);
        console.log("__________________________________________________________________________________________");
        console.log("getPuuidUrl");
        console.log("__________________________________________________________________________________________");
        console.log(response.data);
        data = response.data;
    } catch (error) {
        console.log(error);
        return error;
    }
    return data;
}

// Busca los ID de las ultimas 20 partidas
const getLastMatches = async (puuid) => {
    const getLastMatchesUrl = `${url}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${apiKey}`;
    let data;
    try {
        const response = await axios.get(getLastMatchesUrl);
        console.log("__________________________________________________________________________________________");
        console.log("getLastMatches");
        console.log("__________________________________________________________________________________________");
        console.log(response.data);
        data = response.data;
    } catch (error) {
        console.log(error);
        return error;
    }
    return data;
}

// Busca el detalle de una partida
const getMatch = async (matchId) => {
    const getMatchUrl = `${url}/lol/match/v5/matches/${matchId}?api_key=${apiKey}`;
    let data;
    try {
        const response = await axios.get(getMatchUrl);
        // console.log("__________________________________________________________________________________________");
        // console.log("getMatch");
        // console.log("__________________________________________________________________________________________");
        // console.log(response.data);
        data = response.data;
        fs.writeFileSync(`${data.metadata.matchId}.json`, JSON.stringify(data, null, 2)); // Guardar como .json
    } catch (error) {
        console.log(error.request);
        return error;
    }
    return data;
}

let matchesData = [];

// Proceso completo
const fullProcess = async (playersArray) => {
    console.log(playersArray);
    for (const name of playersArray) {
        const [user, tag] = name.split("#");
        
        // Obtener el puuid
        const userData = await getPuuid(user, tag);
        if (userData.puuid) {
            // Obtener las últimas 20 partidas
            const lastMatches = await getLastMatches(userData.puuid);
            if (lastMatches && lastMatches.length > 0) {
                for (const match of lastMatches) {
                    // Obtener detalles de la partida
                    await sleep(1200); // Pausa de 1.2 segundos entre cada llamada a getMatch
                    const matchData = await getMatch(match);
                    matchesData.push(matchData);
                }
            }
        }
    }

    matchesData.forEach(matchData => {
        if (matchData.metadata) {
            console.log("Match Id: ", matchData.metadata.matchId);
            fs.writeFileSync(`${matchData.metadata.matchId}.json`, JSON.stringify(matchData, null, 2)); // Guardar como .json
        }
    });
}

fullProcess(playersNames);
