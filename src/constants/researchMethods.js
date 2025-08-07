/**
 * Research Methods Constants
 * Constantes para los métodos de investigación disponibles
 */

export const methodOptions = [
    { value: 'all', title: 'All Methods' },
    { value: 'User', title: 'Usability Test' },
    { value: 'HEURISTICS', title: 'Heuristic Evaluation' },
    { value: 'MANUAL', title: 'MANUAL' },
    { value: 'AUTOMATIC', title: 'AUTOMATIC' }
];

export const methodTypes = {
    ALL: 'all',
    USER: 'User',
    HEURISTICS: 'HEURISTICS',
    MANUAL: 'MANUAL',
    AUTOMATIC: 'AUTOMATIC'
};

export const getMethodTitle = (value) => {
    const method = methodOptions.find(option => option.value === value);
    return method ? method.title : value;
};
