document.addEventListener("DOMContentLoaded", function () {
    // Check if the user is an admin
    const isAdmin = sessionStorage.getItem("isAdmin") === "true";

    // Redirect non-admin users
    if (!isAdmin) {
        alert("Access Denied");
        window.location.href = './index.html'; // Redirect to your main page or dashboard
        return;
    }

    console.log("Admin access granted!");

    // Fetch and display user data
    fetchUserData();
});

// Function to fetch user data from the API
function fetchUserData() {
    const apiEndpoint = "https://3yykogu34m.execute-api.us-east-1.amazonaws.com/dev/Users";

    fetch(apiEndpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to fetch users. Status: ${response.status}`);
            }
            return response.json();
        })
        .then((responseData) => {
            console.log("Fetched users:", responseData);

            // Parse the 'body' field to get the actual users array
            const users = JSON.parse(responseData.body);

            // Ensure the response is an array
            if (!Array.isArray(users)) {
                throw new TypeError("Expected an array of users, but got:", users);
            }

            loadUserData(users); // Call function to display users
        })
        .catch((error) => {
            console.error("Error fetching users:", error);
            alert("Failed to load user data. Please try again.");
        });
}

// Function to display user data in the admin page
function loadUserData(users) {
    const userContainer = document.querySelector(".user-container");
    userContainer.innerHTML = ""; // Clear existing users

    users.forEach(user => {
        const userTile = document.createElement("div");
        userTile.classList.add("user-tile");
        userTile.id = `user-row-${user.User_ID}`; // Assign a unique ID

        // Fallback for missing data
        const userName = user.Name || "Unknown User";
        const userEmail = user.Email || "No email provided";
        const userPhoto = user.Photo === "default-photo-url" ? "./images/default-photo-url.png" : user.Photo || "./images/default-photo-url.png";
        const lastLogin = user.LastLogin
            ? new Date(user.LastLogin).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
              })
            : "Never";
        const isAdminUser = user.IsAdmin || false;

        // Create the delete button
        const deleteButton = `
            <button class="btn btn-danger" onclick="deleteUser('${user.User_ID}')" 
                ${isAdminUser ? "disabled" : ""}>
                Delete Data
            </button>
        `;

        userTile.innerHTML = `
            <img src="${userPhoto}" alt="${userName}'s Profile Picture" class="profile-pic rounded-circle mb-3" style="width: 100px; height: 100px; object-fit: cover;">
            <h5>${userName}</h5>
            <p>${userEmail}</p>
            <p>Last Login: ${lastLogin}</p>
            ${deleteButton}
        `;

        userContainer.appendChild(userTile);
    });
}



// Function to delete a user
function deleteUser(userId) {
    console.log("Deleting user with ID:", userId);

    if (!userId) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "User ID is missing. Cannot proceed with deletion.",
        });
        return;
    }

    Swal.fire({
        title: "Are you sure?",
        text: "Do you really want to delete this user's data? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
    }).then((result) => {
        if (result.isConfirmed) {
            fetch("https://3yykogu34m.execute-api.us-east-1.amazonaws.com/dev/Users", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId: userId }), // Send only the userId
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP status ${response.status}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log("User data deleted successfully:", data);
                    Swal.fire("Deleted!", "User data has been successfully deleted.", "success");

                    // Remove the user tile from the UI
                    const userRow = document.getElementById(`user-row-${userId}`);
                    if (userRow) {
                        userRow.remove();
                    } else {
                        console.warn(`User row with ID user-row-${userId} not found.`);
                    }
                })
                .catch((error) => {
                    console.error("Error deleting user data:", error);
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "Failed to delete user data!",
                    });
                });
        }
    });
}

