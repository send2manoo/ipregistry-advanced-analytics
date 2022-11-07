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

        /* ---------------------------------------------------------------

         Javascript
        ----------------

        This endpoint makes sense when it is invoked from a client browser only. If you invoke it from a server node, we will return IP data for the IP from where the request originates, meaning your server IP address. Each origin IP lookup request costs 1 credit.
        -----------------------------------------------------------------*/

        const public_ip = req.headers["x-forwarded-for"]
        const {IpregistryClient} = require('@ipregistry/client');

        const client = new IpregistryClient('3noaja8hp0usdbyv');

        client.lookup(public_ip).then(response => {
            jsonData = response.data;
            console.log("response.data = "+JSON.parse(JSON.stringify(response.data)));
            // console.log("JSON.parse(response.data) = ", JSON.parse(response.data));
            // console.log("JSON.parse(JSON.stringify(jsonData)) = "+JSON.parse(JSON.stringify(jsonData)));
        }).catch(error => {
            console.err(error);
        })

        const db = await connectToDatabase();
        const collection = await db.collection(process.env.COLLECTION);
        await collection.insertOne(JSON.parse(JSON.stringify(jsonData)))
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
