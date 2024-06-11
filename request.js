const axios = require('axios');
const fs = require('fs');
const { MongoClient } = require('mongodb');

const apiKey = "RGAPI-9fc415e5-27c3-441a-a2a0-ea1cb3039100";

const playersNames = [
    "Tio_Heimer#LAS#americas",
    "Nando8#Nando#americas"
];

// Pausa la ejecución durante el tiempo especificado (en milisegundos)
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Obtiene el puuid
const getPuuid = async (gameName, tagLine, apiRegion) => {
    const getPuuidUrl = `https://${apiRegion}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${apiKey}`;
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
const getLastMatches = async (puuid, apiRegion) => {
    const getLastMatchesUrl = `https://${apiRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${apiKey}`;
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
const getMatch = async (matchId,apiRegion) => {
    const getMatchUrl = `https://${apiRegion}.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${apiKey}`;
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

/* const mongoUrl = "mongodb://localhost:27017"; // Cambia esto si tu MongoDB no está en localhost
const dbName = "riot_matches";
const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true }); */


// Proceso completo
const fullProcess = async (playersArray) => {
    console.log(playersArray);
    for (const name of playersArray) {
        const [user, tag, apiRegion] = name.split("#");
        
        // Obtener el puuid
        const userData = await getPuuid(user, tag, apiRegion);
        if (userData.puuid) {
            // Obtener las últimas 20 partidas
            const lastMatches = await getLastMatches(userData.puuid, apiRegion);
            if (lastMatches && lastMatches.length > 0) {
                for (const match of lastMatches) {
                    // Obtener detalles de la partida
                    await sleep(1200); // Pausa de 1.2 segundos entre cada llamada a getMatch
                    const matchData = await getMatch(match, apiRegion);
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

/* const mongoUpload = (matchesArray) => {
    matchesArray.map(match => )
} */

fullProcess(playersNames);
