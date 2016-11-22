var express = require('express'),
    poke = require('./routes/pokes');

var app = express();


app.configure(function () {
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});

app.get('/pokes', poke.findAll);
app.get('/pokes/all', poke.viewAll);
app.get('/pokes/name/:name', poke.findByName);
app.get('/pokes/type/:type', poke.findByType);
app.post('/pokes/add', poke.addPoke);
app.put('/pokes/update/:id', poke.updatePoke);
app.delete('/pokes/delete/:id', poke.deletePoke);
app.get('/fruit/:fruitName/:fruitColor', function(req, res) {
    var data = {
        "fruit": {
            "name": req.params.fruitName,
            "color": req.params.fruitColor
        }
    }; 

    res.send(data);
});

poke.checkDB();

app.listen(3000);
console.log('Listening on port 3000...');
