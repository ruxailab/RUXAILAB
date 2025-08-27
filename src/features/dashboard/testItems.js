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
