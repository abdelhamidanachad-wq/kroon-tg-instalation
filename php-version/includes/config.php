<?php
// Change credentials after uploading to a PHP/MySQL host.
const DB_HOST = 'localhost';
const DB_NAME = 'CHANGE_ME';
const DB_USER = 'CHANGE_ME';
const DB_PASS = 'CHANGE_ME';
if (session_status() !== PHP_SESSION_ACTIVE) {
    $secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    session_set_cookie_params(['httponly'=>true,'secure'=>$secure,'samesite'=>'Lax','path'=>'/']);
    session_start();
}
try {
    $pdo = new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset=utf8mb4', DB_USER, DB_PASS,
        [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC,PDO::ATTR_EMULATE_PREPARES=>false]);
} catch (PDOException $e) { http_response_code(500); exit('Database connection unavailable. Verify configuration and database setup.'); }
function e(?string $value): string { return htmlspecialchars($value ?? '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function csrf_token(): string { if (empty($_SESSION['csrf'])) $_SESSION['csrf']=bin2hex(random_bytes(32)); return $_SESSION['csrf']; }
function csrf_check(): void { if (!hash_equals($_SESSION['csrf'] ?? '', $_POST['csrf'] ?? '')) { http_response_code(419); exit('Session expired. Please refresh and try again.'); } }
function require_login(): void { if (empty($_SESSION['user'])) { header('Location: login.php'); exit; } }
function require_admin(): void { require_login(); if (($_SESSION['user']['role'] ?? '') !== 'ADMIN') { http_response_code(403); exit('Access denied'); } }
function status_label(string $status): string { return ['A_REPERER'=>'À repérer','MESURES_PRISES'=>'Mesures prises','PROD'=>'Prod','DISPATCH'=>'Dispatch','INSTALLE'=>'Installé'][$status] ?? $status; }
