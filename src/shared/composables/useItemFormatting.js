import { useI18n } from 'vue-i18n'
import { formatDateLong } from '@/shared/utils/dateUtils'
import {
  getMethodCategory,
  getMethodDefinition,
} from '../constants/methodDefinitions'
import {
  getStatusColor,
  getStatusIcon,
  getStatusText,
} from '@/shared/utils/statusUtils'

export function useItemFormatting(type) {
  const { t, ...i18n } = useI18n()

  const getItemTitle = (item) => {
    if (type.value === 'myTemplates' || type.value === 'publicTemplates')
      return item.header?.templateTitle

    if (type.value === 'sessions') {
      return item.title || 'Session'
    }

    return item.testTitle ?? item.email ?? 'Untitled'
  }

  const getOwnerName = (item) => {
    if (type.value === 'myTemplates') return t('pages.listTests.me')
    if (type.value === 'publicTemplates')
      return (
        item.header?.templateAuthor?.userEmail || t('pages.listTests.unknown')
      )

    if (type.value === 'sessions') {
      return (
        item.study.testAdmin?.email ??
        item.study.testAuthorEmail ??
        t('pages.listTests.me')
      )
    }
    return (
      item.testAdmin?.email ?? item.testAuthorEmail ?? t('pages.listTests.me')
    )
  }

  const getOwnerImage = (item) => {
    if (type.value === 'myTemplates' || type.value === 'publicTemplates')
      return item.header?.templateAuthor?.imageUrl || null
    return item.testAdmin?.imageUrl || null
  }

  const getParticipantCount = (item) => {
    return item.numberColaborators ?? item.cooperators?.length ?? 0
  }

  const getStaffRoleLabel = (role) => {
    const roleLabels = {
      FACILITATOR: t('Sessions.staff.roles.facilitator'),
      OBSERVER: t('Sessions.staff.roles.observer'),
    }

    return roleLabels[role] || role
  }

  const formatItemDate = (item) => {
    const date =
      type.value == 'sessions'
        ? item.createdAt
        : type.value === 'myTemplates' || type.value === 'publicTemplates'
          ? item.header?.creationDate
          : item.creationDate || item.updateDate

    return formatDateLong(date, i18n.locale.value)
  }

  const getTags = (item) => {
    const tags = []
    const study = item.study || item

    // method definition
    const definition = getMethodDefinition(study.testType, study.subType)
    if (definition) {
      tags.push({
        label: t(`methods.definitions.${definition.id}`),
        color: definition.color,
        icon: definition.icon,
      })
    }

    // method category (ex: Test / Inquiry / Inspection / Accessibility)
    const category = getMethodCategory(study)
    if (category) {
      tags.push({
        label: t(`methods.categories.${category.id}`),
        color: category.color,
        icon: category.icon,
      })
    }

    // status
    if (study.status) {
      tags.push({
        label: getStatusText(study.status),
        color: getStatusColor(study.status),
        icon: getStatusIcon(study.status),
      })
    }

    // visibility
    if (study.isPublic !== undefined) {
      tags.push({
        label: study.isPublic ? t('tags.public') : t('tags.private'),
        color: study.isPublic ? 'green' : 'grey',
        icon: study.isPublic ? 'mdi-earth' : 'mdi-lock',
      })
    }

    // if created from a template
    if (study.templateDoc) {
      tags.push({
        label: t('tags.fromTemplate'),
        color: '#9C27B0',
        icon: 'mdi-file-document-edit',
      })
    }

    // has cooperators
    if (study.cooperators?.length > 0) {
      tags.push({
        label: t('tags.withCollaborators'),
        color: '#ff6161ff',
        icon: 'mdi-account-multiple',
      })
    }

    return tags
  }

  return {
    getItemTitle,
    getOwnerName,
    getOwnerImage,
    getParticipantCount,
    formatItemDate,
    getTags,
    getStaffRoleLabel,
  }
}
