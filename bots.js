const { addPeopleButtons, centers } = require("./constants.js");
const {
  getData,
  postData,
  filterData,
  verify,
  getClock,
  confirm,
} = require("./middleware.js");

const bot_1 = async () => {
  const clock = getClock();

  const eveningPossibleDates = [clock.currentDate, clock.nextDate];
  const morningPossibleDates = [clock.nextDate, clock.dateAfterTomorrow];

  let volunteerSelector;
  let eventTime;
  let deadlines;
  let possibleDates;
  let centersToUse;
  let volunteersToSkip = [];

  let eventStatuses = [];

  if (clock.currentTime >= 9 && clock.currentTime < 11) {
    eventTime = "Evening";
    volunteerSelector = "evening";
    deadlines = ["12:00 pm", "06:00 pm"];
    possibleDates = eveningPossibleDates;
    centersToUse = centers;
    volunteersToSkip = ["Jasmine Samnani"];
  } else if (clock.currentTime >= 12 && clock.currentTime < 14) {
    eventTime = "Evening";
    volunteerSelector = "evening";
    deadlines = ["12:00 pm", "06:00 pm"];
    possibleDates = eveningPossibleDates;
    centersToUse = [centers[2]];
    volunteersToSkip = ["Ruksana Patel"];
  } else if (clock.currentTime >= 15 && clock.currentTime < 17) {
    eventTime = "Morning";
    volunteerSelector = "morning";
    deadlines = ["06:00 pm", "10:00 pm"];
    possibleDates = morningPossibleDates;
    centersToUse = [centers[2], centers[4]];
  } else {
    console.log(clock.currentTime);
    return "Please execute this script between 9 am to 11 am, 12 pm to 2 pm & 3 pm to 5 pm";
  }

  for await (const center of centersToUse) {
    let count = 0;

    for await (const button of addPeopleButtons[volunteerSelector]) {
      const deadlineTime = deadlines[count];
      const eventDate = possibleDates[count];

      if (
        volunteersToSkip.includes(center.volunteers[volunteerSelector][count])
      ) {
        eventStatuses.push({
          status: "Skipped. Event to be skipped on volunteers request.",
          details: {
            eventDate,
            eventTime,
            center: center.center,
            remaining: {
              floor: {
                male: "N/A",
                female: "N/A",
              },
              chair: {
                male: "N/A",
                female: "N/A",
              },
            },
            deadline: count + 1,
          },
        });

        console.log(
          "Skipping iteration. Code 3. For: " +
            center.center +
            " " +
            eventDate +
            " " +
            eventTime
        );

        count++;
        continue;
      }

      const doNext = await verify({
        spreadsheetId: center.sheet_id,
        eventDate,
        eventTime,
        deadline: clock.currentDate + " " + deadlineTime,
      });

      if (doNext === "Skip") {
        eventStatuses.push({
          status: "Skipped. Event already in google sheets.",
          details: {
            eventDate,
            eventTime,
            center: center.center,
            remaining: {
              floor: {
                male: "N/A",
                female: "N/A",
              },
              chair: {
                male: "N/A",
                female: "N/A",
              },
            },
            deadline: count + 1,
          },
        });

        console.log(
          "Skipping iteration. Code 1. For: " +
            center.center +
            " " +
            eventDate +
            " " +
            eventTime
        );

        count++;
        continue;
      }

      const event = await getData({
        center_num: center.selector_num,
        volunteer: center.volunteers[volunteerSelector][count] || "",
        eventDate,
        eventTime,
        deadline: clock.currentDate + " " + deadlineTime,
        addPeopleButton: button,
        lb: center.lb,
      });

      if (event.sorted_scheduled_members.length < 1) {
        eventStatuses.push({
          status: "Skipped. Event has no scheduled members.",
          details: {
            eventDate,
            eventTime,
            center: center.center,
            remaining: event.remaining,
            deadline: count + 1,
          },
        });

        console.log(
          "Skipping iteration. Code 2 For: " +
            center.center +
            " " +
            eventDate +
            " " +
            eventTime
        );

        count++;
        continue;
      }

      try {
        await postData(
          event.sorted_scheduled_members,
          center.sheet_id,
          "Callings!A:J"
        );
      } catch (err) {
        try {
          await postData(
            event.sorted_scheduled_members,
            center.sheet_id,
            "Callings!A:J"
          );
        } catch (error) {
          console.log({
            message: error.message,
            details: {
              eventDate,
              eventTime,
              center: center.center,
            },
          });
        }
      }

      eventStatuses.push({
        status: "Event posted succesfully!",
        details: {
          eventDate,
          eventTime,
          center: center.center,
          remaining: event.remaining,
          deadline: count + 1,
        },
      });

      count++;
    }

    try {
      await filterData(
        center.sheet_id,
        {
          sheetId: center.gid_1,
          startColumnIndex: 0,
          startRowIndex: 0,
          endColumnIndex: 13,
        },
        9
      );
    } catch (err) {
      try {
        await filterData(
          center.sheet_id,
          {
            sheetId: center.gid_1,
            startColumnIndex: 0,
            startRowIndex: 0,
            endColumnIndex: 13,
          },
          9
        );
      } catch (error) {
        console.log({
          message: error.message,
          details: {
            eventDate,
            eventTime,
            center: center.center,
          },
        });
      }
    }
  }

  return eventStatuses;
};

const bot_2 = async () => {
  const clock = getClock();

  const eveningPossibleDates = [clock.currentDate, clock.nextDate];
  const morningPossibleDates = [clock.nextDate, clock.dateAfterTomorrow];

  let volunteerSelector;
  let eventTime;
  let deadlineTime;
  let possibleDates;

  let eventStatuses = [];

  const centersToUse = [centers[2]];

  if (clock.currentTime >= 12 && clock.currentTime < 14) {
    eventTime = "Evening";
    volunteerSelector = "evening";
    deadlineTime = "1:00 pm";
    possibleDates = eveningPossibleDates;
  } else if (clock.currentTime >= 19 && clock.currentTime < 21) {
    eventTime = "Morning";
    volunteerSelector = "morning";
    deadlineTime = "8:30 pm";
    possibleDates = morningPossibleDates;
  } else {
    console.log(clock.currentTime);
    return "Please execute this script between 12 pm to 2 pm & 7 pm to 9 pm";
  }

  for await (const center of centersToUse) {
    let count = 0;

    const button = addPeopleButtons[volunteerSelector][0];
    const eventDate = possibleDates[count];

    const event = await getData({
      center_num: center.selector_num,
      volunteer: center.volunteers[volunteerSelector][count] || "",
      eventDate,
      eventTime,
      deadline: clock.currentDate + " " + deadlineTime,
      addPeopleButton: button,
      lb: center.lb,
    });

    const remaining_data = [
      eventDate,
      eventTime,
      clock.currentDate + " " + deadlineTime,
      event.remaining.floor.male,
      event.remaining.floor.female,
      event.remaining.chair.male,
      event.remaining.chair.female,
    ];

    await postData([remaining_data], center.sheet_id, "Remaining!A:G");

    eventStatuses.push({
      status: "Event posted succesfully!",
      details: {
        eventDate,
        eventTime,
        center: center.center,
        remaining: event.remaining,
        deadline: count + 1,
      },
    });

    count++;

    await filterData(
      center.sheet_id,
      {
        sheetId: center.gid_2,
        startColumnIndex: 0,
        startRowIndex: 1,
        endColumnIndex: 7,
      },
      2
    );
  }

  return eventStatuses;
};

const bot_3 = async () => {
  const clock = getClock();

  let deadline;
  let events;

  if (clock.currentTime >= 12 && clock.currentTime < 13) {
    events = [
      {
        time: "Evening",
        button: addPeopleButtons.evening[0],
        centersToUse: [centers[2], centers[3]],
      },
    ];
    deadline = "12:00 pm";
  } else if (clock.currentTime >= 16 && clock.currentTime < 19) {
    events = [
      {
        time: "Evening",
        button: addPeopleButtons.evening[1],
        centersToUse: [centers[2], centers[3]],
      },
      {
        time: "Morning",
        button: addPeopleButtons.morning[0],
        centersToUse: [centers[2], centers[3]],
      },
    ];
    deadline = "06:00 pm";
  } else if (clock.currentTime >= 22 && clock.currentTime < 23) {
    events = [
      {
        time: "Morning",
        button: addPeopleButtons.morning[1],
        centersToUse: [centers[2], centers[3]],
      },
    ];
    deadline = "10:00 pm";
  } else {
    console.log(clock.currentTime);
    return "Please execute this script between 12 am to 1 pm or 6 pm to 7 pm or 10 pm to 11 pm";
  }

  for (let x = 0; x < events.length; x++) {
    for (let y = 0; y < events[x].centersToUse.length; y++) {
      const confirmedMurids = await confirm({
        center_num: events[x].centersToUse[y].selector_num,
        eventTime: events[x].time,
        addPeopleButton: events[x].button,
        deadline: clock.currentDate + " " + deadline,
        lb: events[x].centersToUse[y].lb,
        spreadsheetId: events[x].centersToUse[y].sheet_id,
      });

      if (confirmedMurids.length < 1) {
        return "No murid needs assistance.";
      }

      await postData(
        confirmedMurids,
        events[x].centersToUse[y].sheet_id,
        "Confirmed!A:I"
      );

      await filterData(
        events[x].centersToUse[y].sheet_id,
        {
          sheetId: events[x].centersToUse[y].gid_3,
          startColumnIndex: 0,
          startRowIndex: 0,
          endColumnIndex: 9,
        },
        6
      );
    }
  }

  return "Waras confirmed succesfully";
};

const bot_4 = async (input) => {
  let { deadline, time, center, verification } = input;
  deadline = deadline - 1;

  const clock = getClock();

  const eveningPossibleDates = [clock.currentDate, clock.nextDate];
  const morningPossibleDates = [clock.nextDate, clock.dateAfterTomorrow];
  const eveningDeadlines = ["12:00 pm", "06:00 pm"];
  const morningDeadlines = ["6:00 pm", "10:00 pm"];

  let eventDate;
  let deadlineTime;

  if (time === "Morning") {
    eventDate = morningPossibleDates[deadline];
    deadlineTime = morningDeadlines[deadline];
  } else {
    eventDate = eveningPossibleDates[deadline];
    deadlineTime = eveningDeadlines[deadline];
  }

  const centerToUse = centers.find((ele) => ele.center === center);

  if (verification === "true") {
    const doNext = await verify({
      spreadsheetId: centerToUse.sheet_id,
      eventDate,
      eventTime: time,
      deadline: clock.currentDate + " " + deadlineTime,
    });

    if (doNext === "Skip") {
      console.log(
        "Skipping iteration. Code 1. For: " +
          centerToUse.center +
          " " +
          eventDate +
          " " +
          time
      );

      return [
        {
          status: "Skipped. Event already in google sheets.",
          details: {
            eventDate,
            eventTime: time,
            center: centerToUse.center,
            remaining: {
              floor: {
                male: "N/A",
                female: "N/A",
              },
              chair: {
                male: "N/A",
                female: "N/A",
              },
            },
            deadline: deadline + 1,
          },
        },
      ];
    }
  }

  const event = await getData({
    center_num: centerToUse.selector_num,
    volunteer: centerToUse.volunteers[time.toLowerCase()][deadline] || "",
    eventDate,
    eventTime: time,
    deadline: clock.currentDate + " " + deadlineTime,
    addPeopleButton: addPeopleButtons[time.toLowerCase()][deadline],
    lb: centerToUse.lb,
  });

  if (event.sorted_scheduled_members.length < 1) {
    console.log(
      "Skipping iteration. Code 2 For: " +
        centerToUse.center +
        " " +
        eventDate +
        " " +
        time
    );

    return [
      {
        status: "Skipped. Event has no scheduled members.",
        details: {
          eventDate,
          eventTime: time,
          center: centerToUse.center,
          remaining: event.remaining,
          deadline: deadline + 1,
        },
      },
    ];
  }

  try {
    await postData(
      event.sorted_scheduled_members,
      centerToUse.sheet_id,
      "Callings!A:J"
    );
  } catch (err) {
    try {
      await postData(
        event.sorted_scheduled_members,
        centerToUse.sheet_id,
        "Callings!A:J"
      );
    } catch (error) {
      console.log({
        message: error.message,
        details: {
          eventDate,
          eventTime: time,
          center: centerToUse.center,
        },
      });
    }
  }

  try {
    await filterData(
      centerToUse.sheet_id,
      {
        sheetId: centerToUse.gid_1,
        startColumnIndex: 0,
        startRowIndex: 0,
        endColumnIndex: 13,
      },
      9
    );
  } catch (err) {
    try {
      await filterData(
        centerToUse.sheet_id,
        {
          sheetId: centerToUse.gid_1,
          startColumnIndex: 0,
          startRowIndex: 0,
          endColumnIndex: 13,
        },
        9
      );
    } catch (error) {
      console.log({
        message: error.message,
        details: {
          eventDate,
          eventTime: time,
          center: centerToUse.center,
        },
      });
    }
  }

  return [
    {
      status: "Event posted succesfully!",
      details: {
        eventDate,
        eventTime: time,
        center: centerToUse.center,
        remaining: event.remaining,
        deadline: deadline + 1,
      },
    },
  ];
};

const bot_5 = async (input) => {
  let { deadline, time, center } = input;
  deadline = deadline - 1;

  const clock = getClock();
  const centerToUse = centers.find((ele) => ele.center === center);

  const eveningDeadlines = ["12:00 pm", "06:00 pm"];
  const morningDeadlines = ["6:00 pm", "10:00 pm"];

  let deadlineTime;

  if (time === "Morning") {
    deadlineTime = morningDeadlines[deadline];
  } else {
    deadlineTime = eveningDeadlines[deadline];
  }

  const confirmedMurids = await confirm({
    center_num: centerToUse.selector_num,
    eventTime: time,
    addPeopleButton: addPeopleButtons[time.toLowerCase()][deadline],
    deadline: clock.currentDate + " " + deadlineTime,
    lb: centerToUse.lb,
    spreadsheetId: centerToUse.sheet_id,
  });

  if (confirmedMurids.length < 1) {
    return "No murid needs assistance.";
  }

  await postData(confirmedMurids, centerToUse.sheet_id, "Confirmed!A:I");

  await filterData(
    centerToUse.sheet_id,
    {
      sheetId: centerToUse.gid_3,
      startColumnIndex: 0,
      startRowIndex: 0,
      endColumnIndex: 9,
    },
    6
  );

  return "Waras confirmed succesfully";
};

module.exports = { bot_1, bot_2, bot_3, bot_4, bot_5 };
