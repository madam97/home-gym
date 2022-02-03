<?php

require './vendor/autoload.php';

require './config/config.php';
require './functions/array_sort.php';
require './classes/api.php';
require './classes/db.php';
require './classes/auth.php';

$api = new API();

try {
  DB::load();

  $api->processRequest();

  throw new \Exception('unknown endpoint');  
} catch (\Exception $e) {
  $api->sendError($e->getMessage(), $e->getCode());
}