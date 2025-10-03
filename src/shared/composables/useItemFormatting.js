import { useI18n } from 'vue-i18n'
import { formatDateLong } from '@/shared/utils/dateUtils'

export function useItemFormatting(type) {
    const { t } = useI18n()

    const getItemTitle = (item) => {
        if (type.value === 'myTemplates' || type.value === 'publicTemplates') return item.header?.templateTitle
        return item.testTitle ?? item.email ?? 'Untitled'
    }

    const getOwnerName = (item) => {
        if (type.value === 'myTemplates') return t('pages.listTests.me')
        if (type.value === 'publicTemplates') return item.header?.templateAuthor?.userEmail || t('pages.listTests.unknown')
        return (
            item.testAdmin?.email ??
            item.testAuthorEmail ??
            t('pages.listTests.me')
        )
    }

    const getOwnerImage = (item) => {
        if (type.value === 'myTemplates' || type.value === 'publicTemplates') return item.header?.templateAuthor?.imageUrl || null
        return item.testAdmin?.imageUrl || null
    }

    const getParticipantCount = (item) => {
        return item.numberColaborators ?? item.cooperators?.length ?? 0
    }

    const formatItemDate = (item) => {
        if (type.value === 'myTemplates' || type.value === 'publicTemplates') return formatDateLong(item.header.creationDate, 'es')
        return formatDateLong(item.creationDate || item.updateDate, 'es')
    }

    return {
        getItemTitle,
        getOwnerName,
        getOwnerImage,
        getParticipantCount,
        formatItemDate
    }
}
