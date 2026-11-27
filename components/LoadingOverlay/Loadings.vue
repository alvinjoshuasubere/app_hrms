<!--
From Uiverse.io by abdulla_5145 - https://uiverse.io/abdulla_5145/pretty-squid-19
MIT License, Copyright (c) abdulla_5145 (Abdulla Khaleel)
-->
<template>
  <div class="hrms-loading-overlay" role="status" aria-live="polite" aria-label="Loading">
    <div class="hrms-cube-loader">
      <div class="hrms-cube-bounce" aria-hidden="true">
        <div class="hrms-cube">
          <div v-for="face in ['top','bottom','front','back','left','right']" :key="face" class="hrms-cube-face" :class="'hrms-cube-' + face"></div>
        </div>
      </div>
      <div class="hrms-cube-shadow" aria-hidden="true"></div>
      <div class="hrms-cube-bar" aria-hidden="true">
        <span v-for="n in 10" :key="n" :style="{ animationDelay: ((n - 1) * 0.25) + 's' }"></span>
      </div>
      <p class="hrms-cube-text">Loading...</p>
    </div>
  </div>
</template>
<script>
export default {};
</script>
<style scoped>
.hrms-loading-overlay {
  position: fixed; inset: 0; z-index: 99999;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0, 46, 44, 0.94);
  animation: hrmsCubeFade .15s ease-out;
}
.hrms-cube-loader { display:flex; flex-direction:column; align-items:center; gap:18px; font-family:"Courier New",monospace; }
.hrms-cube-bounce { width:80px; height:80px; animation:hrmsCubeBounce 1.2s ease-in-out infinite; }
.hrms-cube { position:relative; width:80px; height:80px; transform-style:preserve-3d; animation:hrmsCubeSpin 4s linear infinite; }
.hrms-cube-face { position:absolute; width:80px; height:80px; border:2px solid rgba(0,0,0,.35); box-sizing:border-box; }
.hrms-cube-top { transform:rotateX(90deg) translateZ(40px); background:repeating-conic-gradient(#5fb336 0 25%,#4a972a 0 50%) 0 0 / 20px 20px; }
.hrms-cube-bottom { transform:rotateX(-90deg) translateZ(40px); background:repeating-conic-gradient(#8b5a2b 0 25%,#774a21 0 50%) 0 0 / 20px 20px; }
.hrms-cube-front,.hrms-cube-back,.hrms-cube-left,.hrms-cube-right { background:linear-gradient(#5fb336 0 22%,transparent 22%),repeating-conic-gradient(#8b5a2b 0 25%,#774a21 0 50%) 0 0 / 20px 20px; }
.hrms-cube-front { transform:translateZ(40px); }
.hrms-cube-back { transform:rotateY(180deg) translateZ(40px); }
.hrms-cube-left { transform:rotateY(-90deg) translateZ(40px); }
.hrms-cube-right { transform:rotateY(90deg) translateZ(40px); }
.hrms-cube-shadow { width:70px; height:12px; margin-top:-6px; border-radius:50%; background:rgba(0,0,0,.5); filter:blur(4px); animation:hrmsCubeShadow 1.2s ease-in-out infinite; }
.hrms-cube-bar { display:flex; gap:3px; padding:4px; background:#1a1a1a; border:3px solid #555; box-shadow:inset 0 0 0 2px #000; }
.hrms-cube-bar span { width:16px; height:16px; background:#2f2f2f; animation:hrmsCubeFill 3s steps(1) infinite; }
.hrms-cube-text { margin:0; color:#fff; font-size:18px; letter-spacing:2px; text-shadow:2px 2px 0 #3f3f3f; }
@keyframes hrmsCubeSpin { from { transform:rotateX(-25deg) rotateY(0deg); } to { transform:rotateX(-25deg) rotateY(360deg); } }
@keyframes hrmsCubeBounce { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-25px); } }
@keyframes hrmsCubeShadow { 0%,100% { transform:scale(1); opacity:.5; } 50% { transform:scale(.7); opacity:.25; } }
@keyframes hrmsCubeFill { 0%,70% { background:#6fd23a; box-shadow:inset 3px 3px 0 #a8f070,inset -3px -3px 0 #3f8f1a; } 85%,100% { background:#2f2f2f; box-shadow:none; } }
@keyframes hrmsCubeFade { from { opacity:0; } to { opacity:1; } }
@media (prefers-reduced-motion: reduce) {
  .hrms-cube-bounce,.hrms-cube,.hrms-cube-shadow,.hrms-cube-bar span,.hrms-loading-overlay { animation:none; }
  .hrms-cube { transform:rotateX(-25deg) rotateY(35deg); }
  .hrms-cube-bar span { background:#6fd23a; }
}
</style>
