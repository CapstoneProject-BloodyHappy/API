# BloodyHappy API

## Introduction

This is the BloodyHappy API created using Express.js.

## Prerequisites

Before you begin, make sure you have the following:

- Node.js
- Express.js
- Google Cloud Platform (GCP) Account

## Getting Started

1. **Clone this repository:**

    ```bash
    git clone https://github.com/CapstoneProject-BloodyHappy/API.git
    cd API
    ```

2. **Install dependencies using npm or yarn:**

    ```bash
    yarn install
    ```

3. **Create a Google Cloud Storage bucket:**

    - Go to the [Google Cloud Console](https://console.cloud.google.com/).
    - Create a new project or select an existing one.
    - Navigate to the "Storage" section and create a new bucket.
    - Note the bucket name for use in the application.

4. **Configure IAM settings:**

    - In the Google Cloud Console, navigate to the "IAM & Admin" section.
    - Add the necessary roles (e.g., Storage Object Admin) to the service account associated with your project.
    - Obtain the service account email.

5. **Get Service Account JSON credentials:**

    - In the Google Cloud Console, navigate to the "IAM & Admin" section.
    - Click on "Service accounts" and select the service account you configured.
    - Under "Actions," select "Create key," choose JSON, and download the credentials file.
    - Place the downloaded JSON file in the root of your Express.js backend project.
  
6. **Create a Firebase project and configure authentication:**

    - Visit the [Firebase Console](https://console.firebase.google.com/).
    - Create a new project.
    - Navigate to the "Authentication" section and set up your preferred authentication method (e.g., email/password, Google, etc.).
    - Obtain your Firebase config by clicking on "Project settings" > "General" > "Your apps" > "Firebase SDK snippet" > "Config."

7. **Set environment variables:**

    - Create a `.env` file in the root of your project.
    - Add the following variables from the Firebase project and also the Google Cloud Storage Bucket that you've created:
    - For the `PREDICTION_API_URL`, use our public prediction API which is `https://ml-api-phkkjqoehq-et.a.run.app`

        ```env
        BUCKET_NAME=
        PREDICTION_API_URL=
        PORT=
        project_id=
        private_key_firebase=
        private_key_service_account=
        client_email_firebase=
        client_email_service_account=
        ```

8. **Run the backend:**

    ```bash
    yarn start
    ```

    The Express.js backend will be running at [http://localhost:8080](http://localhost:8080).
