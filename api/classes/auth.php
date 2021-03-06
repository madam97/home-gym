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
    try {
      $username = isset($data['username']) ? trim($data['username']) : '';
      $password = isset($data['password']) ? trim($data['password']) : '';
  
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
  
      return self::getUserDataAndTokens($user);
    } catch (\Exception $e) {
      throw new \Exception($e->getMessage(), 401);
    }
  }

  /**
   * Destroys the refresh token
   * @param array $data
   */
  public static function logout($data) {
    try {
      $refresh_token = isset($data['refreshToken']) ? trim($data['refreshToken']) : '';
  
      if (!$refresh_token) {
        throw new \Exception('missing refresh token');
      }
  
      // Gets user's data from database
      $user = DB::get('users', 0, [
        'filters' => ['refreshToken' => $refresh_token],
        'limit_one' => true
      ]);
  
      if ($user) {
        DB::update('users', $user['id'], ['refreshToken' => null]);
      }

    } catch (\Exception $e) {
      throw new \Exception($e->getMessage(), 401);
    }
  }

  /**
   * Registers a new user
   */
  public static function register($data) {
    try {
      if (!isset($data['username']) || !isset($data['password']) || !isset($data['password2']) || $data['password'] !== $data['password2']) {
        throw new \Exception('missing data for registration');
      }

      $saved_user = DB::get('users', 0, [
        'filters' => ['username' => trim($data['username']) ],
        'limit_one' => true
      ]);

      if ($saved_user) {
        throw new \Exception('username is used');
      }

      $user = [
        'username' => trim($data['username']),
        'password' => password_hash(trim($data['password']), PASSWORD_DEFAULT),
        'refreshToken' => null,
        'role' => 'user'
      ];

      DB::insert('users', $user);

    } catch (\Exception $e) {
      throw new \Exception($e->getMessage(), 401);
    }
  }

  /**
   * Refreshes the logged user's access token 
   * @param array $data The login data: username, password
   * @return array
   */
  public static function refresh($data) {
    try {
      $refresh_token = isset($data['refreshToken']) ? trim($data['refreshToken']) : '';
  
      if (!$refresh_token) {
        throw new \Exception('missing refresh token');
      }
  
      // Gets user's data from database
      $user = DB::get('users', 0, [
        'filters' => ['refreshToken' => $refresh_token],
        'limit_one' => true
      ]);
  
      if (!$user) {
        throw new \Exception('invalid refresh token');
      }
  
      return self::getUserDataAndTokens($user);
    } catch (\Exception $e) {
      throw new \Exception($e->getMessage(), 401);
    }
  }

  /**
   * Checks if the JWT token is in the header, verifies the existence of the user and their role
   * @param string $role
   */
  public static function checkToken($role = null) {
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
  
      if ($data->iss !== getenv('URL_ROOT') || $data->nbf > $now->getTimestamp() || $data->exp < $now->getTimestamp()) {
        throw new \Exception('unauthorized', 401);
      }

      $user = DB::get('users', 0, [
        'filters' => ['username' => $data->username],
        'limit_one' => true
      ]);

      // Verify the user's role
      if ($role && $role !== ROLE_USER && $user['role'] !== $role) {
        throw new \Exception('user do not have '.$role.' role');
      }

      self::$user_id = $user['id'];
    } catch (\Exception $e) {
      $code = $e->getCode();
      throw new \Exception('authorization error: '.$e->getMessage(), $code ? $code : 401);
    }
  }

  /**
   * Returns the given user's data and access tokens
   * @param array $user
   * @return array
   */
  private static function getUserDataAndTokens($user) {
    $now = new \DateTimeImmutable();
  
    $data = [
      'iat' => $now->getTimestamp(),
      'iss' => getenv('URL_ROOT'),
      'nbf' => $now->getTimestamp(),
      'exp' => $now->modify(AUTH_ACCESS_TOKEN_LIFE)->getTimestamp(),
      'username' => $user['username']
    ];
    $access_token = \Firebase\JWT\JWT::encode($data, AUTH_SECRET_KEY, 'HS512');

    $data['exp'] = $now->modify(AUTH_REFRESH_TOKEN_LIFE)->getTimestamp();
    $refresh_token = \Firebase\JWT\JWT::encode($data, AUTH_SECRET_KEY, 'HS512');

    DB::update('users', $user['id'], ['refreshToken' => $refresh_token]);

    return [
      'id' => $user['id'],
      'username' => $user['username'],
      'role' => $user['role'],
      'accessToken' => $access_token,
      'refreshToken' => $refresh_token
    ];
  }

}