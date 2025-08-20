/**
 * Composable for managing cards in manager views
 * Provides common functionality for card-based layouts
 */

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { transformCardsForManager } from '@/utils/cardConfig'

export function useManagerCards() {
    const router = useRouter()
    const { mdAndUp } = useDisplay()
    const { t } = useI18n()

    const cards = ref([])

    // Common navigation function
    const go = (path) => {
        router.push(path).catch(() => { })
    }

    // Transform cards for CardsManager component
    const managerCards = computed(() => transformCardsForManager(cards.value))

    // Responsive grid configuration
    const getGridConfig = (cardCount = 3) => ({
        perRow: mdAndUp.value ? cardCount : 1
    })

    // Set cards data
    const setCards = (cardData) => {
        cards.value = cardData
    }

    // Add a single card
    const addCard = (cardData) => {
        cards.value.push(cardData)
    }

    // Clear all cards
    const clearCards = () => {
        cards.value = []
    }

    // Get responsive layout configuration
    const responsive = computed(() => ({
        mdAndUp: mdAndUp.value,
        gridSize: mdAndUp.value ? 3 : 1
    }))

    return {
        // State
        cards,
        managerCards,
        responsive,

        // Methods
        go,
        setCards,
        addCard,
        clearCards,
        getGridConfig,

        // Vue composables (re-exported for convenience)
        t,
        mdAndUp
    }
}
