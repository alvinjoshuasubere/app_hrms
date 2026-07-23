<template>
  <div>
    <Loading v-if="showLoading" />

    <div class="employee-page">
      <b-row>
        <b-col cols="12">
          <!-- <h6 class="ml-4" style="font-weight: bolder; font-family: font_B">
            <font-awesome-icon icon="users" class="editIcon mr-2" small />List
            of Employees
          </h6> -->

          <b-card class="main-employee-card border-0 shadow-sm">
            <!-- Modern Filter Section -->
            <div class="modern-filter-bar mb-4">
              <div class="search-section">
                <b-input-group class="modern-search-group">
                  <b-input-group-prepend is-text>
                    <font-awesome-icon
                      icon="magnifying-glass"
                      class="text-muted"
                    />
                  </b-input-group-prepend>
                  <b-form-input
                    v-model="searchText"
                    placeholder="Search name, ID, or position..."
                    class="border-left-0"
                  ></b-form-input>
                  <b-input-group-append v-if="searchText">
                    <b-button
                      variant="secondary"
                      class="text-muted"
                      @click="clearSearch"
                    >
                      <font-awesome-icon icon="circle-xmark" />
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </div>

              <div class="filter-controls">
                <div class="filter-group">
                  <b-form-select
                    v-model="selectedStatus"
                    :options="statusOptions"
                    @change="onStatusChange"
                    class="modern-select-sm"
                  ></b-form-select>
                </div>

                <div class="filter-group office-filter-group">
                  <div class="filter-row">
                    <b-dropdown
                      size="sm"
                      variant="outline-primary"
                      text="Select Office"
                      class="modern-dropdown office-dropdown"
                      ref="officeDropdown"
                    >
                      <b-dropdown-header>Department</b-dropdown-header>
                      <div class="dropdown-action-row">
                        <b-button
                          size="sm"
                          variant="link"
                          @click="selectAllDepartments"
                          >All</b-button
                        >
                        <b-button
                          size="sm"
                          variant="link"
                          @click="selectedDepartments = []"
                          >Clear</b-button
                        >
                      </div>
                      <b-dropdown-form class="dropdown-scroll-panel">
                        <b-form-checkbox
                          v-for="dept in sortedDepartments"
                          :key="dept.deptdesc"
                          v-model="selectedDepartments"
                          :value="dept.deptdesc"
                          @change="onDepartmentChange"
                        >
                          {{ dept.deptdesc }}
                        </b-form-checkbox>
                      </b-dropdown-form>
                      <b-dropdown-divider
                        v-if="selectedDepartments.length > 0"
                      ></b-dropdown-divider>
                      <b-dropdown-header v-if="selectedDepartments.length > 0"
                        >Division</b-dropdown-header
                      >
                      <b-dropdown-form
                        v-if="selectedDepartments.length > 0"
                        class="dropdown-scroll-panel"
                      >
                        <div class="dropdown-action-row">
                          <b-button
                            size="sm"
                            variant="link"
                            @click="selectAllDivisions"
                            >All</b-button
                          >
                          <b-button
                            size="sm"
                            variant="link"
                            @click="selectedDivisions = []"
                            >Clear</b-button
                          >
                        </div>
                        <b-form-checkbox
                          v-for="div in sortedDivisions"
                          :key="div.division_desc"
                          v-model="selectedDivisions"
                          :value="div.division_desc"
                          @change="onDivisionChange"
                        >
                          {{ div.division_desc }}
                        </b-form-checkbox>
                      </b-dropdown-form>
                    </b-dropdown>
                    <b-button
                      v-if="
                        selectedDepartments.length > 0 ||
                        selectedDivisions.length > 0
                      "
                      size="sm"
                      variant="outline-danger"
                      class="filter-clear-btn"
                      @click="clearOfficeFilter"
                      v-b-tooltip.hover
                      title="Clear Office filter"
                    >
                      <font-awesome-icon icon="xmark" />
                    </b-button>
                  </div>
                </div>

                <div class="filter-group">
                  <div class="filter-row">
                    <b-dropdown
                      size="sm"
                      variant="outline-primary"
                      text="Select Type"
                      class="modern-dropdown"
                      ref="typeDropdown"
                    >
                      <b-dropdown-form class="dropdown-scroll-panel">
                        <div class="dropdown-action-row">
                          <b-button
                            size="sm"
                            variant="link"
                            @click="selectAllTypes"
                            >All</b-button
                          >
                          <b-button
                            size="sm"
                            variant="link"
                            @click="selectedEmploymentStatuses = []"
                            >Clear</b-button
                          >
                        </div>
                        <b-form-checkbox
                          v-for="status in employmentStatusOptions"
                          :key="status"
                          v-model="selectedEmploymentStatuses"
                          :value="status"
                          @change="onEmploymentStatusChange"
                        >
                          {{ status }}
                        </b-form-checkbox>
                      </b-dropdown-form>
                    </b-dropdown>
                    <b-button
                      v-if="selectedEmploymentStatuses.length > 0"
                      size="sm"
                      variant="outline-danger"
                      class="filter-clear-btn"
                      @click="clearTypeFilter"
                      v-b-tooltip.hover
                      title="Clear Type filter"
                    >
                      <font-awesome-icon icon="xmark" />
                    </b-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Seamless Toolbar -->
            <div class="seamless-toolbar px-3 py-2 mb-3">
              <div class="toolbar-left">
                <!-- Selection Action Group -->
                <div class="action-group">
                  <div class="selection-status d-flex align-items-center">
                    <b-form-checkbox
                      :indeterminate="isPartiallyQRSelected"
                      :checked="isAllQRSelected"
                      @change="toggleQRSelectAll"
                      class="custom-check-success"
                    >
                      <span class="toolbar-label">Select Employees</span>
                    </b-form-checkbox>
                    <b-badge
                      pill
                      variant="light"
                      class="ml-2 px-2 text-success"
                    >
                      {{ selectedForQR.length }} Selected
                    </b-badge>
                    <b-button
                      v-if="selectedForQR.length > 0"
                      size="sm"
                      variant="outline-danger"
                      class="ml-1 filter-clear-btn"
                      @click="clearEmployeeSelection"
                      v-b-tooltip.hover
                      title="Clear selection"
                    >
                      <font-awesome-icon icon="xmark" />
                    </b-button>
                  </div>
                  <b-button
                    size="sm"
                    variant="success"
                    class="btn-elevated ml-3"
                    @click="openMultipleQRModal"
                    :disabled="selectedForQR.length === 0"
                  >
                    <font-awesome-icon icon="qrcode" class="mr-1" />
                    Generate QR
                  </b-button>
                  <b-button
                    size="sm"
                    variant="primary"
                    class="btn-elevated ml-2"
                    @click="confirmUpdateToSeparated"
                    :disabled="selectedForQR.length === 0"
                  >
                    <font-awesome-icon icon="user-check" class="mr-1" />
                    Update Status
                  </b-button>
                </div>
              </div>

              <div class="toolbar-right">
                <!-- <b-button
                  size="sm"
                  variant="primary"
                  class="btn-elevated mr-2"
                  @click="openAddModal"
                >
                  <font-awesome-icon icon="plus" class="mr-1" />
                  Add Employee
                </b-button> -->
                <b-button
                  size="sm"
                  variant="dark"
                  class="btn-circle shadow-sm"
                  @click="generatePDFReport"
                  v-b-tooltip.hover
                  title="Export PDF"
                >
                  <font-awesome-icon icon="file-pdf" />
                </b-button>
              </div>
            </div>

            <b-table
              head-variant="light"
              style="font-size: 12px"
              class="my-3"
              show-empty
              stacked="md"
              :current-page="currentPage"
              :per-page="perPage"
              :busy.sync="showLoading"
              :items="filteredEmployees"
              @row-clicked="viewEmployee"
              :fields="fields"
              :sticky-header="'400px'"
              empty-text="No employees found"
            >
              <template v-slot:cell(image)="row">
                <div class="employee-photo-cell">
                  <img
                    :src="
                      formatSignatureSrc(
                        row.item.photo64 || row.item.photo_url
                      ) || '/user.jpg'
                    "
                    :alt="row.item.fullname"
                    class="employee-thumbnail"
                  />
                </div>
              </template>
              <template v-slot:cell(division_desc)="row">
                <span>
                  {{
                    row.item.division_desc ||
                    row.item.divisiondesc ||
                    row.item.division ||
                    "—"
                  }}
                </span>
              </template>
              <template v-slot:cell(isseparated)="row">
                <div
                  :class="[
                    'status-circle mr-2',
                    !row.item.isseparated ? 'active' : 'separated',
                  ]"
                ></div>
                {{
                  row.item.isseparated
                    ? "Separated"
                    : row.item.issuspended
                    ? "Suspended"
                    : "Active"
                }}
              </template>
              <template v-slot:cell(actions)="row">
                <div class="action-btn-group">
                  <b-button
                    size="sm"
                    variant=""
                    class="tableButton"
                    @click="generateQRCode(row.item)"
                    v-b-tooltip.noninteractive.hover
                    title="Generate QR Code"
                  >
                    <font-awesome-icon icon="qrcode" />
                  </b-button>
                  <b-button
                    size="sm"
                    variant="primary"
                    class="tableButton"
                    @click="openNationalIDModal(row.item)"
                    v-b-tooltip.noninteractive.hover
                    title="Generate ID Card"
                  >
                    <font-awesome-icon icon="id-card" />
                  </b-button>
                  <b-button
                    size="sm"
                    variant="success"
                    class="tableButton"
                    @click="openSignatureModal(row.item)"
                    v-b-tooltip.noninteractive.hover
                    title="Upload Signature"
                  >
                    <font-awesome-icon icon="signature" />
                  </b-button>
                </div>
              </template>

              <!-- QR select column: individual checkbox -->
              <template v-slot:cell(qr_select)="row">
                <div
                  class="d-flex justify-content-center align-items-center h-100"
                >
                  <b-form-checkbox
                    :checked="isQRSelected(row.item)"
                    @change="toggleQRSelection(row.item)"
                    class="qr-select-checkbox"
                  />
                </div>
              </template>

              <!-- QR select column: header with select-all checkbox -->
              <template v-slot:head(qr_select)>
                <span style="font-size: 11px">QR</span>
              </template>
              <template v-slot:table-caption>
                <b-row align-h="end">
                  <b-col cols="6">{{ bottomLabel }}</b-col>
                  <b-col cols="6">
                    <b-pagination
                      v-model="currentPage"
                      :total-rows="filteredTotalRows"
                      :per-page="perPage"
                      pills
                      align="right"
                      size="sm"
                    ></b-pagination>
                  </b-col>
                </b-row>
              </template>
            </b-table>
          </b-card>
        </b-col>
      </b-row>
    </div>
    <b-modal
      header-class="hrmsColor"
      id="employee-id-modal"
      no-close-on-backdrop
      hide-header-close
      class="modal"
      centered
      body-class="p-0"
      size="lg"
    >
      <template #modal-title>
        <div class="modal-title-header">
          <div class="modal-title-icon">
            <font-awesome-icon icon="credit-card" />
          </div>
          <div class="modal-title-text">
            <span class="modal-title-main text-left">Generate Card</span>
            <span class="modal-title-desc">Create employee ID card</span>
          </div>
        </div>
      </template>

      <div class="id-card-wrapper" v-if="formDriver.fullname">
        <!-- ── Background template image ── -->
        <img src="/id_container.png" class="id-bg" alt="ID Template" />

        <!-- ── POSITION vertical text (right side) ── -->
        <div class="id-position-vertical">
          {{ formDriver.position_desc || "EMPLOYEE" }}
        </div>

        <!-- ── NICKNAME  ── -->
        <div class="id-nickname">
          "{{ formDriver.nickname || formDriver.fullname.split(" ")[0] }}"
        </div>

        <!-- ── FULLNAME  ── -->
        <div class="id-fullname">
          {{ formDriver.fullname }}
        </div>

        <!-- ── OFFICE / DEPARTMENT black bar (already in template image) ── -->
        <!-- We overlay text on top of the black bar -->
        <div class="id-office">
          {{ formDriver.deptdesc }}
        </div>

        <!-- ── QR Code ── -->
        <div class="id-qr">
          <img
            :src="
              oldIdQrDataUrl ||
              `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${formDriver.empno}&bgcolor=ffffff&color=000000`
            "
            alt="QR Code"
            class="id-qr-img"
          />
          <div class="id-cgk">{{ formDriver.empno }}</div>
        </div>

        <!-- ── Employee Photo (bottom-right, overlapping the divider) ── -->
        <div class="id-photo">
          <img
            v-if="formDriver.photo_url"
            :src="formDriver.photo_url"
            alt="Employee Photo"
            class="id-photo-img"
          />
          <div v-else class="id-photo-placeholder">
            <font-awesome-icon
              icon="user"
              style="font-size: 60px; color: #ccc"
            />
          </div>
        </div>
      </div>

      <template v-slot:modal-footer>
        <b-button
          size="sm"
          @click="downloadIDCard()"
          variant="primary"
          class="mr-2"
        >
          <font-awesome-icon icon="download" class="mr-1" /> Download ID
        </b-button>
        <b-button
          size="sm"
          @click="$bvModal.hide('employee-id-modal')"
          variant="outline-dark"
          class="mr-2"
        >
          Close
        </b-button>
      </template>
    </b-modal>

    <!-- National ID Card Modal -->
    <b-modal
      v-model="showNationalIDModal"
      id="national-id-modal"
      title="Employee ID"
      size="lg"
      centered
      header-class="hrmsColor"
      body-class="p-2"
      no-close-on-backdrop
    >
      <NationalIDCard
        v-if="nationalIDEmployee"
        :empid="nationalIDEmployee.empid || nationalIDEmployee.empno"
        ref="nationalIDCardRef"
      />
      <template #modal-footer>
        <b-button
          size="sm"
          variant="primary"
          @click="printNationalIDCard()"
          :disabled="isPrintingNationalID"
        >
          <font-awesome-icon
            icon="spinner"
            v-if="isPrintingNationalID"
            spin
            class="mr-1"
          />
          <font-awesome-icon icon="print" v-else class="mr-1" />
          {{ isPrintingNationalID ? "Printing..." : "Print Card" }}
        </b-button>
        <b-button size="sm" variant="success" @click="downloadNationalIDCard()">
          <font-awesome-icon icon="download" class="mr-1" /> Download ID
        </b-button>
        <b-button
          size="sm"
          variant="outline-dark"
          @click="showNationalIDModal = false"
        >
          Close
        </b-button>
      </template>
    </b-modal>

    <!-- Employee Details Modal -->
    <b-modal
      v-model="showEmployeeModal"
      modal-class="emp-staff-modal-root"
      header-class="emp-staff-modal-header"
      size="xl"
      dialog-class="emp-staff-modal-dialog"
      content-class="emp-staff-modal-content"
      hide-footer
      scrollable
      no-close-on-backdrop
      body-class="p-0"
    >
      <template #modal-title>
        <div class="emp-staff-modal-title">
          <font-awesome-icon icon="id-card" />
          <span>Staff detail</span>
        </div>
      </template>

      <div v-if="employeeDetails" class="emp-staff-modal text-left">
        <!-- Summary card (hrment-style) -->
        <div class="emp-staff-summary-card">
          <div class="emp-staff-summary-avatar-wrapper">
            <div class="emp-staff-summary-avatar">
              <img
                v-if="employeeDetails.photo64"
                :src="formatSignatureSrc(employeeDetails.photo64)"
              />
              <div v-else class="emp-staff-summary-initials">
                {{ getInitials(employeeDetails.fullname) }}
              </div>
            </div>
            <button
              type="button"
              class="emp-staff-avatar-upload-btn"
              @click="$refs.profileImageInput.click()"
              title="Upload profile picture"
            >
              <font-awesome-icon icon="camera" />
            </button>
            <input
              ref="profileImageInput"
              type="file"
              accept="image/*"
              class="d-none"
              @change="onProfileImageSelect"
            />
          </div>
          <div class="emp-staff-summary-main">
            <h1 class="emp-staff-summary-name">
              {{ employeeDetails.fullname }}
            </h1>
            <p class="emp-staff-summary-role">
              {{ employeeDetails.position_desc }} |
              {{ employeeDetails.deptdesc }}
            </p>
            <span
              class="emp-staff-summary-status"
              :class="
                !employeeDetails.isseparated ? 'is-active' : 'is-separated'
              "
            >
              {{ !employeeDetails.isseparated ? "Active" : "Separated" }}
            </span>
          </div>
          <div class="emp-staff-summary-meta">
            <div class="emp-staff-meta-grid">
              <div class="emp-staff-meta-block">
                <span class="emp-staff-meta-label">Employee ID</span>
                <span class="emp-staff-meta-value">{{
                  employeeDetails.empno
                }}</span>
              </div>
              <div class="emp-staff-meta-block">
                <span class="emp-staff-meta-label">Account</span>
                <span class="emp-staff-meta-value">{{
                  employeeDetails.email || "—"
                }}</span>
              </div>
              <div class="emp-staff-meta-block">
                <span class="emp-staff-meta-label">Phone number</span>
                <span class="emp-staff-meta-value">{{
                  employeeDetails.cellno || "—"
                }}</span>
              </div>
              <div class="emp-staff-meta-block">
                <span class="emp-staff-meta-label">Email</span>
                <span class="emp-staff-meta-value">{{
                  employeeDetails.email || "—"
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="profileImagePreviewUrl" class="profile-crop-section">
          <b-alert
            :show="profileImageAlert.dismissCountDown"
            dismissible
            :variant="profileImageAlert.variant"
            @dismissed="profileImageAlert.dismissCountDown = 0"
            class="mb-3"
          >
            <font-awesome-icon
              :icon="
                profileImageAlert.variant === 'success'
                  ? 'circle-check'
                  : 'circle-exclamation'
              "
              class="mr-2"
            />
            {{ profileImageAlert.message }}
          </b-alert>

          <label class="text-muted small mb-2 d-block">Preview:</label>
          <div class="profile-crop-preview">
            <img :src="profileImagePreviewUrl" alt="Profile preview" />
          </div>
          <div class="profile-crop-actions mt-3">
            <b-button
              size="sm"
              variant="primary"
              class="mr-2"
              :disabled="isUploadingProfileImage"
              @click="confirmProfileImageUpload"
            >
              <font-awesome-icon
                icon="spinner"
                v-if="isUploadingProfileImage"
                spin
                class="mr-1"
              />
              <font-awesome-icon icon="upload" v-else class="mr-1" />
              {{ isUploadingProfileImage ? "Uploading..." : "Upload" }}
            </b-button>
            <b-button
              size="sm"
              variant="outline-dark"
              @click="cancelProfileImageCrop"
            >
              Cancel
            </b-button>
          </div>
        </div>

        <nav class="emp-staff-tabs" aria-label="Profile sections">
          <button
            type="button"
            class="emp-staff-tab"
            :class="{ 'emp-staff-tab--active': employeeDetailTab === 0 }"
            @click="employeeDetailTab = 0"
          >
            Staff profile
          </button>
          <button
            type="button"
            class="emp-staff-tab"
            :class="{ 'emp-staff-tab--active': employeeDetailTab === 1 }"
            @click="employeeDetailTab = 1"
          >
            Work information
          </button>
          <button
            type="button"
            class="emp-staff-tab"
            :class="{ 'emp-staff-tab--active': employeeDetailTab === 2 }"
            @click="employeeDetailTab = 2"
          >
            Contact &amp; IDs
          </button>
        </nav>

        <div class="emp-staff-panel-wrap">
          <!-- Tab: Staff profile -->
          <div v-show="employeeDetailTab === 0" class="emp-staff-layout">
            <div class="emp-staff-col emp-staff-col--main">
              <div class="emp-staff-card">
                <div class="emp-staff-card-head">
                  <h3>Personal information</h3>
                </div>
                <div class="emp-staff-card-body">
                  <div class="emp-staff-kv-grid">
                    <div class="emp-staff-kv">
                      <span class="emp-staff-kv-label">Gender</span>
                      <span class="emp-staff-kv-value">{{
                        employeeDetails.genderdesc || "—"
                      }}</span>
                    </div>
                    <div class="emp-staff-kv">
                      <span class="emp-staff-kv-label">Date of birth</span>
                      <span class="emp-staff-kv-value">{{
                        formatDate(employeeDetails.birthdate) || "—"
                      }}</span>
                    </div>
                    <div class="emp-staff-kv">
                      <span class="emp-staff-kv-label">Birth place</span>
                      <span class="emp-staff-kv-value">{{
                        employeeDetails.birthplace || "—"
                      }}</span>
                    </div>
                    <div class="emp-staff-kv">
                      <span class="emp-staff-kv-label">Civil status</span>
                      <span class="emp-staff-kv-value">{{
                        employeeDetails.civilstatusdesc || "—"
                      }}</span>
                    </div>
                    <div class="emp-staff-kv">
                      <span class="emp-staff-kv-label">Citizenship</span>
                      <span class="emp-staff-kv-value">{{
                        employeeDetails.citizenshipdesc || "—"
                      }}</span>
                    </div>
                    <div class="emp-staff-kv">
                      <span class="emp-staff-kv-label">Age</span>
                      <span class="emp-staff-kv-value">{{
                        getAge(employeeDetails.birthdate)
                      }}</span>
                    </div>
                  </div>
                  <div class="emp-staff-kv-full">
                    <span class="emp-staff-kv-label">Permanent address</span>
                    <span class="emp-staff-kv-value">{{
                      formatCompleteAddress() || "—"
                    }}</span>
                  </div>
                  <div
                    v-if="employeeDetails.imageSignature64"
                    class="emp-staff-kv-full"
                  >
                    <span class="emp-staff-kv-label">Signature</span>
                    <div class="signature-detail-wrapper">
                      <b-button
                        size="sm"
                        variant="outline-primary"
                        @click="
                          openSignatureViewModal(
                            employeeDetails.imageSignature64
                          )
                        "
                      >
                        <font-awesome-icon icon="signature" class="mr-1" />
                        View Signature
                      </b-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="emp-staff-col emp-staff-col--side">
              <div class="emp-staff-card">
                <div class="emp-staff-card-head">
                  <h3>Employment</h3>
                </div>
                <div class="emp-staff-card-body emp-staff-card-body--stack">
                  <div class="emp-staff-kv">
                    <span class="emp-staff-kv-label">Date hired</span>
                    <span class="emp-staff-kv-value">{{
                      formatDate(employeeDetails.datehired) || "—"
                    }}</span>
                  </div>
                  <div class="emp-staff-kv">
                    <span class="emp-staff-kv-label">Years of service</span>
                    <span class="emp-staff-kv-value">{{
                      getYearsOfService(employeeDetails.datehired)
                    }}</span>
                  </div>
                  <div class="emp-staff-kv">
                    <span class="emp-staff-kv-label">Regularized</span>
                    <span class="emp-staff-kv-value">{{
                      formatDate(employeeDetails.regularized) || "—"
                    }}</span>
                  </div>
                  <div class="emp-staff-kv">
                    <span class="emp-staff-kv-label">Separated</span>
                    <span class="emp-staff-kv-value">{{
                      formatDate(employeeDetails.separated) || "—"
                    }}</span>
                  </div>
                </div>
              </div>
              <div class="emp-staff-card">
                <div class="emp-staff-card-head">
                  <h3>Organization</h3>
                </div>
                <div class="emp-staff-card-body emp-staff-card-body--stack">
                  <div class="emp-staff-kv">
                    <span class="emp-staff-kv-label">Department</span>
                    <span class="emp-staff-kv-value">{{
                      employeeDetails.deptdesc || "—"
                    }}</span>
                  </div>
                  <div class="emp-staff-kv">
                    <span class="emp-staff-kv-label">Position</span>
                    <span class="emp-staff-kv-value">{{
                      employeeDetails.position_desc || "—"
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab: Work information -->
          <div
            v-show="employeeDetailTab === 1"
            class="emp-staff-layout emp-staff-layout--stack"
          >
            <div class="emp-staff-card">
              <div class="emp-staff-card-head">
                <h3>Work information</h3>
              </div>
              <div class="emp-staff-card-body">
                <div class="emp-staff-kv-grid emp-staff-kv-grid--wide">
                  <div class="emp-staff-kv">
                    <span class="emp-staff-kv-label">Employee ID</span>
                    <span class="emp-staff-kv-value">{{
                      employeeDetails.empno
                    }}</span>
                  </div>
                  <div class="emp-staff-kv">
                    <span class="emp-staff-kv-label">Status</span>
                    <span
                      class="emp-staff-kv-value"
                      :class="
                        !employeeDetails.isseparated
                          ? 'emp-staff-text-success'
                          : 'emp-staff-text-danger'
                      "
                    >
                      {{
                        !employeeDetails.isseparated ? "Active" : "Separated"
                      }}
                    </span>
                  </div>
                  <div class="emp-staff-kv">
                    <span class="emp-staff-kv-label">Department</span>
                    <span class="emp-staff-kv-value">{{
                      employeeDetails.deptdesc || "—"
                    }}</span>
                  </div>
                  <div class="emp-staff-kv">
                    <span class="emp-staff-kv-label">Position</span>
                    <span class="emp-staff-kv-value">{{
                      employeeDetails.position_desc || "—"
                    }}</span>
                  </div>
                  <div class="emp-staff-kv">
                    <span class="emp-staff-kv-label">Date hired</span>
                    <span class="emp-staff-kv-value">{{
                      formatDate(employeeDetails.datehired) || "—"
                    }}</span>
                  </div>
                  <div class="emp-staff-kv">
                    <span class="emp-staff-kv-label">Regularized</span>
                    <span class="emp-staff-kv-value">{{
                      formatDate(employeeDetails.regularized) || "—"
                    }}</span>
                  </div>
                  <div class="emp-staff-kv">
                    <span class="emp-staff-kv-label">Separated date</span>
                    <span class="emp-staff-kv-value">{{
                      formatDate(employeeDetails.separated) || "—"
                    }}</span>
                  </div>
                  <div class="emp-staff-kv">
                    <span class="emp-staff-kv-label">Years of service</span>
                    <span class="emp-staff-kv-value">{{
                      getYearsOfService(employeeDetails.datehired)
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab: Contact & IDs -->
          <div
            v-show="employeeDetailTab === 2"
            class="emp-staff-layout emp-staff-layout--split"
          >
            <div class="emp-staff-card">
              <div class="emp-staff-card-head">
                <h3>Contact information</h3>
              </div>
              <div class="emp-staff-card-body emp-staff-card-body--stack">
                <div class="emp-staff-kv">
                  <span class="emp-staff-kv-label">Email</span>
                  <span class="emp-staff-kv-value">{{
                    employeeDetails.email || "—"
                  }}</span>
                </div>
                <div class="emp-staff-kv">
                  <span class="emp-staff-kv-label">Phone</span>
                  <span class="emp-staff-kv-value">{{
                    employeeDetails.cell_no || "—"
                  }}</span>
                </div>
                <div class="emp-staff-kv-full">
                  <span class="emp-staff-kv-label">Address</span>
                  <span class="emp-staff-kv-value">{{
                    formatCompleteAddress() || "—"
                  }}</span>
                </div>
              </div>
            </div>
            <div class="emp-staff-card">
              <div class="emp-staff-card-head">
                <h3>Government &amp; statutory IDs</h3>
              </div>
              <div class="emp-staff-card-body emp-staff-card-body--stack">
                <div class="emp-staff-kv">
                  <span class="emp-staff-kv-label">TIN</span>
                  <span class="emp-staff-kv-value">{{
                    employeeDetails.tin || "—"
                  }}</span>
                </div>
                <div class="emp-staff-kv">
                  <span class="emp-staff-kv-label">PhilHealth</span>
                  <span class="emp-staff-kv-value">{{
                    employeeDetails.philhealth_no || "—"
                  }}</span>
                </div>
                <div class="emp-staff-kv">
                  <span class="emp-staff-kv-label">SSS</span>
                  <span class="emp-staff-kv-value">{{
                    employeeDetails.sss_no || "—"
                  }}</span>
                </div>
                <div class="emp-staff-kv">
                  <span class="emp-staff-kv-label">GSIS</span>
                  <span class="emp-staff-kv-value">{{
                    employeeDetails.sss_gsis_no || "—"
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Footer ── -->
        <div class="emp-footer emp-footer--split">
          <b-button
            size="sm"
            variant="primary"
            @click="openStaffQuickEditModal"
          >
            <font-awesome-icon icon="pen-to-square" class="mr-1" />
            Edit
          </b-button>
          <b-button
            size="sm"
            variant="outline-secondary"
            @click="showEmployeeModal = false"
          >
            Close
          </b-button>
        </div>
      </div>
    </b-modal>

    <!-- Staff profile: quick edit (department, division, position, status) -->
    <b-modal
      id="employee-staff-quick-edit-modal"
      v-model="showStaffQuickEditModal"
      header-class="hrmsColor"
      modal-class="staff-quick-edit-modal"
      size="lg"
      centered
      scrollable
      body-class="p-0"
      @hidden="onQuickEditModalHidden"
    >
      <template #modal-title>
        <div class="modal-title-header">
          <div class="modal-title-icon">
            <font-awesome-icon icon="pen-to-square" />
          </div>
          <div class="modal-title-text">
            <span class="modal-title-main text-left">Edit Details</span>
            <span class="modal-title-desc"
              >Update assignment and emergency contact</span
            >
          </div>
        </div>
      </template>

      <div v-if="staffQuickEditForm" class="sqe-container">
        <b-form class="sqe-form" @submit.prevent="saveStaffQuickEdit">
          <!-- Work Assignment -->
          <div class="sqe-section">
            <div class="sqe-section-header">
              <div class="sqe-section-icon-wrap sqe-section-icon--blue">
                <font-awesome-icon icon="briefcase" />
              </div>
              <h5 class="sqe-section-title">Work Assignment</h5>
            </div>
            <div class="sqe-section-body">
              <div class="sqe-form-grid sqe-form-grid--2col sqe-text-left">
                <b-form-group label="Department" label-for="sqe-dept">
                  <v-select
                    id="sqe-dept"
                    v-model="staffQuickEditForm.deptdesc"
                    :options="staffDeptOptionsForVueSelect"
                    placeholder="Select department"
                    :clearable="true"
                    :searchable="true"
                    :append-to-body="true"
                    disabled
                    class="sqe-vselect"
                  />
                </b-form-group>
                <b-form-group label="Division" label-for="sqe-div">
                  <v-select
                    id="sqe-div"
                    v-model="staffQuickEditForm.divisiondesc"
                    :options="staffDivOptionsForVueSelect"
                    placeholder="Select division"
                    :clearable="true"
                    :searchable="true"
                    :append-to-body="true"
                    class="sqe-vselect"
                    disabled
                  />
                </b-form-group>
                <b-form-group label="Position" label-for="sqe-pos">
                  <b-form-input
                    id="sqe-pos"
                    v-model="staffQuickEditForm.position_desc"
                    placeholder="Job title / position"
                    disabled
                  />
                </b-form-group>
                <b-form-group label="Employment Status" label-for="sqe-empst">
                  <b-form-select
                    id="sqe-empst"
                    v-model="staffQuickEditForm.employmentStatus"
                    :options="staffEmploymentStatusSelectOptions"
                    disabled
                  />
                </b-form-group>
                <b-form-group label="Separation Status" label-for="sqe-sep">
                  <b-form-select
                    id="sqe-sep"
                    v-model="staffQuickEditForm.separation"
                    :options="staffSeparationSelectOptions"
                    disabled
                  />
                </b-form-group>
              </div>
            </div>
          </div>

          <!-- Emergency Contact -->
          <div class="sqe-section">
            <div class="sqe-section-header">
              <div class="sqe-section-icon-wrap sqe-section-icon--red">
                <font-awesome-icon icon="phone-volume" />
              </div>
              <h5 class="sqe-section-title">Emergency Contact</h5>
            </div>
            <div class="sqe-section-body">
              <div class="sqe-form-grid sqe-form-grid--3col sqe-text-left">
                <b-form-group label="Name" label-for="sqe-ename">
                  <b-form-input
                    id="sqe-ename"
                    v-model="staffQuickEditForm.emergency_name"
                    placeholder="Contact name"
                  />
                </b-form-group>
                <b-form-group label="Relation" label-for="sqe-erel">
                  <b-form-input
                    id="sqe-erel"
                    v-model="staffQuickEditForm.emergency_relation"
                    placeholder="Relationship"
                  />
                </b-form-group>
                <b-form-group label="Contact Number" label-for="sqe-econ">
                  <b-form-input
                    id="sqe-econ"
                    v-model="staffQuickEditForm.emergency_contact"
                    placeholder="Phone number"
                  />
                </b-form-group>
              </div>
            </div>
          </div>
        </b-form>
      </div>

      <template #modal-footer>
        <div class="staff-quick-edit-footer">
          <b-button
            size="sm"
            variant="outline-secondary"
            @click="showStaffQuickEditModal = false"
          >
            Cancel
          </b-button>
          <b-button
            size="sm"
            variant="primary"
            :disabled="!staffQuickEditForm"
            @click="saveStaffQuickEdit"
          >
            <font-awesome-icon icon="save" class="mr-1" />
            Save Changes
          </b-button>
        </div>
      </template>
    </b-modal>

    <!-- QR Code Modal -->
    <b-modal
      header-class="hrmsColor"
      id="qr-code-modal"
      no-close-on-backdrop
      hide-header-close
      class="modal"
      centered
      size="md"
    >
      <template #modal-title>
        <div class="modal-title-header">
          <div class="modal-title-icon">
            <font-awesome-icon icon="qrcode" />
          </div>
          <div class="modal-title-text">
            <span class="modal-title-main text-left">Employee QR Code</span>
            <span class="modal-title-desc"
              >Generate QR code for employee profile</span
            >
          </div>
        </div>
      </template>

      <div class="qr-code-container" v-if="qrCodeEmployee">
        <div class="qr-code-wrapper">
          <img
            :src="qrCodeDataUrl"
            alt="Employee QR Code"
            class="qr-code-image"
          />
        </div>
        <div class="qr-code-info">
          <h5>{{ qrCodeEmployee.fullname }}</h5>
          <div class="qr-code-link">
            <small class="text-muted">Profile Link:</small><br />
            <code>{{ employeeProfileLink }}</code>
          </div>
        </div>
      </div>

      <template v-slot:modal-footer>
        <b-button
          size="sm"
          @click="downloadQRCode()"
          variant="primary"
          class="mr-2"
        >
          <font-awesome-icon icon="download" class="mr-1" /> Download QR
        </b-button>
        <b-button
          size="sm"
          @click="$bvModal.hide('qr-code-modal')"
          variant="outline-dark"
          class="mr-2"
        >
          Close
        </b-button>
      </template>
    </b-modal>

    <!-- Employee Edit Modal -->
    <b-modal
      header-class="hrmsColor"
      id="employee-edit-modal"
      v-model="showEditModal"
      size="xl"
      no-close-on-backdrop
      hide-header-close
      scrollable
      centered
      body-class="p-0"
    >
      <template #modal-title>
        <div class="modal-title-header">
          <div class="modal-title-icon">
            <font-awesome-icon icon="pen-to-square" />
          </div>
          <div class="modal-title-text">
            <span class="modal-title-main text-left">Update Employee</span>
            <span class="modal-title-desc">Edit employee information</span>
          </div>
        </div>
      </template>

      <div class="modal-body-edit" v-if="editEmployeeData">
        <div class="edit-form-container">
          <!-- Personal Information -->
          <div class="form-section">
            <h5 class="section-title">Personal Information</h5>
            <div class="form-grid">
              <b-form-group label="First Name">
                <b-form-input v-model="editEmployeeData.firstName" />
              </b-form-group>
              <b-form-group label="Middle Name">
                <b-form-input v-model="editEmployeeData.middleName" />
              </b-form-group>
              <b-form-group label="Last Name">
                <b-form-input v-model="editEmployeeData.lastName" />
              </b-form-group>
              <b-form-group label="Nick Name">
                <b-form-input v-model="editEmployeeData.nickName" />
              </b-form-group>
              <b-form-group label="Birth Date">
                <b-form-input
                  type="date"
                  v-model="editEmployeeData.birthDate"
                />
              </b-form-group>
              <b-form-group label="Birth Place">
                <b-form-input v-model="editEmployeeData.birthPlace" />
              </b-form-group>
              <b-form-group label="Gender">
                <b-form-select
                  v-model="editEmployeeData.genderId"
                  :options="genderOptions"
                />
              </b-form-group>
              <b-form-group label="Civil Status">
                <b-form-select
                  v-model="editEmployeeData.civilStatusId"
                  :options="civilStatusOptions"
                />
              </b-form-group>
              <b-form-group label="Citizenship">
                <b-form-select
                  v-model="editEmployeeData.citizenId"
                  :options="citizenOptions"
                />
              </b-form-group>
              <b-form-group label="Religion">
                <b-form-select
                  v-model="editEmployeeData.religionId"
                  :options="religionOptions"
                />
              </b-form-group>
              <b-form-group label="Blood Type">
                <b-form-select
                  v-model="editEmployeeData.bloodId"
                  :options="bloodTypeOptions"
                />
              </b-form-group>
            </div>
          </div>

          <!-- Address Information -->
          <div class="form-section">
            <h5 class="section-title">Permanent Address</h5>
            <div class="form-grid">
              <b-form-group label="Unit No">
                <b-form-input v-model="editEmployeeData.permanentUnitNo" />
              </b-form-group>
              <b-form-group label="Lot No">
                <b-form-input v-model="editEmployeeData.permanentLotNo" />
              </b-form-group>
              <b-form-group label="Block No">
                <b-form-input v-model="editEmployeeData.permanentBlockNo" />
              </b-form-group>
              <b-form-group label="House No">
                <b-form-input v-model="editEmployeeData.permanentNo" />
              </b-form-group>
              <b-form-group label="Street">
                <b-form-input v-model="editEmployeeData.permanentSt" />
              </b-form-group>
              <b-form-group label="Barangay">
                <b-form-select
                  v-model="editEmployeeData.permanentBrgy"
                  :options="barangayOptions"
                />
              </b-form-group>
              <b-form-group label="City">
                <b-form-select
                  v-model="editEmployeeData.permanentCityId"
                  :options="cityOptions"
                />
              </b-form-group>
              <b-form-group label="Province">
                <b-form-select
                  v-model="editEmployeeData.permanentProvinceId"
                  :options="provinceOptions"
                />
              </b-form-group>
            </div>
          </div>

          <!-- Present Address -->
          <div class="form-section">
            <h5 class="section-title">Present Address</h5>
            <div class="form-grid">
              <b-form-group label="Unit No">
                <b-form-input v-model="editEmployeeData.presentUnitNo" />
              </b-form-group>
              <b-form-group label="Lot No">
                <b-form-input v-model="editEmployeeData.presentLotNo" />
              </b-form-group>
              <b-form-group label="Block No">
                <b-form-input v-model="editEmployeeData.presentBlockNo" />
              </b-form-group>
              <b-form-group label="House No">
                <b-form-input v-model="editEmployeeData.presentNo" />
              </b-form-group>
              <b-form-group label="Street">
                <b-form-input v-model="editEmployeeData.presentSt" />
              </b-form-group>
              <b-form-group label="Barangay">
                <b-form-select
                  v-model="editEmployeeData.presentBrgy"
                  :options="barangayOptions"
                />
              </b-form-group>
              <b-form-group label="City">
                <b-form-select
                  v-model="editEmployeeData.presentCityId"
                  :options="cityOptions"
                />
              </b-form-group>
              <b-form-group label="Province">
                <b-form-select
                  v-model="editEmployeeData.presentProvinceId"
                  :options="provinceOptions"
                />
              </b-form-group>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="form-section">
            <h5 class="section-title">Contact Information</h5>
            <div class="form-grid">
              <b-form-group label="Telephone">
                <b-form-input v-model="editEmployeeData.telNumber" />
              </b-form-group>
              <b-form-group label="Permanent Telephone">
                <b-form-input v-model="editEmployeeData.permanentTelNo" />
              </b-form-group>
              <b-form-group label="Cellphone">
                <b-form-input v-model="editEmployeeData.cellphoneNum" />
              </b-form-group>
              <b-form-group label="Email">
                <b-form-input type="email" v-model="editEmployeeData.email" />
              </b-form-group>
            </div>
          </div>

          <!-- Employment Information -->
          <div class="form-section">
            <h5 class="section-title">Employment Information</h5>
            <div class="form-grid">
              <b-form-group label="Date Hired">
                <b-form-input
                  type="date"
                  v-model="editEmployeeData.dateHired"
                />
              </b-form-group>
              <b-form-group label="Regularized">
                <b-form-input
                  type="date"
                  v-model="editEmployeeData.regularized"
                />
              </b-form-group>
              <b-form-group label="Separated Date">
                <b-form-input
                  type="date"
                  v-model="editEmployeeData.separatedDate"
                />
              </b-form-group>
              <b-form-group label="Suspended Date">
                <b-form-input
                  type="date"
                  v-model="editEmployeeData.suspendedDate"
                />
              </b-form-group>
              <b-form-group label="Reappointment Date">
                <b-form-input
                  type="date"
                  v-model="editEmployeeData.reappointmentDate"
                />
              </b-form-group>
              <b-form-group label="Last Promotion Date">
                <b-form-input
                  type="date"
                  v-model="editEmployeeData.lastPromotionDate"
                />
              </b-form-group>
              <b-form-group label="Transfer Date">
                <b-form-input
                  type="date"
                  v-model="editEmployeeData.transferDate"
                />
              </b-form-group>
              <b-form-group label="Weight">
                <b-form-input type="number" v-model="editEmployeeData.weight" />
              </b-form-group>
              <b-form-group label="Height">
                <b-form-input type="number" v-model="editEmployeeData.height" />
              </b-form-group>
              <b-form-group label="Is Separated">
                <b-form-select
                  v-model="editEmployeeData.IsSeparated"
                  :options="[
                    { value: 0, text: 'Active' },
                    { value: 1, text: 'Separated' },
                  ]"
                />
              </b-form-group>
              <b-form-group label="Remarks">
                <b-form-input v-model="editEmployeeData.remarks" />
              </b-form-group>
            </div>
          </div>

          <!-- Signature Upload -->
          <div class="form-section">
            <h5 class="section-title">Signature</h5>
            <div class="form-grid">
              <b-form-group label="Signature Image">
                <b-form-file
                  v-model="signatureFile"
                  accept="image/*"
                  @input="onSignatureSelect"
                  placeholder="Choose signature image..."
                  drop-placeholder="Drop image here..."
                />
              </b-form-group>
              <div
                v-if="editEmployeeData.imageSignature64"
                class="signature-preview-wrapper"
              >
                <img
                  :src="formatSignatureSrc(editEmployeeData.imageSignature64)"
                  class="signature-preview-img"
                  alt="Signature preview"
                  @error="editEmployeeData.imageSignature64 = null"
                />
                <b-button
                  size="sm"
                  variant="outline-danger"
                  class="mt-2"
                  @click="removeSignature"
                >
                  <font-awesome-icon icon="trash" class="mr-1" />Remove
                </b-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template v-slot:modal-footer>
        <b-button
          size="sm"
          @click="updateEmployee()"
          variant="primary"
          class="mr-2"
        >
          <font-awesome-icon icon="save" class="mr-1" /> Save Changes
        </b-button>
        <b-button
          size="sm"
          @click="closeEditModal()"
          variant="outline-dark"
          class="mr-2"
        >
          Cancel
        </b-button>
      </template>
    </b-modal>

    <!-- Batch Update Confirmation Modal -->
    <b-modal
      header-class="hrmsColor"
      v-model="showConfirmModal"
      size="md"
      centered
      no-close-on-backdrop
    >
      <template #modal-title>
        <div style="display: flex; align-items: center; gap: 10px">
          <font-awesome-icon
            icon="exclamation-triangle"
            style="font-size: 15px; color: #ffc107"
          />
          <span style="font-size: 14px; font-weight: 600"
            >Confirm Batch Update</span
          >
        </div>
      </template>

      <div class="confirm-modal-content">
        <div class="confirm-icon">
          <font-awesome-icon icon="users" />
        </div>

        <div class="confirm-message">
          <h5>Update Employee Status</h5>
          <p>
            Are you sure you want to set
            <strong>{{ selectedForQR.length }}</strong> employee(s) to
            <strong>Separated</strong> status?
          </p>

          <div class="employee-list" v-if="selectedForQR.length <= 5">
            <div
              class="employee-item"
              v-for="employee in selectedForQR.slice(0, 5)"
              :key="employee.empid"
            >
              <font-awesome-icon icon="user" class="item-icon" />
              <span>{{ employee.fullname }} ({{ employee.empno }})</span>
            </div>
          </div>

          <div class="warning-box">
            <font-awesome-icon
              icon="exclamation-triangle"
              class="warning-icon"
            />
            <span
              >This action will update the employment status and cannot be
              easily undone.</span
            >
          </div>
        </div>
      </div>

      <template v-slot:modal-footer>
        <b-button
          size="sm"
          variant="outline-secondary"
          @click="showConfirmModal = false"
        >
          Cancel
        </b-button>
        <b-button
          size="sm"
          variant="success"
          @click="updateAllToSeparated"
          :disabled="isUpdating"
        >
          <font-awesome-icon
            icon="spinner"
            v-if="isUpdating"
            spin
            class="mr-1"
          />
          <font-awesome-icon icon="check" v-else class="mr-1" />
          {{ isUpdating ? "Updating..." : "Yes" }}
        </b-button>
      </template>
    </b-modal>

    <!-- Multiple QR Codes Modal -->
    <b-modal
      header-class="hrmsColor"
      v-model="showMultipleQRModal"
      size="xl"
      no-close-on-backdrop
      scrollable
      centered
    >
      <template #modal-title>
        <div class="modal-title-header">
          <div class="modal-title-icon">
            <font-awesome-icon icon="qrcode" />
          </div>
          <div class="modal-title-text">
            <span class="modal-title-main text-left">Multiple QR Codes</span>
            <span class="modal-title-desc">
              {{ selectedForQR.length }} employee(s) selected
            </span>
          </div>
        </div>
      </template>

      <div v-if="isGeneratingMultiQR" class="text-center py-4">
        <b-spinner variant="primary" label="Loading"></b-spinner>
        <p class="mt-2 mb-0">Generating QR codes...</p>
      </div>
      <div v-else class="multi-qr-grid">
        <div
          v-for="emp in selectedForQR"
          :key="emp.empid"
          class="multi-qr-card"
        >
          <img
            :src="multiQRDataUrls[emp.empid]"
            :alt="emp.fullname"
            class="multi-qr-image"
          />
          <div class="multi-qr-name">{{ emp.fullname }}</div>
          <div class="multi-qr-empno text-muted">{{ emp.empno }}</div>
          <b-button
            size="sm"
            variant="outline-primary"
            class="mt-1"
            @click="downloadSingleQR(emp)"
          >
            <font-awesome-icon icon="download" class="mr-1" />
            Download
          </b-button>
        </div>
      </div>

      <template v-slot:modal-footer>
        <b-button
          size="sm"
          variant="primary"
          class="mr-2"
          @click="downloadAllQRCodes"
          :disabled="isDownloadingAll"
        >
          <font-awesome-icon
            icon="spinner"
            v-if="isDownloadingAll"
            spin
            class="mr-1"
          />
          <font-awesome-icon icon="file-zipper" v-else class="mr-1" />
          {{ isDownloadingAll ? "Generating ZIP..." : "Download All as ZIP" }}
        </b-button>
        <b-button
          size="sm"
          variant="outline-dark"
          @click="showMultipleQRModal = false"
        >
          Close
        </b-button>
      </template>
    </b-modal>

    <!-- Signature Upload Modal -->
    <b-modal
      header-class="hrmsColor"
      v-model="showSignatureModal"
      size="md"
      centered
      no-close-on-backdrop
      @hidden="resetSignatureModal"
    >
      <template #modal-title>
        <div class="modal-title-header">
          <div class="modal-title-icon">
            <font-awesome-icon icon="signature" />
          </div>
          <div class="modal-title-text">
            <span class="modal-title-main text-left">Upload Signature</span>
            <span class="modal-title-desc" v-if="signatureUploadTarget">
              {{ signatureUploadTarget.fullname }} ({{
                signatureUploadTarget.empno
              }})
            </span>
          </div>
        </div>
      </template>

      <div class="signature-modal-body">
        <b-alert
          :show="signatureAlert.dismissCountDown"
          dismissible
          :variant="signatureAlert.variant"
          @dismissed="signatureAlert.dismissCountDown = 0"
          class="mb-3"
        >
          <font-awesome-icon
            :icon="
              signatureAlert.variant === 'success'
                ? 'circle-check'
                : 'circle-exclamation'
            "
            class="mr-2"
          />
          {{ signatureAlert.message }}
        </b-alert>

        <!-- Draw / Upload toggle -->
        <div class="sig-mode-toggle">
          <button
            type="button"
            class="sig-mode-btn"
            :class="{ 'sig-mode-btn--active': signaturePadMode === 'draw' }"
            @click="switchSignatureMode('draw')"
          >
            <font-awesome-icon icon="pen" class="mr-1" />
            Draw
          </button>
          <button
            type="button"
            class="sig-mode-btn"
            :class="{ 'sig-mode-btn--active': signaturePadMode === 'upload' }"
            @click="switchSignatureMode('upload')"
          >
            <font-awesome-icon icon="upload" class="mr-1" />
            Upload
          </button>
        </div>

        <!-- Draw mode -->
        <div v-show="signaturePadMode === 'draw'" class="sig-draw-area">
          <div class="sig-canvas-wrapper">
            <canvas
              ref="signatureCanvas"
              class="sig-canvas"
              width="460"
              height="180"
              @mousedown="startDrawing"
              @mousemove="draw"
              @mouseup="stopDrawing"
              @mouseleave="stopDrawing"
              @touchstart.prevent="startDrawingTouch"
              @touchmove.prevent="drawTouch"
              @touchend="stopDrawing"
            />
          </div>
          <div class="sig-draw-actions">
            <b-button
              size="sm"
              variant="outline-danger"
              @click="clearSignaturePad"
            >
              <font-awesome-icon icon="eraser" class="mr-1" />
              Clear
            </b-button>
            <small class="text-muted">Sign inside the box above</small>
          </div>
        </div>

        <!-- Upload mode -->
        <div v-show="signaturePadMode === 'upload'" class="sig-upload-area">
          <b-form-group>
            <b-form-file
              v-model="signatureModalFile"
              accept="image/*"
              @input="onSignatureModalFileSelect"
              placeholder="Choose signature image..."
              drop-placeholder="Drop image here..."
            />
          </b-form-group>

          <div v-if="signaturePreviewUrl" class="signature-modal-preview">
            <label class="text-muted small">Preview:</label>
            <img :src="signaturePreviewUrl" alt="Signature preview" />
          </div>
        </div>
      </div>

      <template #modal-footer>
        <b-button
          size="sm"
          variant="primary"
          class="mr-2"
          :disabled="
            (!signaturePadDataUrl && !signaturePreviewUrl) ||
            isUploadingSignature
          "
          @click="confirmSignatureUpload"
        >
          <font-awesome-icon
            icon="spinner"
            v-if="isUploadingSignature"
            spin
            class="mr-1"
          />
          <font-awesome-icon icon="upload" v-else class="mr-1" />
          {{ isUploadingSignature ? "Uploading..." : "Upload" }}
        </b-button>
        <b-button
          size="sm"
          variant="outline-dark"
          @click="showSignatureModal = false"
        >
          Cancel
        </b-button>
      </template>
    </b-modal>

    <!-- Signature View Modal -->
    <b-modal
      id="signature-view-modal"
      header-class="hrmsColor"
      size="md"
      centered
      title="Employee Signature"
      ok-only
      ok-title="Close"
      ok-variant="outline-dark"
    >
      <div class="text-center p-3" v-if="signatureViewDataUrl">
        <img
          :src="formatSignatureSrc(signatureViewDataUrl)"
          class="signature-view-img"
          alt="Employee signature"
        />
      </div>
    </b-modal>

    <div v-if="alert.showAlert > 0" class="alert-container">
      <b-alert
        :show="alert.showAlert"
        dismissible
        :variant="alert.variant"
        @dismissed="alert.showAlert = null"
        class="assess-alert"
      >
        <font-awesome-icon
          :icon="
            alert.variant === 'success' ? 'circle-check' : 'circle-exclamation'
          "
          class="mr-2"
        />
        {{ alert.message }}
      </b-alert>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Loading from "~/components/LoadingOverlay/Loadings.vue";
import jsPDF from "jspdf";
import "jspdf-autotable";
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";
import JSZip from "jszip";
import QRCode from "qrcode";
import NationalIDCard from "~/components/Print/NationalIDCard.vue";
import html2canvas from "html2canvas";

export default {
  components: { Loading, vSelect, NationalIDCard },
  data() {
    return {
      showLoading: false,
      employees: [],
      totalRows: 0,
      currentPage: 1,
      perPage: 20,
      searchText: "",
      selectedStatus: 0,
      statusOptions: [
        { value: 0, text: "Active Employees" },
        { value: 1, text: "Separated Employees" },
        { value: 2, text: "All Employees" },
      ],
      selectedDepartments: [],
      departmentOptions: [],
      selectedDivisions: [],
      selectedEmploymentStatuses: [],
      employmentStatusOptions: [
        "Permanent",
        "Job Order ",
        "Elected",
        "Co-terminous",
        "Casual",
      ],
      alert: {
        showAlert: 0,
        variant: "",
        message: "",
      },
      employeeDetails: null,
      showEmployeeModal: false,
      employeeDetailTab: 0,
      profilePhotoFailed: false,
      departments: [],
      formDriver: {},
      oldIdQrDataUrl: "",
      qrCodeEmployee: null,
      qrCodeDataUrl: null,
      multiQRDataUrls: {},
      isGeneratingMultiQR: false,
      // File maintenance reference data
      divisions: [],
      positions: [],
      employmentStatuses: [
        { value: null, text: "Select status", empstat_key: null },
        { value: "Permanent", text: "Permanent", empstat_key: 1 },
        { value: "Job Order", text: "Job Order", empstat_key: 2 },
        { value: "Elected", text: "Elected", empstat_key: 3 },
        { value: "Co-terminous", text: "Co-terminous", empstat_key: 4 },
        { value: "Casual", text: "Casual", empstat_key: 5 },
      ],
      // Reference data
      barangays: [],
      countries: [],
      cities: [],
      provinces: [],
      genders: [],
      religions: [],
      civilStatuses: [],
      bloodTypes: [],
      // Edit modal
      showEditModal: false,
      editEmployeeData: null,
      signatureFile: null,
      signatureUploadTarget: null,
      showSignatureModal: false,
      signatureModalFile: null,
      signaturePreviewUrl: null,
      isUploadingSignature: false,
      signatureViewDataUrl: null,
      signatureAlert: {
        dismissCountDown: 0,
        variant: "",
        message: "",
      },
      signaturePadMode: "draw",
      signaturePadDataUrl: null,
      isDrawing: false,
      drawingCtx: null,
      showStaffQuickEditModal: false,
      profileImageFile: null,
      profileImagePreviewUrl: null,
      isUploadingProfileImage: false,
      profileImageAlert: {
        dismissCountDown: 0,
        variant: "",
        message: "",
      },
      showNationalIDModal: false,
      isPrintingNationalID: false,
      nationalIDEmployee: null,
      staffQuickEditForm: null,
      quickEditDivisions: [],
      selectedForQR: [],
      showConfirmModal: false,
      showMultipleQRModal: false,
      isDownloadingAll: false,
      isUpdating: false,
      fields: [
        {
          key: "qr_select",
          label: "",
          sortable: false,
          class: "text-center",
        },
        { key: "image", label: "Photo", sortable: false },
        { key: "empno", label: "Employee No.", sortable: true },
        { key: "swipe_id", label: "Swipe ID", sortable: true },
        {
          key: "fullname",
          label: "Full Name",
          sortable: true,
          class: "text-left",
        },
        {
          key: "deptdesc",
          label: "Department",
          sortable: true,
          class: "text-left",
        },
        {
          key: "division_desc",
          label: "Division",
          sortable: true,
          class: "text-left",
        },
        {
          key: "position_desc",
          label: "Position",
          sortable: true,
          class: "text-left",
        },
        {
          key: "EmploymentStatus",
          label: "Employment Status",
          sortable: false,
          class: "text-center",
        },
        {
          key: "isseparated",
          label: "Status",
          sortable: false,
          class: "text-center",
        },
        {
          key: "isApprover",
          label: "Approver",
          sortable: false,
          class: "text-center",
        },
        { key: "actions", label: "Actions", sortable: false },
      ],
    };
  },
  created() {
    this.fetchDepartments();
    this.fetchDivisions();
    this.fetchPositions();
    this.fetchEmployees();
    // Fetch reference data
    this.fetchBarangays();
    this.fetchCountries();
    this.fetchCities();
    this.fetchProvinces();
    this.fetchGenders();
    this.fetchReligions();
    this.fetchCivilStatuses();
    this.fetchBloodTypes();
  },
  computed: {
    bottomLabel() {
      return `Showing ${this.startEntry} to ${this.endEntry} of ${this.filteredTotalRows} entries`;
    },
    startEntry() {
      return this.filteredTotalRows === 0
        ? 0
        : (this.currentPage - 1) * this.perPage + 1;
    },
    endEntry() {
      return Math.min(this.currentPage * this.perPage, this.filteredTotalRows);
    },
    filteredEmployees() {
      let filtered = this.employees;

      if (this.selectedDepartments.length > 0) {
        filtered = filtered.filter((employee) =>
          this.selectedDepartments.includes(employee.deptdesc)
        );
      }

      if (this.selectedDivisions.length > 0) {
        filtered = filtered.filter((employee) => {
          const divisionValue = String(
            employee.division_desc ||
              employee.divisiondesc ||
              employee.division ||
              ""
          ).trim();
          return this.selectedDivisions.some(
            (selectedDivision) =>
              String(selectedDivision || "").trim() === divisionValue
          );
        });
      }

      if (this.selectedEmploymentStatuses.length > 0) {
        filtered = filtered.filter((employee) =>
          this.selectedEmploymentStatuses.includes(employee.EmploymentStatus)
        );
      }
      return filtered;
    },
    isAllQRSelected() {
      if (this.filteredEmployees.length === 0) return false;
      return this.filteredEmployees.every((emp) =>
        this.selectedForQR.some((s) => s.empid === emp.empid)
      );
    },
    qrSelectAll: {
      get() {
        return this.isAllQRSelected;
      },
      set(value) {
        if (value) {
          this.selectedForQR = [...this.filteredEmployees];
        } else {
          this.selectedForQR = [];
        }
      },
    },
    isPartiallyQRSelected() {
      if (this.filteredEmployees.length === 0) return false;
      const count = this.filteredEmployees.filter((emp) =>
        this.selectedForQR.some((s) => s.empid === emp.empid)
      ).length;
      return count > 0 && count < this.filteredEmployees.length;
    },
    filteredTotalRows() {
      return this.filteredEmployees.length;
    },
    sortedDepartments() {
      return this.departments
        .slice()
        .sort((a, b) => a.deptdesc.localeCompare(b.deptdesc));
    },
    sortedDivisions() {
      let pool = this.employees;

      // Filter the employee source by selected departments if any are picked
      if (this.selectedDepartments.length > 0) {
        pool = pool.filter((emp) =>
          this.selectedDepartments.includes(emp.deptdesc)
        );
      }

      // Extract unique division names/descriptions found in the current employee pool
      const uniqueNames = [
        ...new Set(
          pool
            .map((emp) =>
              (
                emp.division_desc ||
                emp.divisiondesc ||
                emp.division ||
                ""
              ).trim()
            )
            .filter(Boolean)
        ),
      ];

      // Convert to object format expected by the template and sort alphabetically
      return uniqueNames.sort().map((name) => ({
        division_desc: name,
      }));
    },
    staffSeparationSelectOptions() {
      return [
        { value: "active", text: "Active" },
        { value: "separated", text: "Separated" },
      ];
    },
    /** Department labels for vue-select (string options = v-model is deptdesc) */
    staffDeptOptionsForVueSelect() {
      const names = this.sortedDepartments
        .map((d) => d.deptdesc)
        .filter(Boolean);
      const cur =
        this.staffQuickEditForm && this.staffQuickEditForm.deptdesc
          ? String(this.staffQuickEditForm.deptdesc).trim()
          : "";
      if (cur && !names.includes(cur)) {
        return [cur, ...names];
      }
      return names;
    },
    staffEmploymentStatusSelectOptions() {
      const opts = this.employmentStatusOptions.map((s) => ({
        value: s,
        text: s,
      }));
      const cur =
        this.staffQuickEditForm && this.staffQuickEditForm.employmentStatus;
      if (cur && !opts.some((o) => o.value === cur)) {
        opts.unshift({ value: cur, text: `${cur} (current)` });
      }
      return [{ value: "", text: "— Select employment status —" }, ...opts];
    },
    employeeProfileLink() {
      if (!this.qrCodeEmployee) return "";
      return `https://employee.koronadalcityonlineservices.com/${this.qrCodeEmployee.empid}`;
    },
    // Computed options for edit modal
    genderOptions() {
      return this.genders.map((gender) => ({
        value: gender.id,
        text: gender.desc,
      }));
    },
    civilStatusOptions() {
      return this.civilStatuses.map((status) => ({
        value: status.id,
        text: status.desc,
      }));
    },
    citizenOptions() {
      return this.countries.map((country) => ({
        value: country.id,
        text: country.nationality,
      }));
    },
    religionOptions() {
      return this.religions.map((religion) => ({
        value: religion.id,
        text: religion.desc,
      }));
    },
    bloodTypeOptions() {
      return this.bloodTypes.map((blood) => ({
        value: blood.id,
        text: blood.desc,
      }));
    },
    barangayOptions() {
      return this.barangays.map((barangay) => ({
        value: barangay.id,
        text: barangay.desc,
      }));
    },
    cityOptions() {
      return this.cities.map((city) => ({ value: city.id, text: city.desc }));
    },
    provinceOptions() {
      return this.provinces.map((province) => ({
        value: province.id,
        text: province.desc,
      }));
    },
  },
  watch: {
    currentPage() {
      this.fetchEmployees();
    },
    perPage() {
      this.currentPage = 1;
      this.fetchEmployees();
    },
    searchText() {
      this.currentPage = 1;
      this.debouncedFetchEmployees();
    },
    selectedStatus() {
      this.currentPage = 1;
      this.fetchEmployees();
    },
    selectedDivisions() {
      this.currentPage = 1;
    },
    selectedEmploymentStatuses() {
      this.currentPage = 1;
    },
  },
  methods: {
    logout() {
      localStorage.clear();
      this.$router.push(`/`);
    },
    clearSearch() {
      this.searchText = "";
    },
    selectAllDepartments() {
      this.selectedDepartments = this.sortedDepartments.map((d) => d.deptdesc);
      this.onDepartmentChange();
    },
    selectAllDivisions() {
      this.selectedDivisions = this.sortedDivisions.map((d) => d.division_desc);
      this.onDivisionChange();
    },
    selectAllTypes() {
      this.selectedEmploymentStatuses = [...this.employmentStatusOptions];
      this.onEmploymentStatusChange();
    },
    clearOfficeFilter() {
      this.selectedDepartments = [];
      this.selectedDivisions = [];
      this.onDepartmentChange();
      if (this.$refs.officeDropdown) {
        this.$refs.officeDropdown.hide();
      }
    },
    clearTypeFilter() {
      this.selectedEmploymentStatuses = [];
      this.onEmploymentStatusChange();
      if (this.$refs.typeDropdown) {
        this.$refs.typeDropdown.hide();
      }
    },
    onStatusChange() {
      this.fetchEmployees();
    },
    showAlert(message, variant) {
      this.alert = {
        showAlert: 3,
        variant,
        message,
      };
    },
    getInitials(fullname) {
      if (!fullname) return "?";
      return fullname
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join("");
    },
    getYearsOfService(hireDate) {
      if (!hireDate) return "—";
      const hire = new Date(hireDate);
      const now = new Date();
      const years = now.getFullYear() - hire.getFullYear();
      const months = now.getMonth() - hire.getMonth();
      const totalMonths = years * 12 + months;
      const y = Math.floor(totalMonths / 12);
      const m = totalMonths % 12;
      if (y === 0) return `${m} month${m !== 1 ? "s" : ""}`;
      if (m === 0) return `${y} year${y !== 1 ? "s" : ""}`;
      return `${y} year${y !== 1 ? "s" : ""}, ${m} month${m !== 1 ? "s" : ""}`;
    },
    getAge(birthdate) {
      if (!birthdate) return "—";
      const birth = new Date(birthdate);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const monthDiff = now.getMonth() - birth.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && now.getDate() < birth.getDate())
      ) {
        age--;
      }
      return `${age} years old`;
    },
    async viewEmployee(data) {
      try {
        this.showLoading = true;
        const res = await axios({
          method: "GET",
          url: `${this.$axios.defaults.baseURL}/employees/get-one`,
          params: {
            empid: data.empid,
          },
        });

        const row = res.data && res.data[0];
        if (!row) {
          this.showAlert("No employee details returned.", "warning");
          return;
        }
        this.employeeDetails = row;
        this.employeeDetailTab = 0;
        this.profilePhotoFailed = false;
        this.showEmployeeModal = true;
      } catch (error) {
        console.error("Error fetching employee details:", error);
        this.showAlert("Failed to fetch employee details.", "danger");
      } finally {
        this.showLoading = false;
      }
    },
    openStaffQuickEditModal() {
      const e = this.employeeDetails;
      if (!e) return;
      const empSt =
        e.EmploymentStatus != null ? String(e.EmploymentStatus) : "";

      const matchedDept = this.departments.find(
        (dept) => String(dept.deptdesc).trim() === String(e.deptdesc).trim()
      );
      const matchedDivision = this.divisions.find(
        (division) =>
          String(division.division_desc).trim() ===
          String(e.division_desc || "").trim()
      );
      const matchedPosition = this.positions.find(
        (position) =>
          String(
            position.position_desc || position.positionname || position.position
          ).trim() === String(e.position_desc || "").trim()
      );
      const matchedStatus = this.employmentStatuses.find(
        (status) => String(status.value).trim() === String(empSt).trim()
      );
      console.log(matchedDivision);
      this.staffQuickEditForm = {
        empid: e.empid,
        empno: e.empno,
        deptid: matchedDept ? matchedDept.deptid : null,
        deptdesc: e.deptdesc || "",
        division_key: matchedDivision ? matchedDivision.division_key : null,
        divisiondesc: matchedDivision ? matchedDivision.division_desc : "",
        position_key: matchedPosition ? matchedPosition.position_key : null,
        position_desc: e.position_desc || "",
        separation: e.isseparated ? "separated" : "active",
        empstat_key: e.employmentStatus || null,
        employmentStatus: empSt,
        emergency_name: e.emergency_name || "",
        emergency_contact: e.emergency_contact || "",
        emergency_relation: e.emergency_relation || "",
      };

      this.showStaffQuickEditModal = true;
    },
    async refetchEmployeeDetails() {
      const empid = this.employeeDetails && this.employeeDetails.empid;
      if (!empid) return;
      try {
        const res = await axios({
          method: "GET",
          url: `${this.$axios.defaults.baseURL}/employees/get-one`,
          params: { empid },
        });
        const row = res.data && res.data[0];
        if (row) {
          this.employeeDetails = row;
          this.profilePhotoFailed = false;
        }
      } catch (err) {
        console.error("Error refreshing employee details:", err);
      }
    },
    async saveStaffQuickEdit() {
      const f = this.staffQuickEditForm;
      if (!f || !f.empid) return;
      if (!f.deptid && !f.deptdesc) {
        this.showAlert("Please select a department.", "warning");
        return;
      }
      if (!f.position_key && !f.position_desc) {
        this.showAlert("Please select a position.", "warning");
        return;
      }
      try {
        this.showLoading = true;

        const selectedDept = this.departments.find(
          (dept) => String(dept.deptdesc).trim() === String(f.deptdesc).trim()
        );
        const selectedDivision = this.quickEditDivisions.find(
          (division) =>
            String(
              division.division_desc || division.divisiondesc || ""
            ).trim() ===
              String(f.divisiondesc || f.division_desc || "").trim() &&
            String(division.deptid || division.dept_id || "").trim() ===
              String(selectedDept?.deptid || f.deptid || "").trim()
        );
        const selectedPosition = this.positions.find(
          (position) =>
            String(
              position.position_desc ||
                position.positionname ||
                position.position
            ).trim() === String(f.position_desc || "").trim()
        );
        const selectedStatus = this.employmentStatuses.find(
          (status) =>
            String(status.value).trim() === String(f.employmentStatus).trim()
        );
        console.log(f.employmentStatus, selectedStatus, "ASDASDASDAS");
        await axios({
          method: "PUT",
          url: `${this.$axios.defaults.baseURL}/employees/update-one-emp-temporary/${f.empid}`,
          data: {
            deptid: f.deptid || selectedDept?.deptid || null,
            division_key:
              selectedDivision?.division_key || f.division_key || null,
            position_key:
              f.position_key || selectedPosition?.position_key || null,
            empstat_key: selectedStatus.empstat_key || null,
            empstat_name: selectedStatus ? selectedStatus.value : null,
            emergency_name: f.emergency_name || "",
            emergency_relation: f.emergency_relation || "",
            emergency_contact: f.emergency_contact || "",
          },
        });
        this.showAlert("Details updated successfully.", "success");
        this.showStaffQuickEditModal = false;
        this.staffQuickEditForm = null;
        await this.refetchEmployeeDetails();
        await this.fetchEmployees();
      } catch (error) {
        console.error("Error saving quick edit:", error);
        const msg =
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to save changes.";
        this.showAlert(msg, "danger");
      } finally {
        this.showLoading = false;
      }
    },
    onQuickEditModalHidden() {
      this.staffQuickEditForm = null;
      this.quickEditDivisions = [];
    },
    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    formatCurrency(amount) {
      if (!amount) return "";
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "PHP",
      }).format(amount);
    },
    async generateCard(row) {
      console.log(row);
      this.formDriver = {
        empno: row.empno,
        fullname: row.fullname,
        deptdesc: row.deptdesc,
        position_desc: row.position_desc,
        email: row.email,
        contact_no: row.contact_no,
        is_separated: row.is_separated,
      };
      this.oldIdQrDataUrl = "";
      this.generateOldQRWithLogo(row.empno);
      this.$bvModal.show("employee-id-modal");
    },
    async generateOldQRWithLogo(empno) {
      const profileLink = `https://employee.koronadalcityonlineservices.com/${empno}`;
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
        this.oldIdQrDataUrl = canvas.toDataURL("image/png");
      } catch (e) {
        console.error("Old QR generation failed:", e);
      }
    },
    openNationalIDModal(employee) {
      this.nationalIDEmployee = employee;
      this.showNationalIDModal = true;
    },
    async printNationalIDCard() {
      if (!this.nationalIDEmployee) return;
      this.isPrintingNationalID = true;

      const cardRef = this.$refs.nationalIDCardRef;

      if (!cardRef) {
        this.showAlert("danger", "ID Card not found");
        this.isPrintingNationalID = false;
        return;
      }

      const front = cardRef.$refs.idCardFront;
      const back = cardRef.$refs.idCardBack;
      const flipInner = cardRef.$refs.idCardFront?.parentElement;
      const flipStage = flipInner?.parentElement;

      this.$nextTick(async () => {
        try {
          const savedFlipInner = flipInner?.style.transform;
          const savedFlipStage = flipInner?.style.transformStyle;
          const savedBack = back.style.transform;
          const savedFrontBF = front.style.backfaceVisibility;
          const savedBackBF = back.style.backfaceVisibility;

          if (flipInner) flipInner.style.transform = "none";
          if (flipInner) flipInner.style.transformStyle = "flat";
          back.style.transform = "none";
          front.style.backfaceVisibility = "visible";
          back.style.backfaceVisibility = "visible";

          const options = {
            scale: 4,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            logging: false,
            imageTimeout: 0,
          };

          const frontCanvas = await html2canvas(front, options);
          const backCanvas = await html2canvas(back, options);

          front.style.backfaceVisibility = savedFrontBF || "";
          back.style.backfaceVisibility = savedBackBF || "";
          back.style.transform = savedBack || "";
          if (flipInner) flipInner.style.transform = savedFlipInner || "";
          if (flipInner) flipInner.style.transformStyle = savedFlipStage || "";

          function addBleed(canvas, scale = 1) {
            const output = document.createElement("canvas");

            output.width = Math.round(canvas.width * scale);
            output.height = Math.round(canvas.height * scale);

            const ctx = output.getContext("2d");

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            const dx = -(output.width - canvas.width) / 2;
            const dy = -(output.height - canvas.height) / 2;

            ctx.drawImage(canvas, dx, dy, output.width, output.height);

            return output;
          }

          const frontImage = addBleed(frontCanvas, 1).toDataURL("image/png");
          const backImage = addBleed(backCanvas, 1).toDataURL("image/png");

          const printWindow = window.open("", "_blank");

          printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>

<style>

@page{
    size:85mm 53mm;
    margin:0;
}

html,body{
    margin:0;
    padding:0;
    background:#fff;
    -webkit-print-color-adjust:exact;
    print-color-adjust:exact;
}

.page{
    width:85mm;
    height:53mm;
    overflow:hidden;
    page-break-after:always;
}

.page:last-child{
    page-break-after:auto;
}

img{
    width:100%;
    height:100%;
    display:block;
}
</style>

</head>

<body>

<div class="page">
    <img src="${frontImage}">
</div>

<div class="page">
    <img src="${backImage}">
</div>

</body>
</html>
      `);

          printWindow.document.close();

          const imgs = printWindow.document.images;

          let loaded = 0;

          const doPrint = () => {
            setTimeout(() => {
              printWindow.focus();
              printWindow.print();
              printWindow.close();
            }, 1000);
          };

          Array.from(imgs).forEach((img) => {
            if (img.complete) {
              loaded++;
              if (loaded === imgs.length) doPrint();
            } else {
              img.onload = img.onerror = () => {
                loaded++;
                if (loaded === imgs.length) doPrint();
              };
            }
          });
        } catch (e) {
          console.error(e);
          this.showAlert("danger", "Printing failed.");
        } finally {
          this.isPrintingNationalID = false;
        }
      });
    },
    handleImageError(event) {
      // If the default user.jpg also fails, create a canvas with user icon
      const canvas = document.createElement("canvas");
      canvas.width = 40;
      canvas.height = 40;
      const ctx = canvas.getContext("2d");

      // Draw background
      ctx.fillStyle = "#f5f5f5";
      ctx.beginPath();
      ctx.arc(20, 20, 20, 0, 2 * Math.PI);
      ctx.fill();

      // Draw border
      ctx.strokeStyle = "#e0e0e0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(20, 20, 19, 0, 2 * Math.PI);
      ctx.stroke();

      // Draw user icon (simple circle)
      ctx.fillStyle = "#999";
      ctx.beginPath();
      ctx.arc(20, 16, 6, 0, 2 * Math.PI);
      ctx.fill();

      // Draw body (semi-circle)
      ctx.beginPath();
      ctx.arc(20, 35, 12, Math.PI, 0);
      ctx.fill();

      event.target.src = canvas.toDataURL();
    },
    handleAvatarError(event) {
      // Hide the broken image and show initials fallback
      event.target.style.display = "none";
      const avatarContainer = event.target.parentElement;
      const fallback = avatarContainer.querySelector(".avatar-fallback");
      if (fallback) {
        fallback.style.display = "flex";
      }
    },
    formatCompleteAddress() {
      if (!this.employeeDetails) return "";

      const parts = [];

      // House/Unit details
      if (this.employeeDetails.permanent_unitno) {
        parts.push(`Unit ${this.employeeDetails.permanent_unitno}`);
      }
      if (this.employeeDetails.permanent_blockno) {
        parts.push(`Block ${this.employeeDetails.permanent_blockno}`);
      }
      if (this.employeeDetails.permanent_lotno) {
        parts.push(`Lot ${this.employeeDetails.permanent_lotno}`);
      }
      if (this.employeeDetails.permanent_no) {
        parts.push(`No. ${this.employeeDetails.permanent_no}`);
      }
      if (this.employeeDetails.permanent_street) {
        parts.push(this.employeeDetails.permanent_street);
      }

      // Barangay
      if (this.employeeDetails.permanent_brgy_name) {
        parts.push(this.employeeDetails.permanent_brgy_name);
      }

      // City and Province (handle array format)
      if (this.employeeDetails.permanent_city_name) {
        let cityInfo = this.employeeDetails.permanent_city_name;
        if (Array.isArray(cityInfo)) {
          parts.push(...cityInfo);
        } else {
          parts.push(cityInfo);
        }
      }

      return parts.filter(Boolean).join(", ");
    },
    generateQRCode(employee) {
      this.qrCodeEmployee = employee;
      this.generateQRDataUrl(employee).then((url) => {
        this.qrCodeDataUrl = url;
        this.$bvModal.show("qr-code-modal");
      });
    },
    async generateQRDataUrl(employee) {
      const profileLink = `https://employee.koronadalcityonlineservices.com/${employee.empid}`;
      try {
        return await QRCode.toDataURL(profileLink, {
          width: 400,
          margin: 2,
          color: { dark: "#000000", light: "#ffffff" },
        });
      } catch {
        return "";
      }
    },
    async openMultipleQRModal() {
      if (this.selectedForQR.length === 0) {
        this.showAlert(
          "warning",
          "Please select at least one employee for QR generation."
        );
        return;
      }
      this.isGeneratingMultiQR = true;
      this.multiQRDataUrls = {};
      const entries = await Promise.all(
        this.selectedForQR.map(async (emp) => {
          const url = await this.generateQRDataUrl(emp);
          return [emp.empid, url];
        })
      );
      this.multiQRDataUrls = Object.fromEntries(entries);
      this.isGeneratingMultiQR = false;
      this.showMultipleQRModal = true;
    },
    async downloadSingleQR(employee) {
      try {
        const dataUrl = await this.generateQRDataUrl(employee);
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `QR_${employee.fullname.replace(/\s+/g, "_")}_${
          employee.empno
        }.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Error downloading QR code:", error);
        this.showAlert(
          "danger",
          `Failed to download QR code for ${employee.fullname}.`
        );
      }
    },
    async downloadAllQRCodes() {
      if (this.selectedForQR.length === 0) return;
      this.isDownloadingAll = true;
      try {
        const zip = new JSZip();
        const folder = zip.folder("QR_Codes");

        await Promise.all(
          this.selectedForQR.map(async (employee) => {
            const dataUrl = await this.generateQRDataUrl(employee);
            const base64 = dataUrl.split(",")[1];
            const safeName = employee.fullname
              .replace(/\s+/g, "_")
              .replace(/[^a-zA-Z0-9_-]/g, "");
            folder.file(`QR_${safeName}_${employee.empno}.png`, base64, {
              base64: true,
            });
          })
        );

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const objectUrl = URL.createObjectURL(zipBlob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = `${this.selectedForQR.length}_employees.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);

        this.showAlert(
          "success",
          `Downloaded ${this.selectedForQR.length} QR code(s) as a ZIP file.`
        );
      } catch (error) {
        console.error("Error generating ZIP:", error);
        this.showAlert("danger", "Failed to generate ZIP file.");
      } finally {
        this.isDownloadingAll = false;
      }
    },
    async downloadQRCode() {
      if (!this.qrCodeEmployee) return;

      try {
        const link = document.createElement("a");
        link.href = this.qrCodeDataUrl;
        link.download = `${this.qrCodeEmployee.fullname.replace(
          /\s+/g,
          "_"
        )}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showAlert("QR Code downloaded successfully!", "success");
      } catch (error) {
        console.error("QR download failed:", error);
        this.showAlert("danger", "Failed to download QR Code.");
      }
    },
    openEditModal(employee) {
      this.editEmployeeData = { ...employee };
      this.showEditModal = true;
    },
    closeEditModal() {
      this.showEditModal = false;
      this.editEmployeeData = null;
      this.signatureFile = null;
    },
    onSignatureSelect(file) {
      if (!file) {
        this.editEmployeeData.imageSignature64 = null;
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.editEmployeeData.imageSignature64 = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    removeSignature() {
      this.signatureFile = null;
      this.editEmployeeData.imageSignature64 = null;
    },
    openSignatureModal(employee) {
      this.signatureUploadTarget = employee;
      this.signatureModalFile = null;
      this.signaturePreviewUrl = null;
      this.signaturePadDataUrl = null;
      this.signaturePadMode = "draw";
      this.showSignatureModal = true;
      this.$nextTick(() => this.initSignaturePadCanvas());
    },
    onSignatureModalFileSelect(file) {
      if (!file) {
        this.signaturePreviewUrl = null;
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.signaturePreviewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    formatSignatureSrc(val) {
      if (!val) return "";
      if (val.startsWith("data:image")) return val;
      return "data:image/png;base64," + val;
    },
    openSignatureViewModal(dataUrl) {
      this.signatureViewDataUrl = dataUrl;
      this.$bvModal.show("signature-view-modal");
    },
    resetSignatureModal() {
      this.signatureModalFile = null;
      this.signaturePreviewUrl = null;
      this.signatureUploadTarget = null;
      this.isUploadingSignature = false;
      this.signatureAlert.dismissCountDown = 0;
      this.signaturePadDataUrl = null;
      this.signaturePadMode = "draw";
      this.isDrawing = false;
      this.drawingCtx = null;
    },
    async confirmSignatureUpload() {
      const sigSource =
        this.signaturePadMode === "draw"
          ? this.signaturePadDataUrl
          : this.signaturePreviewUrl;
      if (!sigSource || !this.signatureUploadTarget) return;
      this.isUploadingSignature = true;
      this.signatureAlert.dismissCountDown = 0;
      try {
        this.showLoading = true;
        let res;
        if (this.signaturePadMode === "draw") {
          const blob = await (await fetch(sigSource)).blob();
          const formData = new FormData();
          formData.append("file", blob, "signature.png");
          res = await axios({
            method: "PUT",
            url: `${this.$axios.defaults.baseURL}/employees/upload-signature/${this.signatureUploadTarget.empid}`,
            data: formData,
          });
        } else {
          const formData = new FormData();
          formData.append("file", this.signatureModalFile);
          res = await axios({
            method: "PUT",
            url: `${this.$axios.defaults.baseURL}/employees/upload-signature/${this.signatureUploadTarget.empid}`,
            data: formData,
          });
        }
        const sigUrl =
          res.data?.imageSignature64 ||
          res.data?.url ||
          this.signaturePreviewUrl;
        this.signatureAlert = {
          variant: "success",
          message: "Signature uploaded successfully!",
          dismissCountDown: 3,
        };
        if (
          this.employeeDetails &&
          this.employeeDetails.empid === this.signatureUploadTarget.empid
        ) {
          this.employeeDetails.imageSignature64 = sigUrl;
        }
        this.fetchEmployees();
        setTimeout(() => {
          this.showSignatureModal = false;
        }, 1500);
      } catch (error) {
        const msg =
          error?.response?.data?.error || "Failed to upload signature.";
        this.signatureAlert = {
          variant: "danger",
          message: msg,
          dismissCountDown: 5,
        };
      } finally {
        this.showLoading = false;
        this.isUploadingSignature = false;
      }
    },
    switchSignatureMode(mode) {
      this.signaturePadMode = mode;
      if (mode === "draw") {
        this.signatureModalFile = null;
        this.signaturePreviewUrl = null;
        this.$nextTick(() => this.initSignaturePadCanvas());
      } else {
        this.signaturePadDataUrl = null;
        if (this.drawingCtx) {
          this.drawingCtx.clearRect(
            0,
            0,
            this.$refs.signatureCanvas?.width || 460,
            this.$refs.signatureCanvas?.height || 180
          );
        }
      }
    },
    initSignaturePadCanvas() {
      const canvas = this.$refs.signatureCanvas;
      if (!canvas) return;
      this.drawingCtx = canvas.getContext("2d");
      this.drawingCtx.strokeStyle = "#1a1a2e";
      this.drawingCtx.lineWidth = 2.5;
      this.drawingCtx.lineCap = "round";
      this.drawingCtx.lineJoin = "round";
      this.drawingCtx.clearRect(0, 0, canvas.width, canvas.height);
      this.signaturePadDataUrl = null;
    },
    getCanvasPos(e) {
      const canvas = this.$refs.signatureCanvas;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    startDrawing(e) {
      this.isDrawing = true;
      const pos = this.getCanvasPos(e);
      this.drawingCtx.beginPath();
      this.drawingCtx.moveTo(pos.x, pos.y);
    },
    draw(e) {
      if (!this.isDrawing) return;
      const pos = this.getCanvasPos(e);
      this.drawingCtx.lineTo(pos.x, pos.y);
      this.drawingCtx.stroke();
    },
    stopDrawing() {
      if (!this.isDrawing) return;
      this.isDrawing = false;
      const canvas = this.$refs.signatureCanvas;
      this.signaturePadDataUrl = canvas.toDataURL("image/png");
    },
    startDrawingTouch(e) {
      const touch = e.touches[0];
      const canvas = this.$refs.signatureCanvas;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      this.isDrawing = true;
      this.drawingCtx.beginPath();
      this.drawingCtx.moveTo(
        (touch.clientX - rect.left) * scaleX,
        (touch.clientY - rect.top) * scaleY
      );
    },
    drawTouch(e) {
      if (!this.isDrawing) return;
      const touch = e.touches[0];
      const canvas = this.$refs.signatureCanvas;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      this.drawingCtx.lineTo(
        (touch.clientX - rect.left) * scaleX,
        (touch.clientY - rect.top) * scaleY
      );
      this.drawingCtx.stroke();
    },
    clearSignaturePad() {
      const canvas = this.$refs.signatureCanvas;
      if (!canvas || !this.drawingCtx) return;
      this.drawingCtx.clearRect(0, 0, canvas.width, canvas.height);
      this.signaturePadDataUrl = null;
    },
    onProfileImageSelect(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      this.profileImageFile = file;
      const reader = new FileReader();
      reader.onload = (ev) => {
        this.profileImagePreviewUrl = ev.target.result;
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    cancelProfileImageCrop() {
      this.profileImageFile = null;
      this.profileImagePreviewUrl = null;
    },
    async confirmProfileImageUpload() {
      if (!this.profileImageFile || !this.employeeDetails) return;
      this.isUploadingProfileImage = true;
      this.profileImageAlert.dismissCountDown = 0;
      try {
        this.showLoading = true;
        const formData = new FormData();
        formData.append("file", this.profileImageFile);
        const res = await axios({
          method: "PUT",
          url: `${this.$axios.defaults.baseURL}/employees/upload-profile-image/${this.employeeDetails.empid}`,
          data: formData,
        });
        const photoUrl =
          res.data?.photo64 || res.data?.url || this.profileImagePreviewUrl;
        this.profileImageAlert = {
          variant: "success",
          message: "Profile image uploaded successfully!",
          dismissCountDown: 3,
        };
        if (this.employeeDetails) {
          this.employeeDetails.photo64 = photoUrl;
        }
        this.fetchEmployees();
        this.cancelProfileImageCrop();
      } catch (error) {
        const msg =
          error?.response?.data?.error || "Failed to upload profile image.";
        this.profileImageAlert = {
          variant: "danger",
          message: msg,
          dismissCountDown: 5,
        };
      } finally {
        this.showLoading = false;
        this.isUploadingProfileImage = false;
      }
    },
    async updateEmployee() {
      if (!this.editEmployeeData) return;

      try {
        this.showLoading = true;
        const res = await axios({
          method: "PUT",
          url: `${this.$axios.defaults.baseURL}/employees/update/${
            this.editEmployeeData.empid || this.editEmployeeData.empno
          }`,
          data: this.editEmployeeData,
        });

        this.showAlert("success", "Employee updated successfully!");
        this.closeEditModal();
        this.fetchEmployees(); // Refresh the table
      } catch (error) {
        console.error("Error updating employee:", error);
        const msg =
          error?.response?.data?.error || "Failed to update employee.";
        this.showAlert("danger", msg);
      } finally {
        this.showLoading = false;
      }
    },
    downloadIDCard() {
      if (!this.formDriver || !this.formDriver.fullname) return;

      // Load html2canvas library dynamically
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      script.onload = () => {
        this.$nextTick(() => {
          const element = document.querySelector(".id-card-wrapper");
          if (!element) {
            this.showAlert("danger", "ID Card wrapper not found");
            return;
          }

          html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
          })
            .then((canvas) => {
              // Convert canvas to blob and download
              canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `ID_Card_${this.formDriver.fullname.replace(
                  /\s+/g,
                  "_"
                )}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                this.showAlert("success", "ID Card downloaded successfully!");
              }, "image/png");
            })
            .catch((error) => {
              console.error("Error generating ID card:", error);
              this.showAlert("danger", "Failed to generate ID card");
            });
        });
      };
      script.onerror = () => {
        this.showAlert("danger", "Failed to load ID card generator");
      };
      document.head.appendChild(script);
    },
    async downloadNationalIDCard() {
      if (!this.nationalIDEmployee) return;

      const cardRef = this.$refs.nationalIDCardRef;
      if (!cardRef) {
        this.showAlert("danger", "ID Card not found");
        return;
      }

      this.$nextTick(async () => {
        try {
          const options = {
            scale: 4,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            logging: false,
            imageTimeout: 0,
          };

          const front = cardRef.$refs.idCardFront;
          const back = cardRef.$refs.idCardBack;
          const flipInner = cardRef.$refs.idCardFront?.parentElement;

          const frontCanvas = await html2canvas(front, options);

          const savedFlipTransform = flipInner?.style.transform;
          const savedCardTransform = back?.style.transform;
          const savedBackfaceVisibility = back?.style.backfaceVisibility;
          const savedWebkitBackfaceVisibility = back?.style.webkitBackfaceVisibility;
          if (flipInner) flipInner.style.transform = "none";
          if (back) {
            back.style.transform = "none";
            back.style.backfaceVisibility = "visible";
            back.style.webkitBackfaceVisibility = "visible";
          }

          const backCanvas = await html2canvas(back, options);

          if (flipInner) flipInner.style.transform = savedFlipTransform || "";
          if (back) {
            back.style.transform = savedCardTransform || "";
            back.style.backfaceVisibility = savedBackfaceVisibility || "";
            back.style.webkitBackfaceVisibility = savedWebkitBackfaceVisibility || "";
          }

          const fullname = this.nationalIDEmployee.fullname || "Employee";
          const safeName = fullname.replace(/\s+/g, "_");

          const triggerDownload = (blob, filename) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          };

          await new Promise((resolve, reject) => {
            frontCanvas.toBlob((blob) => {
              if (!blob) return reject(new Error("Front blob failed"));
              triggerDownload(blob, `ID_Card_Front_${safeName}.png`);
              resolve();
            }, "image/png");
          });

          await new Promise((resolve, reject) => {
            backCanvas.toBlob((blob) => {
              if (!blob) return reject(new Error("Back blob failed"));
              triggerDownload(blob, `ID_Card_Back_${safeName}.png`);
              resolve();
            }, "image/png");
          });

          this.showAlert(
            "success",
            "National ID Card downloaded successfully!"
          );
        } catch (e) {
          console.error("Download failed:", e);
          this.showAlert("danger", "Failed to download National ID Card");
        }
      });
    },
    onDepartmentChange() {
      this.currentPage = 1;
      this.fetchEmployees();
    },
    onDivisionChange() {
      this.currentPage = 1;
    },
    onEmploymentStatusChange() {
      this.currentPage = 1;
    },
    debouncedFetchEmployees() {
      clearTimeout(this._searchTimer);
      this._searchTimer = setTimeout(() => {
        this.fetchEmployees();
      }, 400);
    },
    async fetchDepartments() {
      try {
        const res = await axios({
          method: "GET",
          url: `${this.$axios.defaults.baseURL}/file-maintenance/department/get-all`,
        });

        this.departmentOptions = [{ value: null, text: "All Departments" }];

        if (res.data && Array.isArray(res.data)) {
          this.departments = res.data;
          res.data.forEach((dept) => {
            this.departmentOptions.push({
              value: dept.deptdesc,
              text: dept.deptdesc,
            });
          });
          if (this.selectedDepartment !== null) {
            await this.fetchEmployees();
          }
        } else {
          this.departments = [];
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        this.departments = [];
      }
    },
    async fetchDivisions() {
      try {
        const res = await axios({
          method: "GET",
          url: `${this.$axios.defaults.baseURL}/file-maintenance/division/get-all`,
        });
        this.divisions = Array.isArray(res.data) ? res.data : [];
      } catch (error) {
        console.error("Error fetching divisions:", error);
        this.divisions = [];
      }
    },
    async fetchDivisionsByDepartment(deptid) {
      if (!deptid) {
        return this.fetchDivisions();
      }
      try {
        const res = await axios({
          method: "GET",
          url: `${this.$axios.defaults.baseURL}/file-maintenance/division/get-by-dept`,
          params: { deptid },
        });
        this.divisions = Array.isArray(res.data) ? res.data : [];
      } catch (error) {
        console.error("Error fetching divisions by department:", error);
        this.divisions = [];
      }
    },
    async fetchPositions() {
      try {
        const res = await axios({
          method: "GET",
          url: `${this.$axios.defaults.baseURL}/file-maintenance/position/get-all`,
        });
        this.positions = Array.isArray(res.data) ? res.data : [];
      } catch (error) {
        console.error("Error fetching positions:", error);
        this.positions = [];
      }
    },
    async fetchEmployees() {
      this.showLoading = true;
      try {
        const params = {
          text: this.searchText || "",
        };

        if (this.selectedStatus === 2) {
          params.isAll = true;
          params.isSeparated = 0;
        } else {
          params.IsSeparated = this.selectedStatus;
        }

        console.log("Fetching employees with params:", params);

        const res = await axios({
          method: "GET",
          url: `${this.$axios.defaults.baseURL}/employees/get-all`,
          params: params,
        });

        const payload = res.data;

        if (Array.isArray(payload)) {
          this.totalRows = payload.length;
          this.employees = payload.sort((a, b) =>
            a.fullname.localeCompare(b.fullname)
          );
        } else if (payload && Array.isArray(payload.data)) {
          this.employees = payload.data.sort((a, b) =>
            a.fullname.localeCompare(b.fullname)
          );
          this.totalRows = Number(
            payload.total || payload.totalRows || payload.count || 0
          );
        } else if (payload && Array.isArray(payload.items)) {
          this.employees = payload.items.sort((a, b) =>
            a.fullname.localeCompare(b.fullname)
          );
          this.totalRows = Number(payload.totalCount || payload.total || 0);
        } else {
          this.employees = [];
          this.totalRows = 0;
        }

        if (!this.totalRows && Array.isArray(this.employees)) {
          this.totalRows = this.employees.length;
        }
      } catch (e) {
        this.employees = [];
        this.totalRows = 0;
      } finally {
        this.showLoading = false;
      }
    },
    // Reference data fetch functions
    async fetchBarangays() {
      try {
        const res = await axios({
          method: "GET",
          url: `${this.$axios.defaults.baseURL}/file-maintenance/barangay/get-all`,
        });
        this.barangays = res.data || [];
      } catch (error) {
        console.error("Error fetching barangays:", error);
        this.barangays = [];
      }
    },
    async fetchCountries() {
      try {
        const res = await axios({
          method: "GET",
          url: `${this.$axios.defaults.baseURL}/file-maintenance/country/get-all`,
        });
        this.countries = res.data || [];
      } catch (error) {
        console.error("Error fetching countries:", error);
        this.countries = [];
      }
    },
    async fetchCities() {
      try {
        const res = await axios({
          method: "GET",
          url: `${this.$axios.defaults.baseURL}/file-maintenance/city/get-all`,
        });
        this.cities = res.data || [];
      } catch (error) {
        console.error("Error fetching cities:", error);
        this.cities = [];
      }
    },
    async fetchProvinces() {
      try {
        const res = await axios({
          method: "GET",
          url: `${this.$axios.defaults.baseURL}/file-maintenance/province/get-all`,
        });
        this.provinces = res.data || [];
      } catch (error) {
        console.error("Error fetching provinces:", error);
        this.provinces = [];
      }
    },
    async fetchGenders() {
      try {
        const res = await axios({
          method: "GET",
          url: `${this.$axios.defaults.baseURL}/file-maintenance/genders/get-all`,
        });
        this.genders = res.data || [];
      } catch (error) {
        console.error("Error fetching genders:", error);
        this.genders = [];
      }
    },
    async fetchReligions() {
      try {
        const res = await axios({
          method: "GET",
          url: `${this.$axios.defaults.baseURL}/file-maintenance/religions/get-all`,
        });
        this.religions = res.data || [];
      } catch (error) {
        console.error("Error fetching religions:", error);
        this.religions = [];
      }
    },
    async fetchCivilStatuses() {
      try {
        const res = await axios({
          method: "GET",
          url: `${this.$axios.defaults.baseURL}/file-maintenance/civil-status/get-all`,
        });
        this.civilStatuses = res.data || [];
      } catch (error) {
        console.error("Error fetching civil statuses:", error);
        this.civilStatuses = [];
      }
    },
    async fetchBloodTypes() {
      try {
        const res = await axios({
          method: "GET",
          url: `${this.$axios.defaults.baseURL}/file-maintenance/bloodtypes/get-all`,
        });
        this.bloodTypes = res.data || [];
      } catch (error) {
        console.error("Error fetching blood types:", error);
        this.bloodTypes = [];
      }
    },
    clearEmployeeSelection() {
      this.selectedForQR = [];
    },
    toggleQRSelectAll(checked) {
      if (checked) {
        this.selectedForQR = [...this.filteredEmployees];
      } else {
        this.selectedForQR = [];
      }
    },
    toggleQRSelection(employee) {
      const idx = this.selectedForQR.findIndex(
        (e) => e.empid === employee.empid
      );
      if (idx === -1) {
        this.selectedForQR.push(employee);
      } else {
        this.selectedForQR.splice(idx, 1);
      }
    },
    isQRSelected(employee) {
      return this.selectedForQR.some((e) => e.empid === employee.empid);
    },
    confirmUpdateToSeparated() {
      if (this.selectedForQR.length === 0) {
        this.showAlert("warning", "Please select at least one employee first.");
        return;
      }
      this.showConfirmModal = true;
    },
    async updateAllToSeparated() {
      if (this.selectedForQR.length === 0) {
        this.showAlert("warning", "Please select at least one employee first.");
        return;
      }

      this.isUpdating = true;
      try {
        this.showLoading = true;

        const res = await axios({
          method: "PUT",
          url: `${this.$axios.defaults.baseURL}/employees/update-mult-toseparated`,
          data: {
            employeesSelected: this.selectedForQR.map((emp) => ({
              empid: emp.empid,
            })),
          },
        });

        this.showAlert(
          "success",
          `Successfully updated ${this.selectedForQR.length} employees to Separated status!`
        );
        this.fetchEmployees(); // Refresh the table
        this.selectedForQR = []; // Clear selection after update
        this.showConfirmModal = false; // Close modal
      } catch (error) {
        console.error("Error updating all employees to separated:", error);
        const msg =
          error?.response?.data?.error || "Failed to update employees.";
        this.showAlert("danger", msg);
      } finally {
        this.showLoading = false;
        this.isUpdating = false;
      }
    },
    async proceedWithUpdate() {
      this.isUpdating = true;
      try {
        await this.updateSelectedToSeparated();
        this.showConfirmModal = false;
      } finally {
        this.isUpdating = false;
      }
    },
    async updateSelectedToSeparated() {
      try {
        this.showLoading = true;

        const res = await axios({
          method: "PUT",
          url: `${this.$axios.defaults.baseURL}/employees/batch-update-separated`,
          data: {
            employees: this.selectedForQR.map((emp) => emp.empid),
          },
        });

        this.showAlert(
          "success",
          `Successfully updated ${this.selectedForQR.length} employees to Separated status!`
        );
        this.fetchEmployees(); // Refresh the table
        this.selectedForQR = []; // Clear selection after update
      } catch (error) {
        console.error("Error batch updating employees:", error);
        const msg =
          error?.response?.data?.error || "Failed to update employees.";
        this.showAlert("danger", msg);
      } finally {
        this.showLoading = false;
      }
    },
    generatePDFReport() {
      if (this.filteredEmployees.length === 0) {
        this.showAlert("warning", "No employees to generate report.");
        return;
      }

      try {
        // Initialize jsPDF
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(20);
        doc.text("List of Employees", 14, 20);

        // Add generation date
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

        // Add filter info
        doc.text(
          `Status Filter: ${this.getStatusText(this.selectedStatus)}`,
          14,
          37
        );
        doc.text(`Total Employees: ${this.filteredEmployees.length}`, 14, 44);

        // Prepare table data
        const tableData = this.filteredEmployees.map((emp) => [
          emp.empno || "",
          emp.fullname || "",
          emp.position_desc || "",
          this.getEmploymentStatus(emp),
          emp.deptdesc || "",
        ]);

        // Add table
        doc.autoTable({
          head: [
            [
              "Employee No.",
              "Name",
              "Position",
              "Status of Appointment",
              "Office",
            ],
          ],
          body: tableData,
          startY: 55,
          styles: {
            fontSize: 9,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: "black",
            textColor: 255,
            fontStyle: "bold",
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245],
          },
          margin: { top: 55 },
        });

        // Save the PDF
        const fileName = `employee_report_${
          new Date().toISOString().split("T")[0]
        }.pdf`;
        doc.save(fileName);

        this.showAlert("success", "PDF report generated successfully!");
      } catch (error) {
        console.error("Error generating PDF:", error);
        this.showAlert("danger", "Failed to generate PDF report.");
      }
    },
    getStatusText(status) {
      switch (status) {
        case 0:
          return "Active Employees";
        case 1:
          return "Separated Employees";
        case 2:
          return "All Employees";
        default:
          return "Unknown";
      }
    },
    getEmploymentStatus(employee) {
      console.log(employee);
      return employee.EmploymentStatus;
    },
  },
};
</script>

<style scoped>
.employee-checkbox {
  transform: scale(1.2);
}

.employee-checkbox:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Modern UI Styling */
.main-employee-card {
  border-radius: 16px;
  padding: 1.5rem;
  background: #ffffff;
}

.seamless-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fbff;
  border-radius: 12px;
  border: 1px solid #e9f2ff;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.action-group {
  display: flex;
  align-items: center;
}

.toolbar-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #5a6b8a;
  margin-left: 0.25rem;
}

.toolbar-v-divider {
  width: 1px;
  height: 30px;
  background: #dbe4ef;
}

.btn-elevated {
  box-shadow: 0 4px 12px rgba(40, 92, 204, 0.2);
  border-radius: 8px;
  font-weight: 600;
  padding: 0.4rem 1rem;
}

.btn-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.custom-check-primary ::v-deep .custom-control-label::before {
  border-color: #285ccc;
}
.custom-check-success ::v-deep .custom-control-label::before {
  border-color: #28a745;
}

.clickable-division {
  color: #285ccc;
  cursor: pointer;
  transition: all 0.2s;
}
.clickable-division:hover {
  text-decoration: underline;
}

.division-dropdown {
  width: 100%;
}

.dept-checkbox {
  margin-bottom: 0.5rem;
}

.div-checkbox {
  margin-bottom: 0.5rem;
}

.selected-departments {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-divisions {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.employee-page {
  position: fixed;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 90vw;
  bottom: 0;
  overflow-x: hidden;
  background: white;
  overflow-y: auto;
  z-index: 5;
  padding-top: 20px;
}

.employee-photo-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px;
}

.action-btn-group {
  display: flex;
  gap: 2px;
}

.employee-thumbnail {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.photo-placeholder-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  border: 2px solid #e0e0e0;
}

.status-circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
  display: inline-block;
  vertical-align: middle;
}

.status-circle.active {
  background-color: #28a745;
  box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.2);
}

.status-circle.separated {
  background-color: #dc3545;
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.2);
}

.employee-card {
  border-radius: 0;
  width: 100%;
  margin: 0;
}

.employee-navbar {
  min-height: 56px;
  background-color: #285ccc !important;
  color: #fff2bd !important;
}

.navbar-logo {
  height: 30px;
  width: auto;
  object-fit: contain;
}

.qr-code-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px;
}

.qr-code-wrapper {
  margin-bottom: 20px;
}

.qr-code-image {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px;
  background: white;
}

.qr-code-info {
  width: 100%;
}

.qr-code-link {
  margin-top: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  word-break: break-all;
}

.qr-code-link code {
  font-size: 11px;
  color: #007bff;
}

/* Multiple QR Codes grid */
.multi-qr-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 8px;
}

.multi-qr-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 14px 12px 10px;
  width: 160px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
  text-align: center;
}

.multi-qr-image {
  width: 120px;
  height: 120px;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 4px;
  background: #fff;
  margin-bottom: 8px;
}

.multi-qr-name {
  font-size: 11px;
  font-weight: 600;
  color: #333;
  word-break: break-word;
  line-height: 1.3;
  margin-bottom: 2px;
}

.multi-qr-empno {
  font-size: 10px;
  margin-bottom: 6px;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #dee2e6;
  flex-shrink: 0;
}

/* Staff detail modal (hrment-style) */
.emp-staff-modal-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
}

.emp-staff-modal {
  background: #f5f6f8;
  min-height: 200px;
}

.emp-staff-summary-card {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 20px 28px;
  margin: 20px 20px 0;
  padding: 24px 28px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1px solid #eceef2;
}

.emp-staff-summary-avatar {
  flex-shrink: 0;
  width: 112px;
  height: 112px;
  border-radius: 4px;
  overflow: hidden;
  background: #eef1f6;
  border: 1px solid #e2e6ed;
}

.emp-staff-summary-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
  width: 112px;
  height: 112px;
}

.emp-staff-summary-avatar-wrapper .emp-staff-summary-avatar {
  width: 100%;
  height: 100%;
}

.emp-staff-avatar-upload-btn {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid #fff;
  background: #4a90d9;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  z-index: 2;
  transition: background 0.2s;
}

.emp-staff-avatar-upload-btn:hover {
  background: #357abd;
}

.emp-staff-summary-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.emp-staff-summary-initials {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  color: #6b7280;
}

.emp-staff-summary-main {
  flex: 1;
  min-width: 200px;
}

.emp-staff-summary-name {
  margin: 0 0 8px;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.emp-staff-summary-role {
  margin: 0 0 12px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1877f2;
  line-height: 1.4;
}

.emp-staff-summary-status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.emp-staff-summary-status.is-active {
  background: #e8f4ff;
  color: #1877f2;
}

.emp-staff-summary-status.is-separated {
  background: #fef2f2;
  color: #b91c1c;
}

.emp-staff-summary-meta {
  flex: 1 1 260px;
  min-width: 220px;
}

.emp-staff-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 24px;
}

.emp-staff-meta-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.emp-staff-meta-label {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
}

.emp-staff-meta-value {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 600;
  word-break: break-word;
}

.emp-staff-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  margin: 0 20px;
  padding: 0 4px;
  border-bottom: 1px solid #e5e7eb;
  background: #f5f6f8;
}

.emp-staff-tab {
  position: relative;
  border: none;
  background: transparent;
  padding: 14px 18px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease;
}

.emp-staff-tab:hover {
  color: #1877f2;
  background: rgba(24, 119, 242, 0.06);
}

.emp-staff-tab--active {
  color: #1877f2;
  background: rgba(24, 119, 242, 0.08);
}

.emp-staff-tab--active::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 3px;
  background: #1877f2;
  border-radius: 3px 3px 0 0;
}

.emp-staff-panel-wrap {
  padding: 16px 20px 8px;
}

.emp-staff-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 16px;
  align-items: start;
}

@media (max-width: 991px) {
  .emp-staff-layout {
    grid-template-columns: 1fr;
  }

  .emp-staff-col--side {
    order: -1;
  }
}

.emp-staff-layout--stack {
  grid-template-columns: 1fr;
}

.emp-staff-layout--split {
  grid-template-columns: 1fr 1fr;
}

@media (max-width: 767px) {
  .emp-staff-layout--split {
    grid-template-columns: 1fr;
  }

  .emp-staff-meta-grid {
    grid-template-columns: 1fr;
  }
}

.emp-staff-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eceef2;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}

.emp-staff-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 0;
}

.emp-staff-card-head h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
}

.emp-staff-card-body {
  padding: 16px 20px 20px;
}

.emp-staff-card-body--stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.emp-staff-kv-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 28px;
}

.emp-staff-kv-grid--wide {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

@media (max-width: 600px) {
  .emp-staff-kv-grid,
  .emp-staff-kv-grid--wide {
    grid-template-columns: 1fr;
  }
}

.emp-staff-kv {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.emp-staff-kv-label {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
}

.emp-staff-kv-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.45;
  word-break: break-word;
}

.emp-staff-kv-full {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.emp-staff-text-success {
  color: #059669;
}

.emp-staff-text-danger {
  color: #dc2626;
}

.emp-footer {
  padding: 16px 20px;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  text-align: right;
}

.emp-footer--split {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  text-align: left;
}

/* ===== Quick Edit Modal – Professional Sectioned Layout ===== */

.sqe-container {
  padding: 0;
}

.sqe-form {
  padding: 0;
}

/* Section wrapper */
.sqe-section {
  border-bottom: 1px solid #f0f2f5;
}

.sqe-section:last-child {
  border-bottom: none;
}

.sqe-section-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem 1.5rem 0;
}

.sqe-section-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.sqe-section-icon--blue {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}

.sqe-section-icon--red {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.sqe-section-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0;
  font-family: font_M, sans-serif;
}

.sqe-section-body {
  padding: 0.75rem 1.5rem 1.25rem;
}

/* Grid layouts */
.sqe-form-grid {
  display: grid;
  gap: 0.75rem 1rem;
}

.sqe-form-grid--2col {
  grid-template-columns: 1fr 1fr;
}

.sqe-form-grid--3col {
  grid-template-columns: 1fr 1fr 1fr;
}

.sqe-form-grid ::v-deep .form-group {
  margin-bottom: 0;
  text-align: left;
}

.sqe-text-left {
  text-align: left;
}

.sqe-text-left ::v-deep .form-group label {
  text-align: left;
}

.sqe-form-grid ::v-deep .form-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.3rem;
}

.sqe-form-grid ::v-deep .form-control,
.sqe-form-grid ::v-deep .custom-select {
  font-size: 0.875rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 0.4rem 0.75rem;
  height: 38px;
  color: #1f2937;
  background-color: #fff;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.sqe-form-grid ::v-deep .form-control:focus,
.sqe-form-grid ::v-deep .custom-select:focus {
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

/* vue-select inside quick edit */
.sqe-vselect {
  display: block;
}

.sqe-vselect ::v-deep .vs__dropdown-toggle {
  min-height: 38px;
  padding: 0.25rem 0.625rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #fff;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.sqe-vselect ::v-deep .vs__selected-options {
  flex-wrap: wrap;
  padding: 0;
}

.sqe-vselect ::v-deep .vs__search,
.sqe-vselect ::v-deep .vs__search:focus {
  margin: 0;
  padding: 0.1rem 0;
  font-size: 0.875rem;
}

.sqe-vselect ::v-deep .vs__actions {
  padding-top: 0;
}

.sqe-vselect ::v-deep .vs__dropdown-menu {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  z-index: 1060;
}

.sqe-vselect ::v-deep .vs__dropdown-option {
  font-size: 0.875rem;
  padding: 0.45rem 0.75rem;
}

.sqe-vselect ::v-deep .vs__dropdown-option--highlight {
  background: #eff6ff;
  color: #1d4ed8;
}

.sqe-vselect.vs--open ::v-deep .vs__dropdown-toggle {
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

/* Footer */
.staff-quick-edit-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  width: 100%;
}

/* Modal chrome overrides */
::v-deep .staff-quick-edit-modal .modal-body {
  padding: 0 !important;
  background: #fafbfc;
}

::v-deep .staff-quick-edit-modal .modal-footer {
  padding: 0.75rem 1.5rem 1rem !important;
  border-top: 1px solid #f0f2f5;
  background: #fff;
  justify-content: flex-end;
}

::v-deep .staff-quick-edit-modal .modal-dialog.modal-lg {
  max-width: min(620px, calc(100vw - 2rem));
}

/* Responsive: stack to single column on narrow screens */
@media (max-width: 576px) {
  .sqe-form-grid--2col,
  .sqe-form-grid--3col {
    grid-template-columns: 1fr;
  }

  .sqe-section-header {
    padding-left: 1rem;
  }

  .sqe-section-body {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

/* Staff detail modal: same vertical anchor (near top); short content sits higher, tall content grows downward with scroll */
::v-deep .emp-staff-modal-root.modal {
  align-items: flex-start !important;
  justify-content: center;
  padding-top: clamp(0.75rem, 3vh, 2rem);
  padding-bottom: 1rem;
}

::v-deep .emp-staff-modal-root .emp-staff-modal-dialog.modal-dialog {
  margin: 0 auto 1rem !important;
  max-width: min(1080px, 96vw);
  width: 100%;
  max-height: calc(100vh - clamp(1.5rem, 4vh, 3rem));
  display: flex;
  flex-direction: column;
}

::v-deep .emp-staff-modal-root .emp-staff-modal-content.modal-content {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  box-shadow: 0 20px 50px rgba(17, 24, 39, 0.15);
  max-height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

::v-deep .emp-staff-modal-root .emp-staff-modal-content .modal-body {
  padding: 0;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  background: #f5f6f8;
}

/* Wider modal + scoped chrome for staff detail only */
::v-deep .emp-staff-modal-header {
  background: #fff !important;
  color: #111827 !important;
  border-bottom: 1px solid #e5e7eb !important;
  padding: 14px 20px !important;
}

::v-deep .emp-staff-modal-header .close {
  color: #6b7280 !important;
  opacity: 1 !important;
  text-shadow: none !important;
}

::v-deep .modal-content {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

::v-deep .modal-header {
  background: #267bff;
  color: white;
  border: none;
  padding: 20px 30px;
}

::v-deep .modal-body {
  padding: 0;
  max-height: 80vh;
  overflow-y: auto;
}

.office-filter-group {
  min-width: 320px;
}

.office-dropdown {
  width: 100%;
}

.office-dropdown ::v-deep .btn,
.type-dropdown ::v-deep .btn {
  width: 100%;
  justify-content: space-between;
}

.dropdown-action-row {
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem 1rem;
  border-bottom: 1px solid #eef0f2;
  margin-bottom: 0.25rem;
}

.dropdown-action-row .btn-link {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  text-decoration: none;
}

.dropdown-action-row .btn-link:hover {
  text-decoration: underline;
}

/* Signature Upload */
.signature-preview-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.signature-preview-img {
  max-width: 240px;
  max-height: 80px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 8px;
  background: #fafafa;
  object-fit: contain;
}

.signature-view-img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background: #fafafa;
}

/* Signature Upload Modal */
.signature-modal-body {
  padding: 1.25rem;
}

.signature-modal-preview {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.signature-modal-preview img {
  max-width: 100%;
  max-height: 200px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  background: #fafafa;
  object-fit: contain;
}

/* Signature Pad: mode toggle */
.sig-mode-toggle {
  display: flex;
  gap: 0;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.sig-mode-btn {
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  background: #f9fafb;
  color: #6b7280;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sig-mode-btn + .sig-mode-btn {
  border-left: 1px solid #e5e7eb;
}

.sig-mode-btn--active {
  background: #2563eb;
  color: #fff;
}

.sig-mode-btn:not(.sig-mode-btn--active):hover {
  background: #f3f4f6;
}

/* Canvas drawing area */
.sig-draw-area {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sig-canvas-wrapper {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
  transition: border-color 0.15s;
}

.sig-canvas-wrapper:hover {
  border-color: #93c5fd;
}

.sig-canvas {
  display: block;
  width: 100%;
  height: 180px;
  cursor: crosshair;
  touch-action: none;
}

.sig-draw-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Upload area */
.sig-upload-area {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.profile-crop-section {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-crop-circle {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #4a90d9;
  position: relative;
  cursor: grab;
  background: #e9ecef;
  user-select: none;
}

.profile-crop-circle:active {
  cursor: grabbing;
}

.profile-crop-preview img {
  width: 220px;
  height: 220px;
  object-fit: cover;
  border: 1px solid #e2e6ed;
  border-radius: 4px;
  display: block;
}

.profile-crop-actions {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}
</style>
