const Course = require("../models/course"),
  getCourseParams = body => {
    return {
      title: body.title,
      description: body.description,
      maxStudents: body.maxStudents,
      cost: body.cost
    };
};

const User = require("../models/user"); 
const httpStatus = require("http-status-codes");

module.exports = {
    index: (req, res, next) => {
        Course.find().then(courses => {
            res.locals.courses = courses;
            next();
        }).catch(error => {
            console.log(error.message);
            next(error);
        })
    },
    indexView: (req, res) => {
        res.render("courses/index");
    },
    new: (req, res) => {
        res.render("courses/new");
    },
    create: (req, res, next) => {
        let courseParams = getCourseParams(req.body);
        Course.create(courseParams).then(course => {
            res.locals.redirect = "/courses";
            res.locals.course = course;
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
        let courseId = req.params.id;
        Course.findById(courseId).then(course => {
            res.locals.course = course;
            next();
        }).catch(error => {
            console.log(error.message);
            next(error);
        }) ;
    },
    showView: (req, res) => {
        res.render("courses/show");
    },
    edit: (req, res, next) => {
        let courseId = req.params.id;
        Course.findById(courseId).then(course => {
            res.render("courses/edit", {
                course: course
            });
        }).catch(error => {
            console.log(error.message);
            next(error);
        })
    },
    update: (req, res, next) => {
        let courseId = req.params.id;
        let courseParmas = getCourseParams(req.body);

        Course.findByIdAndUpdate(courseId, {
            $set: courseParams
        }).then(course => {
            res.locals.redirect = `/courses/${courseId}`;
            res.locals.course = course;
            next();
        }).catch(error => {
            console.log(error.message);
            next(error);
        });
    },
    delete: (req, res, next) => {
        let courseId = req.params.id;
        Course.findByIdAndDelete(courseId).then(() => {
            res.locals.redirect = "/courses";
            next();
        }).catch(error => {
            console.log(error.message);
            next(error);
        })
    },
    respondJSON: (req, res) => {
        res.json({
            status: httpStatus.StatusCodes.OK,
            data: res.locals
        });
    },
    errorJSON: (error, req, res, next) => {
        let errorObject;

        if (error) {
            errorObject = {
                status: httpStatus.StatusCodes.INTERNAL_SERVER_ERROR,
                message: error.message
            };
        } else {
            errorObject = {
                status: httpStatus.StatusCodes.INTERNAL_SERVER_ERROR,
                message: "Unknow Error."
            };
        }
        res.json(errorObject);
    },
    join: (req, res, next) => {
        let courseId = req.params.id,
            currentUser = req.user;
            
        if (currentUser) {
            User.findByIdAndUpdate(currentUser, {
                $addToSet: {
                    courses: courseId
                }
            }).then(() => {
                res.locals.success = true;
                next();
            }).catch(error => {
                next(error);
            });
        } else {
            next(new Error("User must log in."));
        }
    },
    filterUserCourses: (req, res, next) => {
        let currentUser = res.locals.currentUser;
        if (currentUser) {
            let mappedCourses = res.locals.courses.map((course) => {
                let userJoined = currentUser.courses.some((userCourse) => {
                    return userCourse.equals(course._id);
                });
                return Object.assign(course.toObject(), {joined: userJoined});
            });
            res.locals.courses = mappedCourses;
            next();
        } else {
            next();
        }
    }
};
