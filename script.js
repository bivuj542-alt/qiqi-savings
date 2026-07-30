const goal = 60000;

let saved = Number(localStorage.getItem("qiqiSaved")) || 0;

let savedDates;

try {
  savedDates = JSON.parse(
    localStorage.getItem("qiqiSavedDates") || "[]"
  );
} catch {
  savedDates = [];
}

const amountText = document.getElementById("amount");
const progressBar = document.getElementById("progressBar");
const saveButton = document.getElementById("saveButton");

const monthTitle = document.getElementById("monthTitle");
const calendarDays = document.getElementById("calendarDays");
const prevMonthButton = document.getElementById("prevMonth");
const nextMonthButton = document.getElementById("nextMonth");

let viewingDate = new Date();
viewingDate.setDate(1);

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function updateSavings() {
  const progress = Math.min((saved / goal) * 100, 100);

  amountText.textContent =
    `已存：¥${saved.toLocaleString("zh-CN")} / ` +
    `¥${goal.toLocaleString("zh-CN")}（${progress.toFixed(1)}%）`;

  progressBar.style.width = `${progress}%`;
}

function renderCalendar() {
  const year = viewingDate.getFullYear();
  const month = viewingDate.getMonth();

  monthTitle.textContent = `${year}年${month + 1}月`;
  calendarDays.innerHTML = "";

  const firstDay = new Date(year, month, 1).getDay();

  // 把星期一放在第一列
  const emptyCount = (firstDay + 6) % 7;

  const totalDays = new Date(
    year,
    month + 1,
    0
  ).getDate();

  for (let i = 0; i < emptyCount; i++) {
    const emptyDay = document.createElement("div");
    emptyDay.className = "empty-day";
    calendarDays.appendChild(emptyDay);
  }

  const todayKey = getDateKey(new Date());

  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day);
    const dateKey = getDateKey(date);

    const dayElement = document.createElement("div");

    dayElement.className = "day";
    dayElement.textContent = day;

    if (dateKey === todayKey) {
      dayElement.classList.add("today");
    }

    if (savedDates.includes(dateKey)) {
      dayElement.classList.add("saved");
    }

    calendarDays.appendChild(dayElement);
  }
}

saveButton.addEventListener("click", function () {
  const input = prompt("七七今天存了多少钱？");

  if (input === null) {
    return;
  }

  const amount = Number(input.trim());

  if (!Number.isFinite(amount) || amount <= 0) {
    alert("请输入一个大于 0 的数字～");
    return;
  }

  saved += amount;

  const todayKey = getDateKey(new Date());

  if (!savedDates.includes(todayKey)) {
    savedDates.push(todayKey);
  }

  localStorage.setItem("qiqiSaved", String(saved));

  localStorage.setItem(
    "qiqiSavedDates",
    JSON.stringify(savedDates)
  );

  updateSavings();
  renderCalendar();
});

prevMonthButton.addEventListener("click", function () {
  viewingDate.setMonth(viewingDate.getMonth() - 1);
  renderCalendar();
});

nextMonthButton.addEventListener("click", function () {
  viewingDate.setMonth(viewingDate.getMonth() + 1);
  renderCalendar();
});

// 把刚才已经存入的 120 元标记在今天
if (saved > 0 && savedDates.length === 0) {
  savedDates.push(getDateKey(new Date()));

  localStorage.setItem(
    "qiqiSavedDates",
    JSON.stringify(savedDates)
  );
}

updateSavings();
renderCalendar();
