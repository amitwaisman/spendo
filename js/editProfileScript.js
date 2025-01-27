document.addEventListener("DOMContentLoaded", function () {
    const profilePhotoInput = document.getElementById("profilePhoto");
    const profilePhotoPreview = document.getElementById("profilePhotoPreview");
    const editProfileForm = document.getElementById("editProfileForm");

    // Update preview when the user selects a file
    profilePhotoInput.addEventListener("change", function () {
        const file = profilePhotoInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                profilePhotoPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle form submission
editProfileForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const userId = sessionStorage.getItem("sub"); // Fetch user ID from session storage
    const name = document.getElementById("name").value.trim();
    const lastLogin = new Date().toISOString(); // Record current time as last login
    const file = profilePhotoInput.files[0];
    let photoUrl = null;

    try {
        if (file) {
            // Step 1: Get pre-signed URL for S3 upload
            const presignedResponse = await fetch(
                "https://3yykogu34m.execute-api.us-east-1.amazonaws.com/dev/ProfilePicture",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ filename: `profile-pictures/${file.name}` }),
                }
            );

            console.log("Pre-signed Response:", presignedResponse);
            const data = await presignedResponse.json();
            console.log("Parsed Pre-signed Response:", data);

            const upload_url = data.upload_url;
            if (!upload_url) {
                throw new Error("Pre-signed URL is missing in the response.");
            }
            console.log("Pre-signed URL:", upload_url);

            // Step 2: Upload file to S3
            const s3Response = await fetch(upload_url, {
                method: "PUT",
                body: file,
                headers:
                {
                    "Content-Type": file.type, // Ensure this matches what S3 expects
                },
            });

            if (!s3Response.ok) {
                throw new Error("Failed to upload file to S3.");
            }

            photoUrl = `https://spendo-profile-pictures-bucket.s3.amazonaws.com/profile-pictures/${file.name}`;
        }

        // Step 3: Update user profile via API Gateway
        const updateResponse = await fetch(
            "https://3yykogu34m.execute-api.us-east-1.amazonaws.com/dev/Users",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    Name: name || null, // If the name is empty, send null
                    LastLogin: lastLogin, // Always send the updated login timestamp
                    Photo: photoUrl || null, // If no photo uploaded, send null
                }),
            }
        );

        if (updateResponse.ok) {
            sessionStorage.setItem("user_name", name);
            alert("Profile updated successfully!");
            location.reload(); // Reload the page to reflect changes
        } else {
            const errorData = await updateResponse.json();
            alert(`Error updating profile: ${errorData.error || "Unknown error"}`);
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        alert("An unexpected error occurred while updating your profile.");
    }
});
});
