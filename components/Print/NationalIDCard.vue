<template>
  <div class="id-card-wrapper">
    <!-- Flip trigger -->
    <button type="button" class="flip-btn" @click="flipped = !flipped">
      <font-awesome-icon icon="rotate" />
      {{ flipped ? "View Front" : "View Back" }}
    </button>

    <div class="flip-stage" :class="{ 'is-flipped': flipped }">
      <div class="flip-inner">
        <!-- ═══════════════ FRONT OF THE ID CARD ═══════════════ -->
        <div class="koronadal-id-card card-face card-front" ref="idCardFront">
          <!-- Top Left Diagonal Geometrics -->
          <div class="geometric-shapes">
            <div class="triangle deep-magenta"></div>
            <div class="triangle dark-plum"></div>
            <div class="triangle light-pink"></div>
            <div class="triangle bright-pink"></div>
          </div>

          <!-- Right Side Tower Watermark Background -->
          <div class="tower-watermark">
            <img
              src="/tower_watermark.png"
              alt=""
              class="watermark-img"
              @error="handleLogoError"
            />
          </div>

          <!-- HEADER SECTION -->
          <div class="card-header">
            <div class="header-left">
              <img
                src="/city_logo.png"
                alt="City Seal"
                class="city-seal"
                @error="handleLogoError"
              />
            </div>
            <div class="header-center">
              <span class="gov-title">CITY GOVERNMENT OF KORONADAL</span>
              <span class="gov-subtitle">EMPLOYEE IDENTIFICATION CARD</span>
            </div>
          </div>

          <!-- MAIN BODY SECTION -->
          <div class="card-body">
            <!-- Left Column: Photo & Signature -->
            <div class="left-column">
              <div class="photo-frame">
                <img
                  v-if="photoSrc"
                  :src="photoSrc"
                  alt="Employee Photo"
                  class="photo-img"
                  @error="handlePhotoError"
                />
                <div v-else class="photo-placeholder">
                  <font-awesome-icon icon="user" />
                </div>
              </div>
              <div v-if="signatureSrc" class="employee-signature">
                <img
                  :src="signatureSrc"
                  alt="Signature"
                  class="signature-img"
                />
              </div>
            </div>

            <!-- Right Column: Details & Ribbon -->
            <div class="right-column">
              <!-- Name and Designation -->
              <div class="meta-section">
                <h3
                  class="employee-name"
                  :class="{
                    'employee-name-sm': displayName && displayName.length > 23,
                  }"
                >
                  {{ displayName }}
                </h3>
                <h4 class="employee-position">
                  {{ data.position_desc }}
                </h4>
              </div>

              <!-- Metadata Field List -->
              <div class="details-grid">
                <div class="detail-row">
                  <div class="icon-bullet">
                    <font-awesome-icon icon="id-card" />
                  </div>
                  <span class="field-label">EMPLOYEE ID</span>
                  <span class="field-colon">:</span>
                  <span class="field-value">{{ data.empid }}</span>
                </div>

                <div class="detail-row">
                  <div class="icon-bullet">
                    <font-awesome-icon icon="briefcase" />
                  </div>
                  <span class="field-label">DEPARTMENT</span>
                  <span class="field-colon">:</span>
                  <span class="field-value">{{ data.deptdesc }}</span>
                </div>

                <div class="detail-row">
                  <div class="icon-bullet">
                    <font-awesome-icon icon="calendar-check" />
                  </div>
                  <span class="field-label">BIRTHDATE</span>
                  <span class="field-colon">:</span>
                  <span class="field-value">{{
                    formatDate(data.birthdate || data.birthday)
                  }}</span>
                </div>

                <div class="detail-row detail-row-address">
                  <div class="icon-bullet">
                    <font-awesome-icon icon="location-dot" />
                  </div>
                  <span class="field-label">ADDRESS</span>
                  <span class="field-colon">:</span>
                  <span class="field-value highlight-dept">{{
                    formattedAddress || "N/A"
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- FOOTER BANNER SECTION -->
          <div class="card-footer">
            <span class="footer-role-badge">
              <font-awesome-icon icon="user-tie" class="mr-2" />{{
                roleBadgeText
              }}</span
            >
            <div class="footer-web">
              <font-awesome-icon icon="location-dot" class="globe-icon mr-2" />
              <span class="web-url"
                >Gensan Drive, Brgy. Zone III, City of Koronadal South Cotabato
              </span>
            </div>
          </div>
        </div>

        <!-- ═══════════════ BACK OF THE ID CARD ═══════════════ -->
        <div class="koronadal-id-card card-face card-back" ref="idCardBack">
          <!-- Mirrored geometric accent, top right this time -->
          <div class="geometric-shapes back-shapes">
            <div class="triangle deep-magenta"></div>
            <div class="triangle dark-plum"></div>
            <div class="triangle light-pink"></div>
            <div class="triangle bright-pink"></div>
          </div>

          <div class="back-body">
            <!-- Emergency Contact Block -->
            <div class="back-content-row">
              <div class="back-section">
                <div class="back-section-title">
                  <font-awesome-icon icon="phone-volume" />
                  <span>IN CASE OF EMERGENCY, PLEASE NOTIFY</span>
                </div>
                <div class="back-field-row">
                  <span class="back-field-label">NAME</span>
                  <span class="back-field-colon">:</span>
                  <span class="back-field-value">
                    {{
                      data.emergency_name
                        ? data.emergency_name.toUpperCase()
                        : "--"
                    }}
                  </span>
                </div>
                <div class="back-field-row">
                  <span class="back-field-label">RELATIONSHIP</span>
                  <span class="back-field-colon">:</span>
                  <span class="back-field-value">
                    {{
                      data.emergency_name
                        ? data.emergency_relation.toUpperCase()
                        : "--"
                    }}
                  </span>
                </div>
                <div class="back-field-row">
                  <span class="back-field-label">CONTACT NO.</span>
                  <span class="back-field-colon">:</span>
                  <span class="back-field-value">{{
                    data.emergency_contact || "--"
                  }}</span>
                </div>
              </div>

              <div class="qr-area">
                <div class="qr-placeholder" v-if="qrDataUrl">
                  <img :src="qrDataUrl" alt="QR Code" class="qr-img" />
                </div>
                <div class="qr-placeholder" v-else>
                  <font-awesome-icon icon="qrcode" class="qr-icon" />
                </div>
              </div>
            </div>

            <div class="back-signature-row">
              <div class="back-sig-block">
                <img
                  src="/Mayor.png"
                  alt="Mayor Signature"
                  class="back-signature-img"
                />
                <span class="back-sig-label">
                  <span class="back-sig-name"
                    >ERLINDA P. ARAQUIL, MDMG, DPA</span
                  >
                  <span class="back-sig-title">CITY MAYOR</span>
                </span>
              </div>
            </div>

            <div class="back-notice-block">
              <p class="back-notice-text">
                1. This is an official identification card and remains the
                property of the City Government of Koronadal.
              </p>
              <p class="back-notice-text">
                2. If found, please return to: City Human Resource Management
                Office
              </p>
              <p class="back-notice-text">
                3. Alteration or misuse of this ID card is prohibited.
              </p>
            </div>
          </div>

          <!-- FOOTER BANNER SECTION (matches front) -->
          <div class="card-footer">
            <img src="/Logo_Mayor.png" alt="" class="back-mayor-logo" />
            <span class="web-url footer-text-right">
              <font-awesome-icon icon="globe" class="globe-icon mr-2" />
              www.koronadal.gov.ph
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import QRCode from "qrcode";

export default {
  name: "KoronadalEmployeeID",
  props: {
    empid: { required: true },
  },
  data() {
    return {
      data: {},
      loading: false,
      flipped: false,
      qrDataUrl: "",
    };
  },
  computed: {
    photoSrc() {
      const p = this.data.photo_url || this.data.photo64 || this.data.photo;
      if (!p) return "";
      if (p.startsWith("data:image")) return p;
      return "data:image/png;base64," + p;
    },
    signatureSrc() {
      console.log(this.data);
      const s = this.data.imageSignature64;
      if (!s) return "";
      if (s.startsWith("data:image")) return s;
      return "data:image/png;base64," + s;
    },
    displayName() {
      const f = (
        this.data.first ||
        this.data.firstname ||
        this.data.first_name ||
        ""
      )
        .toString()
        .trim();
      const m = (
        this.data.middle ||
        this.data.middlename ||
        this.data.middle_name ||
        ""
      )
        .toString()
        .trim();
      const l = (
        this.data.last ||
        this.data.lastname ||
        this.data.last_name ||
        ""
      )
        .toString()
        .trim();

      if (!f && !l) {
        const full = (this.data.fullname || this.data.name || "")
          .toString()
          .trim();
        return full ? full.toUpperCase() : "JUAN MIGUEL D. SANTOS";
      }
      const mi = m ? m.charAt(0).toUpperCase() + "." : "";
      const parts = [];
      if (f) parts.push(f);
      if (mi) parts.push(mi);
      if (l) parts.push(l);
      return parts.join(" ").toUpperCase();
    },
    formattedAddress() {
      console.log(this.data);
      const parts = [];
      if (this.data.permanent_unitno)
        parts.push(`Unit ${this.data.permanent_unitno}`);
      if (this.data.permanent_blockno)
        parts.push(`Block ${this.data.permanent_blockno}`);
      if (this.data.permanent_lotno)
        parts.push(`Lot ${this.data.permanent_lotno}`);
      if (this.data.permanent_no) parts.push(`No. ${this.data.permanent_no}`);
      if (this.data.permanent_street) parts.push(this.data.permanent_street);
      if (this.data.permanent_brgy_name)
        parts.push(`Brgy. ${this.data.permanent_brgy_name}`);
      if (this.data.permanent_city_name) {
        const cityInfo = this.data.permanent_city_name;
        if (Array.isArray(cityInfo)) parts.push(...cityInfo);
        else parts.push(cityInfo);
      }
      if (this.data.permanent_province_name) {
        const provInfo = this.data.permanent_province_name;
        if (Array.isArray(provInfo)) parts.push(...provInfo);
        else parts.push(provInfo);
      }
      return parts.filter(Boolean).join(", ");
    },
    roleBadgeText() {
      const employmentStatus = (this.data.EmploymentStatus || "")
        .toString()
        .trim()
        .toUpperCase();
      return employmentStatus === "ELECTED" ? "CITY OFFICIAL" : "EMPLOYEE";
    },
  },
  async mounted() {
    await this.fetchEmployee();
    await this.generateQR();
  },
  watch: {
    async empid() {
      await this.fetchEmployee();
      await this.generateQR();
    },
  },
  methods: {
    async fetchEmployee() {
      if (!this.empid) return;
      this.loading = true;
      try {
        const res = await axios.get(
          `http://192.168.0.26:2000/api-hrms/employees/get-one`,
          { params: { empid: this.empid } }
        );
        this.data = (res.data && res.data[0]) || {};
      } catch (err) {
        console.error("Error fetching employee details:", err);
      } finally {
        this.loading = false;
      }
    },
    async generateQR() {
      const empId = this.data.empid || this.data.empno;
      if (!empId) return;
      const profileLink = `https://employee.koronadalcityonlineservices.com/${empId}`;
      try {
        const qrCanvas = await QRCode.toCanvas(profileLink, {
          width: 200,
          margin: 1,
          color: { dark: "#000000", light: "#ffffff" },
        });
        const cityLogo = new Image();
        cityLogo.crossOrigin = "anonymous";
        await new Promise((resolve, reject) => {
          cityLogo.onload = resolve;
          cityLogo.onerror = resolve;
          cityLogo.src = "/city_logo.png";
        });
        const canvas = document.createElement("canvas");
        const size = 200;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(qrCanvas, 0, 0, size, size);
        const logoSize = 48;
        const logoX = (size - logoSize) / 2;
        const logoY = (size - logoSize) / 2;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4);
        if (cityLogo.complete && cityLogo.naturalWidth > 0) {
          ctx.drawImage(cityLogo, logoX, logoY, logoSize, logoSize);
        }
        this.qrDataUrl = canvas.toDataURL("image/png");
      } catch (e) {
        console.error("QR generation failed:", e);
      }
    },
    formatDate(d) {
      if (!d) return "";
      return new Date(d)
        .toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "2-digit",
        })
        .toUpperCase();
    },
    handlePhotoError(e) {
      e.target.style.display = "none";
    },
    handleLogoError(e) {
      e.target.style.display = "none";
    },
    handleSignatureError(e) {
      e.target.style.display = "none";
    },
  },
};
</script>

<style scoped>
/* Container Layout setup */
.id-card-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

/* ═══════════════ FLIP CONTROL ═══════════════ */
.flip-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border: none;
  border-radius: 999px;
  background-color: #c4147a;
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.5px;
  cursor: pointer;
  box-shadow: 0 4px 10px -2px rgba(196, 20, 122, 0.5);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.flip-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px -2px rgba(196, 20, 122, 0.6);
}
.flip-btn:active {
  transform: translateY(0);
}

/* ═══════════════ FLIP STAGE (3D FLIP) ═══════════════ */
.flip-stage {
  width: min(100%, 850px);
  aspect-ratio: 85 / 53;
  perspective: 2000px;
}
.flip-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1);
  transform-style: preserve-3d;
}
.flip-stage.is-flipped .flip-inner {
  transform: rotateY(180deg);
}
.card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.card-back {
  transform: rotateY(180deg);
}

/*
   Standard compact ID card size (85mm x 53mm) while keeping the same visual design.
*/
.koronadal-id-card {
  width: 100%;
  height: 100%;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  font-family: Tahoma, "Segoe UI", sans-serif;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  user-select: none;
  isolation: isolate;
}

/* ═══════════════ GEOMETRIC ACCENTS (TOP LEFT) ═══════════════ */
.geometric-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 112px;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}
.triangle {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  border-style: solid;
}
.deep-magenta {
  border-width: 220px 92px 0 0;
  border-color: #c4147a transparent transparent transparent;
  z-index: 4;
}
.dark-plum {
  border-width: 160px 62px 0 0;
  border-color: #790b4a transparent transparent transparent;
  z-index: 5;
}
.light-pink {
  border-width: 270px 96px 0 0;
  border-color: #fbcfe8 transparent transparent transparent;
  z-index: 2;
}
.bright-pink {
  border-width: 270px 78px 0 0;
  border-color: #ec4899 transparent transparent transparent;
  z-index: 3;
}
/* Accent on the back face */
.back-shapes {
  left: auto;
  right: 0;
}

/* ═══════════════ WATERMARK CLOCK TOWER ═══════════════ */
.tower-watermark {
  position: absolute;
  right: 0;
  top: 70px;
  bottom: 70px;
  width: 132px;
  opacity: 0.05;
  z-index: 1;
  pointer-events: none;
}
.watermark-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: right bottom;
}

/* ═══════════════ HEADER STYLING (FRONT) ═══════════════ */
.card-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 24px 6px 24px;
  height: 76px;
  box-sizing: border-box;
}
.city-seal {
  width: 58px;
  height: 58px;
  object-fit: contain;
  margin-right: 10px;
  flex-shrink: 0;
}
.header-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  line-height: 1.05;
  flex: 1;
}
.gov-title {
  font-size: 15px;
  font-weight: 900;
  color: #c4147a;
  letter-spacing: 1.2px;
  text-align: center;
  text-transform: uppercase;
}
.gov-subtitle {
  font-size: 10px;
  font-weight: 800;
  color: #334155;
  letter-spacing: 1px;
  text-align: center;
  text-transform: uppercase;
  margin-top: 2px;
}

/* ═══════════════ MAIN CONTENT BODY (FRONT) ═══════════════ */
.card-body {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  padding: 6px 12px 4px 18px;
  margin-top: -20px;
  box-sizing: border-box;
}

/* Left Column Styling */
.left-column {
  width: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 10px;
  flex-shrink: 0;
}
.photo-frame {
  width: 140px;
  height: 140px;
  border: 3px solid #c4147a;
  border-radius: 14px;
  overflow: hidden;
  background: #f8fafc;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 90px;
  color: #cbd5e1;
}
.employee-ribbon {
  display: flex;
  align-items: center;
  background-color: #c4147a;
  border-radius: 14px 0 0 14px;
  padding: 4px 4px 4px 20px;
  white-space: nowrap;
}
.ribbon-icon {
  color: #ffffff;
  font-size: 12px;
  margin-right: 6px;
}
.ribbon-text {
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
}

.sig-ribbon-row {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  margin-top: auto;
}
.employee-signature {
  width: 100px;
  height: 32px;
  margin-top: 4px;
  text-align: center;
  padding-top: 4px;
  overflow: hidden;
}
.signature-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* Right Column Styling */
.right-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.meta-section {
  padding-bottom: 5px;
  margin-bottom: 8px;
  border-bottom: 1.5px solid #fbcfe8;
}
.employee-name {
  font-size: 22px;
  font-weight: 900;
  color: #c4147a;
  margin: 0;
  letter-spacing: 0.5px;
  line-height: 1.1;
  word-break: break-word;
  font-family: Tahoma, "Segoe UI", sans-serif;
}
.employee-name-sm {
  font-size: 16px;
}
.employee-position {
  font-size: 10.5px;
  font-weight: 800;
  color: #334155;
  margin: 3px 0 0 0;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  line-height: 1.2;
  overflow-wrap: anywhere;
  font-family: Tahoma, "Segoe UI", sans-serif;
}

/* Details Grid Setup */
.details-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: stretch;
}
.detail-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  text-align: left;
  font-size: 10.5px;
  font-weight: 800;
  line-height: 1.15;
  flex-wrap: nowrap;
  gap: 2px;
  font-family: Tahoma, "Segoe UI", sans-serif;
}
.detail-row-address {
  flex-wrap: wrap;
  align-items: baseline;
}
.icon-bullet {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #c4147a;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  margin-right: 6px;
  flex-shrink: 0;
  margin-top: 1px;
}
.field-label {
  width: 74px;
  color: #c4147a;
  letter-spacing: 0.3px;
  flex-shrink: 0;
  font-size: 9.5px;
  font-weight: 800;
  text-align: left;
  margin-right: 2px;
}
.field-colon {
  width: 8px;
  color: #334155;
  flex-shrink: 0;
}
.field-value {
  color: #1e293b;
  font-weight: 800;
  overflow-wrap: anywhere;
  word-break: break-word;
  flex: 1;
  min-width: 0;
  text-align: left;
  display: flex;
  align-items: center;
}

/* Verification Footer Elements within Right Column */
.validation-row {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-bottom: 3px;
  gap: 8px;
}
.signature-area {
  display: flex;
  flex-direction: column;
  width: 140px;
}
.sig-container {
  height: 30px;
  position: relative;
}
.signature-graphics {
  height: 100%;
  width: auto;
  position: absolute;
  bottom: -2px;
  left: 8px;
}
.sig-line {
  height: 2px;
  background-color: #c4147a;
  width: 100%;
}
.sig-name {
  font-size: 8px;
  font-weight: 800;
  color: #c4147a;
  text-align: center;
  margin-top: 2px;
  letter-spacing: 0.3px;
}
.sig-title {
  font-size: 7.5px;
  font-weight: 700;
  color: #475569;
  text-align: center;
}
.barcode-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}
.barcode-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.barcode-lines {
  font-family: "Arial", sans-serif;
  font-size: 20px;
  letter-spacing: -1.2px;
  color: #000000;
  line-height: 0.9;
  font-weight: 100;
  transform: scaleY(1.1);
}
.barcode-text {
  font-size: 8px;
  font-weight: 700;
  color: #000000;
  letter-spacing: 1px;
  margin-top: 2px;
}

/* ═══════════════ BACK OF CARD STYLING ═══════════════ */

.back-section {
  margin-bottom: 8px;
}
.back-seal {
  width: 34px;
  height: 34px;
  object-fit: contain;
}
.back-header-text {
  font-size: 13px;
  font-weight: 900;
  color: #c4147a;
  letter-spacing: 0.8px;
}

.back-body {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  gap: 8px;
  padding: 10px 28px 6px 28px;
  overflow: hidden;
}

.back-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 900;
  color: #ffffff;
  background-color: #c4147a;
  padding: 3px 10px;
  border-radius: 999px;
  width: fit-content;
  letter-spacing: 0.5px;
  margin-bottom: 5px;
}

.back-field-row {
  display: flex;
  align-items: baseline;
  font-size: 10.5px;
  font-weight: 700;
  margin-bottom: 3px;
}
.back-field-label {
  width: 96px;
  color: #c4147a;
  letter-spacing: 0.3px;
  flex-shrink: 0;
  text-align: left;
}
.back-field-colon {
  width: 12px;
  color: #334155;
  flex-shrink: 0;
}
.back-field-value {
  color: #1e293b;
  font-weight: 700;
  line-height: 1.3;
  text-align: left;
}

.terms-section {
  padding-top: 7px;
}
.terms-list {
  margin: 0;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.terms-list li {
  font-size: 9px;
  font-weight: 600;
  color: #475569;
  line-height: 1.3;
}

.back-content-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding-top: 8px;
  margin-bottom: 10px;
}
.finder-notice {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  flex: 1;
  min-width: 0;
}
.pin-icon {
  color: #c4147a;
  font-size: 12px;
  margin-top: 2px;
  flex-shrink: 0;
}
.finder-notice p {
  margin: 0;
  font-size: 9.5px;
  font-weight: 600;
  color: #334155;
  line-height: 1.35;
}
.qr-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
  margin-left: auto;
}
.qr-placeholder {
  width: 200px;
  height: 200px;
  border: 3px solid #c4147a;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  overflow: hidden;
}
.qr-icon {
  font-size: 30px;
  color: #c4147a;
}
.qr-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.qr-caption {
  font-size: 8px;
  font-weight: 800;
  color: #c4147a;
  letter-spacing: 0.5px;
}

.back-signature-row {
  margin-top: -70px;
  display: flex;
  justify-content: left;
  align-items: center;
}
.back-sig-block {
  width: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding-top: 4px;
}
.back-signature-img {
  position: relative;
  z-index: 1;
  width: 100px;
  max-height: 32px;
  object-fit: contain;
  object-position: center center;
  margin-bottom: -12px;
}
.back-sig-label {
  display: flex;
  flex-direction: column;
  align-items: center;

  font-weight: 900;
  color: #111827;
  letter-spacing: 0.4px;
  line-height: 1.05;
  margin-top: 0;
  position: relative;
  z-index: 2;
}
.back-sig-name {
  font-weight: 600;
  color: #111827;
  font-size: 12px;
  white-space: nowrap;
}
.back-sig-title {
  font-size: 8px;
  font-weight: 500;
  color: #c4147a;
  letter-spacing: 0.7px;
  text-transform: uppercase;
  margin-top: 1px;
}
.back-mayor-logo {
  height: 24px;
  width: auto;
  object-fit: contain;
}
.footer-left {
  display: flex;
  align-items: center;
  margin-right: auto;
}
.back-notice-block {
  padding: 6px 2px 0;
  border-top: 1px solid #fbcfe8;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.back-notice-text {
  margin: 0;
  font-size: 7.5px;
  line-height: 1.2;
  font-weight: 700;
  color: #334155;
}

/* ═══════════════ FOOTER STYLING (SHARED) ═══════════════ */
.card-footer {
  position: relative;
  z-index: 10;
  height: 24px;
  background-color: #c4147a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  box-sizing: border-box;
}
.footer-role-badge {
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.5px;
}
.footer-motto,
.footer-web {
  display: flex;
  align-items: center;
  color: #ffffff;
}
.heart-icon {
  font-size: 9px;
  margin-right: 5px;
}
.italic-tagline {
  font-size: 8.5px;
  font-weight: 600;
  font-style: italic;
  letter-spacing: 0.5px;
}
.globe-icon {
  font-size: 9px;
  margin-right: 5px;
}
.web-url {
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.footer-text-right {
  margin-left: auto;
  color: #ffffff;
  white-space: nowrap;
}

/* ── PRINT RULES FOR EXACT EXECUTION ── */
@media print {
  .flip-btn {
    display: none;
  }
  .flip-stage {
    perspective: none;
    width: 100%;
    aspect-ratio: auto;
  }
  .flip-inner {
    transform: none !important;
    display: block;
    position: static;
    height: auto;
  }
  .employee-signature {
    width: 100px;
    height: 32px;
  }
  .back-signature-img {
    width: 100px;
    max-height: 32px;
  }
  .card-face {
    position: relative;
    display: block;
    transform: none !important;
    backface-visibility: visible;
    height: auto;
    aspect-ratio: 85 / 53;
    margin-bottom: 12px;
  }
  .card-back {
    transform: none !important;
  }
  .id-card-wrapper {
    background: none;
    padding: 0;
    align-items: stretch;
  }
  .koronadal-id-card {
    box-shadow: none;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
