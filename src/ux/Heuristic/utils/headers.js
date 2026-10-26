const heuristicsStatisticsHeaders = [
  { title: 'HEURISTICS', align: 'start', sortable: false, value: 'name' },
  {
    title: 'Usability Percentage (%)',
    value: 'percentage',
    align: 'center',
    sortable: false,
  },
  {
    title: 'Standard deviation',
    value: 'sd',
    align: 'center',
    sortable: false,
  },
  {
    title: 'Average score',
    value: 'average',
    align: 'center',
    sortable: false,
  },
  {
    title: 'Maximum possible score',
    value: 'max',
    align: 'center',
    sortable: false,
  },
  {
    title: 'Minimum possible score',
    value: 'min',
    align: 'center',
    sortable: false,
  },
]

const weightsStatisticsHeader = [
  { title: 'HEURISTICS', align: 'start', sortable: false, value: 'name' },
  {
    title: 'Usability Percentage (%)',
    value: 'percentage',
    align: 'center',
    sortable: true,
  },
  { title: 'Relative Weights', value: 'rw', align: 'center', sortable: true },
]

const heuristicsEvaluatorHeader = [
  { title: 'HEURISTICS', align: 'start', value: 'heuristic' },
]

export {
  heuristicsStatisticsHeaders,
  weightsStatisticsHeader,
  heuristicsEvaluatorHeader,
}
