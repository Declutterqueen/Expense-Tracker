document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const balanceEl = document.getElementById("balance");
  const incomeEl = document.getElementById("income");
  const expenseEl = document.getElementById("expense");
  const descriptionEl = document.getElementById("description");
  const amountEl = document.getElementById("amount");
  const typeEl = document.getElementById("type");
  const addBtn = document.getElementById("add-btn");
  const transactionsEl = document.getElementById("transactions");
  const darkModeToggle = document.getElementById("darkModeToggle");
  const monthFilter = document.getElementById("monthFilter");
  const clearFilterBtn = document.getElementById("clearFilter");

  // Load transactions from localStorage
  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

  // Set default month to current month 
  const now = new Date();
  monthFilter.value = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}`;

  // Initialize Chart.js
  const ctx = document.getElementById("expenseChart").getContext("2d");
  let expenseChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Income", "Expense"],
      datasets: [{
        label: "Amount",
        data: [0, 0],
        backgroundColor: ["#28a745", "#dc3545"]
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });

  // Add transaction
  addBtn.addEventListener("click", () => {
    const desc = descriptionEl.value.trim();
    const amount = parseFloat(amountEl.value);
    const type = typeEl.value;

    if(desc === "" || isNaN(amount) || amount <= 0){
      // Only check description & amount
      alert("Please enter a valid description and amount.");
      return;
    }

    // Store transaction with current month (from filter) or leave for later update
    const transaction = {
      id: Date.now(),
      description: desc,
      amount,
      type,
      month: monthFilter.value // store month (YYYY-MM)
    };

    transactions.push(transaction);
    saveTransactions();

    descriptionEl.value = "";
    amountEl.value = "";

    updateUI();
  });

  // Delete transaction
  window.deleteTransaction = (id) => {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    updateUI();
  }

  // Save transactions to localStorage
  function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }

  // Filter by month
  monthFilter.addEventListener("change", updateUI);
  clearFilterBtn.addEventListener("click", () => {
    monthFilter.value = "";
    updateUI();
  });

  // Dark mode toggle
  darkModeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark", darkModeToggle.checked);
  });

  // Update UI
  function updateUI(){
    let filteredTransactions = transactions;

    if(monthFilter.value){
      filteredTransactions = transactions.filter(t => t.month === monthFilter.value);
    }

    let income = 0, expense = 0;
    filteredTransactions.forEach(t => {
      if(t.type === "income") income += t.amount;
      else expense += t.amount;
    });

    balanceEl.innerText = (income-expense).toFixed(2);
    incomeEl.innerText = income.toFixed(2);
    expenseEl.innerText = expense.toFixed(2);

    // Render transactions
    transactionsEl.innerHTML = "";
    filteredTransactions.forEach(t=>{
      const li = document.createElement("li");
      li.classList.add(t.type);
      li.innerHTML = `${t.type==="goal"?"🎯 ": ""}${t.description} - $${t.amount.toFixed(2)}
        <button onclick="deleteTransaction(${t.id})">Delete</button>`;
      transactionsEl.appendChild(li);
    });

    // Update Chart
    expenseChart.data.datasets[0].data = [income, expense];
    expenseChart.update();
  }

  // Initial render
  updateUI();
});
