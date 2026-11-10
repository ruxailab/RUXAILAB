<template>
  <div class="auth-wrapper">
    <slot name="prepend" />
    <div class="logo-side d-none d-md-flex align-center justify-center">
      <img
        src="/logo_full.svg"
        alt="RUXAILAB"
        class="logo-img"
        fetchpriority="high"
        loading="eager"
        decoding="async"
      />
    </div>

    <div class="form-side d-flex align-center justify-center">
      <slot name="form-prepend" />
      <div class="auth-box">
        <div v-if="showMobileLogo" class="d-md-none text-center mb-6">
          <img
            src="/logo_full.svg"
            alt="RUXAILAB"
            class="mobile-logo-img"
            loading="eager"
            decoding="async"
          />
        </div>
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  showMobileLogo: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>
.auth-wrapper {
  display: flex;
  flex-direction: row;
  min-height: 100vh;
  background-color: #ffffff;
  flex-wrap: wrap;
}

/* LEFT SIDE LOGO */
.logo-side {
  width: 50%;
  min-height: 100%;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-img {
  max-width: 600px;
  width: 100%;
}

.mobile-logo-img {
  max-width: 220px;
  width: 100%;
}

/* RIGHT SIDE FORM */
.form-side {
  width: 50%;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* BOX STYLING */
.auth-box {
  width: 100%;
  max-width: 450px;
  padding: 32px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
}

.auth-box :deep(.subtitle) {
  font-size: 0.95rem;
  color: #4b5563;
  margin-bottom: 1.5rem;
}

/* Improve form label and helper text contrast for accessibility */
.auth-box :deep(.v-label) {
  color: #374151;
  opacity: 1;
}

.auth-box :deep(.v-field--focused .v-label),
.auth-box :deep(.v-field--active .v-label) {
  color: rgb(var(--v-theme-primary));
  opacity: 1;
}

.auth-box :deep(.v-field__input::placeholder) {
  color: #6b7280;
  opacity: 1;
}

.auth-box :deep(.text-medium-emphasis) {
  color: #4b5563 !important;
  opacity: 1;
}

/* RESPONSIVE ADJUSTMENTS */
@media (max-width: 960px) {
  .logo-side {
    display: none;
  }

  .form-side {
    width: 100%;
    padding: 24px;
    align-items: center;
  }

  .auth-box {
    padding: 24px;
  }
}

@media (max-width: 600px) {
  .auth-box {
    padding: 16px;
    border-radius: 12px;
  }

  .auth-box :deep(.subtitle) {
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
}
</style>
