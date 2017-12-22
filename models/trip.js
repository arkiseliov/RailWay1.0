var mongoose = require('mongoose');
var Station = require('./station.js');
var wagonSchema = mongoose.Schema({
	number: Number,
	type: String,
	places: [{number: Number, isAvailable: Boolean}]
},{_id : false });
var tripSchema = mongoose.Schema({
	from: { type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
	to: { type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
	outcomeDate: Date,
	arrivalDate: Date,
	wagonTypes: [{name: String, price: Number}],
	wagons: [wagonSchema],
	isTwoWay: Boolean,
	returningOutcomeDate: Date,
	returningArrivalDate: Date
});

tripSchema.methods.findWagonType = function(name){
	return this.wagonTypes.find(function(i){
		return i.name == name;
	});
}

tripSchema.methods.countAvailableTickets = function(){
	var res = 0;
	if (typeof arguements[0] == 'number') {
		this.wagons[arguements[0]].places.forEach(function(i){
			if (i.isAvailable) {
				res++;
			}
		})
	}else{
		this.wagons.forEach(function(i){
			i.places.forEach(function(j){
				if (j.isAvailable) {
					res++;
				}
			})
		})
	}
	return res;
}

tripSchema.methods.findWagon = function(int){
	return this.wagons.find(function(i){
		return i.number == int;
	});
}

tripSchema.methods.countDuration = function(){
	return this.arrivalDate.getTime()-this.outcomeDate.getTime();
}

tripSchema.methods.getDurationString = function(){
	var duration = this.arrivalDate.getTime()-this.outcomeDate.getTime();
	var hours = Math.floor(duration / (1000*60*60));
	duration -= hours*1000*60*60;
	var minutes = Math.floor(duration/(1000*60));
	var res = (hours < 10 ? '0'+hours : hours) + ':' + (minutes < 10 ? '0'+minutes : minutes);
	return res;
}

tripSchema.methods.getReturningDurationString = function(){
	var duration = this.returningArrivalDate.getTime()-this.returningOutcomeDate.getTime();
	var hours = Math.floor(duration / (1000*60*60));
	duration -= hours*1000*60*60;
	var minutes = Math.floor(duration/(1000*60));
	var res = (hours < 10 ? '0'+hours : hours) + ':' + (minutes < 10 ? '0'+minutes : minutes);
	return res;
}

tripSchema.methods.getTypesHTML = function(types){
	var result = '', t = this;
	types.forEach(function(i){
		var type;
		if(type = t.wagonTypes.find(function(j){
			return j.name == i;
		})){
			var tickets = 0;
			var wagons = t.wagons.filter(function(j){
				return j.type == type.name;
			});
			wagons.forEach(function(j){
				tickets += j.places.filter(function(k){
					return k.isAvailable;
				}).length;
			})
			result += '<td>'+tickets+'<br>'+type.price+'</td>';
		}else{
			result += '<td></td>';
		}
	});
	return result;
}

var Trip = mongoose.model('Trip', tripSchema);
module.exports = Trip;

Trip.find(function(err, trips){
	if (err) return console.error('Database error');
	if (!trips.length){
		Station.find().or([{name: 'Барановичи-Минск'}, {name: 'Минск-Пассажирский'}]).find(function(err, stations){
			if (err) return console.error('Error getting an object from DB');

			new Trip({
				from: stations[0]._id,
				to: stations[1]._id,
				outcomeDate: new Date('2017-12-25 05:40:00'),
				arrivalDate: new Date('2017-12-29 17:50:00'),
				wagonTypes: [{name: 'Плацкарт', price: 5},{name: 'Купе', price: 7}],
				wagons: [{
					number: 1,
					type: 'Плацкарт',
					places: [
						{
							number: 1,
							isAvailable: true
						},
						{
							number: 2,
							isAvailable: true
						},
						{
							number: 3,
							isAvailable: false
						}
					]
				},
				{
					number: 2,
					type: 'Купе',
					places: [
						{
							number: 1,
							isAvailable: true
						},
						{
							number: 2,
							isAvailable: false
						},
						{
							number: 3,
							isAvailable: true
						}
					]
				}],
				isTwoWay: false
			}).save(function(err){
				if (err) console.error(err);
			});
			new Trip({
				from: stations[1]._id,
				to: stations[0]._id,
				outcomeDate: new Date('2017-12-23 00:01:00'),
				arrivalDate: new Date('2017-12-23 02:00:00'),
				wagonTypes: [{name: 'Общий', price: 5}],
				wagons: [{
					number: 1,
					type: 'Общий',
					places: [
						{
							number: 1,
							isAvailable: true
						},
						{
							number: 2,
							isAvailable: true
						},
						{
							number: 3,
							isAvailable: false
						}
					]
				},
				{
					number: 2,
					type: 'Общий',
					places: [
						{
							number: 1,
							isAvailable: true
						},
						{
							number: 2,
							isAvailable: false
						},
						{
							number: 3,
							isAvailable: true
						}
					]
				}],
				isTwoWay: true,
				returningOutcomeDate: new Date("2017-12-27 00:00:00"),
				returningArrivalDate: new Date("2017-12-27 03:30:00")
			}).save(function(err){
				if (err) console.error(err);
			});
		});
	}
});