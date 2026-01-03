<?php
// Dev preview for standalone viewing outside WordPress/Elementor.
define('ABSPATH', __DIR__ . '/');

// Minimal WP function stubs for calculator.php
if (!function_exists('esc_url')) {
    function esc_url($url) {
        return htmlspecialchars($url, ENT_QUOTES, 'UTF-8');
    }
}

if (!function_exists('plugins_url')) {
    function plugins_url($path = '', $plugin = '') {
        $base = 'http://localhost:8000';
        return rtrim($base, '/') . ($path ? '/' . ltrim($path, '/') : '');
    }
}

// Resource URLs for local dev server (php -S localhost:8000 -t main)
$kalkulator_url   = 'http://localhost:8000/kalkulator';
$konfigurator_url = 'http://localhost:8000/konfigurator';
$img_url          = 'http://localhost:8000/img';
$libraries_url    = 'http://localhost:8000/libraries';

// Render calculator markup
include __DIR__ . '/kalkulator/calculator.php';
