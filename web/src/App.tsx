import { useCallback, useEffect, useRef, useState } from "react";
import { CommandPalette } from "./components/CommandPalette";
import { EmptyState } from "./components/EmptyState";
import { Layout } from "./components/Layout";
import { RouteDetailPanel } from "./components/RouteDetailPanel";
import { RouteGrid } from "./components/RouteGrid";
import { SkeletonGrid } from "./components/Skeleton";
import { useFavorites } from "./hooks/useFavorites";
import { useKeyboardNav } from "./hooks/useKeyboardNav";
import { useRoutes } from "./hooks/useRoutes";
import { useTheme } from "./hooks/useTheme";

function App() {
	const {
		routes,
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
	} = useRoutes();

	const { favorites, toggle, isFavorite } = useFavorites();
	const { dark, toggle: toggleTheme } = useTheme();
	const [view, setView] = useState<"grid" | "list">("grid");
	const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
	const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
	const searchInputRef = useRef<HTMLInputElement>(null);

	const selectedRoute = selectedRouteId ? (allRoutes.find((r) => r.id === selectedRouteId) ?? null) : null;

	const handleSelectRoute = useCallback((id: string) => setSelectedRouteId(id), []);

	const { focusedRouteId } = useKeyboardNav({
		routes,
		disabled: !!selectedRoute || commandPaletteOpen,
		searchInputRef,
		onSelectRoute: handleSelectRoute,
		onToggleFavorite: toggle,
	});

	// Cmd+K / Ctrl+K to toggle command palette
	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setCommandPaletteOpen((open) => !open);
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, []);

	const hasRoutes = Object.keys(groupedRoutes).length > 0;
	const isSearching = search !== "" || selectedNamespaces.length > 0 || healthFilter !== "" || sourceFilter !== "";

	return (
		<>
			<Layout
				title={config.title}
				connected={connected}
				routeCount={routes.length}
				namespaces={config.namespaces}
				allRoutes={allRoutes}
				search={search}
				onSearchChange={setSearch}
				selectedNamespaces={selectedNamespaces}
				onNamespacesChange={setSelectedNamespaces}
				healthFilter={healthFilter}
				onHealthFilterChange={setHealthFilter}
				healthEnabled={config.healthEnabled}
				sourceFilter={sourceFilter}
				onSourceFilterChange={setSourceFilter}
				view={view}
				onViewChange={setView}
				dark={dark}
				onToggleTheme={toggleTheme}
				searchInputRef={searchInputRef}
				onOpenCommandPalette={() => setCommandPaletteOpen(true)}
			>
				{loading ? (
					<SkeletonGrid />
				) : hasRoutes ? (
					<RouteGrid
						groupedRoutes={groupedRoutes}
						view={view}
						allRoutes={allRoutes}
						isFavorite={isFavorite}
						onToggleFavorite={toggle}
						favorites={favorites}
						onSelectRoute={handleSelectRoute}
						focusedRouteId={focusedRouteId}
						healthEnabled={config.healthEnabled}
					/>
				) : (
					<EmptyState searching={isSearching} />
				)}
			</Layout>
			{selectedRoute && (
				<RouteDetailPanel
					route={selectedRoute}
					isFavorite={isFavorite(selectedRoute.id)}
					onToggleFavorite={toggle}
					onClose={() => setSelectedRouteId(null)}
				/>
			)}
			{commandPaletteOpen && (
				<CommandPalette
					routes={allRoutes}
					dark={dark}
					view={view}
					onSelectRoute={handleSelectRoute}
					onToggleTheme={toggleTheme}
					onChangeView={setView}
					onFilterNamespace={(ns) => setSelectedNamespaces(ns ? [ns] : [])}
					onFilterHealth={setHealthFilter}
					onClose={() => setCommandPaletteOpen(false)}
				/>
			)}
		</>
	);
}

export default App;
