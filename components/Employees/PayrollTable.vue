<template>
  <div class="payroll-view">
    <Loading v-if="showLoading" />

    <!-- Table Section -->
    <div class="payroll-page">
      <b-row>
        <b-col cols="12">
          <b-card no-body class="main-payroll-card border-0 shadow-sm">
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
                    placeholder="Search name or ID..."
                    class="border-left-0"
                    @keyup.enter="fetchEmployees"
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
                  <label class="filter-label">Period</label>
                  <div class="select-icon-wrapper">
                    <font-awesome-icon
                      icon="calendar-days"
                      class="select-icon"
                    />
                    <b-form-select
                      v-model="selectedPeriodId"
                      :options="periodOptions"
                      class="modern-select-sm icon-select"
                    ></b-form-select>
                  </div>
                </div>

                <div class="filter-group">
                  <label class="filter-label">Bank</label>
                  <b-form-select
                    v-model="selectedBankId"
                    :options="bankOptions"
                    class="modern-select-sm"
                  ></b-form-select>
                </div>

                <div class="filter-group">
                  <label class="filter-label">Office</label>
                  <b-form-select
                    v-model="selectedDeptId"
                    :options="deptOptions"
                    class="modern-select-sm"
                  ></b-form-select>
                </div>
              </div>
            </div>
            <b-card-body class="pb-0">
              <b-table
                striped
                hover
                responsive
                :items="paginatedEmployees"
                :fields="fields"
                show-empty
                class="payroll-table-sm"
              >
                <template #cell(salary)="data">
                  <span class="font-weight-bold">{{
                    formatCurrency(data.value)
                  }}</span>
                </template>

                <template #table-caption>
                  <b-row align-h="between" class="mt-3 mb-3">
                    <b-col cols="6">
                      <span class="entries-label">{{ bottomLabel }}</span>
                    </b-col>
                    <b-col
                      cols="6"
                      class="d-flex justify-content-end align-items-center gap-2"
                    >
                      <b-form-select
                        v-model="perPage"
                        :options="perPageOptions"
                        class="per-page-select"
                      ></b-form-select>
                      <b-pagination
                        v-model="currentPage"
                        :total-rows="filteredEmployees.length"
                        :per-page="perPage"
                        pills
                        align="right"
                        size="sm"
                        class="pagination-nav"
                      ></b-pagination>
                    </b-col>
                  </b-row>
                </template>
              </b-table>
            </b-card-body>
          </b-card>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Loading from "~/components/LoadingOverlay/Loadings.vue";

export default {
  name: "PayrollTable",
  components: { Loading },
  data() {
    return {
      showLoading: false,
      employees: [],
      currentPage: 1,
      perPage: 15,
      perPageOptions: [
        { value: 10, text: "10 entries" },
        { value: 15, text: "15 entries" },
        { value: 30, text: "30 entries" },
        { value: 50, text: "50 entries" },
      ],
      searchText: "",
      selectedPeriodId: null,
      selectedBankId: null,
      selectedDeptId: null,
      departments: [],
      banks: [],
      periods: [],
      fields: [
        { key: "empno", label: "ID", sortable: true },
        { key: "fullname", label: "Employee Name", sortable: true },
        { key: "deptdesc", label: "Office", sortable: true },
        { key: "Position", label: "Position" },
        { key: "Division", label: "Division" },
        {
          key: "salary",
          label: "Basic Pay",
          sortable: true,
          class: "text-right",
        },
      ],
    };
  },
  computed: {
    bottomLabel() {
      return `Showing ${this.startEntry} to ${this.endEntry} of ${this.filteredEmployees.length} entries`;
    },
    paginatedEmployees() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.filteredEmployees.slice(start, end);
    },
    startEntry() {
      if (this.filteredEmployees.length === 0) return 0;
      return (this.currentPage - 1) * this.perPage + 1;
    },
    endEntry() {
      const end = this.currentPage * this.perPage;
      return Math.min(end, this.filteredEmployees.length);
    },
    filteredEmployees() {
      return this.employees;
    },
    bankOptions() {
      const opts = [{ value: null, text: "All Banks" }];
      (this.banks || []).forEach((b) => {
        opts.push({ value: b.bank_id, text: b.bankdesc });
      });
      return opts;
    },
    periodOptions() {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return (this.periods || []).map((p) => {
        const sd = new Date(p.start_date);
        const ed = new Date(p.end_date);
        const mon = months[sd.getMonth()];
        const year = sd.getFullYear();
        const label = `${mon} ${sd.getDate()}-${ed.getDate()}, ${year}`;
        return { value: p.period_key, text: label };
      });
    },
    deptOptions() {
      return [...(this.departments || [])]
        .sort((a, b) => a.deptdesc.localeCompare(b.deptdesc))
        .map((d) => ({ value: d.deptid, text: d.deptdesc }));
    },
  },
  created() {
    this.fetchEmployees();
    this.fetchDepartments();
    this.fetchBanks();
    this.fetchPeriods();
  },
  watch: {
    searchText() {
      this.currentPage = 1;
      this.debouncedFetchEmployees();
    },
    selectedPeriodId() {
      this.currentPage = 1;
      this.fetchEmployees();
    },
    selectedBankId() {
      this.currentPage = 1;
      this.fetchEmployees();
    },
    selectedDeptId() {
      this.currentPage = 1;
      this.fetchEmployees();
    },
  },
  methods: {
    async fetchEmployees() {
      this.showLoading = true;
      try {
        const params = { report: "Payroll" };
        if (this.searchText) params.text = this.searchText;
        params.deptid = this.selectedDeptId || 0;
        params.bank_id = this.selectedBankId || 0;
        if (this.selectedPeriodId) params.period_id = this.selectedPeriodId;
        const res = await axios.get(
          `${this.$axios.defaults.baseURL}/reports/get-all`,
          { params }
        );
        this.employees = (
          Array.isArray(res.data) ? res.data : res.data.data || []
        ).map((e) => ({
          empno: e.IDNo,
          fullname: e.Name,
          deptdesc: e.Office,
          salary: e.basic_pay,
          Position: e.Position,
          Division: e.division_desc,
          basic_pay: e.basic_pay,
          pera: e.pera,
          wtax: e.wtax,
          philhealth: e.philhealth,
          gsis_employee_share: e.gsis_employee_share,
          gsis_employer_share: e.gsis_employer_share,
          pag_ibig_ps: e.pag_ibig_ps,
          pag_ibig_gs: e.pag_ibig_gs,
          LBP: e.LBP,
          DBP: e.DBP,
          total_health_care: e.total_health_care,
        }));
      } catch (error) {
        console.error("Error fetching payroll data:", error);
      } finally {
        this.showLoading = false;
      }
    },
    async fetchDepartments() {
      try {
        const res = await axios.get(
          `${this.$axios.defaults.baseURL}/file-maintenance/department/get-all`
        );
        this.departments = res.data || [];
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    },
    async fetchBanks() {
      try {
        const res = await axios.get(
          `${this.$axios.defaults.baseURL}/file-maintenance/bank/get-all`
        );
        this.banks = res.data || [];
      } catch (error) {
        console.error("Error fetching banks:", error);
      }
    },
    async fetchPeriods() {
      try {
        const res = await axios.get(
          `${this.$axios.defaults.baseURL}/file-maintenance/periods/get-all`
        );
        this.periods = res.data || [];
        const now = new Date();
        const match = this.periods.find((p) => {
          const sd = new Date(p.start_date);
          const ed = new Date(p.end_date);
          return now >= sd && now <= ed;
        });
        if (match) this.selectedPeriodId = match.period_key;
      } catch (error) {
        console.error("Error fetching periods:", error);
      }
    },
    clearSearch() {
      this.searchText = "";
      this.fetchEmployees();
    },
    debouncedFetchEmployees() {
      clearTimeout(this._searchTimer);
      this._searchTimer = setTimeout(() => {
        this.fetchEmployees();
      }, 400);
    },
    formatCurrency(val) {
      if (!val) return "₱0.00";
      return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(val);
    },
  },
};
</script>

<style scoped>
/* Modern UI Styling */
.payroll-view {
  width: 100%;
  overflow-x: hidden;
}

.main-payroll-card {
  border-radius: 16px;
  padding: 1.5rem;
  background: #ffffff;
}

.payroll-page {
  position: fixed;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 90vw;
  bottom: 0;
  overflow-x: auto;
  background: white;
  z-index: 5;
  padding-top: 20px;
}

.payroll-filter-bar {
  background-color: #007bff !important;
  z-index: 1000;
}

.navbar-logo {
  height: 35px;
  width: auto;
}

.payroll-table-sm {
  font-size: 13px;
}

.dropdown-scroll-container {
  max-height: 350px;
  overflow-y: auto;
  min-width: 280px;
}

::v-deep .payroll-navbar .nav-link {
  color: rgba(255, 255, 255, 0.9) !important;
  font-size: 14px;
}

::v-deep .payroll-navbar .nav-link:hover {
  color: #ffffff !important;
}

/* Pagination Info Styling */
.entries-label {
  font-size: 0.9rem;
  color: #495057;
}

.per-page-select {
  height: 26px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  font-size: 0.7rem;
  min-width: 55px;
  width: 60px;
  padding: 0.05rem 0.2rem;
}

.per-page-select:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

::v-deep .pagination-nav .page-link {
  font-size: 0.85rem;
  padding: 0.375rem 0.75rem;
}

.gap-2 {
  gap: 0.5rem;
}

.select-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.select-icon {
  position: absolute;
  left: 10px;
  color: #6c757d;
  font-size: 0.85rem;
  z-index: 3;
  pointer-events: none;
}

.icon-select {
  padding-left: 30px !important;
  background: #f8f9fa;
  border-color: #ced4da;
  transition: all 0.2s ease;
}

.icon-select:focus {
  background: #fff;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.15);
}
</style>
