require ('dotenv').config();

const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.DATABASE_ACCESS_URL;

let db

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
});

async function connectToDatabase() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
  
      db = client.db("rayreader")

      // Send a ping to confirm a successful connection
      await db.command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
      return db
    } catch (error){
      // Ensures that the client will close when you finish/error
      console.error("Failed to connect to the database:", error);
      throw error;
    }
}

function getDB(){
    return db
}

async function findChunks(chunkID){
    db.collection("cvStorage.files").findOne({_id: chunkID})
}

module.exports = {
    connectToDatabase,
    getDB,
    findChunks,
}