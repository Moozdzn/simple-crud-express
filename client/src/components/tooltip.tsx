type Props = {
    label: string;
    position: { x: number; y: number };
}

export default function Tooltip({ label, position }: Props) {
	return (
		<div
			style={{
				position: "fixed",
				top: position.y + 10,
				left: position.x + 10,
				backgroundColor: "white",
				padding: "10px",
				zIndex: 1,
				color: "black",
			}}
		>
			{label}
		</div>
	);
}