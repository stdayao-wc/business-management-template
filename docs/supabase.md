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
- Middleware session refresh
- Protected routes
- Protected layouts
- Server-side authentication service
- AuthProvider
- Session validation
- Role loading
- Permission loading

Current authentication flow

```
Browser

↓

Middleware

↓

Protected Layout

↓

Server Authentication

↓

AuthProvider

↓

Client Components
```

Current implementation

```
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
```

Current authentication context

```
{
    user,
    profile,
    roles,
    permissions,
    can()
}
```

Current authentication services

```
getCurrentUser()

getCurrentSession()

getCurrentProfile()

getCurrentRoles()

getCurrentPermissions()

getCurrentAuth()

requirePermission()
```

Authentication invariants

Every authenticated user must have

- One profile
- At least one assigned role

Missing profiles or roles are treated as data integrity errors rather than valid application states.

Permissions may legitimately be empty.

Future work

- Service-layer authorization
- Administration module

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

```
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
```

Frontend

↓

```
can(permission)
```

instead of

```
role === "Admin"
```

Server

↓

```
requirePermission(permission)
```

instead of checking permissions inside client pages.

---

## Current Roles

Current roles

```
Admin

Manager

Employee
```

Current implementation

Admin

- Full system access

Employee

- Inventory
- POS

Manager

- Reserved for future implementation

---

## Current Permission Catalog

Dashboard

```
dashboard.read
```

Products

```
products.read
products.create
products.update
products.delete
```

Inventory

```
inventory.read
inventory.receive
inventory.ship
inventory.reserve
inventory.damage
```

POS

```
pos.read
pos.sell
pos.discount
pos.refund
```

---

## Current Authorization Architecture

Authorization happens in two layers.

Server

```
requirePermission(permission)
```

Responsible for

- Page authorization
- Preventing unauthorized pages from rendering

Client

```
can(permission)
```

Responsible for

- UI authorization
- Showing and hiding actions

Future

Service authorization

will validate permissions before database mutations.
---

# Future Improvements

Authentication

- Service authorization
- Automatic profile creation trigger
- Automatic default role assignment

Authorization

- Administration module
- Role editor
- Permission management UI

Database

- Audit logs
- Database functions
- Shared user profile view

Optimization

- Permission constants

```
PERMISSIONS.PRODUCTS.CREATE
```

instead of

```
"products.create"
```

after additional modules adopt RBAC.
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

# Current Architecture Conventions

Authentication

Middleware owns authentication.

Protected layouts own authenticated application state.

Server pages own authorization.

Client pages own rendering.

Authentication Context

The application should consume authentication only through

```
useAuth()
```

Components should always use

```
can(permission)
```

instead of inspecting the permissions array directly.

Authorization

Server pages should authorize modules using

```
requirePermission(permission)
```

before rendering client pages.

Project Convention

Every protected module should follow

```
module/

page.js

ModulePage.jsx
```

Responsibilities

page.js

- Server component
- Authorization
- Server orchestration
- Future server-side data loading

ModulePage.jsx

- Client component
- State
- Hooks
- Events
- Rendering

Components

Components own authorization for their own UI.

Pages should not pass permission booleans to components.

Example

```
ItemCard

↓

useAuth()

↓

can("products.update")
```

rather than

```
< ItemCard canEdit={...} />
```