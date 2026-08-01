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