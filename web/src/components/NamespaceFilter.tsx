import { Check, ChevronDown, Minus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface NamespaceFilterProps {
	namespaces: string[];
	selected: string[];
	onChange: (value: string[]) => void;
}

export function NamespaceFilter({ namespaces, selected, onChange }: NamespaceFilterProps) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const onDocClick = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("mousedown", onDocClick);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", onDocClick);
			document.removeEventListener("keydown", onKey);
		};
	}, [open]);

	if (namespaces.length === 0) return null;

	const allSelected = selected.length === 0;
	const allChecked = allSelected || (namespaces.length > 0 && namespaces.every((ns) => selected.includes(ns)));
	const summary = allSelected ? "All namespaces" : selected.length === 1 ? selected[0] : `${selected.length} namespaces`;

	const toggle = (ns: string) => {
		if (selected.includes(ns)) {
			onChange(selected.filter((n) => n !== ns));
		} else {
			onChange([...selected, ns]);
		}
	};

	return (
		<div ref={ref} className="relative">
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				aria-expanded={open}
				aria-haspopup="listbox"
				className="flex items-center justify-between gap-2 min-w-[180px] bg-surface border border-line rounded-lg text-sm text-tx1 py-2 px-3 outline-none transition-colors hover:border-line-hover focus:border-accent focus:ring-1 focus:ring-accent/20 cursor-pointer font-body"
			>
				<span className="truncate">{summary}</span>
				<ChevronDown className={`w-4 h-4 text-tx3 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
			</button>

			{open && (
				<div className="absolute right-0 mt-2 w-64 max-h-[60vh] overflow-auto bg-surface border border-line rounded-xl shadow-[var(--shadow-card-hover)] p-1.5 z-50">
					<button
						type="button"
						onClick={() => onChange([])}
						className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-tx1 font-medium hover:bg-elevated transition-colors"
					>
						<span
							className={`w-4 h-4 rounded-[5px] border flex items-center justify-center flex-shrink-0 ${
								allChecked ? "bg-accent border-accent text-deep" : "border-line text-accent"
							}`}
						>
							{allChecked ? <Check className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
						</span>
						All namespaces
					</button>
					<div className="h-px bg-line my-1" />
					{namespaces.map((ns) => {
						const checked = selected.includes(ns);
						return (
							<button
								key={ns}
								type="button"
								onClick={() => toggle(ns)}
								className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-tx2 hover:bg-elevated hover:text-tx1 transition-colors"
							>
								<span
									className={`w-4 h-4 rounded-[5px] border flex items-center justify-center flex-shrink-0 ${
										checked ? "bg-accent border-accent text-deep" : "border-line"
									}`}
								>
									{checked && <Check className="w-3 h-3" />}
								</span>
								<span className="truncate">{ns}</span>
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
