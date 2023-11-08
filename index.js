const express = require("express");
const cors = require("cors");
require('dotenv').config()
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


// mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.03occsr.mongodb.net/?retryWrites=true&w=majority`;
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
    const restaurantCollection = client.db("restaurantDB").collection("products");
    const orderCollection = client.db("restaurantDB").collection("orderInfo");

    app.post("/products", async (req, res) => {
      const addProudct = req.body;
      const result = await restaurantCollection.insertOne(addProudct);
      res.send(result);
    })

    // get data by email
    app.get("/userAddedProducts", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query?.email }
      }
      const result = await restaurantCollection.find(query).toArray();
      res.send(result);
    })
    // pagination 
    app.get("/paginationCount", async (req, res) => {
      const count = await restaurantCollection.estimatedDocumentCount();
      res.send({ count });
    })

    app.get("/api/sortProducts", async (req, res) => {
        try {
          const page = Number(req.query.page);
          const size = Number(req.query.size)
          const result = await restaurantCollection.find().sort({ order: -1 })
          .skip(page * size)
          .limit(size)
          .toArray()
          res.send(result)
        } catch (error) {
          console.log(error)
        }
    })

    // update order 
 
    app.patch("/api/sortProducts/:id", async(req,res)=>{
      const id = req.params.id;
      console.log(id)
      const updateId = {_id: new ObjectId(id)}
      const options = {upsert: true} 
      const order = req.body;
      console.log(order.incOrder)
      const updateOrder = {
        $set: {
          order: order.incOrder,
        }
      }
      const result = await restaurantCollection.updateOne(updateId, updateOrder, options)
      res.send(result)
  })


    app.get("/singleFoodDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await restaurantCollection.find(query).toArray();
      res.send(result);
    })

    // { _id, image, FoodName, price, category, quantity, description } 

    app.put("/singleFoodDetails/:id", async (req, res) => {
      const id = req.params.id;
      const updatedId = { _id: new ObjectId(id) };
      const options = { upsert: true }
      const product = req.body;
      const updateProduct = {
        $set: {
          FoodName: product.FoodName,
          image: product.image,
          price: product.price,
          category: product.category,
          quantity: product.quantity,
          description: product.description
        }
      }
      const result = await restaurantCollection.updateOne(updatedId, updateProduct, options)
      res.send(result)
    })






    // orderConfrim
    app.post("/confirmOrder", async (req, res) => {
      const orderData = req.body;
      const result = await orderCollection.insertOne(orderData);
      res.send(result);
    })


    // order get according to login user
    app.get("/allOrderData", async (req, res) => {
      const email = req.query?.email;
      let query = {}
      if (email) {
        query = { userEmail: email }
      }
      const result = await orderCollection.find(query).toArray()

      res.send(result)
    })

    // order food delete
    app.delete("/allOrderData/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);
//   mongodb end


app.get("/", (req, res) => {
  res.send("Server is running");
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})