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


document.write(
     unescape("%3Cscript src='https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js' type='text/javascript'%3E%3C/script%3E");
     unescape("%3Cscript src='https://cdn.jsdelivr.net/npm/ip-geolocation-api-jquery-sdk@1.1.0/ipgeolocation.min.js' type='text/javascript'%3E%3C/script%3E");
   );

// The main, exported, function of the endpoint,
// dealing with the request and subsequent response
module.exports = async (req, res) => {
    try {

      _ipgeolocation.enableSessionStorage(true);

      var ip = sessionStorage.getItem("ip");
      var country_name = sessionStorage.getItem("country_name");
      var country_code2 = sessionStorage.getItem("country_code2");



      if (!ip || !country_name || !country_code2) {
          _ipgeolocation.makeAsyncCallsToAPI(false);
          // _ipgeolocation.setFields("country_name,country_code2");
          _ipgeolocation.getGeolocation(handleResponse, "34faa710fe904818a36b68a72f4b4183");
      }


      const db = await connectToDatabase();
      const collection = await db.collection(process.env.IPCOLLECTION);
      await collection.insertOne(handleResponse)

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
