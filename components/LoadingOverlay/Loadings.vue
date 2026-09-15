<template>
  <div class="hrms-loading-overlay" role="status" aria-live="polite" aria-label="Loading">
    <div class="hrms-loader">
      <div class="loader-spinner"></div>
      <div class="loader-text">Loading...</div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style scoped lang="scss">
.hrms-loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, .92);
  animation: loadingFade .15s ease-out;
}

.hrms-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loader-spinner {
  width: 42px;
  height: 42px;
  border: 4px solid #dbeafe;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin .75s linear infinite;
}

.loader-text {
  margin-top: 12px;
  color: #2563eb;
  font-size: .78rem;
  font-weight: 600;
  letter-spacing: .02em;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes loadingFade {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
