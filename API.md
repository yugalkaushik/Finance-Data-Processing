# Finance Backend API

This file is meant to be practical: what to call, what to send, what comes back, and what was actually tested.

Base URL: `/api`

Local runtime checks:
- `GET /` returns basic service info
- `GET /health` returns status + timestamp

## Auth model

This project uses a lightweight bearer token (base64 JSON payload).

Header format:

`Authorization: Bearer <token>`

Token payload shape:

```json
{
	"userId": 16,
	"role": "ADMIN"
}
```

Roles used by access control:
- `VIEWER`
- `ANALYST`
- `ADMIN`

## Standard response envelope

Success:

```json
{
	"success": true,
	"data": {},
	"message": "Success"
}
```

Error:

```json
{
	"success": false,
	"error": "Error message"
}
```

## Role access matrix

| Route group | VIEWER | ANALYST | ADMIN |
|---|---:|---:|---:|
| `GET /api/users/profile` | yes | yes | yes |
| `/api/users` admin management routes | no | no | yes |
| `GET /api/records` and `GET /api/records/:id` | no | yes | yes |
| `POST/PUT/DELETE /api/records` | no | no | yes |
| `/api/dashboard/*` | yes | yes | yes |

## Routes

### Users

#### `POST /api/users/register`
Create a new user. New users start as `VIEWER` and `ACTIVE`.

Request body:

```json
{
	"email": "person@example.com",
	"password": "passw0rd",
	"name": "Person Name"
}
```

Validation:
- `email`: valid email
- `password`: min 6 chars
- `name`: non-empty string

Success:
- `201 Created`

Common errors:
- `400` invalid body
- `400` email already exists

#### `POST /api/users/login`
Authenticate and return user details + bearer token.

Request body:

```json
{
	"email": "person@example.com",
	"password": "passw0rd"
}
```

Success:
- `200 OK`

Common errors:
- `400` invalid body
- `401` invalid credentials
- `401` inactive user

#### `GET /api/users/profile`
Get current user profile from token.

Auth required: yes

Success:
- `200 OK`

Errors:
- `401` missing/invalid token

#### `GET /api/users`
List users with pagination.

Auth required: yes (`ADMIN`)

Query params:
- `skip` (default `0`, min `0`)
- `take` (default `20`, min `1`, max `100`)

Success:
- `200 OK`

Errors:
- `403` non-admin
- `400` invalid query

#### `GET /api/users/:id`
Get user by id.

Auth required: yes (`ADMIN`)

Success:
- `200 OK`

Errors:
- `400` invalid user id
- `403` non-admin
- `404` user not found

#### `PUT /api/users/:id`
Update user fields.

Auth required: yes (`ADMIN`)

Request body (all optional):

```json
{
	"email": "new@example.com",
	"name": "Updated Name",
	"role": "ANALYST",
	"status": "INACTIVE"
}
```

Success:
- `200 OK`

Errors:
- `400` invalid body or id
- `403` non-admin
- `400` email conflict
- `404` user not found

#### `DELETE /api/users/:id`
Delete user.

Auth required: yes (`ADMIN`)

Success:
- `200 OK`

Errors:
- `400` invalid user id
- `403` non-admin
- `404` user not found

### Financial records

#### `POST /api/records`
Create a financial record.

Auth required: yes (`ADMIN`)

Request body:

```json
{
	"amount": 5000,
	"type": "INCOME",
	"category": "Salary",
	"date": "2026-04-01T00:00:00.000Z",
	"notes": "monthly salary"
}
```

Validation:
- `amount`: positive number
- `type`: `INCOME` or `EXPENSE`
- `category`: non-empty string
- `date`: parseable date
- `notes`: optional string

Success:
- `201 Created`

Errors:
- `403` non-admin
- `400` invalid body

#### `GET /api/records`
List records (paginated + filtered).

Auth required: yes (`ANALYST` or `ADMIN`)

Query params:
- `skip` (default `0`)
- `take` (default `20`, max `100`)
- `type` (`INCOME` or `EXPENSE`)
- `category` (contains match)
- `startDate` (date)
- `endDate` (date)
- `userId` (admin only filter)

Behavior notes:
- `ANALYST` sees only own records
- `ADMIN` can see all records, and can filter by `userId`

Success:
- `200 OK`

Errors:
- `403` viewer denied
- `400` invalid query

#### `GET /api/records/:id`
Get one record.

Auth required: yes (`ANALYST` or `ADMIN`)

Success:
- `200 OK`

Errors:
- `400` invalid record id
- `403` forbidden
- `404` record not found

#### `PUT /api/records/:id`
Update record.

Auth required: yes (`ADMIN`)

Request body (partial allowed):

```json
{
	"notes": "updated note"
}
```

Success:
- `200 OK`

Errors:
- `400` invalid body/id
- `403` non-admin
- `404` record not found

#### `DELETE /api/records/:id`
Delete record.

Auth required: yes (`ADMIN`)

Success:
- `200 OK`

Errors:
- `400` invalid record id
- `403` non-admin
- `404` record not found

### Dashboard

All dashboard routes require auth and allow `VIEWER`, `ANALYST`, and `ADMIN`.

#### `GET /api/dashboard/summary`
Returns:
- `totalIncome`
- `totalExpense`
- `netBalance`
- `recordCount`

#### `GET /api/dashboard/categories`
Returns category-wise totals in this shape:

```json
{
	"Salary": {
		"income": 5000,
		"expense": 0,
		"total": 5000
	}
}
```

#### `GET /api/dashboard/trends`
Returns monthly trend rows:

```json
[
	{
		"month": "2026-04",
		"income": 5000,
		"expense": 1300,
		"net": 3700
	}
]
```

#### `GET /api/dashboard/activity`
Query params:
- `limit` (default `10`, max `50`)

Returns recent records with minimal user info:

```json
[
	{
		"id": 21,
		"amount": 5000,
		"type": "INCOME",
		"category": "Salary",
		"date": "2026-04-01T00:00:00.000Z",
		"createdAt": "2026-04-05T10:55:13.123Z",
		"user": {
			"name": "Admin User",
			"email": "admin@example.com"
		}
	}
]
```

Common errors for dashboard routes:
- `401` missing/invalid token
- `400` invalid query input

## Real test run summary (verified)

Date: 2026-04-05

Checked with live server and scripted calls.

Observed statuses:
- `GET /`: `200`
- `GET /health`: `200`
- `POST /api/users/register` (admin-like user): `201`
- `POST /api/users/register` (analyst user): `201`
- `POST /api/users/register` (viewer user): `201`
- `POST /api/users/register` (temp-delete user): `201`
- `POST /api/users/login` (viewer): `200`
- `PUT /api/users/:id` (admin sets analyst role): `200`
- `GET /api/users/profile`: `200`
- `GET /api/users`: `200`
- `GET /api/users/:id`: `200`
- `PUT /api/users/:id`: `200`
- `DELETE /api/users/:id`: `200`
- `POST /api/records`: `201`
- `GET /api/records`: `200`
- `GET /api/records/:id`: `200`
- `PUT /api/records/:id`: `200`
- `DELETE /api/records/:id`: `200`
- `GET /api/dashboard/summary`: `200`
- `GET /api/dashboard/categories`: `200`
- `GET /api/dashboard/trends`: `200`
- `GET /api/dashboard/activity`: `200`
- `GET /api/not-a-route`: `404`

Extra negative checks (same run):
- duplicate register: `400`
- invalid login: `401`
- viewer on `GET /api/users`: `403`
- viewer on `GET /api/records`: `403`
- analyst on `POST /api/records`: `403`
- invalid id `GET /api/records/not-a-number`: `400`

Sample tested error response:

```json
{
	"success": false,
	"error": "Invalid record id"
}
```

## Suggested execution order (manual testing)

1. Register user.
2. Login and store token.
3. Call `GET /api/users/profile` to confirm auth.
4. Create records (admin).
5. List/filter records.
6. Open dashboard summary/categories/trends/activity.
7. Check one negative case (invalid id or forbidden role) before final submission.