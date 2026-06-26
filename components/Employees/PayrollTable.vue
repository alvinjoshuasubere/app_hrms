<template>
  <div class="payroll-view">
    <Loading v-if="showLoading" />

    <div class="payroll-page">
      <b-row>
        <b-col cols="12">
          <b-card no-body class="main-payroll-card border-0 shadow-sm">
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
                  <b-form-select
                    v-model="selectedBankId"
                    :options="bankOptions"
                    class="modern-select-sm"
                  ></b-form-select>
                </div>

                <div class="filter-group">
                  <b-form-select
                    placeholder="Select Department"
                    v-model="selectedDeptId"
                    :options="deptOptions"
                    class="modern-select-sm"
                  ></b-form-select>
                </div>

                <div class="filter-group">
                  <b-dropdown
                    size="sm"
                    variant="outline-primary"
                    :text="selectedEmploymentStatuses"
                    class="modern-dropdown"
                    ref="typeDropdown"
                    boundary="viewport"
                  >
                    <b-dropdown-item-button
                      v-for="status in employmentStatusOptions"
                      :key="status"
                      :active="selectedEmploymentStatuses === status"
                      @click="selectedEmploymentStatuses = status"
                    >
                      {{ status }}
                    </b-dropdown-item-button>
                  </b-dropdown>
                </div>

                <div class="filter-group">
                  <b-button
                    class="btn-elevated ml-2"
                    variant="success"
                    size="sm"
                    @click="exportExcel"
                  >
                    <font-awesome-icon icon="file-excel" class="mr-1" />
                    Export Excel
                  </b-button>
                </div>
              </div>
            </div>

            <b-card-body class="pb-0">
              <b-table
                striped
                hover
                :items="paginatedEmployees"
                :fields="fields"
                show-empty
                class="payroll-table-sm"
              >
                <template #cell(basic_pay)="data">
                  <span class="font-weight-bold">{{
                    formatCurrency(data.value)
                  }}</span>
                </template>

                <template #table-caption>
                  <b-row align-h="between" class="mt-3 mb-3">
                    <b-col cols="6" class="d-flex align-items-center gap-2">
                      <span class="entries-label">{{ bottomLabel }}</span>
                      <b-form-select
                        v-model="perPage"
                        :options="perPageOptions"
                        class="per-page-select"
                      ></b-form-select>
                    </b-col>
                    <b-col
                      cols="6"
                      class="d-flex justify-content-end align-items-center gap-2"
                    >
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

const COLUMN_HEADERS = [
  "BSIC SLARY",
  "PERA",
  "GSIS PS",
  "HDMF- HOUSING",
  "MP2",
  "HDMF- PS",
  "CEAKOR- EDUC",
  "COMPUTER LOAN",
  "ECC",
  "PHIL PS",
  "CEAKOR- LIVELIHOOD",
  "DBP",
  "GSIS- CONSO",
  "FRINGE",
  "GSIS- POLICY",
  "RICE",
  "ERAP",
  "GSIS- EMERGENCY",
  "GFALL",
  "GSIS- MPL",
  "HDMF- MPL",
  "OULI",
  "CEAKOR - MEMBERSHIP",
  "HDMF- CALAMITY",
  "CEAKOR- PREMIUM",
  "CEAKOR- SOFT",
  "GSIS- EDUC",
  "ATTENDANCE",
  "CEAKOR- RETIREMENT",
  "LBP",
  "KOCECO",
  "GSIS GS",
  "W-TAX",
  "PHIC GS",
  "PAGIBIG GS",
  "EMPTY_1",
  "HEALTH CARE",
  "EMPTY_2",
  "SSS",
  "GSIS - MPLITE",
  "GSIS - GSL",
  "GSIS - LRP",
  "MOTOR LOAN",
];

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
        { value: 10, text: "10" },
        { value: 15, text: "15" },
        { value: 30, text: "30" },
        { value: 50, text: "50" },
      ],
      searchText: "",
      selectedPeriodId: null,
      selectedBankId: null,
      selectedDeptId: 1,
      selectedEmploymentStatuses: "Permanent",
      employmentStatusOptions: ["Permanent", "Casual"],
      departments: [],
      banks: [],
      periods: [],
      fields: [
        { key: "IDNo", label: "ID", sortable: true },
        {
          key: "Name",
          label: "Employee Name",
          class: "text-left",
          sortable: true,
        },
        { key: "Office", label: "Office", class: "text-left", sortable: true },
        { key: "Position", label: "Position", class: "text-left" },
        { key: "division_desc", label: "Division", class: "text-left" },
        {
          key: "basic_pay",
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
      let data = this.employees;
      if (this.searchText) {
        const q = this.searchText.toLowerCase();
        data = data.filter((e) => e.Name && e.Name.toLowerCase().includes(q));
      }
      return data;
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
    selectedEmploymentStatuses() {
      this.currentPage = 1;
      this.fetchEmployees();
    },
  },
  methods: {
    toNum(val) {
      const n = parseFloat(val);
      return isNaN(n) ? 0 : n;
    },
    formatNumber(val) {
      if (val === "" || val === null || val === undefined) return "";
      const n = Number(val);
      if (isNaN(n)) return "-";
      if (n === 0) return "-";
      return n.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
    provideColumnValue(colIdx) {
      const codes = {
        6: "G",
        7: "H",
        9: "J",
        10: "K",
        13: "N",
        14: "O",
        16: "Q",
        18: "S",
        19: "T",
        24: "Y",
        25: "Z",
        30: "AE",
        34: "AI",
        36: "AK",
        37: "AL",
      };
      if (colIdx >= 42 && colIdx <= 45) return "NONE";
      return codes[colIdx] || "";
    },
    systemAliasValue(colIdx) {
      const aliases = {
        3: "BSIC SLARY",
        4: "PERA",
        5: "GSIS PS",
        6: "PAGIBIG - HL",
        7: "MP 2",
        8: "HDMF PS",
        9: "CEAKOR - EDUC",
        10: "GSIS - COMP",
        11: "ECC",
        12: "PHIL PS",
        13: "CEAKOR - LVELIHOD",
        14: "BANKS - DBP",
        15: "GSIS - CONSO",
        16: "OTHERS - F BENEFIT",
        17: "GSIS - POLICY",
        18: "OTHERS - RICE DIS",
        19: "OTHERS - ERAP",
        20: "GSIS - ELA",
        21: "GSIS - GFAL II",
        22: "GSIS - GMPL",
        23: "PAGIBIG - MPL",
        24: "GSIS - UOLI",
        25: "CEAKOR - MEMBERSHIP",
        26: "PAGIBIG - CLMITY",
        27: "CKOR-PS",
        28: "CEAKOR - SOFT LOAN",
        29: "CEAKOR - ATTENDANCE",
        30: "CEAKOR - RETIREMENT",
        31: "BANKS - LBP",
        32: "OTHERS - KOCECO",
        33: "GSIS GS",
        34: "W-TAX",
        35: "PHIL GS",
        36: "HDMF GS",
        37: "HCP",
        38: "SSS",
        39: "GSIS - MPLITE",
        40: "GSIS - GSL",
        41: "GSIS - LRP",
        42: "MOTOR LOAN",
        43: "",
        44: "",
        45: "",
      };
      return aliases[colIdx] || "";
    },
    defaultColumnValue(colIdx) {
      const codes = {
        3: "D",
        4: "E",
        5: "F",
        6: "I",
        7: "L",
        8: "M",
        9: "P",
        10: "R",
        11: "U",
        12: "V",
        13: "W",
        14: "X",
        15: "AA",
        16: "AB",
        17: "AC",
        18: "AD",
        19: "AF",
        20: "AG",
        21: "AH",
        22: "AJ",
        23: "AN",
        24: "AP",
      };
      return codes[colIdx] || "";
    },
    mapEmployeeToLedgerRow(e, idx) {
      const row = Array(46).fill(0);
      const n = (v) => {
        const val = v ?? 0;
        return this.toNum(val);
      };
      row[0] = idx + 1;
      row[1] = e.IDNo || "";
      row[2] = e.Name || "";
      row[3] = n(e.basic_pay);
      row[4] = n(e.pera);
      row[5] = n(e.GSIS_COMP);
      row[6] = n(e.HDMF_HOUSING);
      row[7] = n(e.mp2);
      row[8] = n(e.pag_ibig_ps);
      row[9] = n(e.CEAKOR_EDUC);
      row[10] = n(e.GSIS_COMP);
      row[11] = n(e.ECC);
      row[12] = n(e.philhealth);
      row[13] = n(e.CEAKOR_LIVELIHOOD);
      row[14] = n(e.DBP);
      row[15] = n(e.GSIS_CONSO);
      row[16] = n(e.Fringe);
      row[17] = n(e.GSIS_POLICY);
      row[18] = n(e.rice);
      row[19] = n(e.ERAP);
      row[20] = n(e.GSIS_EMERGENCY);
      row[21] = n(e.GSIS_GFALL);
      row[22] = n(e.GSIS_MPL);
      row[23] = n(e.HDMF_MPL);
      row[24] = n(e.ouli);
      row[25] = n(e.ceakor_membership);
      row[26] = n(e.hdmf_calamity);
      row[27] = n(e.CEAKOR_PREMIUM);
      row[28] = n(e.CEAKOR_SOFT);
      row[29] = n(e.gsis_educ);
      row[30] = n(e.CEAKOR_ATTENDANCE);
      row[31] = n(e.CEAKOR_RETIREMENT);
      row[32] = n(e.LBP);
      row[33] = n(e.KOCECO);
      row[34] = n(e.gsis_employee_share);
      row[35] = n(e.wtax);
      row[36] = n(e.philhealth);
      row[37] = n(e.pag_ibig_gs);
      row[38] = 0;
      row[39] = n(e.total_health_care);
      row[40] = 0;
      row[41] = n(e.SSS);
      row[42] = n(e.GSIS_MPLITE);
      row[43] = n(e.gsis_gsl);
      row[44] = n(e.gsis_lrp);
      row[45] = n(e.motor);
      return row;
    },
    buildExportRows(empData) {
      const rows = [];
      const providedRow = ["", "", "PROVIDE COLUMNS"];
      for (let c = 3; c <= 45; c++)
        providedRow.push(this.provideColumnValue(c));
      rows.push(providedRow);

      const aliasRow = ["", "", ""];
      for (let c = 3; c <= 45; c++) aliasRow.push(this.systemAliasValue(c));
      rows.push(aliasRow);

      const defaultRow = ["", "", "DEFAULT COLUMNS"];
      for (let c = 3; c <= 45; c++) defaultRow.push(this.defaultColumnValue(c));
      rows.push(defaultRow);

      const checkExtras = ["CHECK", "", "-"];
      for (let c = 3; c <= 45; c++)
        checkExtras.push(c === 39 ? "MEDICAL ALLOWANCE" : "");
      rows.push(checkExtras);

      const ledgerRows = empData.map((e, i) =>
        this.mapEmployeeToLedgerRow(e, i)
      );
      const numCols = 43;
      const colTotals = {};
      for (let c = 3; c <= 45; c++) {
        colTotals[c] = ledgerRows.reduce((s, r) => s + r[c], 0);
      }
      const grandTotal = Object.values(colTotals).reduce((a, b) => a + b, 0);

      const totalRow = ["TOTAL", "", this.formatNumber(grandTotal)];
      for (let c = 3; c <= 45; c++)
        totalRow.push(this.formatNumber(colTotals[c]));
      rows.push(totalRow);

      rows.push(["CHECK", "", "-", ...Array(43).fill("")]);

      rows.push(["NO.", "ID/SSL CODE", "EMPLOYEE", ...COLUMN_HEADERS]);

      ledgerRows.forEach((r) => {
        const formatted = [r[0], r[1], r[2]];
        for (let c = 3; c <= 45; c++) formatted.push(this.formatNumber(r[c]));
        rows.push(formatted);
      });

      return rows;
    },
    buildExcelTable(rows) {
      const rowStyles = [
        "background:#f3f4f6;color:#6b7280;", // 0: PROVIDE COLUMNS - gray
        "background:#f3f4f6;color:#6b7280;", // 1: System Aliases - gray
        "background:#f3f4f6;color:#6b7280;", // 2: DEFAULT COLUMNS - gray
        "background:#fee2e2;color:#dc2626;font-weight:bold;", // 3: CHECK (validation) - red
        "background:#d1fae5;font-weight:bold;color:#000;", // 4: TOTAL - green
        "background:#fee2e2;color:#dc2626;font-weight:bold;", // 5: CHECK (validation) - red
        "background:#1e293b;color:#ffffff;font-weight:bold;", // 6: Headers - dark blue
      ];
      let html =
        '<table border="1" cellpadding="3" cellspacing="0" style="font-size:10px;font-family:Calibri;border-collapse:collapse;">';
      rows.forEach((row, ri) => {
        const baseStyle = rowStyles[ri] || "";
        html += "<tr>";
        row.forEach((cell, ci) => {
          const str = String(cell);
          const isNum =
            str !== "" &&
            !isNaN(parseFloat(str.replace(/,/g, ""))) &&
            str.replace(/,/g, "").trim() !== "";
          const isDash = str === "-";
          let align = "left";
          let numFmt = "";
          if (ci === 0) {
            align = "center";
            numFmt = 'mso-number-format:"#,##0"';
          } else if (ci === 1) align = "center";
          else if (ci === 2) align = "left";
          else if (isNum || isDash) {
            align = "center";
            numFmt = 'mso-number-format:"#,##0.00"';
          }
          html += `<td style="${baseStyle}text-align:${align};${numFmt}">${str}</td>`;
        });
        html += "</tr>";
      });
      html += "</table>";
      return html;
    },
    exportExcel() {
      const source =
        this.filteredEmployees.length > 0
          ? this.filteredEmployees
          : this.employees;
      const rows = this.buildExportRows(source);
      const tableHtml = this.buildExcelTable(rows);
      const blob = new Blob(
        [
          "\uFEFF" +
            '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">' +
            '<head><meta charset="UTF-8">' +
            "<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>" +
            "<x:Name>Payroll</x:Name>" +
            "<x:WorksheetOptions><x:DisplayGridlines/>" +
            "<x:FreezePanes><x:FrozenNoSplit/><x:SplitVertical>3</x:SplitVertical><x:LeftColumnRightPane>3</x:LeftColumnRightPane></x:FreezePanes>" +
            "</x:WorksheetOptions>" +
            "</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->" +
            "</head><body>" +
            tableHtml +
            "</body></html>",
        ],
        { type: "application/vnd.ms-excel;charset=utf-8" }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const deptLabel =
        (this.deptOptions.find((d) => d.value === this.selectedDeptId) || {})
          .text || "All";
      const periodLabel =
        (
          this.periodOptions.find((p) => p.value === this.selectedPeriodId) ||
          {}
        ).text || "All";
      a.download = `JEV_${deptLabel}_${periodLabel}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    async fetchEmployees() {
      this.showLoading = true;
      try {
        const report =
          this.selectedEmploymentStatuses === "Permanent"
            ? "Payroll"
            : "Payroll-Casual";
        const params = { report };
        if (this.searchText) params.text = this.searchText;
        params.deptid = this.selectedDeptId || 0;
        params.bank_id = this.selectedBankId || 0;
        if (this.selectedPeriodId) params.period_id = this.selectedPeriodId;
        const res = await axios.get(
          `${this.$axios.defaults.baseURL}/reports/get-all`,
          { params }
        );

        this.employees = Array.isArray(res.data) ? res.data : [];
        console.log(this.employees);
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
.payroll-view {
  width: 100%;
  overflow-x: hidden;
}

.main-payroll-card {
  border-radius: 16px;
  padding: 1.5rem;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.main-payroll-card ::v-deep .card-body {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.payroll-page {
  position: fixed;
  top: 40px;
  left: 0;
  width: 100%;
  bottom: 0;
  background: white;
  z-index: 5;
  padding-top: 20px;
}

.payroll-page .row,
.payroll-page .row > .col,
.payroll-page .row > [class*="col-"] {
  height: 100%;
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

.entries-label {
  font-size: 0.9rem;
  color: #495057;
}

.per-page-select {
  height: 26px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  font-size: 0.9rem;
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

.dropdown-action-row {
  display: flex;
  gap: 0.5rem;
  padding: 0.25rem 1rem;
}

.dropdown-action-row .btn {
  font-size: 0.8rem;
  padding: 0.15rem 0.5rem;
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
  border: 1px solid #ced4da;
  transition: all 0.2s ease;
}

.icon-select:focus {
  background: #fff;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.15);
}

.modern-filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.modern-search-group {
  width: 350px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border-radius: 10px;
  overflow: hidden;
}

.modern-search-group input {
  border: 1px solid #eef0f2;
  height: 42px;
}

.modern-search-group .input-group-text {
  background: white;
  border: 1px solid #eef0f2;
  border-right: none;
}

.filter-controls {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
}

.modern-select-sm {
  height: 38px;
  border-radius: 8px;
  border: 1px solid #eef0f2;
  padding-right: 2rem;
  font-size: 0.85rem;
  color: #495057;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.filter-clear-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
}

.filter-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding-left: 0.15rem;
}

.modern-dropdown ::v-deep .btn {
  height: 38px;
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  border-radius: 8px;
}

.dropdown-scroll-panel {
  max-height: 250px;
  overflow-y: auto;
  padding: 0.5rem 1rem;
}

@media (max-width: 768px) {
  .modern-filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .modern-search-group {
    width: 100%;
  }
  .filter-controls {
    flex-wrap: wrap;
  }
}
</style>
