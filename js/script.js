let selectedMonth = ''; // You can change the default to the first one
let userId = 'Maya'; // Assume this is the unique identifier for the user

// Function to load data for the selected month and user
function loadDataForMonth(month, userId) {
    return JSON.parse(localStorage.getItem(`${userId}-${month}`)) || {
        totalBudget: 0,
        totalExpenses: 0,
        budgetLeft: 0,
        expenses: []
    };
}

// Load data for the selected month and user
let budgetData = loadDataForMonth(selectedMonth, userId);

// Function to update UI
var myCategoryChart;

function updateUI() {
    // Update the information in the text
    document.getElementById('totalBudget').textContent = budgetData.totalBudget.toFixed(2);
    document.getElementById('totalExpenses').textContent = budgetData.totalExpenses.toFixed(2);
    document.getElementById('budgetLeft').textContent = budgetData.budgetLeft.toFixed(2);

    // Recreate the chart
    var ctx = document.getElementById('myCategoryChart').getContext('2d');
    if (myCategoryChart) {
        myCategoryChart.destroy();
    }
    myCategoryChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Food', 'Transportation', 'Housing', 'Entertainment'],
            datasets: [{
                label: 'Expenses by Category',
                data: [
                    budgetData.expenses.filter(e => e.category === 'Food').reduce((sum, e) => sum + e.amount, 0),
                    budgetData.expenses.filter(e => e.category === 'Transportation').reduce((sum, e) => sum + e.amount, 0),
                    budgetData.expenses.filter(e => e.category === 'Housing').reduce((sum, e) => sum + e.amount, 0),
                    budgetData.expenses.filter(e => e.category === 'Entertainment').reduce((sum, e) => sum + e.amount, 0)
                ],
                backgroundColor: ['#4394E5', '#F5921B', '#876FD4', '#63993D'],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });




    // Update the expenses table
    let table = $('#expenseTable').DataTable();
    table.clear();

    budgetData.expenses.forEach(function (expense) {
        table.row.add([
            expense.title,
            expense.amount.toFixed(2),
            expense.category,
            `<button class="btn btn-sm btn-danger" onclick="removeExpense('${expense.title}')">Remove</button>`
        ]);
    });

    table.draw();
}

// Function to remove an expense
function removeExpense(expenseTitle) {
    let index = budgetData.expenses.findIndex(exp => exp.title === expenseTitle);
    if (index !== -1) {
        let removedExpense = budgetData.expenses.splice(index, 1)[0];
        budgetData.totalExpenses -= removedExpense.amount;
        budgetData.budgetLeft += removedExpense.amount;

        // Update the DataTable
        let table = $('#expenseTable').DataTable();

        // Clear and add new rows to the table
        table.clear();
        budgetData.expenses.forEach(expense => {
            table.row.add([
                expense.title,
                expense.amount.toFixed(2),
                expense.category,
                `<button class="btn btn-sm btn-danger" onclick="removeExpense('${expense.title}')">Remove</button>`]);
        });

        // Draw the table after updating
        table.draw();

        // Update localStorage
        updateLocalStorage();
        updateUI();
    }
}

// Function to update the `localStorage` for the selected month and user
function updateLocalStorage() {
    localStorage.setItem(`${userId}-${selectedMonth}`, JSON.stringify(budgetData));
}

function resetAll() {
    // Reset budget data
    budgetData.totalBudget = 0;
    budgetData.totalExpenses = 0;
    budgetData.budgetLeft = 0;
    budgetData.expenses = [];

    // Update local storage and UI
    updateLocalStorage();
    updateUI();
}

function handleLoginClick(){
    window.location.href = './login/login.html';
};

document.addEventListener("DOMContentLoaded", function () {
    // Update UI with initial data
    updateUI();

    $('#hello').text(function (index, currentText) {
        return currentText + userId;
    });

    // Add budget

    $('#budget-submit-btn').on('click', function (event) {
        event.preventDefault();


        var isValid = true;

        // מאמת את שדה שם ההוצאה
        let monthSelected = document.getElementById('month-select');
        if (monthSelected.value.trim() === '') {
            monthSelected.classList.add('is-invalid');
            isValid = false;
        } else {
            monthSelected.classList.remove('is-invalid');
            monthSelected.setCustomValidity(""); // Clear custom validity
        }

        // מאמת את שדה הסכום
        let budgetInput = document.getElementById('budget');
        if (isNaN(budgetInput.value) || budgetInput.value <= 0) {
            budgetInput.classList.add('is-invalid');
            isValid = false;
        } else {
            budgetInput.classList.remove('is-invalid');
        }

        if (isValid) {


            let budgetAmount = parseFloat(budgetInput.value.trim());
            // Update the budget for the selected month
            budgetData.totalBudget += budgetAmount;
            budgetData.budgetLeft += budgetAmount;

            // Save to localStorage for the selected month and user
            updateLocalStorage();
            updateUI(); // Update the UI
            budgetInput.value = '';
        }
        else {
           return;
        }
    });

    // Add expense
    $('#submit-btn').on('click', function (event) {
        event.preventDefault();

        // דגלים לכל שדה
        var isValid = true;

        // מאמת את שדה שם ההוצאה
        let expenseTitle = document.getElementById('expense');
        if (expenseTitle.value.trim() === '') {
            expenseTitle.classList.add('is-invalid');
            isValid = false;
        } else if (/^\d/.test(expenseTitle.value.trim())) {
            expenseTitle.classList.add('is-invalid');
            expenseTitle.setCustomValidity("Expense title cannot start with a number.");
            isValid = false;
        } else {
            expenseTitle.classList.remove('is-invalid');
            expenseTitle.setCustomValidity(""); // Clear custom validity
        }

        // מאמת את שדה הסכום
        let amount = document.getElementById('amount');
        if (isNaN(amount.value) || amount.value <= 0 || amount.value > budgetData.budgetLeft) {
            amount.classList.add('is-invalid');
            isValid = false;
        } else {
            amount.classList.remove('is-invalid');
        }

        // אם כל השדות תקינים, הוסף את ההוצאה
        if (isValid) {
            let expenseInput = document.getElementById('expense');
            let amountInput = document.getElementById('amount');
            let categoryInput = document.getElementById('category');

            let expenseTitle = expenseInput.value.trim();
            let expenseAmount = parseFloat(amountInput.value.trim());
            let expenseCategory = categoryInput.value;

            // עדכון ההוצאות עבור החודש הנבחר
            budgetData.expenses.push({
                title: expenseTitle,
                amount: expenseAmount,
                category: expenseCategory
            });

            // עדכון התקציב הכולל והתקציב הנותר
            budgetData.totalExpenses += expenseAmount;
            budgetData.budgetLeft -= expenseAmount;

            // שמירה ב-localStorage
            updateLocalStorage();
            updateUI(); // עדכון ה-UI

            // אפס את השדות לאחר הוספת ההוצאה
            expenseInput.value = '';
            amountInput.value = '';
        } else {
            // הצגת הודעה אם לא כל השדות תקינים
            return;
        }
    });


    // Change selected month
    $('#month-select').on('change', function () {
        // The value received is in the format YYYY-MM, e.g., "2025-01"
        selectedMonth = this.value; // The selected month

        console.log(selectedMonth);

        // Extract the month from the date (YY-MM)
        let [year, month] = selectedMonth.split('-');  // Split the value into year and month
        let monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        let monthName = monthNames[parseInt(month) - 1];  // Convert the number to the month's name

        // Update the UI with the selected month's name
        document.getElementById('selected-month').textContent = `${monthName} ${year}`;

        // Load data for the selected month from localStorage
        budgetData = loadDataForMonth(selectedMonth, userId);

        // Update the information on the screen with the selected month
        updateUI();
    });



    console.log(myCategoryChart);

    
});
