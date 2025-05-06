# Command X - Construction Project Management System

Command X is a comprehensive construction project management system designed to streamline project workflows, enhance collaboration, and improve financial tracking for construction companies.

## Features

- **Project Management**: Track and manage construction projects from inception to completion
- **Work Order Management**: Create, assign, and track work orders for subcontractors
- **Financial Management**: Monitor budgets, costs, invoices, and payments
- **Document Management**: Store, organize, and share project documents
- **Quality Control**: Implement and track quality control processes
- **User Management**: Manage user roles and permissions

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Containerization**: Docker, Docker Compose

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- pnpm (for frontend)
- npm (for backend)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/command-x.git
   cd command-x
   ```

2. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd ubuntu/command-x-frontend
   pnpm install

   # Install backend dependencies
   cd ../command-x-backend
   npm install
   ```

3. Start the application using Docker:
   ```bash
   cd ../..
   docker-compose up -d
   ```

4. Access the application:
   - Frontend: http://localhost:8082
   - Development server: http://localhost:8081 (when running `npx vite --port 8081` in the frontend directory)

### Development

To start the development server:

```bash
cd ubuntu/command-x-frontend
npx vite --port 8081
```

## Project Structure

- `ubuntu/command-x-frontend`: React frontend application
- `ubuntu/command-x-backend`: Node.js backend services
  - `project-management-service`: Project management API
  - `work-order-service`: Work order management API
  - `financial-service`: Financial management API
  - `document-service`: Document management API
  - `qc-service`: Quality control API
  - `user-service`: User management API

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Express](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/)
