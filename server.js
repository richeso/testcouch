var express = require('express'),
    wine = require('./routes/wines');

var app = express();


app.configure(function () {
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});

app.get('/wines', wine.findAll);
app.get('/wines/all', wine.viewAll);
app.get('/wines/name/:name', wine.findByName);
app.get('/wines/type/:type', wine.findByType);
app.post('/wines/add', wine.addWine);
app.put('/wines/update/:id', wine.updateWine);
app.delete('/wines/delete/:id', wine.deleteWine);
app.get('/fruit/:fruitName/:fruitColor', function(req, res) {
    var data = {
        "fruit": {
            "name": req.params.fruitName,
            "color": req.params.fruitColor
        }
    }; 

    res.send(data);
});

wine.checkDB();

app.listen(3000);
console.log('Listening on port 3000...');
