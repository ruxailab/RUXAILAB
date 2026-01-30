import { computed, toRef } from 'vue'

export function useDataTableConfig(type, t) {
  const typeRef = toRef(type)

  const headers = computed(() => {
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
        value: (item) =>
          item.header?.templateTitle ?? item.testTitle ?? item.email,
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
      },
    ]

    if (typeRef.value === 'sessions') {
      baseHeaders.push({
        title: t('common.table.evaluator'),
        key: 'evaluator',
        sortable: true,
      })
      baseHeaders.push({
        title: t('common.table.status'),
        key: 'status',
        sortable: true,
      })
      baseHeaders.push({
        title: t('common.table.sessionDate'),
        key: 'testDate',
        sortable: true,
      })
    }

    if (
      typeRef.value !== 'sessions' &&
      typeRef.value !== 'myTemplates' &&
      typeRef.value !== 'publicTemplates'
    ) {
      baseHeaders.push({
        title: t('common.table.participants'),
        key: 'participants',
        sortable: true,
        align: 'center',
        value: (item) => item.numberColaborators ?? 0,
      })
    }

    baseHeaders.push({
      title: t('common.table.created'),
      key: 'creationDate',
      sortable: true,
    })

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
  }
}
