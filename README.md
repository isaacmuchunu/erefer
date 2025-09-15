# eRefer - Healthcare Electronic Referral System

[![Laravel](https://img.shields.io/badge/Laravel-12.x-red.svg)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A comprehensive healthcare electronic referral system designed to streamline patient referrals between healthcare facilities, manage ambulance dispatch and tracking, and facilitate seamless communication between healthcare providers.

## 🏥 System Overview

eRefer is a modern, web-based healthcare referral system that enables:

- **Patient Referral Management**: Seamless referrals between healthcare facilities
- **Ambulance Dispatch & Tracking**: Real-time GPS tracking and dispatch management
- **Bed Management**: Hospital bed availability and reservation system
- **Equipment Management**: Medical equipment tracking and maintenance
- **Communication Hub**: Real-time messaging between healthcare providers
- **Analytics & Reporting**: Comprehensive dashboards and performance metrics
- **Emergency Response**: Emergency alert and mass casualty incident management

## 🚀 Features

### Core Referral System
- ✅ Create and manage patient referrals
- ✅ Multi-facility referral workflow
- ✅ Specialty-based referral routing
- ✅ Urgency-based prioritization
- ✅ Document attachment and sharing
- ✅ Referral status tracking and timeline

### Ambulance Management
- ✅ Ambulance fleet management
- ✅ Real-time GPS tracking
- ✅ Dispatch management system
- ✅ Crew assignment and scheduling
- ✅ Route optimization
- ✅ Maintenance tracking

### Facility & Resource Management
- ✅ Healthcare facility registration
- ✅ Bed availability management
- ✅ Equipment inventory tracking
- ✅ Department and specialty management
- ✅ Doctor and staff management

### Communication & Notifications
- ✅ Real-time messaging system
- ✅ Push notifications
- ✅ Email notifications
- ✅ SMS alerts (via Twilio)
- ✅ WebSocket-based real-time updates

### Analytics & Reporting
- ✅ Dashboard with key metrics
- ✅ Referral analytics
- ✅ Performance reporting
- ✅ Resource utilization tracking
- ✅ Emergency response metrics

## 🛠 Technology Stack

### Backend
- **Framework**: Laravel 12.x
- **Database**: SQLite (development) / MySQL/PostgreSQL (production)
- **Authentication**: Laravel Sanctum
- **Real-time**: Pusher WebSockets
- **SMS**: Twilio SDK
- **API**: RESTful API with comprehensive endpoints

### Frontend
- **Framework**: React 19.0 with TypeScript
- **UI Library**: Ant Design + Radix UI + Tailwind CSS
- **State Management**: React Hooks + Inertia.js
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build Tool**: Vite

### Infrastructure
- **Server**: PHP 8.2+
- **Package Manager**: Composer (PHP) + npm (Node.js)
- **Queue System**: Laravel Queues
- **File Storage**: Laravel Filesystem
- **Caching**: Redis/File-based caching

## 📋 Prerequisites

- PHP 8.2 or higher
- Node.js 18+ and npm
- Composer
- SQLite (development) or MySQL/PostgreSQL (production)
- Redis (optional, for caching and queues)

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/erefer.git
cd erefer
```

### 2. Install PHP Dependencies
```bash
composer install
```

### 3. Install Node.js Dependencies
```bash
npm install
```

### 4. Environment Configuration
```bash
cp .env.example .env
php artisan key:generate
```

### 5. Configure Environment Variables
Edit `.env` file with your configuration:

```env
# Application
APP_NAME="eRefer"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=sqlite
# DB_DATABASE=/absolute/path/to/database.sqlite

# For MySQL/PostgreSQL:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=erefer
# DB_USERNAME=root
# DB_PASSWORD=

# Pusher (Real-time features)
PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_APP_CLUSTER=your_cluster

# Twilio (SMS notifications)
TWILIO_SID=your_twilio_sid
TWILIO_TOKEN=your_twilio_token
TWILIO_FROM=your_twilio_phone_number

# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_ENCRYPTION=tls
```

### 6. Database Setup
```bash
# Create database file (for SQLite)
touch database/database.sqlite

# Run migrations
php artisan migrate

# Seed the database with sample data
php artisan db:seed
```

### 7. Build Frontend Assets
```bash
npm run build
# or for development
npm run dev
```

### 8. Start the Application
```bash
# Start Laravel development server
php artisan serve

# In another terminal, start Vite dev server (for development)
npm run dev
```

Visit `http://localhost:8000` to access the application.

## 🔧 Configuration

### Queue Configuration
For background job processing:
```bash
php artisan queue:work
```

### WebSocket Configuration
Configure Pusher credentials in `.env` for real-time features.

### SMS Configuration
Configure Twilio credentials in `.env` for SMS notifications.

## 📱 Usage

### Default Login Credentials
After seeding, you can login with:
- **Super Admin**: admin@erefer.com / password
- **Hospital Admin**: hospital@erefer.com / password
- **Doctor**: doctor@erefer.com / password
- **Dispatcher**: dispatcher@erefer.com / password

### Creating a Referral
1. Navigate to "Referrals" → "Create New"
2. Select patient and referring facility
3. Choose receiving facility and specialty
4. Fill in clinical details and urgency level
5. Submit for processing

### Managing Ambulances
1. Go to "Ambulances" section
2. View fleet status and locations
3. Dispatch ambulances for referrals
4. Track real-time location and status
5. Manage crew assignments

### Monitoring System
1. Access the Dashboard for overview
2. View real-time metrics and alerts
3. Monitor referral status and performance
4. Track ambulance operations
5. Generate reports and analytics

## 🔌 API Documentation

### Authentication
All API endpoints require authentication via Sanctum tokens.

```bash
# Login to get token
POST /api/v1/auth/login
{
    "email": "user@example.com",
    "password": "password"
}
```

### Key Endpoints

#### Referrals
- `GET /api/v1/referrals` - List referrals
- `POST /api/v1/referrals` - Create referral
- `GET /api/v1/referrals/{id}` - Get referral details
- `PUT /api/v1/referrals/{id}` - Update referral
- `POST /api/v1/referrals/{id}/accept` - Accept referral
- `POST /api/v1/referrals/{id}/reject` - Reject referral

#### Ambulances
- `GET /api/v1/ambulances` - List ambulances
- `POST /api/v1/ambulances/dispatch` - Dispatch ambulance
- `PUT /api/v1/ambulances/{id}/location` - Update location
- `GET /api/v1/dispatches` - List dispatches
- `PUT /api/v1/dispatches/{id}/status` - Update dispatch status

#### Facilities
- `GET /api/v1/facilities` - List facilities
- `GET /api/v1/facilities/{id}/beds` - Get facility beds
- `GET /api/v1/facilities/{id}/doctors` - Get facility doctors

For complete API documentation, visit `/api/documentation` when the application is running.

## 🧪 Testing

```bash
# Run PHP tests
php artisan test

# Run with coverage
php artisan test --coverage

# Run specific test suite
php artisan test --testsuite=Feature
```

## 🚀 Deployment

### Production Setup
1. Set `APP_ENV=production` in `.env`
2. Set `APP_DEBUG=false`
3. Configure production database
4. Set up proper web server (Apache/Nginx)
5. Configure SSL certificates
6. Set up queue workers as system services
7. Configure backup and monitoring

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- 📧 Email: support@erefer.com
- 📞 Phone: +1-XXX-XXX-XXXX
- 💬 Slack: [erefer-support.slack.com](https://erefer-support.slack.com)
- 📖 Documentation: [docs.erefer.com](https://docs.erefer.com)

## 🗺 Roadmap

See our [Product Requirements Document (PRD)](PRD.md) for detailed development roadmap and upcoming features.

---

**eRefer** - Transforming Healthcare Referrals, One Patient at a Time 🏥✨
#   e r e f e r  
 