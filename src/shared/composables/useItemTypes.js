import {
    getMethodDefinition,
    getMethodIcon,
    getMethodColor,
    getMethodName
} from '@/shared/constants/methodDefinitions'

export function useItemTypes() {

    const getTypeIcon = (item) => {
        return getMethodIcon(item)
    }

    const getTestType = (item) => {
        const testType = item.testType ?? item.header?.templateType ?? ''
        const userTestType = item.userTestType ?? ''
        const definition = getMethodDefinition(testType, userTestType)
        return definition.name
    }

    // Get color from method definitions
    const getAvatarColor = (item) => {
        return getMethodColor(item)
    }

    return {
        getTypeIcon,
        getTestType,
        getAvatarColor
    }
}
