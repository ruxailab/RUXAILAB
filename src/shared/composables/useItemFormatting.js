import { useI18n } from 'vue-i18n'
import { formatDateLong } from '@/shared/utils/dateUtils'
import { getMethodCategory, getMethodDefinition } from '../constants/methodDefinitions'

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
    const getTags = (item) => {
        const tags = []

        // method definition
        const definition = getMethodDefinition(item.testType, item.subType)
        if (definition) {
            tags.push({
                label: definition.nameEn,
                color: definition.color,
                icon: definition.icon,
            })
        }

        // method category (ex: Test / Inquiry / Inspection / Accessibility)
        const category = getMethodCategory(item)
        if (category) {
            tags.push({
                label: category.nameEn,
                color: category.color,
                icon: category.icon,
            })
        }

        // status
        if (item.status) {
            const status = item.status.charAt(0).toUpperCase() + item.status.slice(1)
            tags.push({
                label: status,
                color:
                    item.status === 'active'
                        ? 'green'
                        : item.status === 'draft'
                            ? 'orange'
                            : 'grey',
                icon:
                    item.status === 'active'
                        ? 'mdi-check-circle'
                        : item.status === 'draft'
                            ? 'mdi-pencil'
                            : 'mdi-clock-outline',
            })
        }

        // visibility
        if (item.isPublic !== undefined) {
            tags.push({
                label: item.isPublic ? 'Public' : 'Private',
                color: item.isPublic ? 'green' : 'grey',
                icon: item.isPublic ? 'mdi-earth' : 'mdi-lock',
            })
        }

        // if created from a template
        if (item.templateDoc) {
            tags.push({
                label: 'From Template',
                color: '#9C27B0',
                icon: 'mdi-file-document-edit',
            })
        }

        // has cooperators
        if (item.cooperators?.length > 0) {
            tags.push({
                label: 'With Collaborators',
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
        getTags
    }
}
