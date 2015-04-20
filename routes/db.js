var mongoose = require("mongoose");
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var userSchema = new Schema({
    email : String,
    password : String,
    firstName : String,
    lastName : String,
    phoneNumber : Number,
    phoneVerified: false,
    deviceId : ObjectId,
    deviceNumber: String // may be directed to another schema later. Board schema.
});

var deviceSchema = new Schema({
	deviceNumber: String,
  isActivated: Boolean,
  isSynced: Boolean,
	sensors : Object,
	priorities: Object
});

var alertSchema = new Schema({
  _id : String,
  phoneNumber : Number,
  token : String
});

var confirmTokenSchema = new Schema({
    _id : String,
    date : { type: Date, default: Date.now }
});

var resetTokenSchema = new Schema({
    _id : String,
    date : { type: Date, default: Date.now },
    userId : ObjectId
})

var User = mongoose.model('User', userSchema)
  , Device = mongoose.model('Device', deviceSchema)
  , Alert = mongoose.model('Alert', alertSchema)
  , ConfirmToken = mongoose.model('ConfirmToken', confirmTokenSchema)
  , ResetToken = mongoose.model('ResetToken', resetTokenSchema);

module.exports = {
    User: User,
    Device: Device,
    Alert: Alert,
    ConfirmToken : ConfirmToken,
    ResetToken : ResetToken
}
