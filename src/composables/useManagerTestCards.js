/**
 * Specific composable for ManagerView cards
 * Handles the complex card logic specific to test management
 */

import { computed } from 'vue'
import { createCard, transformCardsForManager } from '@/utils/cardConfig'

export function useManagerTestCards(test, accessLevel) {
    const topCards = computed(() => {
        if (!test.value) return []

        const cards = [
            createCard('EDIT', {
                title: 'test',
                description: 'edit',
                path: `/edittest/${test.value.id}`,
            }),
            createCard('COOPERATORS', {
                title: 'cooperators',
                description: 'cooperators',
                cardStyle: 'background-image: radial-gradient(circle at top right, #eff31a, #eecf22); overflow: hidden',
                path: `/cooperators/${test.value.cooperators}`,
            }),
        ]

        return transformCardsForManager(cards)
    })

    const bottomCards = computed(() => {
        const tVal = test.value
        if (!tVal?.answersDocId) return []

        const cards = [
            createCard('REPORTS', {
                title: 'reports',
                description: 'reports',
                path: `/reportview/${tVal.answersDocId}`,
            }),
            createCard('ANSWERS', {
                title: 'answers',
                description: 'answers',
                path: `/answerview/${tVal.answersDocId}`,
            }),
        ]

        if (accessLevel.value === 0) {
            cards.push(createCard('FINAL_REPORT', {
                title: 'finalReport',
                description: 'finalReport',
                path: `/finalreportview/${tVal.id}`,
            }))
        }

        return transformCardsForManager(cards)
    })

    return {
        topCards,
        bottomCards
    }
}
