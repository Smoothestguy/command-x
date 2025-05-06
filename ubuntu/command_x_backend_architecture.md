# Command X - Backend Architecture Design

This document outlines the backend architecture for the Command X construction management system, based on the provided requirements.

## 1. Overview

The backend will be built using a microservices architecture to ensure scalability, maintainability, and independent deployment. Node.js with Express.js will be the primary framework for building RESTful APIs. GraphQL will be implemented, likely via an API Gateway pattern or integrated into relevant services, to handle complex data fetching requirements efficiently. Communication between services will leverage both synchronous (REST/GraphQL) and asynchronous (Kafka) patterns.

**Core Technologies:**

*   **Language/Framework:** Node.js, Express.js, TypeScript (recommended for type safety)
*   **Database:** PostgreSQL (with TimescaleDB extension for time-series data like audit logs and financial transactions)
*   **Caching:** Redis
*   **Asynchronous Communication:** Apache Kafka
*   **Authentication:** JSON Web Tokens (JWT)
*   **API Specification:** OpenAPI (for REST), GraphQL Schema Definition Language (SDL)
*   **Containerization:** Docker
*   **Orchestration:** Kubernetes

## 2. Microservices

The backend will be divided into the following microservices:

### 2.1. User Management Service
*   **Responsibilities:** Handles user registration, login (authentication), profile management, password management, role assignments, and permissions.
*   **API Endpoints (RESTful examples):**
    *   `POST /auth/register`
    *   `POST /auth/login`
    *   `GET /users/me`
    *   `PUT /users/me`
    *   `GET /users` (Admin)
    *   `PUT /users/{userId}/role` (Admin)
*   **Data:** Interacts primarily with the `users` table.
*   **Events Published (Kafka):** `UserRegistered`, `UserRoleUpdated`
*   **Authentication:** Issues JWTs upon successful login.

### 2.2. Project Management Service
*   **Responsibilities:** Manages project creation, retrieval, updates, deletion, status tracking, timeline/milestone management, budget tracking (summary level), team assignments.
*   **API Endpoints (RESTful examples):**
    *   `POST /projects`
    *   `GET /projects`
    *   `GET /projects/{projectId}`
    *   `PUT /projects/{projectId}`
    *   `DELETE /projects/{projectId}`
    *   `GET /projects/{projectId}/team`
    *   `POST /projects/{projectId}/milestones`
*   **Data:** Interacts primarily with the `projects` table, potentially `users` (for team members).
*   **Events Published (Kafka):** `ProjectCreated`, `ProjectUpdated`, `ProjectStatusChanged`
*   **Events Consumed (Kafka):** None initially, but could listen for user updates if needed.

### 2.3. Work Order Service
*   **Responsibilities:** Manages work orders, including creation, assignment to subcontractors, status tracking, line item management, quality control initiation, change order handling.
*   **API Endpoints (RESTful examples):**
    *   `POST /projects/{projectId}/workorders`
    *   `GET /workorders` (with filters for project, status, subcontractor)
    *   `GET /workorders/{workOrderId}`
    *   `PUT /workorders/{workOrderId}`
    *   `PATCH /workorders/{workOrderId}/status`
    *   `POST /workorders/{workOrderId}/lineitems`
    *   `GET /workorders/{workOrderId}/lineitems`
    *   `PUT /lineitems/{lineItemId}`
    *   `POST /workorders/{workOrderId}/inspections` (Initiates inspection process)
*   **Data:** Interacts with `work_orders`, `line_items`, `projects`, `subcontractors`, `quality_inspections` tables.
*   **Events Published (Kafka):** `WorkOrderCreated`, `WorkOrderAssigned`, `WorkOrderStatusUpdated`, `LineItemAdded`, `InspectionRequested`
*   **Events Consumed (Kafka):** `ProjectCreated` (potentially for validation), `SubcontractorUpdated`

### 2.4. Financial Service
*   **Responsibilities:** Handles financial aspects like budget tracking (detailed), invoice generation/tracking (integration points), payment processing/history, retainage management, financial reporting data aggregation.
*   **API Endpoints (RESTful examples):**
    *   `GET /projects/{projectId}/financials`
    *   `GET /workorders/{workOrderId}/financials`
    *   `POST /transactions` (e.g., recording payments, invoices)
    *   `GET /transactions` (with filters)
    *   `GET /subcontractors/{subcontractorId}/payments`
    *   `POST /workorders/{workOrderId}/billing` (Update billing status)
*   **Data:** Interacts with `financial_transactions`, `work_orders`, `projects`, `subcontractors` tables. Uses TimescaleDB features for `financial_transactions`.
*   **Events Published (Kafka):** `PaymentRecorded`, `InvoiceStatusUpdated`, `RetainageUpdated`
*   **Events Consumed (Kafka):** `WorkOrderCompleted` (trigger billing?), `WorkOrderStatusUpdated` (update financial summaries)

### 2.5. Document Service
*   **Responsibilities:** Manages document uploads, storage (interfacing with S3 or similar), retrieval, versioning, and association with projects, work orders, or inspections.
*   **API Endpoints (RESTful examples):**
    *   `POST /documents/upload` (Handles file upload, returns document metadata/ID)
    *   `GET /documents/{documentId}`
    *   `GET /documents` (with filters for project, work order)
    *   `DELETE /documents/{documentId}`
    *   `POST /projects/{projectId}/documents` (Associate existing doc)
    *   `POST /workorders/{workOrderId}/documents` (Associate existing doc)
    *   `POST /inspections/{inspectionId}/attachments` (Associate existing doc)
*   **Data:** Interacts with `documents`, `inspection_attachments` tables. Manages file storage externally (e.g., AWS S3, MinIO).
*   **Events Published (Kafka):** `DocumentUploaded`, `DocumentAssociated`
*   **Events Consumed (Kafka):** None initially.

### 2.6. Quality Control Service (Potential - could be part of Work Order Service initially)
*   **Responsibilities:** Manages the quality inspection process, scheduling, status updates (Pass/Fail), issue documentation, correction verification.
*   **API Endpoints (RESTful examples):**
    *   `GET /inspections` (with filters)
    *   `GET /inspections/{inspectionId}`
    *   `PUT /inspections/{inspectionId}/status`
    *   `POST /inspections/{inspectionId}/notes`
    *   `POST /inspections/{inspectionId}/verify`
*   **Data:** Interacts with `quality_inspections`, `inspection_attachments`, `documents`, `work_orders`.
*   **Events Published (Kafka):** `InspectionCompleted`, `InspectionStatusUpdated`
*   **Events Consumed (Kafka):** `InspectionRequested`

## 3. Communication Patterns

*   **Synchronous:** Frontend client communicates with backend services primarily via REST or GraphQL (potentially through an API Gateway). Direct service-to-service communication for immediate data needs can also use REST.
*   **Asynchronous:** Kafka will be used for event-driven communication. Services publish events when significant state changes occur (e.g., `WorkOrderCreated`). Other services subscribe to relevant events to react accordingly (e.g., Financial Service updates summaries when `WorkOrderStatusUpdated`). This decouples services and improves resilience.

## 4. Authentication and Authorization

*   **Authentication:** JWT-based. The User Management Service issues tokens upon login. Subsequent requests to other services must include a valid JWT in the `Authorization` header.
*   **Authorization:** Role-Based Access Control (RBAC). Each service will validate the JWT and check the user's role (extracted from the token) against the required permissions for the requested action/resource. Permission definitions might be managed centrally or within each service.

## 5. Cross-Cutting Concerns

*   **API Gateway (Optional but Recommended):** A dedicated API Gateway (e.g., using Express Gateway, Apollo Gateway for Federation) can serve as a single entry point for the frontend, handle request routing, aggregate results, manage cross-cutting concerns like authentication validation, rate limiting, and potentially provide the GraphQL interface.
*   **Logging:** Implement structured logging (e.g., JSON format) in all services. Centralize logs using the ELK stack (Elasticsearch, Logstash, Kibana) as specified in DevOps requirements.
*   **Error Handling:** Consistent error handling strategy across all services. Standardized error response formats.
*   **API Documentation:** Generate OpenAPI documentation for REST APIs (e.g., using Swagger/OpenAPI tools) and maintain a GraphQL schema. This documentation is crucial for frontend development and inter-service communication.
*   **Database Migrations:** Use a migration tool (e.g., `node-pg-migrate`, `TypeORM migrations`) to manage database schema changes version control.
*   **Seed Data:** Scripts to populate the database with initial necessary data (e.g., admin user, default roles).

## 6. Next Steps

*   Refine API endpoint definitions for each service.
*   Define specific Kafka event schemas.
*   Choose and configure GraphQL implementation (if using Gateway or integrated).
*   Set up base project structure for each microservice.
*   Implement core authentication logic.

