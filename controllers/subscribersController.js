const Subscriber = require("../models/subscriber");
const getSubscriberParams = (body) => {
    return {
        name: body.name,
        email: body.email,
        zipCode: parseInt(body.zipCode)
    };
};

module.exports = {
    index: (req, res, next) => {
        Subscriber.find().then(subs => {
            res.locals.subscribers = subs;
            next();
        }).catch(error => {
            console.log(error.message);
            next(error);
        });
    },
    indexView: (req, res) => {
        res.render("subscribers/index");
    },
    new: (req, res) => {
        res.render("subscribers/new");
    },
    create: (req, res, next) => {
        let subscriberParams = getSubscriberParams(req.body);
        Subscriber.create(subscriberParams).then(sub => {
            res.locals.redirect = "/subscribers";
            res.locals.subscriber = sub;
            next();
        }).catch(error => {
            console.log(error.message);
            next(error);
        });
    },
    redirectView: (req, res, next) => {
        let redirectPath = res.locals.redirect;
        if (redirectPath) res.redirect(redirectPath);
        else next();
    },
    show: (req, res, next) => {
        var subscriberId = req.params.id;
        Subscriber.findById(subscriberId).then(sub => {
            res.locals.subscriber = sub;
            next();
        }).catch(error => {
            console.log(error.message);
            next(error);
        })
    },
    showView: (req, res) => {
        res.render("subscribers/show");
    },
    edit: (req, res, next) => {
        var subscriberId = req.params.id;
        Subscriber.findById(subscriberId).then(sub => {
            res.render("subscribers/edit", {
                subscriber: sub
            });
        }).catch(error => {
            console.log(error.message);
            next(error);
        });
    },
    update: (req, res, next) => {
        let subscriberId = req.params.id,
        susbscriberParams = getSubscriberParams(req.body);

        Subscriber.findByIdAndUpdate(subscriberId, {
            $set: susbscriberParams
        }).then(sub => {
            res.locals.redirect = `/subscribers/${subscriberId}`;
            res.locals.subscriber = sub;
            next();
        }).catch(error => {
            console.log(error.message);
            next(error);
        })
    },
    delete: (req, res, next) => {
        let subscriberId = req.params.id;
        Subscriber.findByIdAndDelete(subscriberId).then(() => {
            res.locals.redirect = "/subscribers";
            next();
        }).catch(error => {
            console.log(error.message);
            next(error);
        });
    }
};
