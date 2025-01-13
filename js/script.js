let selectedMonth = ''; // תוכל לשנות את ברירת המחדל לראשון
// Check if there is any data in localStorage
// פונקציה לטעינת הנתונים עבור החודש הנבחר
function loadDataForMonth(month) {
    return JSON.parse(localStorage.getItem(month)) || {
        totalBudget: 0,
        totalExpenses: 0,
        budgetLeft: 0,
        expenses: []
    };
}

// טוען את הנתונים עבור החודש הנבחר
let budgetData = loadDataForMonth(selectedMonth);
// Function to update UI
var myCategoryChart; // מגדירים את הגרף בשדה גלובלי

function updateUI() {
    // עדכון המידע בטקסטים
    document.getElementById('totalBudget').textContent = budgetData.totalBudget.toFixed(2);
    document.getElementById('totalExpenses').textContent = budgetData.totalExpenses.toFixed(2);
    document.getElementById('budgetLeft').textContent = budgetData.budgetLeft.toFixed(2);

    // יצירת גרף מחדש
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

    // עדכון טבלת ההוצאות
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

        // עדכון ה-DataTable
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


// פונקציה לעדכון ה-`localStorage` עבור החודש הנבחר
function updateLocalStorage() {
    localStorage.setItem(selectedMonth, JSON.stringify(budgetData));
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

document.addEventListener("DOMContentLoaded", function () {
    // Update UI with initial data
    updateUI();

    // הוספת תקציב
    document.getElementById('budget-submit-btn').addEventListener('click', function () {
        let budgetInput = document.getElementById('budget');
        let budgetAmount = parseFloat(budgetInput.value.trim());

        if (isNaN(budgetAmount) || budgetAmount <= 0) {
            alert('Please enter a valid budget amount.');
            return;
        }

        if (selectedMonth == "") {
            alert('Please choose a month.');
            return;
        }

        // עדכון התקציב עבור החודש הנבחר
        budgetData.totalBudget += budgetAmount;
        budgetData.budgetLeft += budgetAmount;

        // שמירה ב-localStorage עבור החודש הנבחר
        updateLocalStorage();
        updateUI(); // עדכון הממשק
        budgetInput.value = '';
    });

    // הוספת הוצאה
    document.getElementById('submit-btn').addEventListener('click', function () {
        let expenseInput = document.getElementById('expense');
        let amountInput = document.getElementById('amount');
        let categoryInput = document.getElementById('category');

        let expenseTitle = expenseInput.value.trim();
        let expenseAmount = parseFloat(amountInput.value.trim());
        let expenseCategory = categoryInput.value;

        if (expenseTitle === '' || isNaN(expenseAmount) || expenseAmount <= 0) {
            alert('Please enter a valid expense');
            return;
        }

        if (budgetData.budgetLeft < expenseAmount || budgetData.totalBudget === 0) {
            alert('Expense must be less than the budget left');
            return;
        }

        // עדכון ההוצאות עבור החודש הנבחר
        budgetData.expenses.push({
            title: expenseTitle,
            amount: expenseAmount,
            category: expenseCategory
        });

        // עדכון התקציב הכולל והתקציב שנותר
        budgetData.totalExpenses += expenseAmount;
        budgetData.budgetLeft -= expenseAmount;

        // שמירה ב-localStorage עבור החודש הנבחר
        updateLocalStorage();
        updateUI(); // עדכון הממשק

        // איפוס שדות הקלט
        expenseInput.value = '';
        amountInput.value = '';
    });



    // שינוי חודש שנבחר
    document.getElementById('month-select').addEventListener('change', function () {
        // הערך שמתקבל הוא בפורמט YYYY-MM, לדוג' "2025-01"
        selectedMonth = this.value; // החודש שנבחר

        console.log(selectedMonth);

        // חילוץ החודש מהתאריך (YY-MM)
        let [year, month] = selectedMonth.split('-');  // מחלק את הערך לשנה וחודש
        let monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        let monthName = monthNames[parseInt(month) - 1];  // ממיר את המספר לשם החודש

        // עדכון ה-UI עם שם החודש שנבחר
        document.getElementById('selected-month').textContent = `${monthName} ${year}`;

        // טוען את הנתונים עבור החודש הנבחר מ-localStorage
        budgetData = loadDataForMonth(selectedMonth);

        // עדכון המידע במסך עם החודש הנבחר
        updateUI();
    });

    $("#clear-btn").click(function () {
        // איפוס הערכים בשדות הקלט (inputs)
        document.getElementById('budget').value = ''; // איפוס שדה התקציב
        document.getElementById('expense').value = ''; // איפוס שם ההוצאה
        document.getElementById('amount').value = ''; // איפוס הסכום
        document.getElementById('category').value = ''; // איפוס הקטגוריה

        // איפוס ערכים נוספים כמו תקציב סך הכל, הוצאות סך הכל ותקציב שנותר
        budgetData.totalBudget = 0;
        budgetData.totalExpenses = 0;
        budgetData.budgetLeft = 0;

        // עדכון המידע ב-localStorage וב-UI
        updateLocalStorage();
        updateUI();
    });

    console.log(myCategoryChart);


});