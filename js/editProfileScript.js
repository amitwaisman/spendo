// פונקציה להוספת התראה לדף
function showAlert(type, message) {
    // מחיקה של התראות קודמות
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());

    // יצירת אלמנט חדש עבור ההתראה
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    
    // הוספת תוכן להתראה
    const icon = document.createElement('i');
    if (type === 'success') {
        icon.className = 'fa fa-check-circle';
    } else if (type === 'danger') {
        icon.className = 'fa fa-times-circle';
    }

    alert.appendChild(icon);
    alert.appendChild(document.createTextNode(` ${message}`));

    // הוספת ההתראה 
    document.getElementById('alert-container').appendChild(alert);

    // הסרת ההתראה אחרי 5 שניות
    setTimeout(() => alert.remove(), 5000);
}

// פונקציה לבדוק אם יש שדות ריקים ומייל תקין
function validateForm() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // בדיקה אם יש שדה ריק
    if (!username || !email || !password || !confirmPassword) {
        showAlert('danger', 'All fields are required.');
        return false; // מונע שליחה אם יש שדות ריקים
    }

    // בדיקה אם המייל תקין
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
        showAlert('danger', 'Please enter a valid email address.');
        return false; // מונע שליחה אם המייל לא תקין
    }

    // בדיקה אם הסיסמאות תואמות
    if (password !== confirmPassword) {
        showAlert('danger', 'Passwords do not match.');
        return false; // מונע שליחה אם הסיסמאות לא תואמות
    }

    // אם כל הפרטים תקינים תופיע הודעת הצלחה
    showAlert('success', 'Your changes have been saved successfully!');
    return true;
}

// מאזין לאירועים בעת שליחת הטופס
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('saveBtn').addEventListener('click', (event) => {
        event.preventDefault(); // מונע את שליחת הטופס
        validateForm(); // בודק אם יש שדות ריקים
    });
});
