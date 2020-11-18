const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId
require('dotenv').config()

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(fileUpload())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lirp7.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`

const port = (process.env.PORT || 5000)

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {

    const allProducts = client.db("emajohndb").collection("products");
    const cart = client.db("emajohndb").collection("cart");

    app.get('/allproducts', (req, res) => {
        allProducts.find({})
            .toArray((err, document) => {
                res.send(document)
            })
    })

    app.post('/addtocart', (req, res) => {
        cart.insertOne(
            { _id: req.body._id, count: 1 }
        )
    })

    app.patch('/updateCart', (req, res) => {
        cart.findOneAndUpdate(
            { _id: req.body._id },
            { $inc: { count: 1 } }
        )
    })

    app.patch('/decreaseCart', (req, res) => {
        cart.updateOne(
            { _id: req.body._id},
            { $set: { count:  req.body.count } }
        )
    })

    app.delete('/deleteProduct', (req, res)=>{
        cart.deleteOne(
            {_id: req.body._id}
        )
    })

    app.get('/products', (req, res)=>{
        const filter = req.query.search
        console.log(filter)
        allProducts.find({ name: { $regex: filter } })
        .toArray((err, documents)=>{
            res.status(200).send(documents)
        })
    })

    app.get('/cartproduct', (req, res) => {
        cart.find({})
            .toArray((err, document) => {
                res.send(document)
            })
    })
});

app.get("/", (req, res) => {
    res.send('Port Opened')
})

app.listen(port)
