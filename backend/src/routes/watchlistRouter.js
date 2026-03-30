const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlist.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.get("/", authMiddleware, wishlistController.getWishlist);
router.post("/toggle", authMiddleware, wishlistController.updateWishlist);

module.exports = router;
