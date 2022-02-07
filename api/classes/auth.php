<?php

class Auth {

  /** @var integer The logged in user's id */
  public static $user_id;

  /**
   * Logins the user and returns their data
   * @param array $data The login data: username, password
   * @return array
   */
  public static function login($data) {
    $username = trim(isset($data['username']) ? $data['username'] : '');
    $password = trim(isset($data['password']) ? $data['password'] : '');

    if (!$username || !$password) {
      throw new \Exception('missing username or password');
    }

    // Gets user's data from database
    $user = DB::get('users', 0, [
      'filters' => ['username' => $username],
      'limit_one' => true
    ]);

    if (!$user || !password_verify($password, $user['password'])) {
      throw new \Exception('invalid username or password');
    }

    // Generate JWT token
    $now = new \DateTimeImmutable();
    $expire = $now->modify('+30 minutes')->getTimestamp();

    $data = [
      'iat' => $now->getTimestamp(),
      'iss' => SERVER_NAME,
      'nbf' => $now->getTimestamp(),
      'exp' => $expire,
      'user_id' => $user['id']
    ];
    $access_token = \Firebase\JWT\JWT::encode($data, AUTH_SECRET_KEY, 'HS512');

    return [
      'username' => $username,
      'accessToken' => $access_token
    ];
  }

  /**
   * Checks the JWT token in the header and its the data if there are no errors
   */
  public static function checkToken() {
    try {
      $headers = getallheaders();

      $auth_header = null;
      foreach ($headers as $name => $value) {
        if (strtolower($name) === 'authorization') {
          $auth_header = $value;
        }
      }

      if (!$auth_header) {
        throw new \Exception('missing authorization header', 403);
      } elseif (!preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
        throw new \Exception('was no able to extract access token from header', 403);
      }
  
      $access_token = $matches[1];
      $data = \Firebase\JWT\JWT::decode($access_token, new \Firebase\JWT\Key(AUTH_SECRET_KEY, 'HS512'));
      $now = new DateTimeImmutable();
  
      if ($data->iss !== SERVER_NAME || $data->nbf > $now->getTimestamp() || $data->exp < $now->getTimestamp()) {
        throw new \Exception('unauthorized', 403);
      }

      self::$user_id = $data->user_id;
    } catch (\Exception $e) {
      $code = $e->getCode();
      throw new \Exception('authorization error: '.$e->getMessage(), $code ? $code : 403);
    }
  }

}