'use strict'

var searchInput = document.getElementById('searchInput');

searchInput.addEventListener('keypress', function(event){
    console.log(event);
    let searchVal = searchInput.nodeValue;
    console.log(searchVal);
})