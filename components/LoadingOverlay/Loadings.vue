<template>
  <div class="hrms-loading-overlay" role="status" aria-live="polite" aria-label="Loading">
    <div class="hrms-loading-card">
      <div class="loading-logo-wrap">
        <div class="loading-orbit loading-orbit--one"></div>
        <div class="loading-orbit loading-orbit--two"></div>
        <div class="loading-logo">
          <img src="/city_logo.png" alt="HRMS" />
        </div>
      </div>
      <div class="loading-title">HRMS</div>
      <div class="loading-subtitle">Loading employee records</div>
      <div class="loading-progress"><span></span></div>
      <div class="loading-dots"><i></i><i></i><i></i></div>
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
  background: rgba(7, 25, 58, .58);
  backdrop-filter: blur(7px);
  -webkit-backdrop-filter: blur(7px);
  animation: loadingFade .2s ease-out;
}

.hrms-loading-card {
  width: min(330px, calc(100vw - 40px));
  padding: 34px 30px 28px;
  text-align: center;
  border: 1px solid rgba(255,255,255,.22);
  border-radius: 24px;
  background: linear-gradient(145deg, rgba(255,255,255,.98), rgba(239,246,255,.98));
  box-shadow: 0 24px 70px rgba(3, 25, 70, .30);
}

.loading-logo-wrap {
  position: relative;
  width: 92px;
  height: 92px;
  margin: 0 auto 18px;
}

.loading-logo {
  position: absolute;
  inset: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 8px 25px rgba(37,99,235,.18);
  z-index: 2;
  overflow: hidden;
}

.loading-logo img {
  width: 56px;
  height: 56px;
  object-fit: contain;
}

.loading-orbit {
  position: absolute;
  inset: 0;
  border: 3px solid transparent;
  border-radius: 50%;
  border-top-color: #2563eb;
  border-right-color: #60a5fa;
  animation: orbit 1.1s linear infinite;
}

.loading-orbit--two {
  inset: 5px;
  border-top-color: transparent;
  border-bottom-color: #1d4ed8;
  border-left-color: #93c5fd;
  animation-direction: reverse;
  animation-duration: 1.6s;
}

.loading-title {
  color: #123b78;
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: .08em;
}

.loading-subtitle {
  margin-top: 5px;
  color: #71809a;
  font-size: .78rem;
  font-weight: 600;
}

.loading-progress {
  width: 100%;
  height: 4px;
  margin: 20px 0 14px;
  overflow: hidden;
  border-radius: 99px;
  background: #dbeafe;
}

.loading-progress span {
  display: block;
  width: 40%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #1d4ed8, #60a5fa);
  animation: progress 1.2s ease-in-out infinite;
}

.loading-dots { display: flex; justify-content: center; gap: 5px; }
.loading-dots i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #2563eb;
  animation: dot 1s ease-in-out infinite;
}
.loading-dots i:nth-child(2) { animation-delay: .15s; }
.loading-dots i:nth-child(3) { animation-delay: .3s; }

@keyframes orbit { to { transform: rotate(360deg); } }
@keyframes progress { 0% { transform: translateX(-130%); } 100% { transform: translateX(330%); } }
@keyframes dot { 0%,100% { transform: translateY(0); opacity: .35; } 50% { transform: translateY(-4px); opacity: 1; } }
@keyframes loadingFade { from { opacity: 0; } to { opacity: 1; } }
</style>
