const express = require('express')
const path = require('path')
const request = require('request')
const axios = require('axios')
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
    
    mongoClient.connect(connectionUrl, { useNewUrlParser: true }, (error, client) => {
        if(error){
           return console.log('cannot connect to mongo', error);
        }
    
        console.log('db connectionn success')
    
        const db = client.db(dbName)

        db.collection('wiki-search-results').find({'searchQuery': searchTerm}).toArray((err, result) => {
            if(err){
                console.log(err)
            }
            if(result[0]){
                console.log('query result', result)
                if(result[0]){
                    let data = [result[0].searchQuery, result[0].keywords, [], result[0].links, result[0].detailInfo];
                    res.send({response:data});
                }
                
            }else{
                let url = "https://en.wikipedia.org/w/api.php?action=opensearch&search="+ searchTerm + "&format=json";
    
                request(url, function (error, response) {
                    const data = JSON.parse(response.body);
                    
                    let promiseList = [];
                    let keywordsList = data[1];
                    
                    for(let i = 0; i < data[1].length; i++){
                        let tempUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${keywordsList[i]}`; 
                        let tempPromise = axios.get(encodeURI(tempUrl));
                        promiseList.push(tempPromise);
                    }

                    
                    Promise.all(promiseList).then((responseList) => {
                        let img_desc_list = [];
                        responseList.forEach((response) => {
                            let obj = {
                                img: response.data.originalimage || '',
                                title: response.data.title,
                                description: response.data.extract
                            }
                            img_desc_list.push(obj);
                        });

                        db.collection('wiki-search-results').insertOne({
                            searchQuery: data[0],
                            keywords: data[1],
                            links: data[3],
                            detailInfo: img_desc_list
                        }, (error, result) => {
                            if(error){
                                console.log(error);
                            }else{
                                console.log(result);
                            }
    
                        })
                        
                        data.push(img_desc_list);

                        res.send({response: data})
                
                    })

                })
            }
        })

        
    })
    
    
    
    
    

});


myApp.listen(3000, () => {
    console.log('express server started');
})
