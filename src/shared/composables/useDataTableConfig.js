import { computed, toRef } from 'vue'
import { useI18n } from 'vue-i18n'

export function useDataTableConfig(type) {
    const typeRef = toRef(type)
    const { t } = useI18n()

    const headers = computed(() => {
        const baseHeaders = [
            {
                title: t('lists.type'),
                key: 'type',
                sortable: false,
                align: 'center'
            },
            {
                title: t('lists.name'),
                key: 'name',
                sortable: true,
                value: item => item.header?.templateTitle ?? item.testTitle ?? item.email
            },
            {
                title: t('lists.tags'),
                key: 'tags',
                align: 'start',
                sortable: false,
            },
            {
                title: t('lists.owner'),
                key: 'owner',
                sortable: true,
            },
        ]

        if (typeRef.value === 'sessions') {
            baseHeaders.push({
                title: t('lists.evaluator'),
                key: 'evaluator',
                sortable: true,
            })
            baseHeaders.push({
                title: t('lists.status'),
                key: 'status',
                sortable: true,
            })
            baseHeaders.push({
                title: t('lists.sessionDate'),
                key: 'testDate',
                sortable: true,
            })
        }

        if (typeRef.value !== 'sessions' && typeRef.value !== 'myTemplates' && typeRef.value !== 'publicTemplates') {
            baseHeaders.push({
                title: t('lists.participants'),
                key: 'participants',
                sortable: true,
                align: 'center',
                value: item => item.numberColaborators ?? 0
            })
        }

        baseHeaders.push({
            title: t('lists.created'),
            key: 'creationDate',
            sortable: true,
        })

        return baseHeaders
    })

    const getEmptyStateMessage = (t) => {
        const currentType = typeRef.value

        if (['myTests', 'publicTests', 'sharedWithMe'].includes(currentType)) {
            return t('lists.noStudiesFound')
        }

        if (['myTemplates', 'publicTemplates'].includes(currentType)) {
            return t('lists.noTemplatesFound')
        }

        return t('lists.noActiveSessions')
    }

    return {
        headers,
        getEmptyStateMessage
    }
}

