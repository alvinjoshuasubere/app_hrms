<template>
  <div>
    <Loading v-if="showLoading" />
    <b-navbar
      toggleable="lg"
      type="dark"
      variant="dark"
      fixed="top"
      class="employee-navbar"
    >
      <b-navbar-brand>
        <img src="/city_logo.png" alt="City Logo" class="navbar-logo mr-2" />
        HRMS
      </b-navbar-brand>
      <b-navbar-nav class="ml-auto">
        <b-button
          variant="outline-light"
          size="sm"
          @click="logout"
          class="ml-2"
        >
          <font-awesome-icon icon="power-off" class="editIcon mr-2" small />
          Logout
        </b-button>
      </b-navbar-nav>
    </b-navbar>

    <div class="employee-page">
      <b-row>
        <b-col cols="12">
          <!-- <h6 class="ml-4" style="font-weight: bolder; font-family: font_B">
            <font-awesome-icon icon="users" class="editIcon mr-2" small />List
            of Employees
          </h6> -->

          <b-card class="cardProfile mainContent employee-card">
            <b-row>
              <b-col cols="4">
                <b-form-group class="searchbar" label-size="sm">
                  <b-input-group size="md">
                    <b-form-input
                      type="search"
                      id="inputSearch"
                      size="sm"
                      class="searchbar no-outline"
                      placeholder="Search employees"
                      v-model="searchText"
                    ></b-form-input>
                    <b-input-group-append>
                      <b-button
                        class="buttonClearSearch"
                        id="buttonClearSearch"
                        size="sm"
                        :disabled="!searchText"
                        @click="clearSearch"
                      >
                        Clear
                      </b-button>
                    </b-input-group-append>
                  </b-input-group>
                </b-form-group>
              </b-col>
              <b-col cols="3">
              <b-form-group>
                <b-input-group size="sm">
                  <b-input-group-prepend is-text>
                    <i class="fas fa-filter mr-1"></i> Status
                  </b-input-group-prepend>

                  <b-form-select
                    v-model="selectedStatus"
                    :options="statusOptions"
                    @change="onStatusChange"
                  ></b-form-select>
                </b-input-group>
              </b-form-group>
              </b-col>
              <b-col cols="3">
                <b-form-group>
                  <b-dropdown size="sm" variant="outline-secondary" text="Departments" class="department-dropdown">
                    <b-dropdown-form style="max-height: 200px; overflow-y: auto;">
                      <b-form-checkbox
                        v-for="dept in sortedDepartments"
                        :key="dept.deptdesc"
                        v-model="selectedDepartments"
                        :value="dept.deptdesc"
                        @change="onDepartmentChange"
                        class="dept-checkbox"
                      >
                        {{ dept.deptdesc }}
                      </b-form-checkbox>
                    </b-dropdown-form>
                  </b-dropdown>
                  <div v-if="selectedDepartments.length > 0" class="selected-departments mt-1">
                    <small class="text-muted">
                      Selected: {{ selectedDepartments.join(', ') }}
                
                    </small>
                  </div>
                </b-form-group>
              </b-col>
              <b-col cols="2">
                <b-form-group>
                  <b-dropdown size="sm" variant="outline-secondary" text="Status" class="employment-status-dropdown">
                    <b-dropdown-form style="max-height: 200px; overflow-y: auto;">
                      <b-form-checkbox
                        v-for="status in employmentStatusOptions"
                        :key="status"
                        v-model="selectedEmploymentStatuses"
                        :value="status"
                        @change="onEmploymentStatusChange"
                        class="emp-status-checkbox"
                      >
                        {{ status }}
                      </b-form-checkbox>
                    </b-dropdown-form>
                  </b-dropdown>
                  <div v-if="selectedEmploymentStatuses.length > 0" class="selected-employment-statuses mt-1">
                    <small class="text-muted">
                      Selected: {{ selectedEmploymentStatuses.join(', ') }}
                    </small>
                  </div>
                </b-form-group>
              </b-col>
            </b-row>

            <!-- Select All Controls -->
            <b-row class="mb-2">
              <b-col class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                  <b-form-checkbox 
                    :indeterminate="isPartiallySelected"
                    :checked="isAllSelected"
                    @change="toggleSelectAll"
                    :disabled="filteredEmployees.filter(emp => !emp.isseparated).length === 0"
                    class="select-all-checkbox mr-3"
                  >
                    Select All
                  </b-form-checkbox>
                  <small class="text-muted mr-3">
                    {{ selectedEmployees.length }} of {{ filteredEmployees.filter(emp => !emp.isseparated).length }} selected
                  </small>
                  <b-button 
                    size="sm" 
                    variant="primary" 
                    @click="confirmUpdateToSeparated"
                    :disabled="selectedEmployees.length === 0"
                  >
                  <font-awesome-icon icon="pen-to-square" class="mr-1" />
                    Update to Separated
                  </b-button>
                </div>
                <b-button 
                  size="sm" 
                  variant="dark" 
                  @click="generatePDFReport"
                   v-b-tooltip.noninteractive.hover
                  title="Generate PDF Report"
                >
                <font-awesome-icon icon="file-pdf"/>
                </b-button>
              </b-col>
            </b-row>

            
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
              <template v-slot:cell(selected)="row">
                <div
                  class="d-flex justify-content-center align-items-center h-100"
                >
                  <b-form-checkbox
                    :checked="row.item.isseparated"
                    @change="toggleEmployeeSelection(row.item)"
                    class="employee-checkbox"
                  />
                </div>
              </template>
              <template v-slot:cell(image)="row">
                <div class="employee-photo-cell">
                  <img
                    :src="row.item.photo_url || '/user.jpg'"
                    :alt="row.item.fullname"
                    class="employee-thumbnail"
                    @error="handleImageError"
                  />
                </div>
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
                <!-- <b-button
                  size="sm"
                 variant="primary"
                  class="tableButton"
                  @click="openEditModal(row.item)"
                  v-b-tooltip.noninteractive.hover
                  title="Update Employee"
                >
                  <font-awesome-icon icon="pen-to-square" />
                </b-button> 
                  <b-button
                  size="sm"
                  variant="dark"
                  class="tableButton"
                  @click="generateCard(row.item)"
                   v-b-tooltip.noninteractive.hover
                  title="Generate Card"
                >
                  <font-awesome-icon icon="credit-card" />
                </b-button>-->
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
            :src="`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${formDriver.empno}&bgcolor=ffffff&color=000000`"
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
          <div class="emp-staff-summary-avatar">
            <img
              v-if="employeeDetails.photo_url && !profilePhotoFailed"
              :src="employeeDetails.photo_url"
              :alt="employeeDetails.fullname"
              @error="profilePhotoFailed = true"
            />
            <div v-else class="emp-staff-summary-initials">
              {{ getInitials(employeeDetails.fullname) }}
            </div>
          </div>
          <div class="emp-staff-summary-main">
            <h1 class="emp-staff-summary-name">{{ employeeDetails.fullname }}</h1>
            <p class="emp-staff-summary-role">
              {{ employeeDetails.position_desc }} | {{ employeeDetails.deptdesc }}
            </p>
            <span
              class="emp-staff-summary-status"
              :class="!employeeDetails.isseparated ? 'is-active' : 'is-separated'"
            >
              {{ !employeeDetails.isseparated ? "Active" : "Separated" }}
            </span>
          </div>
          <div class="emp-staff-summary-meta">
            <div class="emp-staff-meta-grid">
              <div class="emp-staff-meta-block">
                <span class="emp-staff-meta-label">Employee ID</span>
                <span class="emp-staff-meta-value">{{ employeeDetails.empno }}</span>
              </div>
              <div class="emp-staff-meta-block">
                <span class="emp-staff-meta-label">Account</span>
                <span class="emp-staff-meta-value">{{ employeeDetails.email || "—" }}</span>
              </div>
              <div class="emp-staff-meta-block">
                <span class="emp-staff-meta-label">Phone number</span>
                <span class="emp-staff-meta-value">{{ employeeDetails.cell_no || "—" }}</span>
              </div>
              <div class="emp-staff-meta-block">
                <span class="emp-staff-meta-label">Email</span>
                <span class="emp-staff-meta-value">{{ employeeDetails.email || "—" }}</span>
              </div>
            </div>
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
                      <span class="emp-staff-kv-value">{{ employeeDetails.genderdesc || "—" }}</span>
                    </div>
                    <div class="emp-staff-kv">
                      <span class="emp-staff-kv-label">Date of birth</span>
                      <span class="emp-staff-kv-value">{{ formatDate(employeeDetails.birthdate) || "—" }}</span>
                    </div>
                    <div class="emp-staff-kv">
                      <span class="emp-staff-kv-label">Birth place</span>
                      <span class="emp-staff-kv-value">{{ employeeDetails.birthplace || "—" }}</span>
                    </div>
                    <div class="emp-staff-kv">
                      <span class="emp-staff-kv-label">Civil status</span>
                      <span class="emp-staff-kv-value">{{ employeeDetails.civilstatusdesc || "—" }}</span>
                    </div>
                    <div class="emp-staff-kv">
                      <span class="emp-staff-kv-label">Citizenship</span>
                      <span class="emp-staff-kv-value">{{ employeeDetails.citizenshipdesc || "—" }}</span>
                    </div>
                    <div class="emp-staff-kv">
                      <span class="emp-staff-kv-label">Age</span>
                      <span class="emp-staff-kv-value">{{ getAge(employeeDetails.birthdate) }}</span>
                    </div>
                  </div>
                  <div class="emp-staff-kv-full">
                    <span class="emp-staff-kv-label">Permanent address</span>
                    <span class="emp-staff-kv-value">{{ formatCompleteAddress() || "—" }}</span>
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
                    <span class="emp-staff-kv-value">{{ formatDate(employeeDetails.datehired) || "—" }}</span>
                  </div>
                  <div class="emp-staff-kv">
                    <span class="emp-staff-kv-label">Years of service</span>
                    <span class="emp-staff-kv-value">{{ getYearsOfService(employeeDetails.datehired) }}</span>
                  </div>
                  <div class="emp-staff-kv">
                    <span class="emp-staff-kv-label">Regularized</span>
                    <span class="emp-staff-kv-value">{{ formatDate(employeeDetails.regularized) || "—" }}</span>
                  </div>
                  <div class="emp-staff-kv">
                    <span class="emp-staff-kv-label">Separated</span>
                    <span class="emp-staff-kv-value">{{ formatDate(employeeDetails.separated) || "—" }}</span>
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
                    <span class="emp-staff-kv-value">{{ employeeDetails.deptdesc || "—" }}</span>
                  </div>
                  <div class="emp-staff-kv">
                    <span class="emp-staff-kv-label">Position</span>
                    <span class="emp-staff-kv-value">{{ employeeDetails.position_desc || "—" }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab: Work information -->
          <div v-show="employeeDetailTab === 1" class="emp-staff-layout emp-staff-layout--stack">
            <div class="emp-staff-card">
              <div class="emp-staff-card-head">
                <h3>Work information</h3>
              </div>
              <div class="emp-staff-card-body">
                <div class="emp-staff-kv-grid emp-staff-kv-grid--wide">
                  <div class="emp-staff-kv">
                    <span class="emp-staff-kv-label">Employee ID</span>
                    <span class="emp-staff-kv-value">{{ employeeDetails.empno }}</span>
                  </div>
                  <div class="emp-staff-kv">
                    <span class="emp-staff-kv-label">Status</span>
                    <span
                      class="emp-staff-kv-value"
                      :class="!employeeDetails.isseparated ? 'emp-staff-text-success' : 'emp-staff-text-danger'"
                    >
                      {{ !employeeDetails.isseparated ? "Active" : "Separated" }}
                    </span>
                  </div>
                  <div class="emp-staff-kv">
                    <span class="emp-staff-kv-label">Department</span>
                    <span class="emp-staff-kv-value">{{ employeeDetails.deptdesc || "—" }}</span>
                  </div>
                  <div class="emp-staff-kv">
                    <span class="emp-staff-kv-label">Position</span>
                    <span class="emp-staff-kv-value">{{ employeeDetails.position_desc || "—" }}</span>
                  </div>
                  <div class="emp-staff-kv">
                    <span class="emp-staff-kv-label">Date hired</span>
                    <span class="emp-staff-kv-value">{{ formatDate(employeeDetails.datehired) || "—" }}</span>
                  </div>
                  <div class="emp-staff-kv">
                    <span class="emp-staff-kv-label">Regularized</span>
                    <span class="emp-staff-kv-value">{{ formatDate(employeeDetails.regularized) || "—" }}</span>
                  </div>
                  <div class="emp-staff-kv">
                    <span class="emp-staff-kv-label">Separated date</span>
                    <span class="emp-staff-kv-value">{{ formatDate(employeeDetails.separated) || "—" }}</span>
                  </div>
                  <div class="emp-staff-kv">
                    <span class="emp-staff-kv-label">Years of service</span>
                    <span class="emp-staff-kv-value">{{ getYearsOfService(employeeDetails.datehired) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab: Contact & IDs -->
          <div v-show="employeeDetailTab === 2" class="emp-staff-layout emp-staff-layout--split">
            <div class="emp-staff-card">
              <div class="emp-staff-card-head">
                <h3>Contact information</h3>
              </div>
              <div class="emp-staff-card-body emp-staff-card-body--stack">
                <div class="emp-staff-kv">
                  <span class="emp-staff-kv-label">Email</span>
                  <span class="emp-staff-kv-value">{{ employeeDetails.email || "—" }}</span>
                </div>
                <div class="emp-staff-kv">
                  <span class="emp-staff-kv-label">Phone</span>
                  <span class="emp-staff-kv-value">{{ employeeDetails.cell_no || "—" }}</span>
                </div>
                <div class="emp-staff-kv-full">
                  <span class="emp-staff-kv-label">Address</span>
                  <span class="emp-staff-kv-value">{{ formatCompleteAddress() || "—" }}</span>
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
                  <span class="emp-staff-kv-value">{{ employeeDetails.tin || "—" }}</span>
                </div>
                <div class="emp-staff-kv">
                  <span class="emp-staff-kv-label">PhilHealth</span>
                  <span class="emp-staff-kv-value">{{ employeeDetails.philhealth_no || "—" }}</span>
                </div>
                <div class="emp-staff-kv">
                  <span class="emp-staff-kv-label">SSS</span>
                  <span class="emp-staff-kv-value">{{ employeeDetails.sss_no || "—" }}</span>
                </div>
                <div class="emp-staff-kv">
                  <span class="emp-staff-kv-label">GSIS</span>
                  <span class="emp-staff-kv-value">{{ employeeDetails.sss_gsis_no || "—" }}</span>
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
      title="Edit assignment"
      header-class="hrmsColor"
      modal-class="staff-quick-edit-modal"
      size="lg"
      centered
      body-class="p-0"
      @hidden="staffQuickEditForm = null"
    >
      <div v-if="staffQuickEditForm" class="staff-quick-edit text-left">
        <p class="staff-quick-edit-hint text-muted small">
          You can change department, division, position, and status here. More fields will be added later.
        </p>
        <b-form
          class="staff-quick-edit-fields"
          @submit.prevent="saveStaffQuickEdit"
        >
          <b-form-group label="Department" label-for="sqe-dept">
            <v-select
              id="sqe-dept"
              v-model="staffQuickEditForm.deptdesc"
              :options="staffDeptOptionsForVueSelect"
              placeholder="Select department"
              :clearable="true"
              :searchable="true"
              :append-to-body="true"
              class="staff-quick-dept-vselect"
            />
          </b-form-group>
          <b-form-group label="Division" label-for="sqe-div">
            <b-form-input
              id="sqe-div"
              v-model="staffQuickEditForm.divisiondesc"
              placeholder="Division (optional)"
            />
          </b-form-group>
          <b-form-group label="Position" label-for="sqe-pos">
            <b-form-input
              id="sqe-pos"
              v-model="staffQuickEditForm.position_desc"
              placeholder="Job title / position"
            />
          </b-form-group>
          <b-form-group label="Separation status" label-for="sqe-sep">
            <b-form-select
              id="sqe-sep"
              v-model="staffQuickEditForm.separation"
              :options="staffSeparationSelectOptions"
            />
          </b-form-group>
          <b-form-group label="Employment status" label-for="sqe-empst">
            <b-form-select
              id="sqe-empst"
              v-model="staffQuickEditForm.employmentStatus"
              :options="staffEmploymentStatusSelectOptions"
            />
          </b-form-group>
        </b-form>
      </div>
      <template #modal-footer>
        <div class="staff-quick-edit-footer">
          <b-button size="sm" variant="outline-secondary" @click="showStaffQuickEditModal = false">
            Cancel
          </b-button>
          <b-button size="sm" variant="primary" :disabled="!staffQuickEditForm" @click="saveStaffQuickEdit">
            <font-awesome-icon icon="save" class="mr-1" />
            Save
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
          <img :src="qrCodeUrl" alt="Employee QR Code" class="qr-code-image" />
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
          <font-awesome-icon icon="exclamation-triangle" style="font-size: 15px; color: #ffc107;" />
          <span style="font-size: 14px; font-weight: 600">Confirm Batch Update</span>
        </div>
      </template>

      <div class="confirm-modal-content">
        <div class="confirm-icon">
          <font-awesome-icon icon="users" />
        </div>
        
        <div class="confirm-message">
          <h5>Update Employee Status</h5>
          <p>Are you sure you want to set <strong>{{ selectedEmployees.length }}</strong> employee(s) to <strong>Separated</strong> status?</p>
          
          <div class="employee-list" v-if="selectedEmployees.length <= 5">
            <div class="employee-item" v-for="employee in selectedEmployees.slice(0, 5)" :key="employee.empid">
              <font-awesome-icon icon="user" class="item-icon" />
              <span>{{ employee.fullname }} ({{ employee.empno }})</span>
            </div>
          </div>
        
          
          <div class="warning-box">
            <font-awesome-icon icon="exclamation-triangle" class="warning-icon" />
            <span>This action will update the employment status and cannot be easily undone.</span>
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
          <font-awesome-icon icon="spinner" v-if="isUpdating" spin class="mr-1" />
          <font-awesome-icon icon="check" v-else class="mr-1" />
          {{ isUpdating ? 'Updating...' : 'Yes' }}
        </b-button>
      </template>
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

export default {
  components: { Loading, vSelect },
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
      selectedEmploymentStatuses: [],
      employmentStatusOptions: ['Permanent', 'Job Order ', 'Elected', 'Co-terminous', 'Casual'],
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
      qrCodeEmployee: null,
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
      showStaffQuickEditModal: false,
      staffQuickEditForm: null,
      selectedEmployees: [],
      selectAllChecked: false,
      showConfirmModal: false,
      isUpdating: false,
      fields: [
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
          key: "selected",
          label: "Set to Separated",
          sortable: false,
          class: "text-center",
        },
        {
          key: "isseparated",
          label: "Status",
          sortable: false,
          class: "text-left",
        },
        { key: "actions", label: "Actions", sortable: false },
      ],
    };
  },
  created() {
    this.fetchDepartments();
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

      if (this.selectedEmploymentStatuses.length > 0) {
        filtered = filtered.filter((employee) =>
          this.selectedEmploymentStatuses.includes(employee.EmploymentStatus)
        );
      }

      return filtered;
    },
    isAllSelected() {
      // Only consider employees that are not already separated
      const eligibleEmployees = this.filteredEmployees.filter(emp => !emp.isseparated);
      if (eligibleEmployees.length === 0) return false;
      return eligibleEmployees.every(emp => 
        this.selectedEmployees.some(selected => selected.empid === emp.empid)
      );
    },
    isPartiallySelected() {
      // Only consider employees that are not already separated
      const eligibleEmployees = this.filteredEmployees.filter(emp => !emp.isseparated);
      if (eligibleEmployees.length === 0) return false;
      const selectedCount = eligibleEmployees.filter(emp => 
        this.selectedEmployees.some(selected => selected.empid === emp.empid)
      ).length;
      return selectedCount > 0 && selectedCount < eligibleEmployees.length;
    },
    filteredTotalRows() {
      return this.filteredEmployees.length;
    },
    sortedDepartments() {
      return this.departments.slice().sort((a, b) =>
        a.deptdesc.localeCompare(b.deptdesc)
      );
    },
    staffSeparationSelectOptions() {
      return [
        { value: "active", text: "Active" },
        { value: "separated", text: "Separated" },
      ];
    },
    /** Department labels for vue-select (string options = v-model is deptdesc) */
    staffDeptOptionsForVueSelect() {
      const names = this.sortedDepartments.map((d) => d.deptdesc).filter(Boolean);
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
      return [
        { value: "", text: "— Select employment status —" },
        ...opts,
      ];
    },
    employeeProfileLink() {
      if (!this.qrCodeEmployee) return "";
      return `https://employee.koronadalcityonlineservices.com/${this.qrCodeEmployee.empid}`;
    },
    qrCodeUrl() {
      if (!this.qrCodeEmployee) return "";
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        this.employeeProfileLink
      )}&bgcolor=ffffff&color=000000`;
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
      const empSt = e.EmploymentStatus != null ? String(e.EmploymentStatus) : "";
      this.staffQuickEditForm = {
        empid: e.empid,
        empno: e.empno,
        deptdesc: e.deptdesc || "",
        divisiondesc:
          e.divisiondesc || e.division_desc || e.division || "",
        position_desc: e.position_desc || "",
        separation: e.isseparated ? "separated" : "active",
        employmentStatus: empSt,
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
      if (!f.deptdesc) {
        this.showAlert("Please select a department.", "warning");
        return;
      }
      if (!f.position_desc || !String(f.position_desc).trim()) {
        this.showAlert("Please enter a position.", "warning");
        return;
      }
      try {
        this.showLoading = true;
        await axios({
          method: "PUT",
          url: `${this.$axios.defaults.baseURL}/employees/update/${f.empid}`,
          data: {
            empid: f.empid,
            empno: f.empno,
            deptdesc: f.deptdesc,
            divisiondesc: f.divisiondesc
              ? String(f.divisiondesc).trim()
              : "",
            position_desc: String(f.position_desc).trim(),
            isseparated: f.separation === "separated",
            EmploymentStatus: f.employmentStatus
              ? String(f.employmentStatus).trim()
              : "",
          },
        });
        this.showAlert("Assignment updated successfully.", "success");
        this.showStaffQuickEditModal = false;
        this.staffQuickEditForm = null;
        await this.refetchEmployeeDetails();
        this.fetchEmployees();
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
    generateCard(row) {
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
      this.$bvModal.show("employee-id-modal");
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
      this.$bvModal.show("qr-code-modal");
    },
    async downloadQRCode() {
      if (!this.qrCodeEmployee) return;

      try {
        const response = await fetch(this.qrCodeUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `QR_Code_${this.qrCodeEmployee.fullname.replace(
          /\s+/g,
          "_"
        )}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showAlert("QR Code downloaded successfully!","success");
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
    onDepartmentChange() {
      this.currentPage = 1;
      this.fetchEmployees();
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
          url: `${this.$axios.defaults.baseURL}/admin/departments/get-all`,
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
    toggleEmployeeSelection(employee) {
      // Toggle the isseparated status
      employee.isseparated = !employee.isseparated;

      // Update selected employees array
      if (employee.isseparated) {
        // Add to selected employees if not already there
        if (
          !this.selectedEmployees.find((emp) => emp.empid === employee.empid)
        ) {
          this.selectedEmployees.push(employee);
        }
      } else {
        // Remove from selected employees
        this.selectedEmployees = this.selectedEmployees.filter(
          (emp) => emp.empid !== employee.empid
        );
      }

      // Update employee status via API
      this.updateEmployeeStatus(employee);
    },
    getSelectedSeparatedEmployees() {
      return this.selectedEmployees.filter((emp) => emp.isseparated);
    },
    selectAllSeparated() {
      // Get all separated employees
      const separatedEmployees = this.employees.filter(emp => emp.isseparated);
      
      // Clear current selection and add all separated employees
      this.selectedEmployees = [...separatedEmployees];
      
      // Select departments that have separated employees
      const separatedDeptNames = [...new Set(separatedEmployees.map(emp => emp.deptdesc))];
      this.selectedDepartments = separatedDeptNames;
      
      // Show alert
      this.showAlert(`Selected ${separatedEmployees.length} separated employees`, 'info');
    },
    async updateAllSelected() {
      if (this.selectedEmployees.length === 0) {
        this.showAlert('warning', 'Please select at least one employee first.');
        return;
      }

      try {
        this.showLoading = true;
        const res = await axios({
          method: "PUT",
          url: `${this.$axios.defaults.baseURL}/employees/update-separated/batch`,
          data: {
            employees: this.selectedEmployees.map(emp => ({
              empid: emp.empid,
              isseparated: true
            }))
          },
        });

        this.showAlert('success', `Successfully updated ${this.selectedEmployees.length} employees to Separated status!`);
        this.fetchEmployees(); // Refresh the table
      } catch (error) {
        console.error('Error batch updating employees:', error);
        const msg = error?.response?.data?.error || 'Failed to update employees.';
        this.showAlert('danger', msg);
      } finally {
        this.showLoading = false;
      }
    },
    toggleSelectAll(checked) {
      if (checked) {
        // Select only filtered employees that are not already separated/checked
        const unselectedEmployees = this.filteredEmployees.filter(emp => !emp.isseparated);
        this.selectedEmployees = [...unselectedEmployees];
        this.showAlert(`Selected ${unselectedEmployees.length} employees`, 'success');
      } else {
        // Deselect all
        this.selectedEmployees = [];
        this.showAlert('Deselected all employees', 'danger');
      }
    },
    confirmUpdateToSeparated() {
      if (this.selectedEmployees.length === 0) {
        this.showAlert('warning', 'Please select at least one employee first.');
        return;
      }

      this.showConfirmModal = true;
    },
    async updateAllToSeparated() {
      if (this.selectedEmployees.length === 0) {
        this.showAlert('warning', 'Please select at least one employee first.');
        return;
      }

      this.isUpdating = true;
      try {
        this.showLoading = true;
        
        const res = await axios({
          method: "PUT",
          url: `${this.$axios.defaults.baseURL}/employees/update-mult-toseparated`,
          data: {
            employeesSelected: this.selectedEmployees.map(emp => ({
              empid: emp.empid
            }))
          },
        });

        this.showAlert('success', `Successfully updated ${this.selectedEmployees.length} employees to Separated status!`);
        this.fetchEmployees(); // Refresh the table
        this.selectedEmployees = []; // Clear selection after update
        this.showConfirmModal = false; // Close modal
      } catch (error) {
        console.error('Error updating all employees to separated:', error);
        const msg = error?.response?.data?.error || 'Failed to update employees.';
        this.showAlert('danger', msg);
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
        
        // Use new API endpoint
        const res = await axios({
          method: "PUT",
          url: `${this.$axios.defaults.baseURL}/employees/batch-update-separated`,
          data: {
            employees: this.selectedEmployees.map(emp => emp.empid)
          },
        });

        this.showAlert('success', `Successfully updated ${this.selectedEmployees.length} employees to Separated status!`);
        this.fetchEmployees(); // Refresh the table
        this.selectedEmployees = []; // Clear selection after update
      } catch (error) {
        console.error('Error batch updating employees:', error);
        const msg = error?.response?.data?.error || 'Failed to update employees.';
        this.showAlert('danger', msg);
      } finally {
        this.showLoading = false;
      }
    },
    async updateEmployeeStatus(employee) {
      try {
        this.showLoading = true;
        const res = await axios({
          method: "PUT",
          url: `${this.$axios.defaults.baseURL}/employees/update-separated/${employee.empid}`,
          data: {
            empid: employee.empid,
            isseparated: employee.isseparated,
          },
        });

        this.showAlert(
          `${employee.fullname} status updated to ${
            employee.isseparated ? "Separated" : "Active"
          } successfully!`,  "success",
        );
        // Refresh the table to show updated data
        this.fetchEmployees();
      } catch (error) {
        console.error("Error updating employee status:", error);
        const msg =
          error?.response?.data?.error || "Failed to update employee status.";
        this.showAlert("danger", msg);
        employee.isseparated = !employee.isseparated;
        employee.selected = !employee.selected;
      } finally {
        this.showLoading = false;
      }
    },
    generatePDFReport() {
      if (this.filteredEmployees.length === 0) {
        this.showAlert('warning', 'No employees to generate report.');
        return;
      }

      try {
        // Initialize jsPDF
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(20);
        doc.text('List of Employees', 14, 20);
        
        // Add generation date
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
        
        // Add filter info
        doc.text(`Status Filter: ${this.getStatusText(this.selectedStatus)}`, 14, 37);
        doc.text(`Total Employees: ${this.filteredEmployees.length}`, 14, 44);
        
        // Prepare table data
        const tableData = this.filteredEmployees.map(emp => [
          emp.empno || '',
          emp.fullname || '',
          emp.position_desc || '',
          this.getEmploymentStatus(emp),
          emp.deptdesc || ''
        ]);
        
        // Add table
        doc.autoTable({
          head: [
            ['Employee No.', 'Name', 'Position', 'Status of Appointment', 'Office']
          ],
          body: tableData,
          startY: 55,
          styles: {
            fontSize: 9,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: 'black',
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          margin: { top: 55 }
        });
        
        // Save the PDF
        const fileName = `employee_report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        this.showAlert('success', 'PDF report generated successfully!');
      } catch (error) {
        console.error('Error generating PDF:', error);
        this.showAlert('danger', 'Failed to generate PDF report.');
      }
    },
    getStatusText(status) {
      switch(status) {
        case 0: return 'Active Employees';
        case 1: return 'Separated Employees';
        case 2: return 'All Employees';
        default: return 'Unknown';
      }
    },
    getEmploymentStatus(employee) {
      console.log(employee)
      return employee.EmploymentStatus
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

.department-dropdown {
  width: 100%;
}

.dept-checkbox {
  margin-bottom: 0.5rem;
}

.selected-departments {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.employee-page {
  position: fixed;
  top: 80px;
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

.employee-thumbnail {
  width: 40px;
  height: 40px;
  border-radius: 50%;
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
  border-radius: 50%;
  overflow: hidden;
  background: #eef1f6;
  border: 1px solid #e2e6ed;
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

.staff-quick-edit {
  padding: 0;
}

.staff-quick-edit-hint {
  margin: 0 1.25rem 1rem;
  line-height: 1.45;
}

.staff-quick-edit-fields {
  margin: 0 1.25rem;
  padding-bottom: 0.25rem;
}

.staff-quick-edit-fields ::v-deep .form-group {
  margin-bottom: 0.85rem;
}

.staff-quick-edit-fields ::v-deep .form-group:last-of-type {
  margin-bottom: 0;
}

/* vue-select: match Bootstrap form-control look inside quick edit */
.staff-quick-dept-vselect {
  display: block;
}

.staff-quick-dept-vselect ::v-deep .vs__dropdown-toggle {
  min-height: calc(1.5em + 0.75rem + 2px);
  padding: 0.2rem 0.55rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  background-color: #fff;
}

.staff-quick-dept-vselect ::v-deep .vs__selected-options {
  flex-wrap: wrap;
  padding: 0;
}

.staff-quick-dept-vselect ::v-deep .vs__search,
.staff-quick-dept-vselect ::v-deep .vs__search:focus {
  margin: 0;
  padding: 0.1rem 0;
}

.staff-quick-dept-vselect ::v-deep .vs__actions {
  padding-top: 0;
}

.staff-quick-dept-vselect ::v-deep .vs__dropdown-menu {
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
  z-index: 1060;
}

.staff-quick-dept-vselect.vs--open ::v-deep .vs__dropdown-toggle {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.15);
}

.staff-quick-edit-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  width: 100%;
}

/* Quick edit modal: full-width body, horizontal inset only on content */
::v-deep .staff-quick-edit-modal .modal-body {
  padding: 0.75rem 0 0 !important;
}

::v-deep .staff-quick-edit-modal .modal-footer {
  padding: 0.75rem 1.25rem 1rem !important;
  border-top: 1px solid #e9ecef;
  justify-content: flex-end;
}

::v-deep .staff-quick-edit-modal .modal-dialog.modal-lg {
  max-width: min(560px, calc(100vw - 2rem));
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
</style>
