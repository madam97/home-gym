<?php

define('ROOT', __DIR__ .'/../');
define('DB_FILE', realpath(ROOT.'../data/db.json'));

define('AUTH_SECRET_KEY', 'Jyz6QeEZ8naMLI7h2iqH');
define('AUTH_ACCESS_TOKEN_LIFE', '+10 minutes');
define('AUTH_REFRESH_TOKEN_LIFE', '+1 days');
define('SERVER_NAME', 'adam.webtelek.hu/home-gym');