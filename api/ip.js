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

        // const url = "https://api.ipgeolocation.io/ipgeo?apiKey=34faa710fe904818a36b68a72f4b4183";

        var IPGeolocationAPI = require('ip-geolocation-api-javascript-sdk');

        // Create IPGeolocationAPI object. Constructor takes two parameters.
        // 1) API key (Optional: To authenticate your requests through "Request Origin", you can skip it.)
        // 2) Async (Optional: It is used to toggle "async" mode in the requests. By default, it is true.)
        var ipgeolocationApi = new IPGeolocationAPI("34faa710fe904818a36b68a72f4b4183", false);


        function handleResponse(json) {
            jsonData = json;
            console.log(json);
        }

        // var GeolocationParams = require('ip-geolocation-api-javascript-sdk/GeolocationParams.js');

        // Get complete geolocation for the calling machine's IP address
        ipgeolocationApi.getGeolocation(handleResponse);


        // console.log("jsonData = "+ JSON.parse(jsonData));
        console.log("jsonData = "+ JSON.stringify(jsonData, null, 4));



        const db = await connectToDatabase();
        const collection = await db.collection(process.env.IPCOLLECTION);
        await collection.insertOne(JSON.stringify(jsonData, null, 4))
            .then(() => {
                // just return the status as 200
                res.status(200).send()
            })
            .catch((err) => {
                console.log(err);
            })
    } catch (error) {
        // log the error so that owner can see it in vercel's function logs
        console.log(error);
        // return 500 for any error
        res.status(500).send()
    }
};
