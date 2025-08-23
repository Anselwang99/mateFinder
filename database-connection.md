# Next Steps for MateFinder Database Connection

## Choose Your Database Option

You have two options for connecting your MateFinder application to MongoDB:

### Option 1: Set Up MongoDB Atlas (Recommended)

MongoDB Atlas is a fully-managed cloud database service that's perfect for development and production use.

1. Follow the instructions in `mongodb-atlas-setup.md` to create your MongoDB Atlas account
2. Get your connection string from MongoDB Atlas
3. Update your `.env` file with the actual connection string:

```
MONGODB_URI=mongodb+srv://<your-username>:<your-password>@<your-cluster-url>/matefinder?retryWrites=true&w=majority
```

4. Restart your application

### Option 2: Install MongoDB Locally

If you prefer to run MongoDB on your local machine:

1. Follow the instructions in `local-mongodb-setup.md` to install MongoDB locally
2. Update your `.env` file with the local connection string:

```
MONGODB_URI=mongodb://localhost:27017/matefinder
```

3. Restart your application

## Modifying the Connection String

The current connection string in your `.env` file is a placeholder and won't work. You need to replace it with a real MongoDB connection string using either Option 1 or Option 2 above.

## Testing the Connection

After updating your connection string:

1. Restart your application: `npm run dev`
2. Check the console output for "Connected to MongoDB successfully"

## Database Schema

Once connected, your application will automatically create the necessary collections in the database:

-   `users`: For user profiles and authentication
-   `chats`: For storing chat messages between users

## Sample Data

You may want to create sample data after connecting to the database. A script for this will be provided later if needed.
