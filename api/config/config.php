<?php

define('ENVIRONMENT', preg_match('/local/i', $_SERVER['SERVER_NAME']) ? 'development' : 'production');

define('ROOT', realpath(__DIR__ .'/../'));
define('DB_FILE', realpath(ROOT.'/../data/db.json'));

define('AUTH_SECRET_KEY', 'Jyz6QeEZ8naMLI7h2iqH');
define('AUTH_ACCESS_TOKEN_LIFE', '+10 minutes');
define('AUTH_REFRESH_TOKEN_LIFE', '+1 days');

define('ROLE_USER', 'user');
define('ROLE_ADMIN', 'admin');