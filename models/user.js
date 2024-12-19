const mongoose = require("mongoose");
const Subscriber = require("./subscriber");
const passportLocalMongoose = require("passport-local-mongoose");
const randToken = require("rand-token");

const userSchema = new mongoose.Schema({
    name: {
        first: {
            type: String,
            trim: true
        },
        last: {
            type: String,
            trim: true
        }
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    zipCode: {
        type: Number,
        min: [10000, "Zip code too short"],
        max: 99999
    },
    apiToken: {
        type: String
    },
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course"
        }
    ],
    subscribedAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscriber"
    }
}, {
    timestamps: true
});

userSchema.virtual("fullName").get(function() {
    return `${this.name.first} ${this.name.last}`;
});

userSchema.pre("save", function (next) {
    let user = this;
    if (user.subscribedAccount === undefined) {
        Subscriber.findOne({
            email: user.email
        }).then(sub => {
            if (sub) {
                user.subscribedAccount = sub;
            }
            next();
        }).catch(error => {
            console.log(error.message)
            next(error);
        });
    } else {
        next();
    }
});

// userSchema.pre("save", function(next) {
//     let user = this;
//     if (!user.apiToken) user.apiToken = randToken.generate(16);
//     next();
// });

userSchema.plugin(passportLocalMongoose, {
    usernameField: "email"
});

module.exports = mongoose.model("User", userSchema);
