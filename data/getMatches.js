const { MongoClient } = require('mongodb');
fs = require("fs")

// Proceso completo
const fullProcess = async () => {
    const mongoUrl = "mongodb://localhost:27017"; // Cambia esto si tu MongoDB no está en localhost
    const dbName = "riot_matches";
    const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("matches");

    const data = await collection.find({"matchId": "BR1_2943424123"}).toArray()

    //console.log(data)
    fs.writeFileSync("partidazas.json", JSON.stringify(data));
    // await client.close();

}


fullProcess();
