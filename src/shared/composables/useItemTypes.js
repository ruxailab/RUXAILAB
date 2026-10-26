import {
  getMethodDefinition,
  getMethodIcon,
  getMethodColor,
} from '@/shared/constants/methodDefinitions'

export function useItemTypes() {
  const getTypeIcon = (item) => {
    return getMethodIcon(item.study || item)
  }

  const getTestType = (item) => {
    const testType =
      item.study?.testType ?? item.testType ?? item.header?.templateType ?? ''
    const subType = item.study?.subType ?? item.subType ?? ''
    const definition = getMethodDefinition(testType, subType)
    return definition?.name ?? ''
  }

  // Get color from method definitions
  const getAvatarColor = (item) => {
    return getMethodColor(item.study || item)
  }

  return {
    getTypeIcon,
    getTestType,
    getAvatarColor,
  }
}
