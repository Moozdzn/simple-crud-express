import express, { type Router } from "express";
import { PaginateSchema, type Product, ProductSchema, UpdateProductSchema } from '../../../../shared/schemas';
import { createProduct, deleteProduct, getProduct, getProducts, updateProduct } from "./productModel";
import auth from "../../middleware/auth";

declare global {
    namespace Express {
        interface Request {
            user?: { mail: string }
        }
    }
}

const ProductRouter: Router = express.Router();

/* A mock middleware to simulate user authentication on POST / PUT / DELETE */
ProductRouter.use(auth);

ProductRouter.get("/", async (req, res) => {

    const { success, data, error } = PaginateSchema.safeParse(req.query);

    if (!success) {
        res.status(400).json({ error }); 
        return
    }

    const { products, total } = await getProducts(data.page, data.per_page);

    res.status(200).json({
		products,
		meta: {
			total,
			current_page: data.page,
			per_page: data.per_page,
			next_page_link: (total - 1) / data.per_page > data.page ? `${req.headers.host}${req.baseUrl}?page=${data.page + 1}&per_page=${data.per_page}` : undefined,
			previous_page_link: data.page > 1 ? `${req.headers.host}${req.baseUrl}?page=${data.page - 1}&per_page=${data.per_page}` : undefined,
		},
	});
});

ProductRouter.post("/", async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: "Unauthorized" })
        return; 
    }

    const { success, data, error } = ProductSchema.safeParse(req.body);
	if (!success) {
        res.status(400).json({ error });
        return; 
	}

    const exists = await getProduct(data.id);
    if (exists) {
		res.status(409).json({ error: "Product already exists" });
        return; 
	}
	
	const insertId = await createProduct(req.user.mail, data);
	if (!insertId) {
        res.status(500).json({ error: "Failed to create product" });
        return; 
	}

    res.status(201).json({ id: insertId, message: "Product created successfully" });
});

ProductRouter.get("/:id", async (req, res) => {
    const { id } = req.params;
	const product = await getProduct(id);

	if (!product) {
        res.status(404).json({ error: "Product not found" });
        return 
	}
    res.status(200).json(product);
});

ProductRouter.delete("/:id", async (req, res) => {
	if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return
	}

	const { id } = req.params;
	const result = await deleteProduct(id);

	if (!result) {
        res.status(404).json({ error: "Product not found" });
        return
	}

    res.status(200).json({ message: "Product deleted" });
});

ProductRouter.put("/:id", async (req, res) => {
	if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return; 
	}

	const { id } = req.params;

	const productData: Partial<Product> = req.body;

	const { success, data, error } = UpdateProductSchema.safeParse(productData);
	if (!success) {
        res.status(400).json({ error: error.message });
        return; 
	}

	if (Object.keys(data).length === 0) {
        res.status(400).json({ error: "No data provided" });
        return; 
	}

	const updated = await updateProduct(req.user.mail, id, data);

	if (!updated) {
        res.status(404).json({ error: "Product not found" });
        return; 
	}

    res.status(200).json({ message: "Product updated" });
});

export default ProductRouter
