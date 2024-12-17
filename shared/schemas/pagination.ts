import { z } from "zod";

export const PaginateSchema = z.object({
	page: z
		.string()
		.nullish()
		.transform((value) => (value ? +value : 1)),
	per_page: z
		.string()
		.nullish()
		.transform((value) => (value ? Math.min(Math.max(1, +value), 50) : 20)),
});

export type Paginate = z.infer<typeof PaginateSchema>;
