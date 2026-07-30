const goal = 60000;

// 日历从 2026 年 8 月开始
// JavaScript 的月份从 0 开始，所以 7 代表 8 月
const firstMonth = new Date(2026, 7, 1);

// 打开网页时默认显示 2026 年 8 月
let viewingDate = new Date(firstMonth);

// 读取以前保存的总金额
let saved = Number(localStorage.getItem("qiqiSaved")) || 0;

// 读取已经存过钱的日期
let savedDates = [];

try {
  const storedDates = JSON.parse(
    localStorage.getItem("qiqiSavedDates") || "[]"
  );

  if (Array.isArray(storedDates)) {
    savedDates = storedDates;
  }
} catch {
  savedDates = [];
}

// 获取网页上的元素
const amountText = document.getElementById("amount");
const progressBar = document.getElementById("progressBar");
const saveButton = document.getElementById("saveButton");

const monthTitle = document.getElementById("monthTitle");
const calendarDays = document.getElementById("calendarDays");
const prevMonthButton = document.getElementById("prevMonth");
const nextMonthButton = document.getElementById("nextMonth");

// 把日期转换成 2026-08-01 这种格式
function getDateKey(date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// 格式化金额
function formatMoney(value) {
  return value.toLocaleString("zh-CN", {
    maximumFractionDigits: 2
  });
}

// 更新存钱金额与进度条
function updateSavings() {
  const progress = Math.min(
    (saved / goal) * 100,
    100
  );

  amountText.textContent =
    `已存：¥${formatMoney(saved)} / ` +
    `¥${formatMoney(goal)}（${progress.toFixed(1)}%）`;

  progressBar.style.width = `${progress}%`;
}

// 生成当前月份的日历
function renderCalendar() {
  const year = viewingDate.getFullYear();
  const month = viewingDate.getMonth();

  monthTitle.textContent =
    `${year}年${month + 1}月`;

  calendarDays.innerHTML = "";

  // 到了 2026 年 8 月以后，不允许再往前翻
  const isFirstMonth =
    year === firstMonth.getFullYear() &&
    month === firstMonth.getMonth();

  prevMonthButton.disabled = isFirstMonth;
  prevMonthButton.style.opacity =
    isFirstMonth ? "0.25" : "1";

  // 获取这个月第一天是星期几
  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();

  // 日历以星期一作为第一列
  const emptyCount = (firstDay + 6) % 7;

  // 获取这个月一共有多少天
  const totalDays = new Date(
    year,
    month + 1,
    0
  ).getDate();

  // 添加月初的空白格
  for (let i = 0; i < emptyCount; i++) {
    const emptyDay =
      document.createElement("div");

    emptyDay.className = "empty-day";

    calendarDays.appendChild(emptyDay);
  }

  const todayKey = getDateKey(new Date());

  // 添加这个月的每一天
  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(
      year,
      month,
      day
    );

    const dateKey = getDateKey(date);

    const dayElement =
      document.createElement("div");

    dayElement.className = "day";
    dayElement.textContent = day;

    // 今天显示粉紫色圆圈
    if (dateKey === todayKey) {
      dayElement.classList.add("today");
    }

    // 存过钱的日期显示爱心
    if (savedDates.includes(dateKey)) {
      dayElement.classList.add("saved");
    }

    calendarDays.appendChild(dayElement);
  }
}

// 点击“今天存钱”
saveButton.addEventListener(
  "click",
  function () {
    const input = prompt(
      "七七今天存了多少钱？"
    );

    // 点取消时什么也不做
    if (input === null) {
      return;
    }

    const amount = Number(input.trim());

    // 阻止错误金额
    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      alert("请输入一个大于 0 的数字～");
      return;
    }

    // 增加总金额
    saved += amount;

    // 记录今天的日期
    const todayKey = getDateKey(new Date());

    if (!savedDates.includes(todayKey)) {
      savedDates.push(todayKey);
    }

    // 保存到手机浏览器
    localStorage.setItem(
      "qiqiSaved",
      String(saved)
    );

    localStorage.setItem(
      "qiqiSavedDates",
      JSON.stringify(savedDates)
    );

    updateSavings();
    renderCalendar();
  }
);

// 上一个月
prevMonthButton.addEventListener(
  "click",
  function () {
    if (prevMonthButton.disabled) {
      return;
    }

    viewingDate.setMonth(
      viewingDate.getMonth() - 1
    );

    renderCalendar();
  }
);

// 下一个月
nextMonthButton.addEventListener(
  "click",
  function () {
    viewingDate.setMonth(
      viewingDate.getMonth() + 1
    );

    renderCalendar();
  }
);

// 第一次打开网页时运行
updateSavings();
renderCalendar();
