# SMOLLAN Activation KROON — PHP edition

Native PHP 8+ / PDO / MySQL edition for Hostinger, cPanel or another PHP-enabled host. Mobile-first UI uses Tailwind CDN and SMOLLAN brand colors (#862633 / #a48e65).

## Files
- login.php / logout.php: PHP sessions and password_verify.
- admin.php: progress dashboard, status changes, search/filter, provider create/edit/password reset/delete, reassignment.
- stores.php: provider's assigned stores.
- store.php: per-store measurements in JSON and field photos.
- database.sql: MySQL schema for users and installations.
- includes/config.php: PDO config, sessions, CSRF helpers.
- uploads/photos/: photo storage; ensure PHP can write here.

## Setup
1. Create a MySQL database/user in cPanel and grant all privileges.
2. Import database.sql using phpMyAdmin.
3. Put database credentials in includes/config.php.
4. Upload the contents of this folder to public_html on PHP hosting.
5. Add initial users with hashed passwords and import the initial store assignments into the database. The initial user list and store matrix are in the repository root prompt. The credential bootstrap is not bundled here, so the PHP host admin should initialize accounts securely and delete any one-time setup script after use.
6. Open login.php. Admin and provider pages are available after the database users are added.

## Compatibility
Vercel does not execute native PHP/MySQL applications as a standard runtime. Use Hostinger/cPanel for this PHP edition. The existing Next.js app remains unchanged at the repository root and can continue to be deployed to Vercel.
