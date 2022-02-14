<?php

require './config/config.php';

require ROOT.'/vendor/autoload.php';

$dotenv = \Dotenv\Dotenv::createImmutable(ROOT.'/', '.env.'.ENVIRONMENT);
$dotenv->load();

require ROOT.'/functions/array_sort.php';
require ROOT.'/classes/api.php';
require ROOT.'/classes/db.php';
require ROOT.'/classes/auth.php';

$api = new API();

try {
  DB::load();

  $api->processRequest();

  throw new \Exception('unknown endpoint');  
} catch (\Exception $e) {
  $api->sendError($e->getMessage(), $e->getCode());
}