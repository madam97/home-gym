<?php

class API {
  /** @var array SPEC_URL_PARAMS Possible special uri parameters like _sort, _order, etc. */
  const SPEC_URL_PARAMS = [
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
  private $auth;

  /** @var string $method The API endpoint's method */
  private $method;
  /** @var array $uri The API endpoint's parts */
  private $uri;
  /** @var int $count_uri The count of the API endpoint's elements */
  private $count_uri;
  /** @var object $route The API endpoint's route data */
  private $route;

  /**
   * Constructor. Sets the necessary headers
   */
  public function __construct() {
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json; charset=UTF-8');
    header('Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE');
    header('Access-Control-Allow-Headers: Content-Type,Access-Control-Allow-Headers,Authorization,X-Requested-With');

    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
      header('HTTP/1.1 200 OK');
      exit();
    }

    error_reporting( E_ERROR | E_COMPILE_ERROR | E_WARNING );
    // ini_set( 'display_errors', 0 );
  }

  /**
   * Runs the API process
   */
  public function processRequest() {
    $uri = preg_replace('/^[\s\/]+|[\s\/]+$/', '', parse_url($_REQUEST['path'], PHP_URL_PATH));
    $this->uri = explode('/', $uri);
    $this->count_uri = count($this->uri);
    $this->method = $_SERVER['REQUEST_METHOD'];

    $this->validateRoute($uri);

    // Authorization processes
    if ($this->count_uri > 0 && $this->uri[0] === 'auth') {
      $this->processAuth();
    }
    // CRUD processes
    else {
      $func = 'process'.$this->method;
      $this->$func();
    }
  }

  /**
   * Validates the API endpoint's route and saves its data
   * @param string $uri
   */
  private function validateRoute($uri) {
    require_once ROOT.'/config/routes.php';

    $this->route = null;
    foreach ($routes as $r) {
      if (preg_match('/^'.preg_replace('/\//', '\/', $r['url']).'$/i', $uri)) {
        $this->route = (object) $r;
        break;
      }
    }

    if (!$this->route) {
      throw new \Exception("'$uri' is an invalid endpoint");
    }

    if (isset($this->route->options) && is_array($this->route->options)) {
      $this->route->options = (object) array_merge(self::DEF_ROUTE_OPTIONS, $this->route->options);
    } else {
      $this->route->options = new stdClass();
    }

    if (!in_array($this->method, $this->route->methods)) {
      throw new \Exception("'{$this->method}' is not allowed on '$uri' endpoint");
    }

    if ($this->route->options->required_role) {
      Auth::checkToken($this->route->options->required_role);
    }
  }

  /**
   * Runs an authorization process
   */
  private function processAuth() {
    if (empty($this->uri[1])) {
      throw new \Exception('missing authorization process');
    } elseif (!method_exists('Auth', $this->uri[1])) {
      throw new \Exception("'{$this->uri[1]}' is an invalid authorization process");
    }

    $func = $this->uri[1];
    $this->sendOk(Auth::{$func}($this->getBody()));
  }

  /**
   * Runs a GET method's process
   */
  private function processGET() {
    // Options
    $url_params = $_REQUEST;
    unset($url_params['path']);
    $options = [];
    foreach (API::SPEC_URL_PARAMS as $param => $type) {
      $key = '_'.$param;

      if (isset($url_params[$key])) {
        if ($url_params[$key]) {
          switch ($type) {
            case 'split':
              $options[$param] = explode(',', $url_params[$key]); 
              break;
            case 'array':
              $options[$param] = is_array($url_params[$key]) ? $url_params[$key] : [ $url_params[$key] ]; 
            case 'int':
              $options[$param] = intval($url_params[$key]); 
              if (!$options[$param]) {
                unset($options[$param]);
              }
              break;
            default:
              $options[$param] = $url_params[$key]; 
              break;
          }
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

    if ($this->route->options->user_id_col) {
      $options['filters'][ $this->route->options->user_id_col ] = Auth::$user_id;
    }

    // Get and send data
    if ($this->count_uri === 1) {
      $this->sendOk(DB::get($this->uri[0], 0, $options));
    } else if ($this->count_uri === 2) {
      $this->sendOk(DB::get($this->uri[0], $this->uri[1], $options));
    }
  }

  /**
   * Runs a POST method's process
   */
  private function processPOST() {
    if ($this->count_uri !== 1) {
      throw new \Exception('element is required');
    }

    $data = $this->getBody();

    // Add user id
    if ($this->route->options->user_id_col) {
      $data[$this->route->options->user_id_col] = Auth::$user_id;
    }

    $this->sendOk(DB::insert($this->uri[0], $data));
  }

  /**
   * Runs a PUT method's process
   * @throws \Exception
   */
  private function processPUT() {
    if ($this->count_uri !== 2) {
      throw new \Exception('element and id is required');
    }

    $this->validateUserIdOfElement();

    $this->sendOk(DB::update($this->uri[0], $this->uri[1], $this->getBody()));
  }

  /**
   * Runs a PATCH method's process
   */
  private function processPATCH() {
    $this->processPUT();
  }

  /**
   * Runs a DELETE method's process
   */
  private function processDELETE() {
    if ($this->count_uri !== 2) {
      throw new \Exception('element and id is required');
    }

    $this->validateUserIdOfElement();

    $this->sendOk(DB::delete($this->uri[0], $this->uri[1]));
  }

  /**
   * Validates the user id on the element given in the uri; used at PUT, PATCH, DELETE requests
   */
  private function validateUserIdOfElement() {
    try {
      $options = [
        'filters' => [ $this->route->options->user_id_col => Auth::$user_id ]
      ];

      DB::get($this->uri[0], $this->uri[1], $options);
    } catch (\Exception $e) {
      if (strpos($e->getMessage(), $this->route->options->user_id_col)) {
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
  private function getBody() {
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
  public function sendOk($data) {
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
  public function sendError($message, $code = 0) {
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