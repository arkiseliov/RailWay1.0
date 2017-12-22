var Station = require('./models/station.js');
var Trip = require('./models/trip.js');
var Passenger = require('./models/passenger.js');
var mongoose = require('mongoose');

module.exports = [
	{
		method: 'get',
		path: '/',
		handler: function(req, res, next){
			Station.find(function(err, stations){
				if(err){
					console.error('Database error');
					return next();
				}
				var context = {
					stations: stations.map(function(station){
						return {
							name: station.name
						};
					}),
					minDate: (new Date).toJSON().substr(0,10)
				};
				res.render('home', context);
			});
		}
	},
	{
		method: 'get',
		path: '/select-ticket',
		handler: function(req, res){
			console.log('Route accepted');
			Station.findOne({name: req.query.from}, function(err, from){
				if(err) console.error(err);
				Station.findOne({name: req.query.to}, function(err, to){
					if(err) console.error(err);
					var mode = req.query.mode == 'oneWay' ? false : true;
					Trip.find({from: from.id, to: to.id, isTwoWay: mode}).populate('from').populate('to').exec(function(err, trips){
						if(err){
							return console.error(err);
						}
						var result;
						
						result = trips.filter(function(i){
							return i.outcomeDate.toJSON().substr(0,10) == req.query.outcomeDate;
						})
						var allWagonTypes = [];
						result.forEach(function(i){
							i.wagonTypes.forEach(function(j){
								var obj = j.name;
								if(allWagonTypes.indexOf(obj) < 0){
									allWagonTypes.push(obj);
								}
							});
						});
						if (req.query.mode == 'oneWay') {
							result = result.map(function(i){
								return {
									id: i._id,
									from: i.from.name,
									to: i.to.name,
									outcomeDate: i.outcomeDate.toLocaleString(),
									arrivalDate: i.arrivalDate.toLocaleString(),
									duration: i.getDurationString(),
									wagonTypes: i.getTypesHTML(allWagonTypes)
								}
							})
						}else{
							result = result.map(function(i){
								return {
									id: i._id,
									from: i.from.name,
									to: i.to.name,
									outcomeDate: i.outcomeDate.toLocaleString(),
									arrivalDate: i.arrivalDate.toLocaleString(),
									duration: i.getDurationString(),
									returningOutcomeDate: i.returningOutcomeDate.toLocaleString(),
									returningArrivalDate: i.returningArrivalDate.toLocaleString(),
									returningDuration: i.getReturningDurationString(),
									wagonTypes: i.getTypesHTML(allWagonTypes)
								}
							})
							
						}
						var context = {
							trips: result,
							isTwoWay: mode,
							allWagonTypes: allWagonTypes
						};
						res.render('select-ticket', context);
					});
				});
			});
		}
	},
	{
		method: 'get',
		path: '/timetable',
		handler: function(req, res){
			Station.findOne({name: req.query.from}, function(err, from){
				if(err) console.error(err);
				Station.findOne({name: req.query.to}, function(err, to){
					if(err) console.error(err);
					var mode = req.query.mode == 'oneWay' ? false : true;
					Trip.find({from: from.id, to: to.id, isTwoWay: mode}).populate('from').populate('to').exec(function(err, trips){
						if(err){
							return console.error(err);
						}
						var result;
						if (req.query.mode == 'oneWay') {
							result = trips.filter(function(i){
								return i.outcomeDate.toJSON().substr(0,10) == req.query.outcomeDate;
							}).map(function(i){
								return {
									id: i._id,
									from: i.from.name,
									to: i.to.name,
									outcomeDate: i.outcomeDate.toLocaleString(),
									arrivalDate: i.arrivalDate.toLocaleString(),
									duration: i.getDurationString()
								}
							});
						}else{
							result = trips.filter(function(i){
								return i.outcomeDate.toJSON().substr(0,10) == req.query.outcomeDate;
							}).map(function(i){
								return {
									id: i._id,
									from: i.from.name,
									to: i.to.name,
									outcomeDate: i.outcomeDate.toLocaleString(),
									arrivalDate: i.arrivalDate.toLocaleString(),
									duration: i.getDurationString(),
									returningOutcomeDate: i.returningOutcomeDate.toLocaleString(),
									returningArrivalDate: i.returningArrivalDate.toLocaleString(),
									returningDuration: i.getReturningDurationString()
								}
							});
						}
						var context = {
							trips: result,
							isTwoWay: mode
						};
						res.render('timetable', context);
					});
				});
			});
		}
	},
	{
		method: 'post',
		path: '/credentials/',
		handler: function(req, res){
			context = {
				id: req.body.id
			}
			res.render('credentials', context);
		}
	},
	{
		method: 'post',
		path: '/select-place/',
		handler: function(req, res){
			Trip.findById(req.body.tripId, function(err, trip){
				if (err) console.error(err);
				var context = {
					wagons: trip.wagons,
					credentials: req.body
				}
				res.render('select-place', context);
			});
		}
	},
	{
		method: 'post',
		path: '/card-credential/',
		handler: function(req, res){
			var places = req.body.places;
			delete req.body.places;
			var context = {
				places: places,
				credentials: req.body
			}
			res.render('card-credential', context);
		}
	},
	{
		method: 'post',
		path:'/overall/',
		handler: function(req, res){
			// console.log(req.body);
			var places = JSON.parse(req.body.places);
			Trip.findOne({_id: mongoose.Types.ObjectId(req.body.tripId)},function(err, trip){
				console.log(trip, req.body.tripId);
				places.forEach(function(i){
					var wInd = trip.wagons.findIndex(function(j){
						return j.number == i.wagon;
					});
					var pInd = trip.wagons[wInd].places.findIndex(function(j){
						return j.number == i.place;
					});
					trip.wagons[wInd].places[pInd].isAvailable = false;
				});
				trip.save(function(err, uTrip){
					if(err) console.error(err);

					new Passenger({
						lastName: req.body.lastName,
						firstName: req.body.firstName,
						passportNumber: req.body.passport,
						validUntil: new Date(req.body.validityPeriod),
						email: req.body.email,
						phone: req.body.tel,
						trip: req.body.tripId,
						places: places
					}).save(function(er, uPass){
						Station.findById(trip.from, function(err, from){
							Station.findById(trip.to, function(err, to){
								var context = {
									passenger: uPass,
									trip: {
										from: from.name,
										to: to.name,
										outcomeDate: trip.outcomeDate.toLocaleString(),
										arrivalDate: trip.arrivalDate.toLocaleString(),
										duration: trip.getDurationString(),
										isTwoWay: trip.isTwoWay,
										returningOutcomeDate: trip.isTwoWay ? trip.returningOutcomeDate.toLocaleString() : undefined,
										returningArrivalDate: trip.isTwoWay ? trip.returningArrivalDate.toLocaleString() : undefined,
										returningDuration: trip.isTwoWay ? trip.getReturningDurationString() : undefined
									}
								};
							res.render('overall', context);
							})
						});
					});
				});
			});
		}
	},
	{
		method: 'get',
		path: '/download-ticket',
		handler: function(req, res){
			Passenger.findById(req.query.passenger, function(err, passenger){
				Trip.findById(passenger.trip, function(err, trip){
					Station.findById(trip.from, function(err, from){
						Station.findById(trip.to, function(err, to){
							var content = '<div class="customer-info">\
											<h3>Информация о покупателе:</h3>\
											<ul>\
												<li>Имя: '+passenger.lastName+' '+passenger.firstName+'</li>\
												<li>Номер паспорта: '+passenger.passportNumber+'</li>\
												<li>Срок действия паспорта: '+passenger.validUntil.toJSON().substr(0,10)+'</li>\
												<li>E-mail: '+passenger.email+'</li>\
												<li>Номер телефона: '+passenger.phone+'</li>\
											</ul>\
										</div>\
										<div class="trip-info">\
											<h3>Информация о покупке</h3>\
											<ul>\
												<li>'+from.name+' - '+to.name+'</li>\
												<li>Дата и время отправления: '+trip.outcomeDate.toLocaleString()+'</li>\
												<li>Дата и время прибытия: '+trip.arrivalDate.toLocaleString()+'</li>\
												<li>Длительность поездки: '+trip.getDurationString()+'</li>';
												if(trip.isTwoWay){
													content += '<li>Дата и время отправления обратно: '+trip.returningOutcomeDate.toLocaleString()+'</li>\
													<li>Дата и время прибытия обратно: '+trip.returningArrivalDate.toLocaleString()+'</li>\
													<li>Длительность поездки обратно: '+trip.getReturningDurationString()+'</li>';
												}
												content += '<li>\
													<h4>Места:</h4>\
													<ul>';
														passenger.places.forEach(function(i){
															content += '<li>Вагон '+i.wagon+', место '+i.place+'</li>';
														})
														content += '</ul>\
												</li>\
											</ul>\
										</div>';
							res.pdfFromHTML({
						        filename: 'ticket.pdf',
						        htmlContent: content,
						        options: {}
						    });
						})
					});
				});
			});
		}
	}
];