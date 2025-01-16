 // Switch between sign-up and sign-in forms
 signUpButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
});

$(document).ready(function() {
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const container = document.getElementById('container');

   

  
    $('#signUpButton').on('click', function() {
        let name = $('#signup-name').val();
        let email = $('#signup-email').val();
        let password = $('#signup-password').val();

        let user = {
            name: name,
            email: email,
            password: password,
            totalBudget: 0,  
            totalExpenses: 0, 
            budgetLeft: 0, 
            expenses: [] 
        };

        // Save user data in localStorage
        localStorage.setItem('user', JSON.stringify(user));

        console.log('User saved to localStorage:', user);
    });
});
