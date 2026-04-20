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
      <b-navbar-brand>HRMS</b-navbar-brand>
      <b-navbar-nav class="ml-auto">
        <b-nav-item @click="logout">Logout</b-nav-item>
      </b-navbar-nav>
    </b-navbar>

    <div class="employee-page">
      <b-row no-gutters class="w-100 text-left">
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
                  <b-form-select
                    size="sm"
                    v-model="selectedStatus"
                    :options="statusOptions"
                    @change="onStatusChange"
                  ></b-form-select>
                </b-form-group>
              </b-col>
              <b-col cols="3">
                <b-form-group>
                  <b-form-select
                    size="sm"
                    v-model="selectedDepartment"
                    :options="departmentOptions"
                    @change="onDepartmentChange"
                  ></b-form-select>
                </b-form-group>
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
              :items="employees"
              :fields="fields"
              :sticky-header="tableHeight"
              empty-text="No employees found"
            >
              <template v-slot:cell(actions)="row">
                <b-button
                  size="sm"
                  variant="outline-primary"
                  @click="viewEmployee(row.item.empid)"
                  class="mr-2"
                >
                  <font-awesome-icon icon="eye" class="mr-1" />
                  View
                </b-button>
                  <b-button
                  size="sm"
                  variant="outline-primary"
                  @click="generateCard(row.item)"
                  class="mr-2"
                >
                  <font-awesome-icon icon="eye" class="mr-1" />
                  Generate Card
                </b-button>
              </template>
              <template v-slot:table-caption>
                <b-row align-h="end">
                  <b-col cols="6">{{ bottomLabel }}</b-col>
                  <b-col cols="6">
                    <b-pagination
                      v-model="currentPage"
                      :total-rows="totalRows"
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
    <template v-slot:modal-title>
      <h6>Generate ID Card</h6>
    </template>

    <div class="id-card-wrapper" v-if="formDriver.fullname">
      <!-- ── Background template image ── -->
      <img src="/id_container.png" class="id-bg" alt="ID Template" />

      <!-- ── POSITION vertical text (right side) ── -->
      <div class="id-position-vertical">
        {{ formDriver.position_desc || 'EMPLOYEE' }}
      </div>

      <!-- ── NICKNAME  ── -->
      <div class="id-nickname">
        "{{ formDriver.nickname || formDriver.fullname.split(' ')[0] }}"
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
          <font-awesome-icon icon="user" style="font-size: 60px; color: #ccc;" />
        </div>
      </div>
    </div>

    <template v-slot:modal-footer>
      <b-button size="sm" @click="downloadIDCard()" class="primaryBtn mr-2">
        <font-awesome-icon icon="download" class="mr-1" /> Download ID
      </b-button>
      <b-button size="sm" @click="$bvModal.hide('employee-id-modal')" class="greyBtn mr-2">
        Close
      </b-button>
    </template>
  </b-modal>
  
    <!-- Employee Details Modal -->
    <b-modal
      header-class="hrmsColor"
      v-model="showEmployeeModal"
      size="xl"
      hide-footer
      scrollable
      centered
    >
      <template #modal-title>
        <div class="modal-title-header">
          <div class="modal-title-icon">
            <font-awesome-icon icon="user" />
          </div>
          <div class="modal-title-text">
            <span class="modal-title-main text-left">Employee Details</span>
            <span class="modal-title-desc">Complete employee information and records</span>
          </div>
        </div>
      </template>
      <div v-if="employeeDetails">
        <b-row>
          <b-col md="6">
            <b-form-group label="Employee No.">
              <b-form-input :value="employeeDetails.empno" readonly plaintext />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Swipe ID">
              <b-form-input :value="employeeDetails.swipe_id" readonly plaintext />
            </b-form-group>
          </b-col>
        </b-row>

        <b-row>
          <b-col md="6">
            <b-form-group label="Full Name">
              <b-form-input :value="employeeDetails.fullname" readonly plaintext />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Department">
              <b-form-input :value="employeeDetails.deptdesc" readonly plaintext />
            </b-form-group>
          </b-col>
        </b-row>

        <b-row>
          <b-col md="6">
            <b-form-group label="Position">
              <b-form-input :value="employeeDetails.position_desc" readonly plaintext />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Status">
              <b-badge :variant="employeeDetails.is_separated === 0 ? 'success' : 'danger'">
                {{ employeeDetails.is_separated === 0 ? "Active" : "Separated" }}
              </b-badge>
            </b-form-group>
          </b-col>
        </b-row>

        <b-row v-if="employeeDetails.email">
          <b-col md="12">
            <b-form-group label="Email">
              <b-form-input :value="employeeDetails.email" readonly plaintext />
            </b-form-group>
          </b-col>
        </b-row>

        <b-row v-if="employeeDetails.contact_no">
          <b-col md="12">
            <b-form-group label="Contact No.">
              <b-form-input :value="employeeDetails.contact_no" readonly plaintext />
            </b-form-group>
          </b-col>
        </b-row>

        <b-row v-if="employeeDetails.hire_date">
          <b-col md="6">
            <b-form-group label="Hire Date">
              <b-form-input :value="formatDate(employeeDetails.hire_date)" readonly plaintext />
            </b-form-group>
          </b-col>
          <b-col md="6" v-if="employeeDetails.separation_date">
            <b-form-group label="Separation Date">
              <b-form-input :value="formatDate(employeeDetails.separation_date)" readonly plaintext />
            </b-form-group>
          </b-col>
        </b-row>

        <b-row v-if="employeeDetails.salary">
          <b-col md="6">
            <b-form-group label="Salary">
              <b-form-input :value="formatCurrency(employeeDetails.salary)" readonly plaintext />
            </b-form-group>
          </b-col>
          <b-col md="6" v-if="employeeDetails.work_schedule">
            <b-form-group label="Work Schedule">
              <b-form-input :value="employeeDetails.work_schedule" readonly plaintext />
            </b-form-group>
          </b-col>
        </b-row>
      </div>
      
      <div class="text-right mt-3">
        <b-button variant="secondary" @click="showEmployeeModal = false">
          Close
        </b-button>
      </div>
    </b-modal>
    <b-alert
      :show="alert.showAlert"
      dismissible
      :variant="alert.variant"
      @dismissed="alert.showAlert = null"
    >
      <font-awesome-icon
        :icon="
          alert.variant == 'success' ? 'circle-check' : 'circle-exclamation'
        "
        class="mr-1 alert-font"
      />
      {{ alert.message }}
    </b-alert>
  </div>
</template>

<script>
import axios from "axios";
import Loading from "~/components/LoadingOverlay/Loadings.vue";
export default {
  components: { Loading },
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
      ],
      selectedDepartment: null,
      departmentOptions: [
      ],
      alert: {
        showAlert: 0,
        variant: "",
        message: "",
      },
      employeeDetails: null,
      showEmployeeModal: false,
      departments: [],
      formDriver: {},
      fields: [
        { key: "empno", label: "Employee No.", sortable: true },
        { key: "swipe_id", label: "Swipe ID", sortable: true },
        { key: "fullname", label: "Full Name", sortable: true },
        { key: "deptdesc", label: "Department", sortable: true },
        { key: "position_desc", label: "Position", sortable: true },
        { key: "actions", label: "Actions", sortable: false },
      ],
    };
  },
  created() {
    this.fetchDepartments();
    this.fetchEmployees();
  },
  computed: {
    bottomLabel() {
      return `Showing ${this.startEntry} to ${this.endEntry} of ${this.totalRows} entries`;
    },
    startEntry() {
      return this.totalRows === 0
        ? 0
        : (this.currentPage - 1) * this.perPage + 1;
    },
    endEntry() {
      return Math.min(this.currentPage * this.perPage, this.totalRows);
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
    async viewEmployee(empid) {
      try {
        this.showLoading = true;
        const res = await axios({
          method: "GET",
          url: `${this.$axios.defaults.baseURL}/employees/get-one`,
          params: {
            empid: empid,
          },
        });

        this.employeeDetails = res.data;
        this.showEmployeeModal = true;
        console.log("Employee details:", this.employeeDetails);
      } catch (error) {
        console.error("Error fetching employee details:", error);
        this.$bvToast.toast("Failed to fetch employee details", {
          title: "Error",
          variant: "danger",
          solid: true,
        });
      } finally {
        this.showLoading = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    formatCurrency(amount) {
      if (!amount) return '';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PHP'
      }).format(amount);
    },
    generateCard(row) {
      console.log(row)
      this.formDriver = {
        empno: row.empno,
        fullname: row.fullname,
        deptdesc: row.deptdesc,
        position_desc: row.position_desc,
        email: row.email,
        contact_no: row.contact_no,
        is_separated: row.is_separated
      };
      this.$bvModal.show("employee-id-modal");
    },
    downloadIDCard() {
      if (!this.formDriver || !this.formDriver.fullname) return;
      
      // Load html2canvas library dynamically
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.onload = () => {
        this.$nextTick(() => {
          const element = document.querySelector('.id-card-wrapper');
          if (!element) {
            this.showAlert('danger', 'ID Card wrapper not found');
            return;
          }
          
          html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null
          }).then(canvas => {
            // Convert canvas to blob and download
            canvas.toBlob((blob) => {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `ID_Card_${this.formDriver.fullname.replace(/\s+/g, '_')}.png`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              
              this.showAlert('success', 'ID Card downloaded successfully!');
            }, 'image/png');
          }).catch(error => {
            console.error('Error generating ID card:', error);
            this.showAlert('danger', 'Failed to generate ID card');
          });
        });
      };
      script.onerror = () => {
        this.showAlert('danger', 'Failed to load ID card generator');
      };
      document.head.appendChild(script);
    },
    onDepartmentChange() {
      this.currentPage = 1;
      this.fetchEmployees();
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
          url: `${this.$axios.defaults.baseURL}/api-hrms/admin/departments/get-all`,
        });
        
        // Clear existing options and add "All Departments" option
        this.departmentOptions = [{ value: null, text: "All Departments" }];
        
        // Add departments from API response
        if (res.data && Array.isArray(res.data)) {
          this.departments = res.data;
          res.data.forEach(dept => {
            this.departmentOptions.push({
              value: dept.deptid || dept.dept_code,
              text: dept.deptdesc || dept.department_name
            });
          });
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
          IsSeparated: this.selectedStatus,
        };
        
        if (this.selectedDepartment !== null) {
          params.department = this.selectedDepartment;
        }
        
        console.log('Fetching employees with params:', params);
        
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
  },
};
</script>

<style scoped>

.employee-page {
  padding-top: 80px;
  width: 90vw;
  margin-left: 0;
  margin-right: 0;
  padding-left: 0;
  padding-right: 0;
  overflow-x: hidden;
}

.employee-card {
  border-radius: 0;
  width: 100%;
  margin: 0;
}

.employee-navbar {
  min-height: 56px;
}
</style>
