@echo off
echo 🏆 Setting up La Copa Final...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if MySQL is installed
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  MySQL is not installed. Please install MySQL first.
    echo    Download from: https://dev.mysql.com/downloads/
    echo    Or use Docker: docker-compose up -d mysql
)

echo 📦 Installing Node.js dependencies...
call npm install

echo 🔧 Setting up environment file...
if not exist .env (
    copy .env.example .env
    echo ✅ Created .env file from example
    echo ⚠️  Please edit .env file with your database credentials
) else (
    echo ✅ .env file already exists
)

echo 🗄️  Setting up database...
echo Please run the following SQL scripts in your MySQL database:
echo 1. bd\BdEstructura.sql - Creates database structure
echo 2. bd\BdDatosScript.sql - Inserts sample data (optional)

echo 🚀 To start the application:
echo    npm start
echo    or
echo    npm run dev (for development with auto-reload)

echo 🌐 The application will be available at:
echo    http://localhost:3000

echo 📱 Features included:
echo    ✅ User registration and authentication
echo    ✅ Create and join parties with unique codes
echo    ✅ Real-time drink tracking
echo    ✅ Multiple ranking systems
echo    ✅ 60-minute challenge tracking
echo    ✅ Mobile-responsive design
echo    ✅ Automatic party closure after 24 hours
echo    ✅ Real-time updates with Socket.IO

echo.
echo 🏆 La Copa Final setup complete!
echo    Ready to compete with your friends! 🍻
pause