// src/composables/useItemFormatting.js
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatDateLong } from '@/utils/dateUtils'

export function useItemFormatting(type) {
    const { t } = useI18n()

    const getItemTitle = (item) => {
        return item.header?.templateTitle ?? item.testTitle ?? item.email ?? 'Untitled'
    }

    const getOwnerName = (item) => {
        if (type.value === 'myTests' || type.value === 'myTemplates') {
            return t('pages.listTests.me')
        }
        return (
            item.testAdmin?.email ??
            item.header?.templateAuthor?.userEmail ??
            item.testAuthorEmail ??
            'Unknown'
        )
    }

    const getOwnerImage = (item) => {
        return item.testAdmin?.imageUrl ||
            item.header?.templateAuthor?.imageUrl ||
            null
    }

    const getParticipantCount = (item) => {
        return item.numberColaborators ?? '-'
    }

    const formatItemDate = (item) => {
        return formatDateLong(item.createDate || item.updateDate, 'es')
    }

    return {
        getItemTitle,
        getOwnerName,
        getOwnerImage,
        getParticipantCount,
        formatItemDate
    }
}
