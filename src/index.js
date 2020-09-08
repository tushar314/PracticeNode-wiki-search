const express = require('express')
const path = require('path')
const request = require('request')
const mongo = require('mongodb')
const mongoClient = mongo.MongoClient

const connectionUrl = 'mongodb://127.0.0.1:27017'
const dbName = 'wiki-search'





const myApp = express()

const viewsPath = path.join(__dirname, '../views')

myApp.set('view engine', 'hbs')

// myApp.set('views', viewsPath)

myApp.use(express.static(path.join(__dirname, '../public')));
// console.log(path.join(__dirname, './templates'))

// myApp.get('/', (req,res) => {
//     res.render('index');
// });

myApp.get('/search', (req,res) => {
    let searchTerm = req.query.searchQuery;
    let url = "https://en.wikipedia.org/w/api.php?action=opensearch&search="+ searchTerm + "&format=json";
    
    request(url, function (error, response) {
        const data = JSON.parse(response.body);

        mongoClient.connect(connectionUrl, { useNewUrlParser: true }, (error, client) => {
            if(error){
               return console.log('cannot connect to mongo', error);
            }
        
            console.log('db connectionn success')
        
            const db = client.db(dbName)

            db.collection('wiki-search-results').insertOne({
                searchQuery: data[0],
                keywords: data[1],
                links: data[2]
            }, (error, result) => {
                if(error){
                    console.log(error);
                }else{
                    console.log(result);
                }

            })
        })

        res.send({response: data})
    })

});


myApp.listen(3000, () => {
    console.log('express server started');
})
