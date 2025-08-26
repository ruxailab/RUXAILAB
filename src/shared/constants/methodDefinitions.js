/**
 * Research Method Definitions
 * This file contains the complete configuration for each research method:
 * - Unique ID
 * - Descriptive name
 * - Material Design icon
 * - Specific color
 * - Description
 * - Category (test, inquiry, inspection, accessibility)
 * - Status (available, not available, coming soon, improving)
 */

export const METHOD_DEFINITIONS = {
    HEURISTICS: {
        id: 'HEURISTICS',
        name: 'Evaluación Heurística',
        nameEn: 'Heuristic Evaluation',
        icon: 'mdi-clipboard-check',
        color: '#2196F3', // Azul
        description: 'Evaluación de la interfaz basada en principios de usabilidad',
        category: 'inspection',
        status: 'available'
    },

    USER_MODERATED: {
        id: 'USER_MODERATED',
        name: 'Test Moderado',
        nameEn: 'Moderated Usability Test',
        icon: 'mdi-account-voice',
        color: '#4CAF50', // Verde
        description: 'Test de usabilidad con moderador en tiempo real',
        category: 'test',
        status: 'available'
    },

    USER_UNMODERATED: {
        id: 'USER_UNMODERATED',
        name: 'Test No Moderado',
        nameEn: 'Unmoderated Usability Test',
        icon: 'mdi-monitor-screenshot',
        color: '#FF9800', // Naranja
        description: 'Test de usabilidad automatizado sin moderador',
        category: 'test',
        status: 'available'
    },

    USER_GENERAL: {
        id: 'USER_GENERAL',
        name: 'Test de Usuario',
        nameEn: 'User Test',
        icon: 'mdi-account',
        color: '#9C27B0', // Púrpura
        description: 'Test general de usuario',
        category: 'test',
        status: 'available'
    },

    SURVEY: {
        id: 'SURVEY',
        name: 'Encuesta',
        nameEn: 'Survey',
        icon: 'mdi-clipboard-text',
        color: '#FF5722', // Rojo
        description: 'Recolección de datos mediante encuestas',
        category: 'inquiry',
        status: 'coming soon'
    },

    INTERVIEW: {
        id: 'INTERVIEW',
        name: 'Entrevista',
        nameEn: 'Interview',
        icon: 'mdi-microphone',
        color: '#E91E63', // Rosa
        description: 'Entrevistas cualitativas con usuarios',
        category: 'inquiry',
        status: 'coming soon'
    },

    CARD_SORTING: {
        id: 'CARD_SORTING',
        name: 'Card Sorting',
        nameEn: 'Card Sorting',
        icon: 'mdi-cards',
        color: '#3F51B5', // Índigo
        description: 'Organización de contenido mediante clasificación de tarjetas',
        category: 'inquiry',
        status: 'improving'
    },

    COGNITIVE_WALKTHROUGH: {
        id: 'COGNITIVE_WALKTHROUGH',
        name: 'Recorrido Cognitivo',
        nameEn: 'Cognitive Walkthrough',
        icon: 'mdi-brain',
        color: '#795548', // Marrón
        description: 'Evaluación paso a paso de tareas cognitivas',
        category: 'inspection',
        status: 'not available'
    },

    MANUAL: {
        id: 'MANUAL',
        name: 'Evaluación Manual',
        nameEn: 'Manual Evaluation',
        icon: 'mdi-hand-extended',
        color: '#607D8B', // Azul gris
        description: 'Evaluación manual de accesibilidad',
        category: 'accessibility',
        status: 'available'
    },

    AUTOMATIC: {
        id: 'AUTOMATIC',
        name: 'Evaluación Automática',
        nameEn: 'Automatic Evaluation',
        icon: 'mdi-robot',
        color: '#795548', // Marrón
        description: 'Evaluación automática de accesibilidad',
        category: 'accessibility',
        status: 'available'
    },

    WCAG_AUDIT: {
        id: 'WCAG_AUDIT',
        name: 'Auditoría WCAG',
        nameEn: 'WCAG Audit',
        icon: 'mdi-shield-check',
        color: '#009688', // Teal
        description: 'Auditoría completa de cumplimiento WCAG',
        category: 'accessibility',
        status: 'improving'
    },

    DEFAULT: {
        id: 'DEFAULT',
        name: 'Método Desconocido',
        nameEn: 'Unknown Method',
        icon: 'mdi-file-document',
        color: '#9E9E9E', // Gris
        description: 'Método no identificado',
        category: 'other',
        status: 'not available'
    }
}

// Definición de categorías
export const METHOD_CATEGORIES = {
    test: {
        id: 'test',
        name: 'Pruebas con Usuarios',
        nameEn: 'User Testing',
        description: 'Métodos que involucran directamente a usuarios reales',
        icon: 'mdi-account-group',
        color: '#4CAF50'
    },
    inquiry: {
        id: 'inquiry',
        name: 'Investigación',
        nameEn: 'User Research',
        description: 'Métodos de investigación y recolección de datos',
        icon: 'mdi-magnify',
        color: '#FF9800'
    },
    inspection: {
        id: 'inspection',
        name: 'Inspección',
        nameEn: 'Expert Inspection',
        description: 'Evaluaciones realizadas por expertos',
        icon: 'mdi-magnify-scan',
        color: '#2196F3'
    },
    accessibility: {
        id: 'accessibility',
        name: 'Accesibilidad',
        nameEn: 'Accessibility',
        description: 'Evaluaciones de accesibilidad web',
        icon: 'mdi-wheelchair-accessibility',
        color: '#009688'
    },
    other: {
        id: 'other',
        name: 'Otros',
        nameEn: 'Other',
        description: 'Otros métodos',
        icon: 'mdi-dots-horizontal',
        color: '#9E9E9E'
    }
}

// Definición de estados
export const METHOD_STATUSES = {
    available: {
        id: 'available',
        name: 'Disponible',
        nameEn: 'Available',
        description: 'Método completamente funcional',
        color: '#4CAF50',
        icon: 'mdi-check-circle'
    },
    'not available': {
        id: 'not available',
        name: 'No Disponible',
        nameEn: 'Not Available',
        description: 'Método no disponible actualmente',
        color: '#F44336',
        icon: 'mdi-close-circle'
    },
    'coming soon': {
        id: 'coming soon',
        name: 'Próximamente',
        nameEn: 'Coming Soon',
        description: 'Método en desarrollo',
        color: '#FF9800',
        icon: 'mdi-clock-outline'
    },
    improving: {
        id: 'improving',
        name: 'Mejorando',
        nameEn: 'Improving',
        description: 'Método en proceso de mejora',
        color: '#2196F3',
        icon: 'mdi-progress-wrench'
    }
}

// Mapeo para compatibilidad con el sistema actual
export const METHOD_MAPPING = {
    'HEURISTICS': 'HEURISTICS',
    'USER': 'USER_GENERAL',
    'MANUAL': 'MANUAL',
    'AUTOMATIC': 'AUTOMATIC'
}

// Mapeo de subtipos para tests de usuario
export const USER_SUBTYPE_MAPPING = {
    'UNMODERATED': 'USER_UNMODERATED',
    'MODERATED': 'USER_MODERATED'
}

/**
 * Obtiene la definición completa de un método
 * @param {string} testType - Tipo de test principal
 * @param {string} userTestType - Subtipo de test de usuario (opcional)
 * @returns {Object} Definición del método
 */
export const getMethodDefinition = (testType, userTestType = '') => {
    const type = testType?.toUpperCase() || ''
    const subtype = userTestType?.toUpperCase() || ''

    // Casos especiales para tests de usuario
    if (type === 'USER') {
        if (subtype.includes('UNMODERATED')) {
            return METHOD_DEFINITIONS.USER_UNMODERATED
        }
        if (subtype.includes('MODERATED')) {
            return METHOD_DEFINITIONS.USER_MODERATED
        }
        return METHOD_DEFINITIONS.USER_GENERAL
    }

    // Mapeo directo para otros tipos
    const mappedType = METHOD_MAPPING[type]
    return METHOD_DEFINITIONS[mappedType] || METHOD_DEFINITIONS.DEFAULT
}

/**
 * Obtiene el icono para un método específico
 * @param {Object} item - Item que contiene testType y userTestType
 * @returns {string} Nombre del icono MDI
 */
export const getMethodIcon = (item) => {
    const testType = item.testType ?? item.header?.templateType ?? ''
    const userTestType = item.userTestType ?? ''
    const definition = getMethodDefinition(testType, userTestType)
    return definition.icon
}

/**
 * Obtiene el color para un método específico
 * @param {Object} item - Item que contiene testType y userTestType
 * @returns {string} Color en formato hex
 */
export const getMethodColor = (item) => {
    const testType = item.testType ?? item.header?.templateType ?? ''
    const userTestType = item.userTestType ?? ''
    const definition = getMethodDefinition(testType, userTestType)
    return definition.color
}

/**
 * Obtiene el nombre para un método específico
 * @param {Object} item - Item que contiene testType y userTestType
 * @param {string} lang - Idioma ('es' o 'en')
 * @returns {string} Nombre del método
 */
export const getMethodName = (item, lang = 'es') => {
    const testType = item.testType ?? item.header?.templateType ?? ''
    const userTestType = item.userTestType ?? ''
    const definition = getMethodDefinition(testType, userTestType)
    return lang === 'en' ? definition.nameEn : definition.name
}

/**
 * Obtiene el estado de un método específico
 * @param {Object} item - Item que contiene testType y userTestType
 * @returns {Object} Definición del estado
 */
export const getMethodStatus = (item) => {
    const testType = item.testType ?? item.header?.templateType ?? ''
    const userTestType = item.userTestType ?? ''
    const definition = getMethodDefinition(testType, userTestType)
    return METHOD_STATUSES[definition.status]
}

/**
 * Obtiene la categoría de un método específico
 * @param {Object} item - Item que contiene testType y userTestType
 * @returns {Object} Definición de la categoría
 */
export const getMethodCategory = (item) => {
    const testType = item.testType ?? item.header?.templateType ?? ''
    const userTestType = item.userTestType ?? ''
    const definition = getMethodDefinition(testType, userTestType)
    return METHOD_CATEGORIES[definition.category]
}

/**
 * Obtiene todos los métodos agrupados por categoría
 * @returns {Object} Métodos agrupados por categoría
 */
export const getMethodsByCategory = () => {
    const categories = {}

    Object.values(METHOD_DEFINITIONS).forEach(method => {
        if (!categories[method.category]) {
            categories[method.category] = []
        }
        categories[method.category].push(method)
    })

    return categories
}

/**
 * Obtiene todos los métodos filtrados por estado
 * @param {string} status - Estado a filtrar ('available', 'not available', 'coming soon', 'improving')
 * @returns {Array} Array de métodos con el estado especificado
 */
export const getMethodsByStatus = (status) => {
    return Object.values(METHOD_DEFINITIONS).filter(method => method.status === status)
}

/**
 * Obtiene todos los métodos filtrados por categoría
 * @param {string} category - Categoría a filtrar ('test', 'inquiry', 'inspection', 'accessibility')
 * @returns {Array} Array de métodos de la categoría especificada
 */
export const getMethodsBySpecificCategory = (category) => {
    return Object.values(METHOD_DEFINITIONS).filter(method => method.category === category)
}

/**
 * Obtiene todas las opciones para selectores
 * @param {string} lang - Idioma ('es' o 'en')
 * @param {string} filterStatus - Filtrar por estado (opcional)
 * @param {string} filterCategory - Filtrar por categoría (opcional)
 * @returns {Array} Array de opciones {value, text, icon, color, status, category}
 */
export const getMethodOptions = (lang = 'es', filterStatus = null, filterCategory = null) => {
    let methods = Object.values(METHOD_DEFINITIONS).filter(method => method.id !== 'DEFAULT')

    if (filterStatus) {
        methods = methods.filter(method => method.status === filterStatus)
    }

    if (filterCategory) {
        methods = methods.filter(method => method.category === filterCategory)
    }

    return methods.map(method => ({
        value: method.id,
        text: lang === 'en' ? method.nameEn : method.name,
        icon: method.icon,
        color: method.color,
        status: method.status,
        category: method.category,
        statusInfo: METHOD_STATUSES[method.status],
        categoryInfo: METHOD_CATEGORIES[method.category]
    }))
}

/**
 * Obtiene todas las categorías disponibles
 * @param {string} lang - Idioma ('es' o 'en')
 * @returns {Array} Array de categorías
 */
export const getCategoryOptions = (lang = 'es') => {
    return Object.values(METHOD_CATEGORIES).map(category => ({
        value: category.id,
        text: lang === 'en' ? category.nameEn : category.name,
        description: category.description,
        icon: category.icon,
        color: category.color
    }))
}

/**
 * Obtiene todos los estados disponibles
 * @param {string} lang - Idioma ('es' o 'en')
 * @returns {Array} Array de estados
 */
export const getStatusOptions = (lang = 'es') => {
    return Object.values(METHOD_STATUSES).map(status => ({
        value: status.id,
        text: lang === 'en' ? status.nameEn : status.name,
        description: status.description,
        icon: status.icon,
        color: status.color
    }))
}
