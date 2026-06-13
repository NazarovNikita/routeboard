import { useCallback, useEffect, useMemo, useState } from "react";
import type { Config, Route } from "../types";
import { useSSE } from "./useSSE";

export function useRoutes() {
	const [allRoutes, setAllRoutes] = useState<Route[]>([]);
	const [config, setConfig] = useState<Config>({
		title: "RouteBoard",
		namespaces: [],
		healthEnabled: false,
	});
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);
	const [healthFilter, setHealthFilter] = useState("");
	const [sourceFilter, setSourceFilter] = useState("");

	const fetchRoutes = useCallback(async () => {
		try {
			const res = await fetch("/api/routes");
			const data = await res.json();
			setAllRoutes(data || []);
		} catch (err) {
			console.error("Failed to fetch routes:", err);
		} finally {
			setLoading(false);
		}
	}, []);

	const fetchConfig = useCallback(async () => {
		try {
			const res = await fetch("/api/config");
			const data = await res.json();
			setConfig(data);
		} catch (err) {
			console.error("Failed to fetch config:", err);
		}
	}, []);

	useEffect(() => {
		fetchRoutes();
		fetchConfig();
	}, [fetchRoutes, fetchConfig]);

	const { connected } = useSSE("/api/events", () => {
		fetchRoutes();
		fetchConfig();
	});

	// Client-side filtering: search + namespace + health + hide no-URL routes
	const filteredRoutes = useMemo(() => {
		let routes = allRoutes.filter((r) => r.url);

		if (selectedNamespaces.length > 0) {
			routes = routes.filter((r) => selectedNamespaces.includes(r.namespace));
		}

		if (healthFilter) {
			routes = routes.filter((r) => r.health === healthFilter);
		}

		if (sourceFilter) {
			routes = routes.filter((r) => r.source === sourceFilter);
		}

		if (search) {
			const q = search.toLowerCase();
			routes = routes.filter(
				(r) =>
					r.title.toLowerCase().includes(q) ||
					r.url.toLowerCase().includes(q) ||
					r.description.toLowerCase().includes(q) ||
					r.name.toLowerCase().includes(q) ||
					r.namespace.toLowerCase().includes(q),
			);
		}

		return routes;
	}, [allRoutes, selectedNamespaces, healthFilter, sourceFilter, search]);

	const groupedRoutes = useMemo(() => {
		const groups: Record<string, Route[]> = {};
		for (const route of filteredRoutes) {
			const g = route.group || "default";
			if (!groups[g]) groups[g] = [];
			groups[g].push(route);
		}
		const sortedKeys = Object.keys(groups).sort();
		const result: Record<string, Route[]> = {};
		for (const key of sortedKeys) {
			result[key] = groups[key].sort((a, b) => {
				if (a.order !== b.order) return a.order - b.order;
				return a.title.localeCompare(b.title);
			});
		}
		return result;
	}, [filteredRoutes]);

	return {
		routes: filteredRoutes,
		allRoutes,
		groupedRoutes,
		config,
		loading,
		connected,
		search,
		setSearch,
		selectedNamespaces,
		setSelectedNamespaces,
		healthFilter,
		setHealthFilter,
		sourceFilter,
		setSourceFilter,
	};
}
