<template>
  <div />
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  data() {
    return {
      previousErrorMessage: '',
      previousErrorCode: '',
    }
  },
  computed: {
    ...mapState({
      error: (state) => state.error,
    }),
  },
  watch: {
    error: {
      immediate: true,
      deep: true,
      handler(newError) {
        if (newError) {
          // Handle different error object structures
          const errorMessage = newError.message || 'Unknown error'
          const errorCode = newError.errorCode || 'ERROR'

          if (
            (errorMessage !== this.previousErrorMessage ||
              errorCode !== this.previousErrorCode) &&
            (errorMessage || errorCode)
          ) {
            this.$toast.error(`${errorCode}: ${errorMessage}`)
            this.previousErrorMessage = errorMessage
            this.previousErrorCode = errorCode
            this.clearError()
          }
        }
      },
    },
  },
  methods: {
    ...mapMutations(['clearError']),
  },
}
</script>
