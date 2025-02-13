<template>
  <div />
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import 'vue-toastification/dist/index.css'

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
        if (
          newError &&
          (newError.message || newError.errorCode) &&
          (newError.message !== this.previousErrorMessage ||
            newError.errorCode !== this.previousErrorCode)
        ) {
          const toast = useToast()
          toast.error(`${newError.errorCode}: ${newError.message}`)

          this.previousErrorMessage = newError.message
          this.previousErrorCode = newError.errorCode
          this.clearError()
        }
      },
    },
  },
  methods: {
    ...mapMutations(['clearError']),
  },
}
</script>
