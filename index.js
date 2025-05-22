const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

// mongoDB connect
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7gsjhzt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    // Connect to the "CoffeeDB" database and access its "coffees" collection
    const coffeesCollection = client.db('coffeeDB').collection('coffees');
    const usersCollection = client.db('coffeeDB').collection('users');

    app.get('/coffees', async (req, res) => {
      // const cursor = coffeesCollection.find();
      // const result = await cursor.toArray();
      const result = await coffeesCollection.find().toArray();
      res.send(result);
    });

    // read
    app.get('/coffees/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeesCollection.findOne(query);
      res.send(result);
    });

    // ## create coffee data
    app.post('/coffees', async (req, res) => {
      const newCoffee = req.body;
      console.log(newCoffee);

      // Insert the defined document into the "coffees" collection
      const result = await coffeesCollection.insertOne(newCoffee);

      res.send(result);
    });

    // update
    app.put('/coffees/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedCoffee = req.body; 
      const updatedDoc = {
        $set: updatedCoffee,
      };
      const result = await coffeesCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // delete
    app.delete('/coffees/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeesCollection.deleteOne(query);
      res.send(result);
    });

    // ##_user related APIs*

    // read on json all users
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // create user json
    app.post('/users', async (req, res) => {
      const userProfile = req.body;
      console.log(userProfile);

      // Insert the defined document into the "users" collection
      const result = await usersCollection.insertOne(userProfile);
      res.send(result);
    });

    // update user 
    app.patch('/users', async (req, res) => {
      const { email, lastSignInTime } = req.body;
      const filter = { email: email };
      const updatedDoc = {
        $set: {
          lastSignInTime: lastSignInTime,
        },
      };
      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // delete user
    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
  }
}
run().catch(console.dir);

// starting
app.get('/', (req, res) => {
  res.send('Coffee server is getting hotter');
});
app.listen(port, () => {
  console.log(`Coffee server is running on port ${port}`);
});
