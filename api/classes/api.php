<?php

class API {
  /** @var array SPEC_URL_PARAMS Possible special uri parameters like _sort, _order, etc. */
  const SPEC_URL_PARAMS = [
    'start' => 'int',
    'end' => 'int',
    'page' => 'int',
    'limit' => 'int',
    'sort' => 'split', 
    'order' => 'split',
    'expand' => 'array', 
    'embed' => 'array'
  ];

  /** @var array DEF_ROUTE_OPTIONS Default route options */
  const DEF_ROUTE_OPTIONS = [
    'required_role' => null,
    'user_id_col' => null
  ];

  /** @var Auth $auth The authorization class */
  private static $auth;

  /** @var string $method The API endpoint's method */
  private static $method;
  /** @var array $uri The API endpoint's parts */
  private static $uri;
  /** @var int $count_uri The count of the API endpoint's elements */
  private static $count_uri;
  /** @var object $route The API endpoint's route data */
  private static $route;

  /**
   * Sets the necessary headers
   */
  public static function init() {
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json; charset=UTF-8');
    header('Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE');
    header('Access-Control-Allow-Headers: Content-Type,Access-Control-Allow-Headers,Authorization,X-Requested-With');
    header('Access-Control-Expose-Headers: Content-Range,X-Total-Count');

    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
      header('HTTP/1.1 200 OK');
      exit();
    }

    error_reporting( E_ERROR | E_COMPILE_ERROR | E_WARNING );
    // ini_set( 'display_errors', 0 );
  }

  /**
   * Sets the pagination headers
   * @param string $unit
   * @param int $count
   * @param int $offset
   * @param int $limit
   * @param boolean $used_slice
   */
  public static function setHeadersPagination($unit, $count, $offset, $limit, $used_slice = true) {
    header('X-Total-Count: '.$count);
    header('Content-Range: '.$unit.' '.($offset+1).'-'.($offset+$limit).'/'.$count);

    $links_data = [];

    // Slice
    if ($used_slice) {
      $links_data['first'] = "_start=0&_end=$limit";
      if ($offset > 0) {
        $links_data['prev'] = '_start='.($offset-$limit)."&_end=$offset";
      }
      if ($offset+$limit < $count) {
        $links_data['next'] = '_start='.($offset+$limit).'&_end='.($offset+2*$limit);
      }
      $links_data['last'] = "_start=".(floor($count / $limit) * $limit).'&_end='.(ceil($count / $limit) * $limit);
    }
    // Pagination
    else {
      $links_data['first'] = "_page=1&_limit=$limit";
      if ($offset > 0) {
        $links_data['prev'] = "_page=$offset&_limit=$limit";
      }
      if ($offset+$limit < $count) {
        $links_data['next'] = '_page='.($offset+2)."&_limit=$limit";
      }
      $links_data['last'] = '_page='.(floor($count / $limit))."&_limit=$limit";
    }

    $links = [];
    foreach ($links_data as $rel => $params) {
      $links[] = '<'.getenv('URL_ROOT').'/excercises?'.$params.'>; rel="'.$rel.'"';
    }
    
    header('Link: '.implode(', ', $links));
  }

  /**
   * Runs the API process
   */
  public static function processRequest() {
    $uri = preg_replace('/^[\s\/]+|[\s\/]+$/', '', parse_url($_REQUEST['path'], PHP_URL_PATH));
    self::$uri = explode('/', $uri);
    self::$count_uri = count(self::$uri);
    self::$method = $_SERVER['REQUEST_METHOD'];

    self::validateRoute($uri);

    // Authorization processes
    if (self::$count_uri > 0 && self::$uri[0] === 'auth') {
      self::processAuth();
    }
    // CRUD processes
    else {
      $func = 'process'.self::$method;
      self::$func();
    }
  }

  /**
   * Validates the API endpoint's route and saves its data
   * @param string $uri
   */
  private static function validateRoute($uri) {
    require_once ROOT.'/config/routes.php';

    self::$route = null;
    foreach ($routes as $r) {
      $r = (object) $r;

      if (preg_match('/^'.preg_replace('/\//', '\/', $r->url).'$/i', $uri)) {
        self::$route = $r;

        if (in_array(self::$method, $r->methods)) {
          break;
        }
      }
    }

    if (!self::$route) {
      throw new \Exception("'$uri' is an invalid endpoint");
    }

    if (!in_array(self::$method, self::$route->methods)) {
      throw new \Exception("'".self::$method."' is not allowed on '$uri' endpoint");
    }

    if (isset(self::$route->options) && is_array(self::$route->options)) {
      self::$route->options = (object) array_merge(self::DEF_ROUTE_OPTIONS, self::$route->options);
    } else {
      self::$route->options = new stdClass();
    }

    if (self::$route->options->required_role) {
      Auth::checkToken(self::$route->options->required_role);
    }
  }

  /**
   * Runs an authorization process
   */
  private static function processAuth() {
    if (empty(self::$uri[1])) {
      throw new \Exception('missing authorization process');
    } elseif (!method_exists('Auth', self::$uri[1])) {
      throw new \Exception("'".self::$uri[1]."' is an invalid authorization process");
    }

    $func = self::$uri[1];
    self::sendOk(Auth::{$func}(self::getBody()));
  }

  /**
   * Runs a GET method's process
   */
  private static function processGET() {
    // Options
    $url_params = $_REQUEST;
    unset($url_params['path']);
    $options = [];
    foreach (API::SPEC_URL_PARAMS as $param => $type) {
      $key = '_'.$param;

      if (isset($url_params[$key])) {
        switch ($type) {
          case 'split':
            if ($url_params[$key]) {
              $options[$param] = explode(',', $url_params[$key]); 
            }
            break;
          case 'array':
            if ($url_params[$key]) {
              $options[$param] = is_array($url_params[$key]) ? $url_params[$key] : [ $url_params[$key] ]; 
            }
          case 'int':
            $options[$param] = intval($url_params[$key]); 
            break;
          default:
            if ($url_params[$key]) {
              $options[$param] = $url_params[$key]; 
            }
            break;
        }

        unset($url_params[$key]);
      }
    }

    // Filters
    if (count($url_params) > 0) {
      $options['filters'] = $url_params;
    } else {
      $options['filters'] = [];
    }

    if (self::$route->options->user_id_col) {
      $options['filters'][ self::$route->options->user_id_col ] = Auth::$user_id;
    }

    // Get and send data
    if (self::$count_uri === 1) {
      self::sendOk(DB::get(self::$uri[0], 0, $options));
    } else if (self::$count_uri === 2) {
      self::sendOk(DB::get(self::$uri[0], self::$uri[1], $options));
    }
  }

  /**
   * Runs a POST method's process
   */
  private static function processPOST() {
    if (self::$count_uri !== 1) {
      throw new \Exception('element is required');
    }

    $data = self::getBody();

    // Add user id
    if (self::$route->options->user_id_col) {
      $data[self::$route->options->user_id_col] = Auth::$user_id;
    }

    self::sendOk(DB::insert(self::$uri[0], $data));
  }

  /**
   * Runs a PUT method's process
   * @throws \Exception
   */
  private static function processPUT() {
    if (self::$count_uri !== 2) {
      throw new \Exception('element and id is required');
    }

    self::validateUserIdOfElement();

    self::sendOk(DB::update(self::uri[0], self::$uri[1], self::$getBody()));
  }

  /**
   * Runs a PATCH method's process
   */
  private static function processPATCH() {
    self::processPUT();
  }

  /**
   * Runs a DELETE method's process
   */
  private static function processDELETE() {
    if (self::$count_uri !== 2) {
      throw new \Exception('element and id is required');
    }

    self::validateUserIdOfElement();

    self::sendOk(DB::delete(self::$uri[0], self::$uri[1]));
  }

  /**
   * Validates the user id on the element given in the uri; used at PUT, PATCH, DELETE requests
   */
  private static function validateUserIdOfElement() {
    try {
      if (self::$route->options->user_id_col) {
        $options = [
          'filters' => [ self::$route->options->user_id_col => Auth::$user_id ]
        ];
  
        DB::get(self::$uri[0], self::$uri[1], $options);
      }
    } catch (\Exception $e) {
      if (strpos($e->getMessage(), self::$route->options->user_id_col)) {
        throw new \Exception($e->getMessage(), 403);
      } else {
        throw $e;
      }
    }
  }

  /**
   * Returns the body of the called endpoint
   * @return array
   * @throws \Exception
   */
  private static function getBody() {
    $body = file_get_contents('php://input');

    if (!$body) {
      throw new \Exception('body is empty');
    }

    return json_decode($body, true);
  }

  /**
   * Sends an ok API message
   * @param array $data The data to be sent
   */
  public static function sendOk($data) {
    header('Content-type: application/json');
    http_response_code(200);
    echo json_encode($data);
    exit();
  }

  /**
   * Sends an error API message
   * @param string $message The message to be sent
   * @param int $code The error's code
   */
  public static function sendError($message, $code = 0) {
    if (!$code) {
      $code = 404;
    }

    header('Content-type: application/json');
    http_response_code($code);
    echo json_encode([
      'status' => 'error',
      'code' => $code,
      'message' => $message
    ]);
    exit();
  }
}