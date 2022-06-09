const applyButton =
  "#filters_form > div > div.ibox-footer.text-right > button.btn.btn-info.action-search.m-l-xs";

const addPeopleButtons = {
  evening: [
    "#schedule_scroll > table > tbody > tr:nth-child() > td:nth-child(2) > div:nth-child(2) > button",
    "#schedule_scroll > table > tbody > tr:nth-child() > td:nth-child(3) > div:nth-child(2) > button",
  ],
  morning: [
    "#schedule_scroll > table > tbody > tr > td:nth-child(3) > div:nth-child(2) > button",
    "#schedule_scroll > table > tbody > tr > td:nth-child(4) > div:nth-child(2) > button",
  ],
};

const centers = [
  {
    center: "Adilabad",
    selector_num: "187",
    sheet_id: "",
    volunteers: {
      morning: ["", ""],
      evening: ["Shabnam Dinani", "Shabnam Dinani"],
    },
    gid_1: 1547683864,
    gid_2: 1000393733,
    lb: "secunderabad",
  },
  {
    center: "Karimnagar",
    selector_num: "191",
    sheet_id: "",
    volunteers: {
      morning: ["", ""],
      evening: ["Farah Veerani", "Farah Veerani"],
    },
    gid_1: 1547683864,
    gid_2: 1207606703,
    lb: "secunderabad",
  },
  {
    center: "Kompally",
    selector_num: "193",
    sheet_id: "",
    volunteers: {
      morning: ["Rozmin Mardhani", "Rubina Jiwani"],
      evening: ["Ruksana Patel", "Jasmine Samnani"],
    },
    gid_1: 1547683864,
    gid_2: 771351500,
    gid_3: 1993188792,
    lb: "secunderabad",
  },
  {
    center: "Secunderabad",
    selector_num: "196",
    sheet_id: "",
    volunteers: {
      evening: ["Salma Halani", "Sameera Fazal"],
      morning: ["Amit Panjwani", "Amit Panjwani"],
    },
    gid_1: 1547683864,
    gid_2: 1628998929,
    gid_3: 599224970,
    lb: "secunderabad",
  },
  {
    center: "Hyderabad",
    selector_num: "182",
    sheet_id: "",
    volunteers: {
      evening: ["Fazal Thakkar", "Fazal Thakkar"],
      morning: ["Ashiwna Punjani", "Ashiwna Punjani"],
    },
    gid_1: "0",
    gid_2: 1350318519,
    lb: "hyderabad",
  },
  {
    center: "Kinwat",
    selector_num: "192",
    sheet_id: "",
    volunteers: { evening: ["", ""], morning: ["", ""] },
    gid_1: 1547683864,
    gid_2: 1628998929,
    lb: "secunderabad",
  },
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

module.exports = {
  addPeopleButtons,
  applyButton,
  centers,
  credentials,
  months,
};
