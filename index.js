const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// define port
const port = process.env.PORT || 5000;

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// database setup
const uri = process.env.DB_URI;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

// run function & api endpoint
async function run() {
    try {
        const usersCollection = client.db("recycleHub-db").collection("users");
        const categoriesCollection = client
        .db("recycleHub-db")
        .collection("categories");
        const productsCollection = client.db("recycleHub-db").collection("products");

        // save the user in db & generate JWT
        app.put("/user/:email", async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const doc = {
                $set: user,
            };
            const result = await usersCollection.updateOne(
                filter,
                doc,
                options
            );

            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: "2h",
            });
            res.send({ result, token });
        });

        // set User role
        app.patch("/userRole/:email", async (req, res) => {
            const email = req.params.email;
            const role = req.body;
            const filter = { email: email };

            const options = { upsert: false };
            const doc = {
                $set: { role: role.role },
            };
            const result = await usersCollection.updateOne(
                filter,
                doc,
                options
            );

            res.send({ result });
        });

        // set User role
        app.patch("/verifyStatus/:email", async (req, res) => {
            const email = req.params.email;
            const isVerified = req.body;
            const filter = { email: email };

            const options = { upsert: false };
            const doc = {
                $set: { isVerified: isVerified.isVerified },
            };
            const result = await usersCollection.updateOne(
                filter,
                doc,
                options
            );

            res.send({ result });
        });

        // get all category
        app.get("/categories", async (req, res) => {
            const filter = {};
            const categories = await categoriesCollection
                .find(filter)
                .toArray();
            res.send(categories);
        });

        // get user role from db
        app.get("/userRole/:email", async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const user = await usersCollection.findOne(filter);
            res.send(user);
        });

        // add product to the database
        app.post('/addProduct', async(req, res) => {
            const product = req.body;
            // console.log(product);
            const result = await productsCollection.insertOne(product);
            res.send(result)
        })
    } finally {
    }
}
run().catch((error) => console.log(error));

app.get("/", (req, res) => {
    res.send("Server is running!");
});

// listen port
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
