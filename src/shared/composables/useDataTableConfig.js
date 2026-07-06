import { computed, toRef, unref } from 'vue'
import { getSessionStatus } from '@/shared/utils/sessionsUtils'

const toSortableTimestamp = (value) => {
  if (!value) return 0
  if (typeof value?.toMillis === 'function') return value.toMillis()

  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

const getSessionItemValue = (item) =>
  [item.id, item.userDocId ?? item.email, item.email, item.testDate]
    .map((value) => encodeURIComponent(String(value ?? '')))
    .join(':')

const getSortableTitle = (item) =>
  item.header?.templateTitle ?? item.testTitle ?? item.title ?? item.email ?? ''

const getSortableOwner = (item, type) => {
  if (type === 'myTemplates') return ''
  if (type === 'publicTemplates') {
    return item.header?.templateAuthor?.userEmail ?? ''
  }

  return item.testAdmin?.email ?? item.testAuthorEmail ?? ''
}

const getSortableParticipantCount = (item) =>
  item.numberColaborators ?? item.cooperators?.length ?? 0

const getSortableCreationDate = (item, type) => {
  if (type === 'myTemplates' || type === 'publicTemplates') {
    return item.header?.creationDate ?? 0
  }

  return item.creationDate ?? item.updateDate ?? 0
}

export function useDataTableConfig(type, t, options = {}) {
  const typeRef = toRef(type)

  const itemValue = (item) =>
    typeRef.value === 'sessions' ? getSessionItemValue(item) : item.id

  const headers = computed(() => {
    const currentType = typeRef.value

    const baseHeaders = [
      {
        title: t('common.table.type'),
        key: 'type',
        sortable: false,
        align: 'center',
      },
      {
        title: t('common.table.name'),
        key: 'name',
        sortable: true,
        value: getSortableTitle,
      },
      {
        title: t('common.table.tags'),
        key: 'tags',
        align: 'start',
        sortable: false,
      },
      {
        title: t('common.table.owner'),
        key: 'owner',
        sortable: true,
        value: (item) => getSortableOwner(item, currentType),
      },
    ]

    if (currentType === 'sessions') {
      baseHeaders.push({
        title: t('common.table.evaluator'),
        key: 'evaluator',
        sortable: true,
        value: (item) => item.email ?? '',
      })
      baseHeaders.push({
        title: t('common.table.status'),
        key: 'status',
        sortable: true,
        value: (item) => getSessionStatus(item.testDate).status,
      })
      baseHeaders.push({
        title: t('common.table.sessionDate'),
        key: 'testDate',
        sortable: true,
        value: (item) => toSortableTimestamp(item.testDate),
      })
    }

    if (
      currentType !== 'sessions' &&
      currentType !== 'myTemplates' &&
      currentType !== 'publicTemplates'
    ) {
      baseHeaders.push({
        title: t('common.table.participants'),
        key: 'participants',
        sortable: true,
        align: 'center',
        value: getSortableParticipantCount,
      })
    }

    baseHeaders.push({
      title: t('common.table.created'),
      key: 'creationDate',
      sortable: true,
      value: (item) => getSortableCreationDate(item, currentType),
    })

    if (unref(options.showActions)) {
      baseHeaders.push({
        title: '',
        key: 'actions',
        sortable: false,
        align: 'end',
        width: 64,
      })
    }

    return baseHeaders
  })

  const getEmptyStateMessage = (t) => {
    const currentType = typeRef.value

    if (['myTests', 'publicTests', 'sharedWithMe'].includes(currentType)) {
      return t('pages.listTests.noTests')
    }

    if (['myTemplates', 'publicTemplates'].includes(currentType)) {
      return t('pages.listTests.noTemplates')
    }

    return t('pages.listTests.noSessions')
  }

  return {
    headers,
    getEmptyStateMessage,
    itemValue,
  }
}
