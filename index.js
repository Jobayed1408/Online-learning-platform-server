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


    // find users data 
    app.get("/users", async (req, res) => {
      try {
        const result = await userCollection
          .find()
          .toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Error searching users", error });
      }
    });

    
  
      // search data
      app.get("/search", async (req, res) => {
        try {
          const searchTxt = req.query.text;
          const result = await courseCollection
            .find({
              title: { $regex: searchTxt, $options: "i" }
            })
            .toArray();
          res.send(result);
        } catch (error) {
          res.status(500).send({ message: "Error searching courses", error });
        }
      });

  
  
      // Delete data by id
      app.delete("/course/:id", async (req, res) => {
        try {
          const { id } = req.params
  
          const result = await courseCollection
            .deleteOne({ _id: new ObjectId(id) })
  
          res.send(result);
        } catch (error) {
          res.status(500).send({ message: "Error searching courses", error });
        }
      });
      
  
  
      // find specific id
      app.get("/courses/:id", async (req, res) => {
        try {
          const id = req.params.id
          // console.log(id);
  
          const result = await courseCollection.findOne({ _id: new ObjectId(id) })
          res.send({ success: true, result });
        } catch (error) {
          res.status(500).send({ message: "Error searching courses", error });
        }
      });
  
  
  
      // get enrolled data from database
      app.get("/enroll-courses", async (req, res) => {
        try {
          const { email } = req.query;
          if (!email) {
            return res.status(400).send({ success: false, message: "Email required" });
          }
  
          const user = await userCollection.findOne({ email });
          if (!user) {
            return res.status(404).send({ success: false, message: "User not found" });
          }
  
          const enrollments = await enrollmentCollection.find({ userId: user._id }).toArray();
  
          const courseIds = enrollments.map((e) => new ObjectId(e.courseId));
  
          const courses = await courseCollection.find({ _id: { $in: courseIds } }).toArray();
  
          res.send({ success: true, courses, courseIds });
        } catch (error) {
          console.error(error);
          res.status(500).send({ success: false, message: "Error fetching courses", error });
        }
      });
      
  
  
  
      // save courses data on courseCollection
      app.post("/courses", async (req, res) => {
        try {
          const data = req.body;
          const result = await courseCollection.insertOne(data);
          res.send({ success: true, insertedId: result.insertedId });
        } catch (err) {
          console.error(err);
          res.status(500).send({ success: false, error: err.message });
        }
      });
        
  
      // add single user 
      app.post("/users", async (req, res) => {
        try {
          const user = req.body;
  
          const existingUser = await userCollection.findOne({ email: user.email });
  
          if (existingUser) {
            return res.send({ success: true, message: "User already exists" });
          }
  
          const result = await userCollection.insertOne(user);
          res.send({ success: true, message: "User saved successfully", result });
        } catch (error) {
          console.error(error);
          res.status(500).send({ success: false, message: "Error saving user" });
        }
      });

  

  
  
  
      // save enrolled course in database
      app.post("/enroll", async (req, res) => {
        const { userEmail, courseId } = req.body;
  
        try {
          const user = await userCollection.findOne({ email: userEmail });
          if (!user) return res.status(404).send({ success: false, message: "User not found" });
  
          const alreadyEnrolled = await enrollmentCollection.findOne({
            userId: user._id,
            courseId: courseId
          });
          if (alreadyEnrolled) return res.send({ success: false, message: "Already enrolled" });
  
          const result = await enrollmentCollection.insertOne({
            userId: user._id,
            courseId: courseId,
            enrolledAt: new Date()
          });
  
          res.send({ success: true, message: "Course enrolled successfully", result });
  
        } catch (error) {
          console.error(error);
          res.status(500).send({ success: false, message: "Enrollment failed", error });
        }
      });
  
  
  
      // update single course
      app.put("/update-course/:id", async (req, res) => {
        const id = req.params.id;
        const updatedData = req.body;
        const userEmail = updatedData.email;
  
        try {
          const result = await courseCollection.updateOne(
            { _id: new ObjectId(id), created_by: userEmail },
            { $set: updatedData }
          );
  
          if (result.modifiedCount > 0) {
            res.send({ success: true, message: "Course updated successfully" });
          } else {
            res.send({ success: false, message: "No course found to update" });
          }
        } catch (error) {
          console.error("Update error:", error);
          res.status(500).send({ success: false, message: "Server error" });
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
