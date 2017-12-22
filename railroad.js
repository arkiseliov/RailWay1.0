var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var credentials = require('./credentials.js');
var Station = require('./models/station.js');
var Trip = require('./models/trip.js');
var Passenger = require('./models/passenger.js');
var pdf = require('express-pdf');
var opts = {
	server: {
		socketOptions: { keepAlive: 1 }
	}
};
mongoose.connect(credentials.mongo.connectionString, opts);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', console.log.bind(console, 'connected succesfully'));
var handlebars = require('express-handlebars')
	.create({
		defaultLayout:'main',
		helpers: {
			section: function(name, options){
				if(!this._sections) this._sections = {};
				this._sections[name] = options.fn(this);
				return null;
			}
		}
	});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.use(express.static(__dirname + '/public'));
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(pdf);

//ининциализация маршрутов
var routes = require('./routes.js');
routes.forEach(function(route){
	app[route.method](route.path, route.handler);
});

var autoViews = {};

app.use(function(req,res,next){
	var path = req.path.toLowerCase();
	// проверка кэша; если он там есть, визуализируем представление
	if(autoViews[path]) return res.render(autoViews[path]);
	// если его нет в кэше, проверяем наличие
	// подходящего файла .handlebars
	if(fs.existsSync(__dirname + '/views' + path + '.handlebars')){
		autoViews[path] = path.replace(/^\//, '');
		return res.render(autoViews[path]);
	}

	// представление не найдено; переходим к обработчику кода 404
	next();
});

// пользовательская страница 404
app.use(function(req, res){
	res.status(404);
	res.render('404');
});
// пользовательская страница 500
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500).render('500');
});

app.listen(app.get('port'), function(){
	console.log( 'Express запущено в режиме ' + app.get('env') + ' на http://localhost:' + app.get('port') + '; нажмите Ctrl+C для завершения.' );
});

