# Supabase Documentation

> Last Updated: August 2026

This document serves as the source of truth for the backend architecture of the Business Management Template.

It documents the current Supabase implementation, authentication architecture, database schema, storage configuration, Row Level Security, and future plans.

---

# Project Overview

## Tech Stack

- Supabase
  - PostgreSQL
  - Auth
  - Storage

Frontend

- Next.js 16
- React
- Tailwind CSS

Architecture

Pages
↓
Components
↓
Services
↓
Supabase

---

# Authentication

## Current Status

Implemented

- Email / Password Login
- Logout
- Supabase Auth
- Session cookies via @supabase/ssr

Current implementation

auth.users

↓

profiles

↓

user_roles

↓

roles

Current limitations

- Protected routes not implemented
- Middleware only refreshes sessions
- Session validation not enforced
- Sidebar still visible while logged out
- Pages can be visited without authentication
- RBAC not yet implemented

Future work

- Protected layouts
- Public layouts
- Session validation
- Route guards
- AuthProvider

---

# Database Schema

## Tables

### brands

Purpose

...

Relationships

...

---

### categories

...

---

### products

...

---

### inventory_items

...

---

### inventory_item_statuses

...

---

### suppliers

...

---

### locations

...

---

### profiles

...

---

### roles

...

---

### user_roles

...

---

# Relationships

(ERD / relationship summary)

---

# Row Level Security

Current status

Tables with RLS enabled

- inventory_items
- inventory_item_statuses

Tables without RLS

- brands
- categories
- products
- suppliers
- profiles
- roles
- user_roles
- locations

Future direction

Enable RLS across all business tables.

---

# Storage

Bucket

product-images

Current Policies

...

---

# Database Functions

Currently

None

Future

Automatic profile creation

Automatic default role assignment

Permission helper functions

---

# Triggers

Current

Supabase default triggers only.

---

# RBAC

## Current Design

auth.users

↓

profiles

↓

user_roles

↓

roles

## Planned Design

auth.users

↓

profiles

↓

user_roles

↓

roles

↓

role_permissions

↓

permissions

Frontend

↓

can(permission)

instead of

role == "Admin"

---

# Future Improvements

Authentication

- Protected routes
- Middleware redirects
- AuthProvider
- Session persistence
- Public layouts
- Protected layouts

Authorization

- permissions table
- role_permissions table
- Permission hooks
- UI authorization
- Service authorization

Database

- Audit logs
- Database functions
- Shared user profile view

---

# Planned Database View

A future optimization will introduce a database view similar to:

current_user_profile

Purpose

Provide the frontend with a single query that returns:

- User
- Profile
- Assigned Roles
- (Future) Permissions

Instead of multiple queries:

auth.users

↓

profiles

↓

user_roles

↓

roles

↓

permissions

the frontend will consume a single view/service, reducing duplicated joins throughout the application while keeping the underlying schema normalized.

This is a future optimization and will be implemented after RBAC is complete.

---

# Notes

Project Principles

- KISS
- Vertical slices
- Services own business logic
- Components never access Supabase directly
- Prefer permissions over role checks
- Build MVP first
- Refactor only when it clearly improves maintainability

## Authentication Invariants

Every authenticated user must have:

- One profile record.
- At least one assigned role.

Missing profiles or roles are treated as data integrity errors rather than valid application states.

### permissions

**Purpose**

Defines every permission available in the application.

Permissions represent the smallest unit of authorization and are assigned to roles rather than directly to users.

Permission names follow the convention:

```
resource.action
```

Examples

```
products.read
products.create
inventory.receive
inventory.ship
reports.read
```

**Primary Key**

- id (bigint)

**Columns**

| Column | Type |
|---------|------|
| id | bigint |
| name | text |
| description | text |
| created_at | timestamptz |

**Relationships**

- Referenced by `role_permissions.permission_id`

**Notes**

- Permission names are globally unique.
- Permissions are immutable lookup data.
- Permissions are assigned to roles, never directly to users.
- The application should always check permissions instead of role names.

---

### role_permissions

**Purpose**

Assigns permissions to roles.

This table establishes the many-to-many relationship between roles and permissions.

**Primary Key**

Composite Key

- role_id
- permission_id

**Columns**

| Column | Type |
|---------|------|
| role_id | bigint |
| permission_id | bigint |
| assigned_at | timestamptz |

**Relationships**

- role_id → roles.id
- permission_id → permissions.id

**Notes**

- Supports assigning multiple permissions to a role.
- Supports sharing the same permission across multiple roles.
- Mirrors the design of `user_roles` for consistency.

## Authentication Invariants

Every authenticated user must have:

- One profile record.
- At least one assigned role.

Every role may have:

- Zero or more assigned permissions.

Permissions are assigned to roles, never directly to users.

Missing profiles or roles are treated as data integrity errors rather than valid application states.