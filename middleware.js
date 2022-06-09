const puppeteer = require("puppeteer");
const { google } = require("googleapis");

const { credentials, applyButton, months } = require("./constants.js");

const getClock = () => {
  const dateRequirements = [
    { variableName: "currentDate", dateVale: Date.now() },
    { variableName: "nextDate", dateVale: Date.now() + 86400000 },
    { variableName: "dateAfterTomorrow", dateVale: Date.now() + 172800000 },
    { variableName: "currentTime", dateVale: Date.now() },
  ];

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
  });

  let clock = {
    currentDate: "",
    nextDate: "",
    dateAfterTomorrow: "",
    currentTime: "",
  };

  dateRequirements.forEach((requirement) => {
    const requiredDate = new Date(requirement.dateVale);
    const inDateText = formatter.format(requiredDate);
    const dateValue = new Date(inDateText);
    if (requirement.variableName === "currentTime") {
      clock[requirement.variableName] = requiredDate.getUTCHours() + 5.5;
    } else {
      clock[requirement.variableName] =
        dateValue.getDate() +
        "-" +
        months[dateValue.getMonth()].substr(0, 3) +
        "-" +
        dateValue.getFullYear();
    }
  });

  return clock;
};

const getSheetEditor = async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  const client = await auth.getClient();

  const googleSheets = google.sheets({ version: "v4", auth: client });

  return { googleSheets, auth };
};

const getData = async (input) => {
  const {
    center_num,
    volunteer,
    eventDate,
    eventTime,
    addPeopleButton,
    deadline,
    lb,
  } = input;

  let event = {
    remaining: {
      floor: {
        male: 0,
        female: 0,
      },
      chair: {
        male: 0,
        female: 0,
      },
    },
    sorted_scheduled_members: [],
  };

  let scheduled_members = [];

  // to start puppeteer
  const browser = await puppeteer.launch({
    // headless: false,
    // defaultViewport: null,
    // args: ["--start-maximized"],
    args: ["--no-sandbox"],
  });

  // To login in JKReg app
  const LoginPage = await browser.newPage();
  await LoginPage.goto("https://jkreg.iiindia.org/login");
  await LoginPage.type("[name=username]", credentials[lb].username);
  await LoginPage.type("[name=password]", credentials[lb].password);
  await LoginPage.keyboard.press("Enter");
  await LoginPage.waitForNavigation();
  await LoginPage.close();

  // Creates and opens scheduling page of JKReg app
  const SchedulePage = await browser.newPage();
  await SchedulePage.goto(
    `https://jkreg.iiindia.org/admin/${lb}/capacity_control/schedule`
  );

  await SchedulePage.select("select#ft-center", center_num);

  if (eventTime === "Morning") {
    await SchedulePage.select('select[name="filters[event_code]"]', "4");
    await SchedulePage.click(applyButton);
    await SchedulePage.waitForTimeout(5000);
    await SchedulePage.click(addPeopleButton);
  } else if (eventTime === "Evening") {
    const eventRows = await SchedulePage.$$eval(
      "#schedule_scroll > table > tbody > tr",
      (trs) => trs.length
    );

    await SchedulePage.select('select[name="filters[event_code]"]', "0");
    await SchedulePage.click(applyButton);
    await SchedulePage.waitForTimeout(5000);

    for (let x = 2; x <= eventRows; x++) {
      try {
        await SchedulePage.click(
          addPeopleButton.substr(0, 48) + x + addPeopleButton.substr(48)
        );
        break;
      } catch (error) {
        continue;
      }
    }
  }

  await SchedulePage.waitForTimeout(5000);
  await SchedulePage.select("#sl-status", "1");
  await SchedulePage.select('select[name="schedule-table_length"]', "100");
  await SchedulePage.click(
    "#schedule-table_wrapper > div.dataTables_scroll > div.dataTables_scrollHead > div > table > thead > tr > td:nth-child(4)"
  );
  await SchedulePage.waitForTimeout(5000);
  await SchedulePage.click("#bt-search");
  await SchedulePage.waitForTimeout(20000);

  event.remaining.floor.male = await SchedulePage.$eval(
    "#num_available_floor_m",
    (ele) => ele.textContent
  );

  event.remaining.floor.female = await SchedulePage.$eval(
    "#num_available_floor_f",
    (ele) => ele.textContent
  );

  event.remaining.chair.male = await SchedulePage.$eval(
    "#num_available_chair_m",
    (ele) => ele.textContent
  );

  event.remaining.chair.female = await SchedulePage.$eval(
    "#num_available_chair_f",
    (ele) => ele.textContent
  );

  try {
    const first_row_content = await SchedulePage.$eval(
      "table#schedule-table tbody tr td",
      (td) => td.textContent
    );

    if (first_row_content === "No data available in table") {
      await browser.close();
      return event;
    }
  } catch (error) {}

  const num_of_scheduled = await SchedulePage.$eval(
    "#schedule-table_info",
    (ele) => {
      try {
        return parseInt(/\d+(?!.*\d+)/gm.exec(ele.textContent)[0]);
      } catch (e) {
        return 1;
      }
    }
  );

  while (num_of_scheduled > scheduled_members.length) {
    const dataRows = await SchedulePage.$$eval(
      "table#schedule-table tbody tr",
      (trs) => trs.length
    );

    for (let x = 1; x <= dataRows; x++) {
      const individualData = [
        volunteer,
        await SchedulePage.$eval(
          `#schedule-table > tbody > tr:nth-child(${x}) > td:nth-child(4) > div:nth-child(1)`,
          (div) => div.textContent.substr(5)
        ),
        await SchedulePage.$eval(
          `#schedule-table > tbody > tr:nth-child(${x}) > td:nth-child(4) > div:nth-child(2) > span`,
          (span) => span.textContent
        ),
        await SchedulePage.$eval(
          `#schedule-table > tbody > tr:nth-child(${x}) > td:nth-child(5) > span`,
          (span) => span.textContent
        ),
        await SchedulePage.$eval(
          `#schedule-table > tbody > tr:nth-child(${x}) > td:nth-child(5) > br`,
          (br) => br.nextSibling.textContent
        ),
        await SchedulePage.$eval(
          `#schedule-table > tbody > tr:nth-child(${x}) > td:nth-child(6) > div:nth-child(1)`,
          (div) => div.textContent.substr(4)
        ),
        await SchedulePage.$eval(
          `#schedule-table > tbody > tr:nth-child(${x}) > td:nth-child(6) > div:nth-child(2) > span`,
          (span) => span.textContent
        ),
        eventDate,
        eventTime,
        deadline,
      ];

      scheduled_members.push(individualData);
    }

    await SchedulePage.click("#schedule-table_next > a");
    await SchedulePage.waitForTimeout(10000);
  }

  await SchedulePage.waitForTimeout(5000);

  event.sorted_scheduled_members = scheduled_members.sort(
    (a, b) => b[1] - a[1]
  );

  await browser.close();

  return event;
};

const postData = async (data, spreadsheetId, range) => {
  const { googleSheets, auth } = await getSheetEditor();

  await googleSheets.spreadsheets.values.append({
    auth,
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    resource: {
      values: data,
    },
  });
};

const filterData = async (spreadsheetId, range, coulum_num) => {
  const { googleSheets } = await getSheetEditor();

  await googleSheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          setBasicFilter: {
            filter: {
              range,
              filterSpecs: [
                {
                  filterCriteria: {
                    condition: {
                      type: "DATE_EQ",
                      values: [
                        {
                          relativeDate: "TODAY",
                        },
                      ],
                    },
                  },
                  columnIndex: coulum_num,
                },
              ],
              sortSpecs: [
                {
                  sortOrder: "ASCENDING",
                  dimensionIndex: coulum_num,
                },
              ],
            },
          },
        },
      ],
      includeSpreadsheetInResponse: false,
    },
  });
};

const verify = async (event) => {
  const { spreadsheetId, eventDate, eventTime, deadline } = event;

  const { googleSheets } = await getSheetEditor();

  const addedData = await googleSheets.spreadsheets.values.batchGetByDataFilter(
    {
      spreadsheetId,
      requestBody: {
        dataFilters: [
          {
            a1Range: "Callings!H:J",
          },
        ],
        majorDimension: "ROWS",
        valueRenderOption: "UNFORMATTED_VALUE",
        dateTimeRenderOption: "FORMATTED_STRING",
      },
    }
  );

  const concernedData = addedData.data.valueRanges[0].valueRange.values.filter(
    (wara) =>
      wara[0] === eventDate && wara[1] === eventTime && wara[2] === deadline
  );

  if (concernedData.length > 0) {
    return "Skip";
  } else {
    return "Continue";
  }
};

const confirm = async (input) => {
  const { googleSheets, auth } = await getSheetEditor();

  const {
    center_num,
    eventTime,
    addPeopleButton,
    deadline,
    lb,
    spreadsheetId,
  } = input;

  const raw = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "Callings!D2:L",
  });

  const toConfirm = raw.data.values.filter(
    (row) =>
      row[6] == deadline &&
      row[8] === "COUNCIL TO ACCEPT" &&
      row[5] === eventTime
  );

  let confirmed = [];

  if (toConfirm.length < 1) {
    return confirmed;
  }

  // to start puppeteer
  const browser = await puppeteer.launch({
    // headless: false,
    // defaultViewport: null,
    // args: ["--start-maximized"],
    args: ["--no-sandbox"],
  });

  // To login in JKReg app
  const LoginPage = await browser.newPage();
  await LoginPage.goto("https://jkreg.iiindia.org/login");
  await LoginPage.type("[name=username]", credentials[lb].username);
  await LoginPage.type("[name=password]", credentials[lb].password);
  await LoginPage.keyboard.press("Enter");
  await LoginPage.waitForNavigation();
  await LoginPage.close();

  // Creates and opens scheduling page of JKReg app
  const SchedulePage = await browser.newPage();
  await SchedulePage.goto(
    `https://jkreg.iiindia.org/admin/${lb}/capacity_control/schedule`
  );

  await SchedulePage.select("select#ft-center", center_num);

  if (eventTime === "Morning") {
    await SchedulePage.select('select[name="filters[event_code]"]', "4");
    await SchedulePage.click(applyButton);
    await SchedulePage.waitForTimeout(5000);
    await SchedulePage.click(addPeopleButton);
  } else if (eventTime === "Evening") {
    const eventRows = await SchedulePage.$$eval(
      "#schedule_scroll > table > tbody > tr",
      (trs) => trs.length
    );

    await SchedulePage.select('select[name="filters[event_code]"]', "0");
    await SchedulePage.click(applyButton);
    await SchedulePage.waitForTimeout(5000);

    for (let x = 2; x <= eventRows; x++) {
      try {
        await SchedulePage.click(
          addPeopleButton.substr(0, 48) + x + addPeopleButton.substr(48)
        );
        break;
      } catch (error) {
        continue;
      }
    }
  }

  await SchedulePage.waitForTimeout(5000);
  await SchedulePage.select("select#sl-status", "assign");

  for (let i = 0; i < toConfirm.length; i++) {
    console.log({ Name: toConfirm[i][0], count: i });
    await SchedulePage.type("#ip-keyword", toConfirm[i][0]);
    await SchedulePage.waitForTimeout(1000);
    await SchedulePage.click("#bt-search");
    await SchedulePage.waitForTimeout(10000);

    const dataRows = await SchedulePage.$$eval(
      "#schedule-table > tbody > tr",
      (trs) => trs.length
    );

    let tagretRow = 1;

    if (dataRows > 1) {
      for (let y = 1; y < dataRows; y++) {
        try {
          const name_to_check = await SchedulePage.$eval(
            `#schedule-table > tbody > tr:nth-child(${y}) > td:nth-child(5) > span`,
            (span) => span.textContent
          );

          if (name_to_check === toConfirm[i][0]) {
            tagretRow = y;
            break;
          }
        } catch (error) {
          console.log(error.message);
        }
      }
    }

    try {
      const pre_status = await SchedulePage.$eval(
        `#schedule-table > tbody > tr:nth-child(${tagretRow}) > td:nth-child(1) > span:nth-child(1)`,
        (ele) => ele.textContent
      );

      if (pre_status == "Confirmed" || pre_status == "Declined") {
        toConfirm[i][8] = `Murid ${pre_status} their wara.`;
        continue;
      }

      await SchedulePage.click(
        `#schedule-table > tbody > tr:nth-child(${tagretRow}) > td:nth-child(10) > button`
      );
      await SchedulePage.waitForTimeout(5000);
      await SchedulePage.click("#swal-confirm");
      await SchedulePage.waitForTimeout(15000);

      const post_status = await SchedulePage.$eval(
        `#schedule-table > tbody > tr:nth-child(${tagretRow}) > td:nth-child(1) > span:nth-child(1)`,
        (ele) => ele.textContent
      );

      if (post_status !== "Confirmed") {
        toConfirm[i][8] = "Not Confirmed";
      } else {
        toConfirm[i][8] = "Confirmed";
      }
    } catch (err) {
      toConfirm[i][8] = "Tried to Confirm";
      console.log(err.message);
    }

    confirmed.push(toConfirm[i]);

    await SchedulePage.click("#ip-keyword", { clickCount: 3 });
    await SchedulePage.keyboard.press("Backspace");
  }

  await SchedulePage.waitForTimeout(5000);

  await browser.close();

  return confirmed;
};

module.exports = { getData, postData, filterData, verify, getClock, confirm };
