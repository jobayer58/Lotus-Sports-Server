const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.esqhd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// console.log(uri);

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const equipmentCollections = client.db('LotusSports').collection('sports') 
    // const userCollection = client.db('LotusSports').collection('addCollection')

    app.get('/equipment', async(req,res) => {
        const  cursor = equipmentCollections.find()
        const result = await cursor.toArray()
        res.send(result)
    })

    // card Details
    app.get('/equipment/:id', async(req,res) => {
        const id = req.params.id
        const query = {_id: new ObjectId(id)}
        const result = await equipmentCollections.findOne(query)
        res.send(result)
    })

    app.post('/equipment', async (req,res) => {
        const newEquipment = req.body
        const result = await equipmentCollections.insertOne(newEquipment)
        res.send(result)
    })

    // use Add Collection 
    const userCollection = client.db('LotusSports').collection('addCollection')

    // collect add to card to my collection list in data server
    app.post('/collection', async (req, res) => {
        const item = req.body;
        if (!item.userEmail) {
            return res.status(400).send({ message: "User email is required" });
        }
        const exists = await userCollection.findOne({ userEmail: item.userEmail, name: item.name });
        if (exists) {
            return res.status(400).send({ message: "Already Added" });
        }
        // Remove _id if it exists
        delete item._id;
    
        const result = await userCollection.insertOne(item);
        res.send(result);
    });
    
    // data get form database.and show the data in my collection page
    app.get('/collection', async (req, res) => {
        const userEmail = req.query.email;
        if (!userEmail) {
            return res.status(400).send({ message: "User email is required" });
        }       
        const items = await userCollection.find({ userEmail }).toArray();     
        // id convert to string
        const formattedItems = items.map(item => ({
            ...item,
            _id: item._id.toString()
        }));
    
        res.send(formattedItems);
    });

    // gat Item card For update
    app.get('/collection/:id', async(req,res) => {
        const id = req.params.id
        const query = {_id: new ObjectId(id)}
        const result = await userCollection.findOne(query)
        res.send(result)
    })
    
    // add item Delete Function
    app.delete('/collection/:id', async (req,res) => {
        const id = req.params.id
        const query = {_id: new ObjectId(id)}
        const result = await userCollection.deleteOne(query)
        res.send(result) 
    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res) => {
    res.send('lotus sports is running')
})


app.listen(port, () => {
    console.log(`lotus sports server is running on port: ${port}`);
})