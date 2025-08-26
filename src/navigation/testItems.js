/**
 * Test Navigation Items
 * Items de navegación para tests específicos
 */

/**
 * Genera los items de navegación para un test específico basado en el nivel de acceso
 * @param {Object} test - Objeto del test
 * @param {number} accessLevel - Nivel de acceso del usuario (0: admin, 1: colaborador, 2: público)
 * @returns {Array} Array de items de navegación
 */
export const generateTestNavigationItems = (test, accessLevel) => {
    if (!test) return [];

    let items = [
        {
            title: 'Manager',
            icon: 'mdi-home',
            path: `/managerview/${test.id}`,
            id: 0,
        },
    ];

    if (accessLevel <= 2) {
        if (accessLevel === 0) {
            items.push(
                {
                    title: 'Test',
                    icon: 'mdi-file-document-edit',
                    path: `/edittest/${test.id}`,
                    id: 1,
                },
                {
                    title: 'Preview',
                    icon: 'mdi-file-eye',
                    path: `/testview/${test.id}`,
                    id: 2,
                },
            );
        } else if (accessLevel === 1) {
            items.push({
                title: 'Answer Test',
                icon: 'mdi-file-document',
                path: `/testview/${test.id}`,
                id: 1,
            });
        }
    }

    if (accessLevel === 0) {
        items.push(
            {
                title: 'Reports',
                icon: 'mdi-book-multiple',
                path: `/reportview/${test.id}`,
                id: 3,
            },
            {
                title: 'Answers',
                icon: 'mdi-order-bool-ascending-variant',
                path: `/answerview/${test.id}`,
                id: 4,
            },
            {
                title: 'Final Report',
                icon: 'mdi-file-document',
                path: `/finalreportview/${test.id}`,
                id: 5,
            },
            {
                title: 'Cooperators',
                icon: 'mdi-account-group',
                path: `/cooperators/${test.id}`,
                id: 6,
            },
        );
    } else if (accessLevel === 1) {
        items.push(
            {
                title: 'Reports',
                icon: 'mdi-book-multiple',
                path: `/reportview/${test.id}`,
                id: 2,
            },
            {
                title: 'Answers',
                icon: 'mdi-order-bool-ascending-variant',
                path: `/answerview/${test.id}`,
                id: 3,
            },
        );
    }

    if (test.template) {
        items.push({
            title: 'Template',
            icon: 'mdi-file-compare',
            path: `/templateview/${test.template.id}`,
            id: 7,
        });
    }

    return items;
};

/**
 * Calcula el nivel de acceso del usuario para un test específico
 * @param {Object} user - Objeto del usuario
 * @param {Object} test - Objeto del test
 * @returns {number} Nivel de acceso (0: admin, 1: colaborador, 2: público)
 */
export const calculateAccessLevel = (user, test) => {
    if (!user || !test) return 1;

    if (user.accessLevel === 0) return 0;

    const isTestOwner = test.testAdmin?.userDocId === user.id;
    if (isTestOwner) return 0;

    if (test.cooperators) {
        const coopsInfo = test.cooperators.find(
            (coops) => coops.userDocId === user.id,
        );
        if (coopsInfo) {
            return coopsInfo.accessLevel;
        }
    }

    if (test.isPublic) return 1;
    return 2;
};
