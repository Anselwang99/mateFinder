# Setting up Local MongoDB for MateFinder

If you prefer to run MongoDB locally instead of using MongoDB Atlas, follow these steps:

## 1. Install MongoDB

### macOS (using Homebrew)

```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install MongoDB Community Edition
brew tap mongodb/brew
brew install mongodb-community@6.0

# Start MongoDB
brew services start mongodb-community@6.0

# Verify it's running
mongosh
```

### Windows

1. Download the MongoDB Community Server from the [official MongoDB website](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the instructions
3. During installation, select "Install MongoDB as a Service"
4. After installation, MongoDB should start automatically

### Linux (Ubuntu/Debian)

```bash
# Import the public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Reload the package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod

# Enable MongoDB to start on boot
sudo systemctl enable mongod

# Verify it's running
mongosh
```

## 2. Update Your .env File

Ensure your `.env` file has the correct MongoDB URI:

```
MONGODB_URI=mongodb://localhost:27017/matefinder
```

## 3. Create the Database

The database will be created automatically when the application first connects. However, you can create it manually:

```bash
mongosh
```

Then in the MongoDB shell:

```
use matefinder
```

## 4. Troubleshooting

If you encounter connection issues:

1. Check if MongoDB is running:

    - macOS: `brew services list`
    - Windows: Check Services app
    - Linux: `sudo systemctl status mongod`

2. Verify the connection string:

    - Default port is 27017
    - Make sure the database name is correct

3. Check firewall settings:

    - Ensure port 27017 is open if connecting from a different machine

4. Check MongoDB logs:
    - macOS/Linux: `/var/log/mongodb/mongod.log`
    - Windows: `C:\Program Files\MongoDB\Server\6.0\log\mongod.log`
