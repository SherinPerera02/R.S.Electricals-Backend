import express from "express";
import { getProduct } from "../controllers/productController.js";
import { saveProduct } from "../controllers/productController.js";
import { deleteProduct } from "../controllers/productController.js";
import { updateProduct } from "../controllers/productController.js";
import { getProductById } from "../controllers/productController.js";
import { searchProducts } from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.get("/", getProduct);
productRouter.post("/", saveProduct);
productRouter.delete("/:productId", deleteProduct);
productRouter.put("/:productId", updateProduct);
productRouter.get("/:productId", getProductById);
productRouter.get("/search/:query", searchProducts);

export default productRouter;
