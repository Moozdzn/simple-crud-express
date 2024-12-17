import { z } from "zod";

export const UpdateProductSchema = z.object({
	name: z.optional(z.string()),
	description: z.optional(z.string()),
	category: z.optional(z.string()),
});

export type UpdateProductType = z.infer<typeof UpdateProductSchema>;

export const ProductSchema = z.object({
	id: z.string().min(3, { message: "ID must be at least 3 characters long" }).max(55, { message: "ID must be at most 55 characters long" }).toLowerCase(),
	name: z.string().min(3, { message: "Name must be at least 3 characters long" }).max(55, { message: "Name must be at most 55 characters long" }),
	description: z.string().max(255, { message: "Description must be at most 255 characters long" }),
	category: z.string().max(100, { message: "Category must be at most 100 characters long" }),
});

export type Product = z.infer<typeof ProductSchema>;
