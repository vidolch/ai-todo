# AI TODO Application

A modern TODO application with Google authentication, customizable tasks, lists, and tagging capabilities.

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Google OAuth credentials (for authentication)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   # Start the PostgreSQL database
   docker-compose up -d
   
   # Verify the database is running
   docker-compose ps
   ```

4. Configure environment variables:
   Create a `.env` file in the root directory with the following content:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_todo?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key" # Generate with: openssl rand -base64 32
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

5. Initialize the database:
   ```bash
   npx prisma migrate dev
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## Database Management

### Starting the Database
```bash
docker-compose up -d
```

### Stopping the Database
```bash
docker-compose down
```

### Viewing Database Logs
```bash
docker-compose logs -f postgres
```

### Accessing the Database
```bash
# Connect to the database using psql
docker exec -it ai-todo-db psql -U postgres -d ai_todo
```

### Resetting the Database
```bash
# Stop the container and remove the volume
docker-compose down -v

# Start fresh
docker-compose up -d
```

## Development

- Run the development server: `npm run dev`
- Build for production: `npm run build`
- Start production server: `npm start`
- Run tests: `npm test`
- Lint code: `npm run lint`

## Project Structure

- `/src` - Source code
  - `/app` - Next.js app router pages
  - `/components` - Reusable UI components
  - `/lib` - Utility functions and configurations
  - `/prisma` - Database schema and migrations
  - `/styles` - Global styles and Tailwind configuration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
