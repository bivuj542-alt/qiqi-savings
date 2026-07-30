const goal = 60000;

// 打开网页时默认显示 2026 年 8 月
let viewingDate = new Date(2026, 7, 1);

// 获取网页元素
const amountText =
  document.getElementById("amount");

const progressBar =
  document.getElementById("progressBar");

const saveButton =
  document.getElementById("saveButton");

const monthTitle =
  document.getElementById("monthTitle");

const calendarDays =
  document.getElementById("calendarDays");

const prevMonthButton =
  document.getElementById("prevMonth");

const nextMonthButton =
  document.getElementById("nextMonth");

const recordList =
  document.getElementById("recordList");

const recordCount =
  document.getElementById("recordCount");

const modalOverlay =
  document.getElementById("modalOverlay");

const closeModalButton =
  document.getElementById("closeModal");

const cancelSaveButton =
  document.getElementById("cancelSave");

const saveForm =
  document.getElementById("saveForm");

const saveAmountInput =
  document.getElementById("saveAmount");

const saveDateInput =
  document.getElementById("saveDate");

const saveNoteInput =
  document.getElementById("saveNote");

const formError =
  document.getElementById("formError");

// 安全读取本地保存的数据
function readJSON(key, fallback) {
  try {
    const value = JSON.parse(
      localStorage.getItem(key)
    );

    return value ?? fallback;
  } catch {
    return fallback;
  }
}

// 把日期变成 2026-08-01
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
  return Number(value).toLocaleString(
    "zh-CN",
    {
      maximumFractionDigits: 2
    }
  );
}

// 格式化记录日期
function formatRecordDate(dateString) {
  const parts = dateString.split("-");

  if (parts.length !== 3) {
    return dateString;
  }

  return (
    `${parts[0]}年` +
    `${Number(parts[1])}月` +
    `${Number(parts[2])}日`
  );
}

// 读取存钱记录
let records = readJSON(
  "qiqiSavingRecords",
  []
);

if (!Array.isArray(records)) {
  records = [];
}

// 把之前测试的 120 元自动变成一条旧记录
if (records.length === 0) {
  const oldTotal =
    Number(
      localStorage.getItem("qiqiSaved")
    ) || 0;

  const oldDates =
    readJSON("qiqiSavedDates", []);

  if (oldTotal > 0) {
    const oldDate =
      Array.isArray(oldDates) &&
      oldDates.length > 0
        ? oldDates[0]
        : getDateKey(new Date());

    records.push({
      id: `old-${Date.now()}`,
      amount: oldTotal,
      date: oldDate,
      note: "之前已存",
      createdAt: Date.now()
    });
  }
}

// 计算总金额
function getSavedTotal() {
  return records.reduce(
    (total, record) =>
      total + Number(record.amount || 0),
    0
  );
}

// 获取所有存过钱的日期
function getSavedDates() {
  return [
    ...new Set(
      records
        .map(record => record.date)
        .filter(Boolean)
    )
  ];
}

// 把数据保存进手机浏览器
function saveLocalData() {
  const total = getSavedTotal();
  const savedDates = getSavedDates();

  localStorage.setItem(
    "qiqiSavingRecords",
    JSON.stringify(records)
  );

  // 同时保留旧数据格式
  localStorage.setItem(
    "qiqiSaved",
    String(total)
  );

  localStorage.setItem(
    "qiqiSavedDates",
    JSON.stringify(savedDates)
  );
}

// 更新金额和进度条
function updateSavings() {
  const total = getSavedTotal();

  const progress = Math.min(
    (total / goal) * 100,
    100
  );

  amountText.textContent =
    `已存：¥${formatMoney(total)} / ` +
    `¥${formatMoney(goal)}（${progress.toFixed(1)}%）`;

  const visibleProgress =
    total > 0
      ? Math.max(progress, 1.2)
      : 0;

  progressBar.style.width =
    `${visibleProgress}%`;
}

// 生成日历
function renderCalendar() {
  const year =
    viewingDate.getFullYear();

  const month =
    viewingDate.getMonth();

  monthTitle.textContent =
    `${year}年${month + 1}月`;

  calendarDays.innerHTML = "";

  const firstDay =
    new Date(
      year,
      month,
      1
    ).getDay();

  // 星期一放第一列
  const emptyCount =
    (firstDay + 6) % 7;

  const totalDays =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  for (
    let i = 0;
    i < emptyCount;
    i++
  ) {
    const emptyDay =
      document.createElement("div");

    emptyDay.className = "empty-day";

    calendarDays.appendChild(
      emptyDay
    );
  }

  const todayKey =
    getDateKey(new Date());

  const savedDateSet =
    new Set(getSavedDates());

  for (
    let day = 1;
    day <= totalDays;
    day++
  ) {
    const date =
      new Date(
        year,
        month,
        day
      );

    const dateKey =
      getDateKey(date);

    const dayElement =
      document.createElement("div");

    dayElement.className = "day";
    dayElement.textContent = day;

    if (dateKey === todayKey) {
      dayElement.classList.add(
        "today"
      );
    }

    if (
      savedDateSet.has(dateKey)
    ) {
      dayElement.classList.add(
        "saved"
      );
    }

    calendarDays.appendChild(
      dayElement
    );
  }
}

// 生成最近记录
function renderRecords() {
  recordList.innerHTML = "";

  recordCount.textContent =
    `${records.length} 笔`;

  if (records.length === 0) {
    const empty =
      document.createElement("p");

    empty.className =
      "empty-records";

    empty.textContent =
      "还没有存钱记录，第一笔正等着七七呢 ✨";

    recordList.appendChild(empty);

    return;
  }

  const sortedRecords =
    [...records].sort(
      (a, b) => {
        const dateCompare =
          String(b.date).localeCompare(
            String(a.date)
          );

        if (dateCompare !== 0) {
          return dateCompare;
        }

        return (
          Number(b.createdAt || 0) -
          Number(a.createdAt || 0)
        );
      }
    );

  sortedRecords
    .slice(0, 8)
    .forEach(record => {
      const item =
        document.createElement("article");

      item.className = "record-item";

      const info =
        document.createElement("div");

      info.className = "record-info";

      const date =
        document.createElement("span");

      date.className = "record-date";

      date.textContent =
        formatRecordDate(record.date);

      const note =
        document.createElement("span");

      note.className = "record-note";

      note.textContent =
        record.note || "存入小金库";

      const money =
        document.createElement("strong");

      money.className = "record-amount";

      money.textContent =
        `+¥${formatMoney(record.amount)}`;

      info.appendChild(date);
      info.appendChild(note);

      item.appendChild(info);
      item.appendChild(money);

      recordList.appendChild(item);
    });
}

// 更新整个页面
function updatePage() {
  updateSavings();
  renderCalendar();
  renderRecords();
}

// 打开弹窗
function openModal() {
  saveAmountInput.value = "";
  saveNoteInput.value = "";
  saveDateInput.value =
    getDateKey(new Date());

  formError.textContent = "";

  modalOverlay.hidden = false;

  document.body.classList.add(
    "modal-open"
  );

  requestAnimationFrame(() => {
    modalOverlay.classList.add(
      "show"
    );
  });
}

// 关闭弹窗
function closeModal() {
  modalOverlay.classList.remove(
    "show"
  );

  document.body.classList.remove(
    "modal-open"
  );

  setTimeout(() => {
    modalOverlay.hidden = true;
  }, 200);
}

// 点击记一笔存钱
saveButton.addEventListener(
  "click",
  openModal
);

closeModalButton.addEventListener(
  "click",
  closeModal
);

cancelSaveButton.addEventListener(
  "click",
  closeModal
);

// 点击弹窗外面关闭
modalOverlay.addEventListener(
  "click",
  function (event) {
    if (
      event.target === modalOverlay
    ) {
      closeModal();
    }
  }
);

// 提交存钱记录
saveForm.addEventListener(
  "submit",
  function (event) {
    event.preventDefault();

    formError.textContent = "";

    const cleanedAmount =
      saveAmountInput.value
        .replace(/,/g, "")
        .trim();

    const amount =
      Number(cleanedAmount);

    const date =
      saveDateInput.value;

    const note =
      saveNoteInput.value.trim();

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      formError.textContent =
        "请输入一个大于 0 的金额～";

      return;
    }

    if (!date) {
      formError.textContent =
        "请选择存钱日期～";

      return;
    }

    records.push({
      id:
        `${Date.now()}-` +
        `${Math.random()
          .toString(16)
          .slice(2)}`,

      amount,
      date,
      note,
      createdAt: Date.now()
    });

    saveLocalData();

    // 保存后自动跳到这笔记录所在月份
    const selectedDate =
      new Date(`${date}T00:00:00`);

    viewingDate =
      new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1
      );

    updatePage();
    closeModal();
  }
);

// 上个月
prevMonthButton.addEventListener(
  "click",
  function () {
    viewingDate.setMonth(
      viewingDate.getMonth() - 1
    );

    renderCalendar();
  }
);

// 下个月
nextMonthButton.addEventListener(
  "click",
  function () {
    viewingDate.setMonth(
      viewingDate.getMonth() + 1
    );

    renderCalendar();
  }
);

// 按键盘 Esc 关闭弹窗
document.addEventListener(
  "keydown",
  function (event) {
    if (
      event.key === "Escape" &&
      !modalOverlay.hidden
    ) {
      closeModal();
    }
  }
);

// 第一次打开页面
saveLocalData();
updatePage();
