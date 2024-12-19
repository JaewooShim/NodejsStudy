const User = require("../models/user"),
  getUserParams = body => {
    return {
      name: {
        first: body.first,
        last: body.last
      },
      email: body.email,
      password: body.password,
      zipCode: body.zipCode
    };
  };
  
const { body, check, validationResult } = require("express-validator");
const passport = require("passport");
const token = process.env.TOKEN || "recipeT0k3n";
const jsonWebToken = require("jsonwebtoken");
const httpStatus = require("http-status-codes");

module.exports = {
    index: (req, res, next) => {
        User.find().then(users => {
            res.locals.users = users;
            next();
        }).catch(error => {
            console.log(error.message);
            next(error);
        })
    },
    indexView: (req, res) => {
        res.render("users/index", {
            flashMEssages: {
                success: "Loaded all users!"
            }
        });
    },
    requestToken: (req, res) => {
        res.render("users/tokenRequest");
    },
    new: (req, res) => {
        res.render("users/new");
    },
    validate: (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            let messages = errors.array().map(e => e.msg);
            req.skip = true;
            req.flash("error", messages.join(" and "));
            res.locals.redirect = "/users/new";
            next();
        } else {
            next();
        }
    },
    create: (req, res, next) => {
        if (req.skip) return next(); // next() does not behave like a return statment so need to put else to prevent from proceeding the code

        let newUser = new User(getUserParams(req.body));

        User.register(newUser, req.body.password, (e, user) => {
            if (user) {
                req.flash("success", `${user.fullName}'s account created successfully!`);
                res.locals.redirect = "/users";
                next();
            } else {
                req.flash("error", `Failed to create user account because: ${e.message}.`);
                res.locals.redirect = "/users/new";
                next();
            }
        });
    },
    redirectView: (req, res, next) => {
        let redirectPath = res.locals.redirect;
        if (redirectPath !== undefined) res.redirect(redirectPath);
        else next();
    },
    show: (req, res, next) => {
        let userId = req.params.id;
        User.findById(userId).then(user => {
            res.locals.user = user;
            next();
        }).catch(error => {
            console.log(error.message);
            next(error);
        })
    },
    showView: (req, res) => {
        res.render("users/show");
    },
    edit: (req, res, next) => {
        let userId = req.params.id;
        User.findById(userId).then(user => {
            res.render("users/edit", {
                user: user
            });
        }).catch(error => {
            console.log(error.message);
            next(error);
        })
    },
    update: (req, res, next) => {
        let userId = req.params.id,
        userParams = getUserParams(req.body);

        User.findByIdAndUpdate(userId, {
            $set: userParams
        }).then(user => {
            res.locals.redirect = `/users/${userId}`;
            res.locals.user = user;
            next();
        }).catch(error => {
            console.log(error.message);
            next(error);
        });
    },
    delete: (req, res, next) => {
        let userId = req.params.id;
        User.findByIdAndDelete(userId).then(() => {
            res.locals.redirect = "/users";
            next();
        }).catch(error => {
            console.log(error.message);
            next();
        });
    },
    login: (req, res) => {
        res.render("users/login");
    },
    authenticate: passport.authenticate("local", {
        failureRedirect: "/users/login",
        failureFlash: "failed to login.",
        successRedirect: "/",
        successFlash: "Logged in!"
    }),
    login: (req, res) => {
        res.render("users/login");
    },
    logout: (req, res, next) => {
        req.logout(error => {
            if (error) return next(error);
            req.flash("success", "You have been logged out!");
            res.locals.redirect = "/";
            next();
        });
    },
    // verifyToken: (req, res, next) => {
    //     let token =req.query.apiToken;
    //     if (token) {
    //         User.findOne({ apiToken: token }).then(user => {
    //             if (user) next();
    //             else next(new Error("Invalid API token."));
    //         }).catch(error => {
    //             new(new Error(error.message));
    //         });
    //     } else {
    //         next(new Error("Invalid API token."));
    //     }
    // },
  // },
    apiAuthenticate: (req, res, next) => {
        console.log("hello?");
        passport.authenticate("local", (errors, user) => {
        if (user) {
            let signedToken = jsonWebToken.sign(
            {
                data: user._id,
                exp: new Date().setDate(new Date().getDate() + 1)
            },
            "secret_encoding_passphrase"
            );
            res.json({
            success: true,
            token: signedToken
            });

        } else
            res.json({
            success: false,
            message: "Could not authenticate user."
            });
        })(req, res, next); //When you use passport.authenticate() with a custom callback, 
        // Passport will not automatically call next() or respond to the client on its own. 
        // Instead, Passport will pass control to your callback function with the (errors, user) arguments. 
        // This is where you handle the results of the authentication attempt and that is why it has (req, res, next) after all
    },
    verifyJWT: (req, res, next) => {
        let token = req.headers.token;
        if (token) {
            jsonWebToken.verify(
                token,
                "secret_encoding_passphrase",
                (errors, payload) => {
                    if (payload) {
                        User.findById(payload.data).then(user => {
                            if (user) {
                                next();
                            } else {
                                res.status(httpStatus.StatusCodes.FORBIDDEN).json({
                                    error: true,
                                    message: "No user account found"
                                });
                            }
                        });
                    } else {
                        res.status(httpStatus.StatusCodes.UNAUTHORIZED).json({
                            error: true,
                            message: "Cannot verify API token"
                        });
                        next();
                    }
                }
            );
        } else {
            res.status(httpStatus.StatusCodes.UNAUTHORIZED).json({
                error: true,
                message: "Provide Token"
            });
        }
    }

};
