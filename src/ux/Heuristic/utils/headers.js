const heuristicsStatisticsHeaders = [
    { text: 'HEURISTICS', align: 'start', sortable: false, value: 'name' },
    { text: 'Percentage of use', value: 'max', align: 'center', sortable: false },
    { text: 'Standard deviation', value: 'sd', align: 'center', sortable: false },
    { text: 'Average', value: 'average', align: 'center', sortable: false },
    { text: 'Max', value: 'max', align: 'center', sortable: false },
    { text: 'Min', value: 'min', align: 'center', sortable: false },
]

const weightsStatisticsHeader = [
    { title: 'HEURISTICS', align: 'start', sortable: false, value: 'name' },
    { title: 'Usability Score (%)', value: 'percentage', align: 'center', sortable: true },
    { title: 'Relative Weights', value: 'rw', align: 'center', sortable: true },
];

const heuristicsEvaluatorHeader = [
    { title: 'HEURISTICS', align: 'start', value: 'heuristic' },
];

export {
    heuristicsStatisticsHeaders,
    weightsStatisticsHeader,
    heuristicsEvaluatorHeader
}
