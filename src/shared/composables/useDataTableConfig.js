import { computed, toRef } from 'vue'

export function useDataTableConfig(type, t) {
    const typeRef = toRef(type)

    const headers = computed(() => [
        {
            title: t ? t('pages.studies.table.type') : 'Type',
            key: 'type',
            sortable: false,
            align: 'center'
        },
        {
            title: t ? t('pages.studies.table.name') : 'Name',
            key: 'name',
            sortable: true,
            value: item => item.header?.templateTitle ?? item.testTitle ?? item.email
        },
        {
            title: t ? t('pages.studies.table.tags') : 'Tags',
            key: 'tags',
            align: 'start',
            sortable: false,
        },
        {
            title: t ? t('pages.studies.table.owner') : 'Owner',
            key: 'owner',
            sortable: true,
        },
    ])

    if (typeRef.value === 'sessions') {
        headers.value.push({
            title: t ? t('pages.studies.table.evaluator') : 'Evaluator',
            key: 'evaluator',
            sortable: true,
        })
        headers.value.push({
            title: t ? t('pages.studies.table.status') : 'Status',
            key: 'status',
            sortable: true,
        })
        headers.value.push({
            title: t ? t('pages.studies.table.sessionDate') : 'Session Date',
            key: 'testDate',
            sortable: true,
        },)
    }

    if (typeRef.value !== 'sessions' && typeRef.value !== 'myTemplates' && typeRef.value !== 'publicTemplates') {
        headers.value.push({
            title: t ? t('pages.studies.table.participants') : 'Participants',
            key: 'participants',
            sortable: true,
            align: 'center',
            value: item => item.numberColaborators ?? 0
        })
    }

    headers.value.push(
        {
            title: t ? t('pages.studies.table.created') : 'Created',
            key: 'creationDate',
            sortable: true,
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
        getEmptyStateMessage
    }
}

