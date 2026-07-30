const goal = 60000;

let saved = Number(localStorage.getItem("qiqiSaved")) || 0;

const amountText = document.getElementById("amount");
const saveButton = document.getElementById("saveButton");

function updatePage() {
  const progress = Math.min((saved / goal) * 100, 100);

  amountText.textContent =
    `已存：¥${saved.toLocaleString("zh-CN")} / ` +
    `¥${goal.toLocaleString("zh-CN")}（${progress.toFixed(1)}%）`;
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

  localStorage.setItem("qiqiSaved", String(saved));

  updatePage();
});

updatePage();
