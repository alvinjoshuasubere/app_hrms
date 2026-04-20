<template>
  <div id="printDtr">
    <div class="container">
      <span class="stacked"><b>City Government of Koronadal</b></span>
      <span class="stacked"><b>Daily Time Record</b></span>
      <small class="stacked">As of {{ dateRange }}</small>
      <br />
      <br />

      <table class="tablePrint">
        <thead>
          <tr>
            <th width="35%">NAME/DESIGNATION</th>
            <th>DATE</th>
            <th>IN 1</th>
            <th>OUT 1</th>
            <th>IN 2</th>
            <th>OUT 2</th>
            <th>TOTAL LATE</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-left">
              <b>{{ department }}</b>
            </td>
          </tr>
          <tr>
            <td class="text-left">
              <b>{{ username }}</b>
            </td>
            <td colspan="6">
              <b>{{ position }}</b>
            </td>
          </tr>
        </tbody>
        <tbody>
          <tr v-for="log in groupedLogs" :key="log.dtr_date">
            <td></td>
            <td>{{ formatDate(log.dtr_date) }}</td>
            <td>{{ formatTime(log.in_1) ? formatTime(log.in_1) : "-" }}</td>
            <td>{{ formatTime(log.out_1) ? formatTime(log.out_1) : "-" }}</td>
            <td>{{ formatTime(log.in_2) ? formatTime(log.in_2) : "-" }}</td>
            <td>{{ formatTime(log.out_2) ? formatTime(log.out_2) : "-" }}</td>
            <td>{{ calculateLateHours(log) }}</td>
          </tr>
        </tbody>
      </table>
      <b-row>
        <b-col cols="12">
          <small class="float-left" style="display: block"
            ><b
              >Corrections are valid if made by the HR Authorized Personnel</b
            ></small
          >
        </b-col>
        <b-col cols="12">
          <small style="border-bottom: 0.5px solid gray" class="float-right"
            >Total Late &nbsp;&nbsp;&nbsp; {{ totalLateHoursForAllLogs }}</small
          >
        </b-col>
        <b-col cols="12">
          <small style="border-bottom: 1px solid black" class="float-right"
            ><b>Equi.Leave &nbsp;&nbsp;&nbsp; {{ equiLeave }}</b></small
          >
        </b-col>
      </b-row>

      <b-row class="signature">
        <b-col>
          <span><b>Certified Correct: </b></span>
          <span
            class="mt-5"
            style="
              font-size: 15px;
              border-top-style: solid;
              border-width: 1px;
              margin: 0;
              padding: 0;
            "
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Employee Signature
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
        </b-col>
        <b-col>
          <span><b>Approved: </b></span>
          <span
            class="mt-5"
            style="
              font-size: 15px;
              border-top-style: solid;
              border-width: 1px;
              margin: 0;
              padding: 0;
            "
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Department
            Head/Supervisor &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
        </b-col>
      </b-row>
    </div>
  </div>
</template>
<script>
import moment from "moment";
export default {
  components: {
    moment,
  },
  props: {
    groupedLogs: Object,
    dateRange: String,
  },
  data() {
    return {
      username: localStorage.fullname,
      department: localStorage.department,
      position: localStorage.position,
      // totalLateHoursForAllLogs: null,
      equiLeave: null,
    };
  },
  computed: {
    totalLateHoursForAllLogs() {
      let totalLateHours = 0;
      this.equiLeave = 0;

      if (this.groupedLogs != null) {
        for (let i = 0; i < this.groupedLogs.length; i++) {
          const element = this.groupedLogs[i];
          if (!element.dayoff) {
            totalLateHours += parseFloat(this.calculateLateHours(element));
          }
        }
        this.equiLeave = (totalLateHours / 8).toFixed(2);
        return totalLateHours.toFixed(2);
      }
    },
  },
  methods: {
    formatDate(date) {
      return moment(date).format("MM/DD/YYYY");
    },
    formatDateRange(data) {
      return (
        moment(data.dtr_date).startOf("month").format("YYYY-MM-DD") -
        moment(data.dtr_date).endOf("month").format("YYYY-MM-DD")
      );
    },
    formatLate(data) {
      if (data.dayoff == true) {
        return moment(data.dtr_date).format("dddd");
      } else if (data.holday == true) {
        return moment(data.dtr_date).format("dddd");
      } else {
        return parseFloat(data.late_hrs).toFixed(2);
      }
    },
    formatTime(data) {
      if (data) {
        if (data == "DAY OFF") {
          return "-";
        } else if (data == "MO") {
          return "MO";
        } else if (data == "OT") {
          return "OT";
        } else if (data == "HOLIDAY") {
          return "-";
        } else if (data == "LEAVE") {
          return "LEAVE";
        } else {
          const time = data.split("T");
          const minutes = time[1].split(":");

          if (minutes[0] < 11 && minutes[1] < 59) {
            return `${minutes[0]}:${minutes[1]} AM`;
          } else {
            return `${minutes[0]}:${minutes[1]} PM`;
          }
        }
      }
    },

    calculateLateHours(data) {
      // Helper function to convert time to minutes since midnight
      if (data.dayoff == true) {
        return "OFF";
      } else {
        const timeToMinutes = (time) => {
          const [hours, minutes] = time.split(":").map(Number);
          return hours * 60 + minutes;
        };

        const timeToMinutesData = (time) => {
          const day = time.split("T");
          const [hours, minutes] = day[1].split(":").map(Number);
          return hours * 60 + minutes;
        };

        if (data.shift_description != null) {
          // Calculate time in shift
          const shift_sched = data.shift_description.split("-");
          const shift_time = shift_sched[0].split(" ");
          let time_in = shift_time[0];

          // Calculate Break In
          const [hours, minutes] = time_in.split(":");
          let date = new Date(2000, 0, 1, hours, minutes); // Create a new date object (the specific date doesn't matter, only time is relevant here)
          date.setHours(date.getHours() + 5); // Add 5 hours
          const time_in2 =
            date.getHours() + ":" + ("0" + date.getMinutes()).slice(-2); // Format the result back into the HH:mm format

          let totalLateMinutes = 0;

          if (data.in_1 != null) {
            if (data.in_1.includes("000Z")) {
              // console.log(data, "IN 1")
              // Check in_1
              if (timeToMinutesData(data.in_1) > timeToMinutes(time_in)) {
                totalLateMinutes +=
                  timeToMinutesData(data.in_1) - timeToMinutes(time_in);
              }
            }
          }
          if (data.in_2 != null) {
            if (data.in_2.includes("000Z")) {
              if (timeToMinutesData(data.in_2) > timeToMinutes(time_in2)) {
                totalLateMinutes +=
                  timeToMinutesData(data.in_2) - timeToMinutes(time_in2);
              }
            }
          }
          return parseFloat(totalLateMinutes / 60).toFixed(2);
        }
      }
      // Convert total minutes to hours and return
    },
    async print() {
      // console.log(this.qrCode);
      await setTimeout({}, 3000);
      // Get HTML to print from element
      const prtHtml = document.getElementById("printDtr").innerHTML;

      // let originalContents = document.body.innerHTML;

      // Get all stylesheets HTML
      let stylesHtml = "";
      for (const node of [
        ...document.querySelectorAll('link[rel="stylesheet"], style'),
      ]) {
        stylesHtml += node.outerHTML;
      }
      // Open the print window
      const WinPrint = await window.open(
        "",
        "",
        "left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0"
      );
      WinPrint.document.open();
      WinPrint.document.write(`<!DOCTYPE html>
                <html>
                <head>
                    ${stylesHtml}
                <style>
                    body {margin-left: .6rem;}
                </style>
                </head>
                <body>
                    ${prtHtml}
                </body>
        </html>`);

      WinPrint.document.close();
      WinPrint.focus();
      WinPrint.print();
      WinPrint.close();
      window.top.location = window.top.location;
    },
  },
};
</script>
<style scoped>
.container {
  top: 0;
}

table {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  height: 100%;
  table-layout: fixed;
}

@media print {
  #print-button {
    display: none;
  }

  #printDtr {
    height: 50%;
    width: 20%;
    position: relative;
    left: 14px;
  }
}

th {
  border: 1px solid black;
  text-align: center;
}

td {
  border: 1px solid black;
  text-align: center;
  padding: 3px;
}

.signature {
  position: fixed;
  bottom: 1in;
  /* Pushes the div 1 inch from the bottom */
  left: 0;
  right: 0;
  text-align: center;
}
</style>
