<?php

require './config/config.php';

require ROOT.'/vendor/autoload.php';

$dotenv = \Dotenv\Dotenv::createImmutable(ROOT.'/', '.env.'.ENVIRONMENT);
$dotenv->load();

require ROOT.'/functions/array_sort.php';
require ROOT.'/classes/api.php';
require ROOT.'/classes/db.php';
require ROOT.'/classes/auth.php';

try {
  API::init();
  DB::load();
  API::processRequest();

  throw new \Exception('unknown endpoint');  
} catch (\Exception $e) {
  API::sendError($e->getMessage(), $e->getCode());
}