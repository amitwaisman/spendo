// Function to parse URL parameters
function getUrlParameters() {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    return Object.fromEntries(hashParams);
}





// Save relevant token data to sessionStorage
function saveTokenData(params) {
    if (params.id_token) {
        try {
            const decodedIdToken = JSON.parse(atob(params.id_token.split('.')[1]));
            const user_name = decodedIdToken['cognito:username'];
            const email = decodedIdToken.email;
            const sub = decodedIdToken.sub;
            
              // Check if user is an admin (using cognito:groups)
            const isAdmin = decodedIdToken['cognito:groups']?.includes('Admin') || false;
            console.log(isAdmin);

            // Store data in sessionStorage
            sessionStorage.setItem('id_token', params.id_token);
            sessionStorage.setItem('user_name', user_name);
            sessionStorage.setItem('email', email);
            sessionStorage.setItem('sub', sub);
            sessionStorage.setItem('isAdmin', isAdmin); // Store admin status

            console.log("Saved user information:", { user_name, email, sub });
            sendUserData(sub, user_name, email);
        } catch (error) {
            console.error("Error decoding ID token:", error);
        }
    } else {
        console.warn("ID token not found.");
    }
}

// Global variables//
let selectedMonth = '';
let userId;
let budgetData = {
    month: "",
    budget_details: {
        TotalBudget: 0,
        TotalExpenses: 0,
        BudgetLeft: 0
    },
    expenses_details: []
};





// Function to update the UI based on the budget data//
let myCategoryChart;
function updateUI() {
    if (!budgetData || !budgetData.budget_details) {
        console.error('budgetData is undefined or invalid:', budgetData);
        return;
    }

    // Display the user's name from sessionStorage
    document.getElementById('user-name').textContent = sessionStorage.getItem('user_name');
    document.getElementById('budget').textContent = ""

    // Update budget summary cards
    document.getElementById('totalBudget').textContent = budgetData.budget_details.TotalBudget.toFixed(2);
    document.getElementById('totalExpenses').textContent = budgetData.budget_details.TotalExpenses.toFixed(2);
    let budgetLeft = document.getElementById('budgetLeft');
    budgetLeft.textContent = parseFloat(budgetData.budget_details.BudgetLeft).toFixed(2);

    // Check if budgetLeft is 0
    if (parseFloat(budgetLeft.textContent) === 0) {
        document.getElementById('submit-btn').disabled = true;
        // Disable the submit button
    } else {
        document.getElementById('submit-btn').disabled = false; // Enable the submit button
       
    }
    
    if(parseFloat(document.getElementById('totalBudget').textContent) > 0 &&  parseFloat(budgetLeft.textContent) <= 0){
        budgetLeft.classList.remove('text-success');
        budgetLeft.classList.add('text-danger');
    }
    else if(parseFloat(document.getElementById('totalBudget').textContent) > 0 ){
        budgetLeft.classList.remove('text-danger');
        budgetLeft.classList.add('text-success');//
    }

    // Create or update pie chart for expenses by category
    const ctx = document.getElementById('myCategoryChart').getContext('2d');
    if (myCategoryChart) {
        myCategoryChart.destroy();
    }

    const categories = ['Food', 'Transportation', 'Housing', 'Entertainment'];
    const categoryData = categories.map(category => {
        return budgetData.expenses_details.filter(e => e.Category === category).reduce((sum, e) => sum + e.Amount, 0);
    });

    myCategoryChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                label: 'Expenses by Category',
                data: categoryData,
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
    
    

    // Update expense table
    const table = $('#expenseTable').DataTable();
    table.clear();
    budgetData.expenses_details.forEach(expense => {
        table.row.add([
            expense.Title,
            `$${parseFloat(expense.Amount).toFixed(2)}`,
            expense.Category,
            `<button class="btn btn-sm btn-danger rounded-pill" data-id="${expense.id}" title="Remove" onclick="removeExpense(this)">   <i class="fas fa-trash"></i>  </button>`
        ]);
    });
    table.draw();
}





// Check if user is logged in//
function checkLoginStatus() {
    const loggedInUser = sessionStorage.getItem("sub");
    if (!loggedInUser) {
        console.log("User not logged in.");
        // Redirect to login page or show login modal
    } else {
        console.log("User logged in:", loggedInUser);
        updateUI();
    }
}





// Send user data to the server//
function sendUserData(sub, user_name, email) {
    const apiEndpoint = 'https://3yykogu34m.execute-api.us-east-1.amazonaws.com/dev/Users';
    const userData = { userId: sub, name: user_name, email: email};

    fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Data sent successfully:', data);
    })
    .catch(error => {
        console.error('Failed to send data:', error);
    });
}





// Fetch budget data from the server//
function fetchBudgetData(userId, month) {
    showLoadingIndicator();
    fetch(`https://3yykogu34m.execute-api.us-east-1.amazonaws.com/dev/Users/Budget?userId=${encodeURIComponent(userId)}&month=${encodeURIComponent(month)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
    
            budgetData = JSON.parse(data.body);
       
        console.log('Data fetched and parsed:', budgetData);
        updateUI();
    })
    .catch(error => {
        console.error('Error fetching budget data:', error);
    })
    .finally(() => {
        hideLoadingIndicator();
    });
}






// Remove an expense from the server and update the UI//
function removeExpense(button) {
    const expenseId = button.dataset.id;
    const userId = sessionStorage.getItem('sub');
    const selectedMonth = document.getElementById('month-select').value;

    if (!userId || !selectedMonth || !expenseId) {
        console.error('Missing required parameters:', { userId, selectedMonth, expenseId });
        return;
    }
    
    
      Swal.fire({
        title: 'Are you sure?',
        text: "Do you really want to delete this expense? This action cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            // אם המשתמש מאשר מחיקה
            showLoadingIndicator();
            fetch(`https://3yykogu34m.execute-api.us-east-1.amazonaws.com/dev/Users/Budget/Expenses?userId=${encodeURIComponent(userId)}&month=${encodeURIComponent(selectedMonth)}&expenseId=${encodeURIComponent(expenseId)}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to delete expense. Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Expense deleted successfully:', data);
                Swal.fire('Deleted!', 'Expense has been successfully deleted.', 'success');
                fetchBudgetData(userId, selectedMonth);
            })
            .catch(error => {
                console.error('Error deleting expense:', error);
                Swal.fire('Error!', 'Failed to delete expense.', 'error');
            })
            .finally(() => {
                hideLoadingIndicator();
                console.log('end');
            });
        }
    });
    
}






// Show loading indicator
function showLoadingIndicator() {
    document.getElementById('loading').style.display = 'block';
}






// Hide loading indicator
function hideLoadingIndicator() {
    document.getElementById('loading').style.display = 'none';
}






// On DOMContentLoaded, initialize the application
document.addEventListener("DOMContentLoaded", function () {
    const params = getUrlParameters();
    if (params.id_token) {
        saveTokenData(params);
        checkLoginStatus();
        userId = sessionStorage.getItem('sub');
    } else {
        console.log("ID token not found in URL.");
        checkLoginStatus();
    }
    
    if (sessionStorage.getItem('isAdmin') === 'true') {
        console.log("User is an admin.");
        document.getElementById('adminNavLink').style.display = 'block'; // Show admin features
    } else {
        console.log("User is not an admin.");
    }

    // Handle budget submission
    $('#budget-submit-btn').on('click', function (event) {
        event.preventDefault();
        const amount = parseFloat(document.getElementById('budget').value.trim());
        const selectedMonth = document.getElementById('month-select').value;

        if (!amount || amount <= 0) {
            Swal.fire({
                title: 'Enter a possitive amount',
                timer: 3000,
                timerProgressBar: true,
        });
            return;
        }
        else if(selectedMonth === ""){
             Swal.fire({
                title: 'Enter a month',
                timer: 3000,
                timerProgressBar: true,
        });
            return;
        }
        
        

        const newBudget = {
            userId: sessionStorage.getItem('sub'),
            totalBudget: amount,
            month: selectedMonth
        };
        
      

        showLoadingIndicator();
        fetch('https://3yykogu34m.execute-api.us-east-1.amazonaws.com/dev/Users/Budget', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBudget)
        })
        .then(response => response.json())
        .then(data => {
            fetchBudgetData(userId, selectedMonth);
            document.getElementById('budget').value = '';
        })
        .catch(error => console.error('Error updating budget:', error))
        .finally(() => hideLoadingIndicator());
    });
    
    
    

    // Handle expense submission
    $('#submit-btn').on('click', function (event) {
        event.preventDefault();
        const button = this;
       

        const budgetLeft = budgetData.budget_details.BudgetLeft;
        const expenseInput = document.getElementById('expense');
        const expenseAmountInput = document.getElementById('amount');
        const categoryInput = document.getElementById('category');
        const monthSelect = document.getElementById('month-select').value;

        if (
            expenseInput.value.trim() === '' ||
            monthSelect.trim() === ''
        ) {
           Swal.fire({
                title: 'Enter expense title',
                timer: 3000,
                timerProgressBar: true,
        });
            return;
        }
        
        if(parseFloat(expenseAmountInput.value) <= 0 ||
            isNaN(parseFloat(expenseAmountInput.value))){
                Swal.fire({
                title: 'Enter a positive expense amount',
                timer: 3000,
                timerProgressBar: true,
        });
                return;
            }else if(parseFloat(expenseAmountInput.value) > budgetLeft){
                Swal.fire({
                title: 'Expense is higher than the budget',
                timer: 3000,
                timerProgressBar: true,
        });
        return;
            }
        
        if(categoryInput.value === ""){
                Swal.fire({
                title: 'Enter a Category',
                timer: 3000,
                timerProgressBar: true,
        });
                return;
            }
            
        
        
        button.disabled = true;     
        

        const newExpense = {
            userId: sessionStorage.getItem('sub'),
            month: monthSelect,
            expense: {
                Title: expenseInput.value.trim(),
                Amount: parseFloat(expenseAmountInput.value),
                Category: categoryInput.value
            }
        };
        
        console.log(newExpense);
        

        showLoadingIndicator();
        fetch('https://3yykogu34m.execute-api.us-east-1.amazonaws.com/dev/Users/Budget/Expenses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newExpense),
        })
        .then(response => response.json())
        .then(data => {
            fetchBudgetData(userId, monthSelect);
            expenseInput.value = '';
            expenseAmountInput.value = '';
        })
        .catch(error => console.error('Error adding expense:', error))
        .finally(() => hideLoadingIndicator());
    });
    
    
    
    
    
    
    
     document.getElementById('resetBudgetBtn').addEventListener('click', () => {
        const userId =  sessionStorage.getItem('sub'); // Example, make dynamic based on the user
        const month = document.getElementById('month-select').value;

        Swal.fire({
        title: 'Are you sure?',
        text: "You are about to reset the budget for this month. This action cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, reset it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            // Construct the URL with query parameters
            const url = `https://3yykogu34m.execute-api.us-east-1.amazonaws.com/dev/Users/Budget?userId=${encodeURIComponent(userId)}&month=${encodeURIComponent(month)}`;
            
            fetch(url, {  // Replace with your actual API Gateway endpoint
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => response.json()) // Parse response to JSON
            .then(data => {
                let message;
                // Parse the 'body' if it is a stringified JSON
                if (data.body) {
                    try {
                        message = JSON.parse(data.body); // Parse the body if necessary
                    } catch (e) {
                        message = data.body; // Fallback to raw body
                    }
                } else {
                    message = data.message || 'The budget has been reset.';
                }

                // Show the success message
                Swal.fire(
                    'Done!', 
                    `Budget for ${month} has been deleted`, // Use template literals to include the month
                    'success'
                    ).then(() => {
                        fetchBudgetData(userId, month); // Call your function to update the UI
                });
            })
            .catch(error => {
                console.error('Error resetting budget:', error);
                Swal.fire('Error!', 'Failed to reset the budget.', 'error');
            });
        }
    });
    });
    
    

    // Handle month selection change
    $('#month-select').on('change', function () {
        selectedMonth = this.value;
        const [year, month] = selectedMonth.split('-');
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        document.getElementById('selected-month').textContent = `${monthNames[parseInt(month) - 1]} ${year}`;
        fetchBudgetData(userId, selectedMonth);
    });
    
    
    
    
    // Handle sign out
    document.getElementById('signOutButton').addEventListener('click', function () {
        sessionStorage.clear();
        const authUrl = `${config.domain}/logout?` + 
        `client_id=${config.clientId}` + 
        `&logout_uri=${encodeURIComponent(config.redirectUris.signOut)}`;
        window.location.href = authUrl;
    });
    
});
