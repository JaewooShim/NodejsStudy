const router = require("express").Router(),
    usersController = require("../controllers/usersController");
const { body } = require("express-validator");


router.get("/", usersController.index, usersController.indexView);
router.get("/new", usersController.new);
router.post("/create", [body('email').normalizeEmail({all_lowercase: true}).trim().isEmail().withMessage("Email is invalid"),

    body('zipCode').notEmpty().withMessage("Zip code cannot be empty").isInt().withMessage("Zip code must be a number").isLength({
        min: 5,
        max: 5
    }).withMessage("Zip code must be exactly 5 characters").custom((value, {req}) => value === req.body.zipCode).withMessage("Zip code must match"),

    body('password').notEmpty().withMessage("Password cannot be empty")], usersController.validate, usersController.create, usersController.redirectView);
router.get("/login", usersController.login);
router.post("/login", usersController.authenticate);
router.get("/apiToken", usersController.requestToken);
router.post("/apiToken", usersController.apiAuthenticate,usersController.redirectView);
router.get("/logout", usersController.logout, usersController.redirectView);

router.get("/:id/edit", usersController.edit);
router.put("/:id/update", usersController.update, usersController.redirectView);
router.get("/:id", usersController.show, usersController.showView);
router.delete("/:id/delete", usersController.delete, usersController.redirectView);

module.exports = router;