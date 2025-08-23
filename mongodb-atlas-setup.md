# Setting up MongoDB Atlas for MateFinder

Follow these steps to set up MongoDB Atlas for your MateFinder application:

## 1. Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and click "Try Free"
2. Sign up for an account or log in if you already have one

## 2. Create a New Cluster

1. Click "Build a Cluster"
2. Select the "Shared" free tier option
3. Choose your preferred cloud provider (AWS, Google Cloud, or Azure)
4. Select a region close to your target users
5. Click "Create Cluster" (this may take a few minutes)

## 3. Set Up Database Access

1. In the left navigation, click "Database Access"
2. Click "Add New Database User"
3. Create a username and password (store these securely)
4. Set user privileges to "Read and Write to Any Database"
5. Click "Add User"

## 4. Set Up Network Access

1. In the left navigation, click "Network Access"
2. Click "Add IP Address"
3. For development, you can click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production, restrict to your application server's IP address
5. Click "Confirm"

## 5. Get Your Connection String

1. Go back to the "Clusters" view and click "Connect"
2. Choose "Connect your application"
3. Select "Node.js" as your driver and the latest version
4. Copy the connection string
5. Replace `<username>`, `<password>`, and `<dbname>` with your actual values:
    - Replace `<username>` with your database user username
    - Replace `<password>` with your database user password
    - Replace `<dbname>` with "matefinder"

## 6. Update Your .env File

Update your `.env` file with your actual MongoDB Atlas connection string:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/matefinder?retryWrites=true&w=majority
```

## 7. Restart Your Application

After updating the connection string, restart your application to connect to MongoDB Atlas.
