// ----- /api/analytics.js -----
// Import Dependencies
const url = require("url");
const MongoClient = require("mongodb").MongoClient;

// Create cached connection variable
let cachedDb = null;
const uri = process.env.VISITORSDB
console.log("db = " +uri);

// A function for connecting to MongoDB,
// taking a single parameter of the connection string
async function connectToDatabase() {
    // If the database connection is cached,
    // use it instead of creating a new connection
    if (cachedDb) {
        return cachedDb;
    }

    // If no connection is cached, create a new one
    const client = await MongoClient.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    // Select the database through the connection,
    // using the database path of the connection string
    const db = await client.db(url.parse(uri).pathname.substr(1));

    // Cache the database connection and return the connection
    cachedDb = db;
    return db;
}

// The main, exported, function of the endpoint,
// dealing with the request and subsequent response
module.exports = async (req, res) => {
    try {
        // get all user details and store them

        // const host = req.headers["host"]
        const forwardedhost = req.headers["x-forwarded-host"]
        // const forwardedproto = req.headers["x-forwarded-proto"]
        // const forwardedport = req.headers["x-forwarded-port"]

        // const vercelid = req.headers["x-vercel-id"]

        // const acceptlanguage = req.headers["accept-language"]
        // const acceptencoding = req.headers["accept-encoding"]
        const referer = req.headers["referer"]

        // const secfetchdest = req.headers["sec-fetch-dest"]
        // const secfetchmode = req.headers["sec-fetch-mode"]
        // const secfetchsite = req.headers["sec-fetch-site"]

        // const origin = req.headers["origin"]
        // const accept = req.headers["accept"]

        const dnt = req.headers["dnt"]


        const userAgent = req.headers["user-agent"]
        const public_ip = req.headers["x-forwarded-for"]
        const ipcountry = req.headers["x-vercel-ip-country"]
        const ipregion = req.headers["x-vercel-ip-country-region"]
        const ipcity = req.headers["x-vercel-ip-city"]
        const iplatitude = req.headers["x-vercel-ip-latitude"]
        const iplongitude = req.headers["x-vercel-ip-longitude"]
        const iptimezone = req.headers["x-vercel-ip-timezone"]

        const deploymenturl = req.headers["x-vercel-deployment-url"]

        d = new Date(); // time of logging
        d.toLocaleTimeString();

        info = { forwardedhost, referer, dnt, userAgent, public_ip, ipcountry, ipregion, ipcity, iplatitude, iplongitude, iptimezone, deploymenturl, userClickedOn: "" + d } // as a json5 object

        const db = await connectToDatabase();
        const collection = await db.collection(process.env.COLLECTION);
        await collection.insertOne(info)
            .then(() => {
                // just return the status as 200
                res.status(200).send()
            })
            .catch((err) => {
                throw err
            })
    } catch (error) {
        // log the error so that owner can see it in vercel's function logs
        console.log(error);
        // return 500 for any error
        res.status(500).send()
    }
};
