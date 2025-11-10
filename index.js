const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const uri = process.env.MONGO_URI;
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json())



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



async function run() {
  try {
    await client.connect();
    // Send a ping to confirm a successful connection
    const db = client.db("online_learning_platform");
    const courseCollection = db.collection("courses")
    const userCollection = db.collection("users")
    const enrollmentCollection = db.collection("enrollUsers")

    app.get('/latest-courses', async (req, res) => {
      try {
        const courses = await courseCollection.find().toArray();
        res.send(courses);
      } catch (error) {
        res.status(500).send({ message: "Error fetching data", error });
      }
    });

    // My courses get
    app.get('/my-courses', async (req, res) => {
      try {
        const email = req.query.email
        const courses = await courseCollection.find({ created_by: email }).toArray()
        res.send({ success: true, courses })
      } catch (error) {
        res.status(500).send({ message: "Error fetching data", error });
      }
    });







    await client.db("admin").command({ ping: 1 });

    console.log("Pinged your deployment. You successfully connected to Ping MongoDB!");

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
