import { computed, toRef } from 'vue'

export function useDataTableConfig(type) {
    const typeRef = toRef(type)

    const headers = computed(() => [
        {
            title: 'Type',
            key: 'type',
            sortable: false,
            align: 'center'
        },
        {
            title: 'Name',
            key: 'name',
            sortable: true,
            value: item => item.header?.templateTitle ?? item.testTitle ?? item.email
        },
        {
            title: 'Owner',
            key: 'owner',
            sortable: false,
        },
        {
            title: 'Participants',
            key: 'participants',
            sortable: true,
            align: 'center',
            value: item => item.numberColaborators ?? 0
        }
    ])

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
