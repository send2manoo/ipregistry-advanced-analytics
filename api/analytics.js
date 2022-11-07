// ----- /api/analytics.js -----
// Import Dependencies
const url = require("url");
const MongoClient = require("mongodb").MongoClient;

// Create cached connection variable
let cachedDb = null;
const uri = process.env.VISITORSDB
console.log("db = " +uri);
var jsonData;

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
        const public_ip = req.headers["x-forwarded-for"]
        const {IpregistryClient} = require('@ipregistry/client');

        const client = new IpregistryClient('3noaja8hp0usdbyv');

        client.lookup(public_ip).then(response => {
            jsonData = response.data;
            console.log("JSON.stringify(jsonData) = "+JSON.stringify(jsonData));
        }).catch(error => {
            console.err(error);
        })

        // const forwardedhost = req.headers["x-forwarded-host"]
        // const referer = req.headers["referer"]
        // const dnt = req.headers["dnt"]
        // const userAgent = req.headers["user-agent"]
        // const ipcountry = req.headers["x-vercel-ip-country"]
        // const ipregion = req.headers["x-vercel-ip-country-region"]
        // const ipcity = req.headers["x-vercel-ip-city"]
        // const iplatitude = req.headers["x-vercel-ip-latitude"]
        // const iplongitude = req.headers["x-vercel-ip-longitude"]
        // const iptimezone = req.headers["x-vercel-ip-timezone"]
        // const deploymenturl = req.headers["x-vercel-deployment-url"]

        // d = new Date(); // time of logging
        // d.toLocaleTimeString();

        // info = { forwardedhost, referer, dnt, userAgent, public_ip, ipcountry, ipregion, ipcity, iplatitude, iplongitude, iptimezone, deploymenturl, userClickedOn: "" + d } // as a json5 object
        // advanced_info = Object.assign(info, JSON.parse(JSON.stringify(jsonData)));
        console.log("jsonData = "+JSON.parse(jsonData));

        const db = await connectToDatabase();
        const collection = await db.collection(process.env.COLLECTION);
        await collection.insertOne(JSON.parse(jsonData))
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
