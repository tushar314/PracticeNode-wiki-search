const express = require('express')
const path = require('path')
const request = require('request')

const myApp = express()

const viewsPath = path.join(__dirname, '../views')

myApp.set('view engine', 'hbs')

myApp.set('views', viewsPath)

// myApp.use(express.static(path.join(__dirname, '../public')));
console.log(path.join(__dirname, './templates'))

myApp.get('/', (req,res) => {
    res.render('index');
});

myApp.get('/search', (req,res) => {
    let searchTerm = req.query.searchQuery;
    let url = "https://en.wikipedia.org/w/api.php?action=opensearch&search="+ searchTerm + "&format=json";
    
    request(url, function (error, response) {
        const data = JSON.parse(response.body);
        res.render('search-result', {query : data[0], results: data[1]})
    });

});


myApp.listen(3000, () => {
    console.log('express server started');
})
