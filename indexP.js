const express=require('express');
const app=express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const MongoClient = require('mongodb').MongoClient;

let server=require('./server');
let config=require('./config');
let middleware=require('./middleware');
const response=require('express');

const url='mongodb://127.0.0.1:27017';
const dbname="myproject";
let db

MongoClient.connect(url,(err,client)=>{
    if(err) return console.log(err);
    db=client.db(dbname);
    console.log('connected database: ${url}');
    console.log('Database:${dbname}');
});

app.get('/hospital', middleware.checkToken, (req,res)=>{
    console.log("getting things ready");
    db.collection("hospital").find().toArray()
    .then(result => res.json(result));
});

app.get('/ventilator', middleware.checkToken, (req,res)=>{
    console.log("getting things ready");
    db.collection("ventilator").find().toArray()
    .then(result=>(res.json(result)));
});

app.post('/searchventbystatus', middleware.checkToken, (req,res) => {
    const status = req.query.status;
    console.log(status);
    db.collection('ventilator').find({"status":status}).toArray().then(result=>res.json(result));
});

app.post('/searchventbyname', middleware.checkToken, (req,res) => {
    const name=req.query.name;
    console.log(name);
    db.collection('ventilator').find({'name':new RegExp(name, 'i')}).toArray().then(result=>res.json(result));
});

app.post('/searchhospital', middleware.checkToken, (req,res) => {
    const name=req.query.name;
    console.log(name);
    db.collection('hospital').find({'name':new RegExp(name, 'i')}).toArray().then(result=>res.json(result));
});

app.post('/addvent',(req,res)=>{
    const hid=req.body.hid;
    const ventid=req.body.ventid;
    const status=req.body.status;
    const name=req.body.name;
    console.log("adding ventilator, please wait a moment");
    const item={"hId":hid, "ventilatorId":ventid, "status":status, "name":name};
    db.collection("ventilator").insertOne(item, function(err, result){
        res.json("inserted successfully");
    });
});

app.put('/updateventilator', middleware.checkToken, (req,res) => {
    const ventid= {ventilatorId: req.query.ventid};
    console.log(ventid);
    const newvalues={$set: {status:req.query.status}};
    console.log("updating ventilator details, please wait a moment");
    db.collection("ventilator").updateOne(ventid, newvalues, function(err, result){
        res.json('updated one document');
        if(err) throw err;
    });
});

app.delete('/deletevent', middleware.checkToken, (req,res) => {
    const ventid=req.query.ventid;
    console.log(ventid);
    const temp={"ventilatorId":ventid};
    db.collection("ventilator").deleteOne(temp, function(err,obj){
        if(err) throw err;
        res.json("deleted one element");
    });
});

app.listen(1100,(req,res)=>{
    console.log("working well");
});