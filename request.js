const axios = require('axios');
const fs = require('fs');

const apiKey = ""
const apiRegion = "americas" // americas, europe, asia, esports
const url = `https://${apiRegion}.api.riotgames.com`

const playersNames = [
    "Nando8#Nando",
    "ElPintaCulos#ELPC"
]

// Obtiene el puuid
const getPuuid = async (gameName, tagLine) => {
    const getPuuidUrl = `${url}/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${apiKey}`
    let data
    await axios.get(getPuuidUrl)
        .then((response) => {
            console.log("__________________________________________________________________________________________");
            console.log("getPuuidUrl");
            console.log("__________________________________________________________________________________________");
            console.log(response.data);
            data = response.data;
        })
        .catch((error) => {
            console.log(error);
            return (error)
        })

    return data
}

// Busca los ID de las ultimas 20 partidas
const getLastMatches = async (puuid) => {
    const getLastMatchesUrl = `${url}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${apiKey}`
    let data
    await axios.get(getLastMatchesUrl)
        .then((response) => {
            console.log("__________________________________________________________________________________________");
            console.log("getLastMatches");
            console.log("__________________________________________________________________________________________");
            console.log(response.data);
            data = response.data;
        })
        .catch(function (error) {
            console.log(error);
            return (error)
        })
    return data
}

// Busca el detalle de una partida
const getMatch = async (matchId) => {
    const getLastMatchesUrl = `${url}/lol/match/v5/matches/${matchId}?api_key=${apiKey}`
    let data
    await axios.get(getLastMatchesUrl)
        .then((response) => {
            // console.log("__________________________________________________________________________________________");
            // console.log("getMatch");
            // console.log("__________________________________________________________________________________________");
            // console.log(response.data);
            data = response.data;
            fs.writeFileSync(`${data.metadata.matchId}.txt`, JSON.stringify(data));
        })
        .catch(function (error) {
            console.log(error.request);
            return (error)
        })
    return data
}

let matchesData

const fullProcess = (playersArray) => {
    console.log(playersArray)
    playersArray.map((name, idx) => {
        setTimeout(() => {
            console.log("Delayed for 1 second.");
        }, "1000");

        const [user, tag] = name.split("#")
        const lastMatches = new Promise(async () => {
            const userData = await getPuuid(user, tag)

            const lastMatches = await getLastMatches(userData.puuid)

            matchesData = await lastMatches.map(async (match, idx) => {
                await setTimeout(() => {
                    console.log("Delayed for 1 second.");
                }, "5000");
                await getMatch(match)
            })
        })

        Promise.all([lastMatches]).then(() => {
            return matchesData.map(matchData => {
                console.log("Match Id: ", matchData.metadata.matchId)
                fs.writeFileSync(`${matchData.metadata.matchId}.txt`, JSON.stringify(matchData));
            })
        });
    })
}
fullProcess(playersNames)



