import { type PointerEvent, useState } from "react";
import Tooltip from "./tooltip";
import Exercise1 from "./exercise1";
import type { Product } from "../../../shared/schemas";

export default function ProductList({ products }: { products: Product[] }) {
	const [tooltipDescription, setTooltipDescription] = useState<string>();
	const [pointerPosition, setPointerPosition] = useState({ x: 0, y: 0 });

	const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
		setPointerPosition({ x: event.clientX, y: event.clientY });
	};

    const handlePointerEnter = (description: string, event: PointerEvent<HTMLDivElement>) => {
		setTooltipDescription(description);
		setPointerPosition({ x: event.clientX, y: event.clientY });
	};

	const handlePointerLeave = () => {
		setTooltipDescription(undefined);
	};

	return (
		<div
			style={{
				display: "grid",
				width: "100%",
				gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
				userSelect: "none",
				WebkitTouchCallout: "none",
				WebkitUserSelect: "none",
			}}
			onPointerMove={handlePointerMove}
		>
			{products.map((product: Product) => (
				<Exercise1 key={product.id} product={product} onPointerEnter={(event) => handlePointerEnter(product.description, event)} onPointerLeave={handlePointerLeave} />
			))}

			{tooltipDescription && <Tooltip label={tooltipDescription} position={pointerPosition} />}
		</div>
	);
}
