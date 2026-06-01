<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
     */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // REVISI: Mendaftarkan alamat resmi Frontend agar diberikan akses VIP oleh Laravel
    'allowed_origins' => [
        'http://localhost:5173',  // Akses dari React di laptopmu
        'http://127.0.0.1:5173',  // Akses alternatif React
        '*',                      // Jembatan sementara untuk Vercel (bisa diganti URL asli setelah deploy)
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
