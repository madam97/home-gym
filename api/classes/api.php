<?php

class API {
  /** @var array SPEC_URL_PARAMS Possible special uri parameters like _sort, _order, etc. */
  const SPEC_URL_PARAMS = [
    'expand' => 'array', 
    'embed' => 'array', 
    'sort' => 'split', 
    'order' => 'split'
  ];

  /** @var Auth $auth The authorization class */
  private $auth;

  /** @var array $uri The API endpoint's elements */
  private $uri;
  /** @var int $count_uri The count of the API endpoint's elements */
  private $count_uri;

  /**
   * Constructor. Sets the necessary headers
   */
  public function __construct() {
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json; charset=UTF-8');
    header('Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE');
    header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

    error_reporting( E_ERROR | E_COMPILE_ERROR | E_WARNING );
    // ini_set( 'display_errors', 0 );
  }

  /**
   * Runs the API process
   */
  public function processRequest() {
    $uri = parse_url($_REQUEST['path'], PHP_URL_PATH);
    $this->uri = explode('/', $uri);
    $this->count_uri = count($this->uri);

    // Authorization processes
    if ($this->count_uri > 0 && $this->uri[0] === 'auth') {
      $this->processAuth();
    }
    // CRUD processes
    else {
      // TODO $token_data = Auth::checkToken();

      $func = 'process'.$_SERVER['REQUEST_METHOD'];
      $this->$func();
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
    } elseif ($_SERVER['REQUEST_METHOD'] !== 'POST') {
      throw new \Exception("'{$this->uri[1]}' authorization process must use POST method");
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
            default:
              $options[$param] = is_array($url_params[$key]) ? $url_params[$key] : [ $url_params[$key] ]; 
              break;
          }
        }

        unset($url_params[$key]);
      }
    }

    // Filter
    if (count($url_params) > 0) {
      $options['filters'] = $url_params;
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

    $this->sendOk(DB::insert($this->uri[0], $this->getBody()));
  }

  /**
   * Runs a PUT method's process
   * @throws \Exception
   */
  private function processPUT() {
    if ($this->count_uri !== 2) {
      throw new \Exception('element and id is required');
    }

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

    $this->sendOk(DB::delete($this->uri[0], $this->uri[1]));
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