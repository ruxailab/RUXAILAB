import HeuristicAnalyticsView from './views/HeuristicAnalyticsView.vue';

const HeuristicRoutes = [
	{
		path: '/heuristic-analytics',
		name: 'HeuristicAnalytics',
		component: HeuristicAnalyticsView,
		meta: { authorize: [1] },
	},
	// Puedes agregar más rutas específicas aquí
];

export default HeuristicRoutes;
