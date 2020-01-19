const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Guest = new Schema({
    guest_name: {
        type: String
    },
    guest_email: {
        type: String
    },
    guest_phoneNumber: {
        type: String
    },
    guest_address: {
        type: String
    },
    guest_travelingFrom: {
        type: String
    },
    guest_overnight: {
        type: Boolean
    },
    guest_alchBev: {
        type: String
    },
    guest_partySize: {
        type: Number
    },
    guest_RSVPStatus: {
        type: String
    },
});

module.exports = Guest;//mongoose.model("Guest", Guest);