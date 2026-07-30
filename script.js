const goal = 60000;
const planStartDate = "2026-08-01";

// 默认打开 2026 年 8 月
let viewingDate = new Date(2026, 7, 1);

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


function formatMoney(value) {
  return Number(value).toLocaleString(
    "zh-CN",
    {
      maximumFractionDigits: 2
    }
  );
}


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


let records = readJSON(
  "qiqiSavingRecords",
  []
);

if (!Array.isArray(records)) {
  records = [];
}


// 兼容之前的测试数据
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


function getSavedTotal() {
  return records.reduce(
    (total, record) =>
      total + Number(record.amount || 0),
    0
  );
}


function getSavedDates() {
  return [
    ...new Set(
      records
        .map(record => record.date)
        .filter(Boolean)
    )
  ];
}


function saveLocalData() {
  const total = getSavedTotal();
  const savedDates = getSavedDates();

  localStorage.setItem(
    "qiqiSavingRecords",
    JSON.stringify(records)
  );

  localStorage.setItem(
    "qiqiSaved",
    String(total)
  );

  localStorage.setItem(
    "qiqiSavedDates",
    JSON.stringify(savedDates)
  );
}


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

    if (savedDateSet.has(dateKey)) {
      dayElement.classList.add(
        "saved"
      );
    }

    calendarDays.appendChild(
      dayElement
    );
  }
}


function addManagementStyles() {
  if (
    document.getElementById(
      "managementStyles"
    )
  ) {
    return;
  }

  const style =
    document.createElement("style");

  style.id = "managementStyles";

  style.textContent = `
    .record-side {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }

    .record-delete {
      width: 34px;
      height: 34px;
      display: grid;
      place-items: center;
      padding: 0;
      border: 0;
      border-radius: 50%;
      color: #b07091;
      background: rgba(196, 114, 155, 0.10);
      font-size: 17px;
      cursor: pointer;
    }

    .record-delete:active {
      transform: scale(0.9);
    }

    .data-tools {
      margin-top: 22px;
      padding-top: 17px;
      border-top: 1px solid rgba(112, 87, 128, 0.12);
    }

    .clear-data-button {
      width: 100%;
      min-height: 45px;
      border: 0;
      border-radius: 15px;
      color: #9a7088;
      background: rgba(172, 106, 140, 0.08);
      font-size: 14px;
      font-weight: 650;
      cursor: pointer;
    }

    .clear-data-button:active {
      transform: scale(0.97);
    }

    .confirm-overlay {
      position: fixed;
      inset: 0;
      z-index: 50;
      display: grid;
      place-items: center;
      padding: 22px;
      background: rgba(15, 9, 29, 0.58);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }

    .confirm-card {
      width: min(100%, 360px);
      padding: 25px 21px 20px;
      border: 1px solid rgba(255, 255, 255, 0.72);
      border-radius: 25px;
      background: rgba(255, 248, 240, 0.99);
      box-shadow: 0 30px 80px rgba(8, 4, 28, 0.48);
      text-align: center;
    }

    .confirm-icon {
      margin-bottom: 7px;
      font-size: 35px;
    }

    .confirm-card h3 {
      margin: 0;
      color: #584563;
      font-size: 21px;
    }

    .confirm-card p {
      margin: 11px 0 21px;
      color: #8b7892;
      font-size: 14px;
      line-height: 1.6;
    }

    .confirm-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .confirm-cancel,
    .confirm-danger {
      min-height: 48px;
      border: 0;
      border-radius: 15px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
    }

    .confirm-cancel {
      color: #796581;
      background: rgba(126, 98, 141, 0.10);
    }

    .confirm-danger {
      color: white;
      background: linear-gradient(
        135deg,
        #df94bc,
        #a16fca
      );
    }

    .toast-message {
      position: fixed;
      z-index: 80;
      left: 50%;
      bottom: calc(
        34px + env(safe-area-inset-bottom)
      );
      transform: translateX(-50%);
      padding: 12px 18px;
      border-radius: 999px;
      color: white;
      background: rgba(48, 34, 67, 0.92);
      box-shadow: 0 12px 35px rgba(7, 3, 20, 0.32);
      font-size: 14px;
      white-space: nowrap;
      animation: toastIn 0.25s ease;
    }

    @keyframes toastIn {
      from {
        opacity: 0;
        transform: translate(-50%, 12px);
      }

      to {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    }
  `;

  document.head.appendChild(style);
}


function showToast(message) {
  const oldToast =
    document.querySelector(
      ".toast-message"
    );

  if (oldToast) {
    oldToast.remove();
  }

  const toast =
    document.createElement("div");

  toast.className =
    "toast-message";

  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2200);
}


function askConfirm({
  icon = "🐷",
  title,
  message,
  confirmText
}) {
  return new Promise(resolve => {
    const overlay =
      document.createElement("div");

    overlay.className =
      "confirm-overlay";

    const card =
      document.createElement("section");

    card.className =
      "confirm-card";

    const iconElement =
      document.createElement("div");

    iconElement.className =
      "confirm-icon";

    iconElement.textContent = icon;

    const titleElement =
      document.createElement("h3");

    titleElement.textContent = title;

    const messageElement =
      document.createElement("p");

    messageElement.textContent =
      message;

    const actions =
      document.createElement("div");

    actions.className =
      "confirm-actions";

    const cancelButton =
      document.createElement("button");

    cancelButton.type = "button";

    cancelButton.className =
      "confirm-cancel";

    cancelButton.textContent =
      "先不删";

    const confirmButton =
      document.createElement("button");

    confirmButton.type = "button";

    confirmButton.className =
      "confirm-danger";

    confirmButton.textContent =
      confirmText;

    actions.appendChild(
      cancelButton
    );

    actions.appendChild(
      confirmButton
    );

    card.appendChild(
      iconElement
    );

    card.appendChild(
      titleElement
    );

    card.appendChild(
      messageElement
    );

    card.appendChild(actions);

    overlay.appendChild(card);

    document.body.appendChild(
      overlay
    );

    function finish(result) {
      overlay.remove();
      resolve(result);
    }

    cancelButton.addEventListener(
      "click",
      () => finish(false)
    );

    confirmButton.addEventListener(
      "click",
      () => finish(true)
    );

    overlay.addEventListener(
      "click",
      event => {
        if (event.target === overlay) {
          finish(false);
        }
      }
    );
  });
}


async function deleteRecord(record) {
  const confirmed =
    await askConfirm({
      icon: "🗑",
      title: "删除这笔记录？",
      message:
        `${formatRecordDate(record.date)}，` +
        `金额 ¥${formatMoney(record.amount)}。` +
        "删除后，总金额和日历爱心也会一起更新。",
      confirmText: "确认删除"
    });

  if (!confirmed) {
    return;
  }

  records = records.filter(
    item => item.id !== record.id
  );

  saveLocalData();
  updatePage();

  showToast("这笔记录已经删除");
}


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

      const side =
        document.createElement("div");

      side.className = "record-side";

      const money =
        document.createElement("strong");

      money.className = "record-amount";

      money.textContent =
        `+¥${formatMoney(record.amount)}`;

      const deleteButton =
        document.createElement("button");

      deleteButton.type = "button";

      deleteButton.className =
        "record-delete";

      deleteButton.textContent = "×";

      deleteButton.setAttribute(
        "aria-label",
        "删除这笔记录"
      );

      deleteButton.addEventListener(
        "click",
        () => deleteRecord(record)
      );

      info.appendChild(date);
      info.appendChild(note);

      side.appendChild(money);
      side.appendChild(
        deleteButton
      );

      item.appendChild(info);
      item.appendChild(side);

      recordList.appendChild(item);
    });
}


function ensureDataTools() {
  if (
    document.getElementById(
      "dataTools"
    )
  ) {
    return;
  }

  const tools =
    document.createElement("div");

  tools.id = "dataTools";
  tools.className = "data-tools";

  const clearButton =
    document.createElement("button");

  clearButton.type = "button";

  clearButton.className =
    "clear-data-button";

  clearButton.textContent =
    "清空测试数据";

  clearButton.addEventListener(
    "click",
    async () => {
      const confirmed =
        await askConfirm({
          icon: "🧹",
          title: "清空全部测试数据？",
          message:
            "现有金额、记录和日历爱心都会被清空，页面会重新从 2026 年 8 月开始。",
          confirmText: "全部清空"
        });

      if (!confirmed) {
        return;
      }

      records = [];

      localStorage.removeItem(
        "qiqiSavingRecords"
      );

      localStorage.removeItem(
        "qiqiSaved"
      );

      localStorage.removeItem(
        "qiqiSavedDates"
      );

      saveLocalData();

      viewingDate =
        new Date(2026, 7, 1);

      updatePage();

      showToast(
        "测试数据已清空，八月正式开始 ✨"
      );
    }
  );

  tools.appendChild(clearButton);

  recordList.insertAdjacentElement(
    "afterend",
    tools
  );
}


function updatePage() {
  updateSavings();
  renderCalendar();
  renderRecords();
}


function openModal() {
  saveAmountInput.value = "";
  saveNoteInput.value = "";

  const today =
    getDateKey(new Date());

  saveDateInput.min =
    planStartDate;

  saveDateInput.value =
    today < planStartDate
      ? planStartDate
      : today;

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

    if (date < planStartDate) {
      formError.textContent =
        "正式记录从 2026 年 8 月 1 日开始哦～";

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

    showToast(
      `成功存入 ¥${formatMoney(amount)} ✨`
    );
  }
);


prevMonthButton.addEventListener(
  "click",
  function () {
    viewingDate.setMonth(
      viewingDate.getMonth() - 1
    );

    renderCalendar();
  }
);


nextMonthButton.addEventListener(
  "click",
  function () {
    viewingDate.setMonth(
      viewingDate.getMonth() + 1
    );

    renderCalendar();
  }
);


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


addManagementStyles();
ensureDataTools();
saveLocalData();
updatePage();
