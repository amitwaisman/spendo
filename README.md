# Spendo Project

## Table of Contents
1. [Project Overview](#project-overview)
2. [Setup Instructions](#setup-instructions)
3. [Features](#features)
4. [File Structure](#file-structure)
5. [API Documentation](#api-documentation)
6. [Future Improvements](#future-improvements)

---

## Project Overview
Spendo is a budget management web application designed to help users track expenses and manage budgets effectively. The application allows users to:
- Log expenses categorized by type.
- Set monthly budgets.
- View expenses and budgets in a user-friendly dashboard.
- Administer user accounts with roles and permissions.

Admin users have access to an admin panel where they can manage user data, including deleting user accounts from the system.

---

## Setup Instructions

### Prerequisites
- **Node.js**: Ensure you have Node.js installed.
- **AWS Services**: This project uses AWS Lambda, API Gateway, S3, and DynamoDB.
- **Frontend Hosting**: The frontend is hosted on an S3 bucket.

### Installation
1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd spendo
   ```

2. Install dependencies for the frontend (if applicable):
   ```bash
   npm install
   ```

3. Set up the environment:
   - Create an `.env` file for local development.
   - Configure AWS resources (Lambda, API Gateway, S3, DynamoDB, Cognito).

4. Deploy the frontend:
   - Upload the frontend files to the S3 bucket hosting the website.

5. Deploy the backend:
   - Ensure the Lambda functions are correctly deployed and tied to the API Gateway endpoints.

---

## Features

### User Features
- **Expense Logging**: Add, edit, and delete expenses.
- **Budget Management**: Set and view monthly budgets.
- **User Profiles**: Update profile details and upload profile pictures.

### Admin Features
- **Admin Panel**: View all registered users.
- **Delete User Data**: Admins can delete user data from DynamoDB.

### Visualizations
- **Budget Summary**: Displays total budget, expenses, and remaining balance.
- **Expense Categories**: Visualized with a pie chart.

---

## File Structure

```
spendo/
├── index.html               # Homepage
├── dashboard.html           # User dashboard
├── admin.html               # Admin panel
├── editprofile.html         # Profile editing page
├── css/
│   ├── style.css            # General styles
│   ├── admin.css            # Admin-specific styles
├── js/
│   ├── sharedNavBar.js      # Shared navbar logic
│   ├── admin.js             # Admin panel logic
│   ├── editProfileScript.js # Profile editing logic
├── assets/
│   ├── favicon.ico          # Website favicon
│   ├── default-photo-url.png # Default profile picture
└── README.md                # Project documentation
```

---

## API Documentation

### Endpoints

#### `GET /Users`
- **Description**: Fetches all user data.
- **Response**: Array of user objects.

#### `POST /Users`
- **Description**: Creates or updates user data.
- **Request Body**:
  ```json
  {
    "userId": "string",
    "name": "string",
    "photo": "string"
  }
  ```

#### `DELETE /Users`
- **Description**: Deletes user data from DynamoDB.
- **Request Body**:
  ```json
  {
    "userId": "string"
  }
  ```

#### `POST /ProfilePicture`
- **Description**: Generates a pre-signed URL for uploading profile pictures.
- **Request Body**:
  ```json
  {
    "filename": "string"
  }
  ```

---

## Future Improvements
- **Role Management**: Allow dynamic assignment of roles.
- **Advanced Charts**: Include more detailed visualizations like bar charts for monthly trends.
- **Mobile Responsiveness**: Improve the UI/UX for mobile users.
- **Notifications**: Add email reminders for budget thresholds.
- **Testing**: Integrate unit and end-to-end testing.

---

## Notes
- Ensure all AWS services are properly configured to avoid CORS or permission issues.
- Keep the `default-photo-url.png` file in the assets folder or upload it to the correct S3 bucket for universal access.
- Regularly monitor the DynamoDB usage to ensure scalability.

