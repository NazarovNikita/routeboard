import { Layers } from "lucide-react";
import type { Route } from "../types";

interface SourceFilterProps {
	value: string;
	onChange: (value: string) => void;
	routes: Route[];
}

const sources = [
	{ value: "Ingress", label: "Ingress", color: "bg-accent" },
	{ value: "HTTPRoute", label: "HTTPRoute", color: "bg-info" },
] as const;

export function SourceFilter({ value, onChange, routes }: SourceFilterProps) {
	const counts = {
		Ingress: routes.filter((r) => r.source === "Ingress" && r.url).length,
		HTTPRoute: routes.filter((r) => r.source === "HTTPRoute" && r.url).length,
	};

	const hasAny = counts.Ingress + counts.HTTPRoute > 0;
	if (!hasAny) return null;

	return (
		<div className="flex items-center gap-1 bg-surface border border-line rounded-lg overflow-hidden">
			<button
				type="button"
				onClick={() => onChange("")}
				className={`p-2 transition-colors ${value === "" ? "bg-accent-soft text-accent" : "text-tx3 hover:text-tx2"}`}
				title="Ingress + HTTPRoute"
			>
				<Layers className="w-4 h-4" />
			</button>
			{sources.map((s) =>
				counts[s.value] > 0 ? (
					<button
						type="button"
						key={s.value}
						onClick={() => onChange(value === s.value ? "" : s.value)}
						className={`flex items-center gap-1.5 px-2 py-2 text-xs font-mono transition-colors ${
							value === s.value ? "bg-accent-soft text-accent" : "text-tx3 hover:text-tx2"
						}`}
						title={`Show ${s.label} only`}
					>
						<span className={`w-2 h-2 rounded-full ${s.color}`} />
						<span>{counts[s.value]}</span>
					</button>
				) : null,
			)}
		</div>
	);
}
