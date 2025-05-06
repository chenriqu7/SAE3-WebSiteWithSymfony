<?php

/**
 * Returns the importmap for this application.
 *
 * - "path" is a path inside the asset mapper system. Use the
 *     "debug:asset-map" command to see the full list of paths.
 *
 * - "entrypoint" (JavaScript only) set to true for any module that will
 *     be used as an "entrypoint" (and passed to the importmap() Twig function).
 *
 * The "importmap:require" command can be used to add new entries to this file.
 */
return [
    'app' => [
        'path' => './assets/app.js',
        'entrypoint' => true,
    ],
    'acquisition' => [
        'path' => './assets/js/acquisition.js',
        'entrypoint' => true,
    ],
    'room' => [
        'path' => './assets/js/room.js',
        'entrypoint' => true,
    ],
    'management' => [
        'path' => './assets/js/management.js',
        'entrypoint' => true,
    ],
    'config' => [
        'path' => './assets/js/config.js',
    ],
    'ESPDevice' => [
        'path' => './assets/js/ESPDevice.js',
    ],
    'limitSeason' => [
        'path' => './assets/js/limitSeason.js',
    ],
    'roomDashboard' => [
        'path' => './assets/js/roomDashboard.js',
        'entrypoint' => true,
    ],
    'dashboard' => [
        'path' => './assets/js/dashboard.js',
        'entrypoint' => true,
    ],
    'chart.js' => [
        'version' => '4.4.1',
    ],
    '@kurkle/color' => [
        'version' => '0.3.2',
    ],
    'chartjs-adapter-date-fns' => [
        'version' => '3.0.0',
    ],
    'date-fns' => [
        'version' => '3.3.1',
    ],
    'date-fns/locale' => [
        'version' => '4.1.0',
    ],
];
