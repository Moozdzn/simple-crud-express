import type { Product } from "../../../shared/schemas";

type Props = React.DetailsHTMLAttributes<HTMLDivElement> & { product: Product };

export default function Exercise1({ product, ...props }: Props) {
	const { name } = product;

	return (
		<main
			{...props}
		>
			<p>{name}</p>
		</main>
	);
}