import {
  getMethodDefinition,
  getMethodIcon,
  getMethodColor,
} from '@/shared/constants/methodDefinitions'

export function useItemTypes() {
  const getTypeIcon = (item) => {
    return getMethodIcon(item)
  }

  const getTestType = (item) => {
    const testType = item.testType ?? item.header?.templateType ?? ''
    const subType = item.subType ?? ''
    const definition = getMethodDefinition(testType, subType)
    return definition?.name ?? ''
  }

  // Get color from method definitions
  const getAvatarColor = (item) => {
    return getMethodColor(item)
  }

  return {
    getTypeIcon,
    getTestType,
    getAvatarColor,
  }
}
