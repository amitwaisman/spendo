document.addEventListener("DOMContentLoaded", function () {
    // Get user data from sessionStorage
    const userName = sessionStorage.getItem("user_name");
    const userEmail = sessionStorage.getItem("email");
    const isAdmin = sessionStorage.getItem("isAdmin") === "true";

    const adminNavLink = document.getElementById("adminNavLink");
    const userId = sessionStorage.getItem('sub');
    const idToken = sessionStorage.getItem('id_token');
//    const editProfileButton = document.getElementById("editProfileButton");
    const signOutButton = document.getElementById("signOutButton");

    // Admin link visibility
    if (isAdmin) {
        adminNavLink.style.display = "block";
        adminNavLink.href = `./admin.html#id_token=${idToken}&userId=${userId}`;
    } else {
        adminNavLink.style.display = "none";
    }

    // Adjust navbar based on user login status
    if (userName && userEmail) {
//       editProfileButton.style.display = "inline-block";

        // Add sign-out functionality
        signOutButton.addEventListener("click", function () {
            // Clear sessionStorage and redirect
            sessionStorage.clear();
            alert("You have been signed out.");
            window.location.href = "./index.html"; // Redirect to home page
        });
    } else {
//        editProfileButton.style.display = "none";
    }
    if (userId) {
        // Update the Dashboard and Home links
        const dashboardLink = document.getElementById('profileLink'); // Dashboard link
        const homeLink = document.querySelector('.navbar-brand'); // Home link (site title)

//        editProfileButton.href = `./editprofile.html#id_token=${idToken}&userId=${userId}`;
        dashboardLink.href = `./dashboard.html#id_token=${idToken}&userId=${userId}`;
        homeLink.href = `./dashboard.html#id_token=${idToken}&userId=${userId}`;
    } else {
        console.error("No userId found in sessionStorage.");
    }
});
