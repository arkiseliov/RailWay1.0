var mongoose = require('mongoose');
var passengerSchema = mongoose.Schema({
	lastName: String,
	firstName: String,
	passportNumber: String,
	validUntil: Date,
	email: String,
	phone: String,
	trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
	places: [{wagon: Number, place: Number}]
});

var Passenger = mongoose.model('Passenger', passengerSchema);
module.exports = Passenger;