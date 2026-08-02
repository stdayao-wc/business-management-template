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

## Post-MVP Administration Module

Purpose

Provide administrators with the ability to manage the system without modifying the database directly.

Planned Features

- User Management
- Role Management
- Permission Assignment
- Branch Management
- System Settings
- Audit Logs

The Role Management module will edit `role_permissions` rather than assigning permissions directly to individual users, preserving the project's RBAC architecture.