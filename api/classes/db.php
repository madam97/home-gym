<?php

class DB {
  /** @var array DEF_GET_OPTIONS The default get function's options */
  const DEF_GET_OPTIONS = [
    'filters' => [],
    'sort' => [],
    'order' => [],
    'expand' => [],
    'limit_one' => false
  ];

  /** @var array $data */
  static $data = [];


  // DATABASE FILE METHODS

  /**
   * Loads the data from the DB json file
   */
  public static function load() {
    self::$data = json_decode(file_get_contents(DB_FILE), true);
  }

  /**
   * Saves the data into the DB json file
   */
  public static function save() {
    file_put_contents(DB_FILE, json_encode(self::$data, JSON_PRETTY_PRINT));
  }


  // DATABASE METHODS

  /**
   * Returs the data from the given table
   * @param string $table
   * @param int $id
   * @param array $options
   */
  public static function get($table, $id = 0, $options = []) {
    $options = array_merge(self::DEF_GET_OPTIONS, $options);

    // Returns every data
    if ($table === '' || $table === 'db') {
      $ret = self::$data;
    }
    // Returns every item in the table
    else if ($id <= 0) {
      self::validateTable($table);
      $ret = self::$data[$table];

      // Filter
      if ($options['filters']) {
        self::validateCols($table, array_keys($options['filters']));
        
        foreach ($ret as $i => $row) {
          $ok = true;
          foreach ($options['filters'] as $col => $value) {
            if ($row[$col] != $value) {
              $ok = false;
              break;
            }
          }

          if (!$ok) {
            unset($ret[$i]);
          }
        }
      }

      // Get childrens - expand param
      if ($options['expand']) {
        foreach ($options['expand'] as $expand) {
          $expand_table = self::validateTable($expand, true);
          $expand_col_id = $expand.'Id';
          self::validateCol($table, $expand_col_id);

          foreach ($ret as &$row) {
            $row[$expand] = self::get($expand_table, $row[$expand_col_id]);
          }
        }
      }

      // Limit 1
      if ($options['limit_one']) {
        $ret = reset($ret);
      }
      // Order
      elseif ($options['sort']) {
        foreach ($options['sort'] as $col) {
          self::validateCol($table, $col);
        }

        dsort($ret, $options['sort'], $options['order']);
      }
    }
    // Returns an item in the table
    else {
      self::validateTable($table);

      $i = self::validateId($table, $id);
      $ret = self::$data[$table][$i];

      // Filter
      if ($options['filters']) {
        self::validateCols($table, array_keys($options['filters']));
        
        foreach ($options['filters'] as $col => $value) {
          if ($ret[$col] != $value) {
            throw new \Exception("'$id' id in '$table' has invalid value in the '$col' column");
          }
        }
      }

      // Get childrens - expand param
      if ($options['expand']) {
        foreach ($options['expand'] as $expand) {
          $expand_table = self::validateTable($expand, true);
          $expand_col_id = $expand.'Id';
          self::validateCol($table, $expand_col_id);

          $ret[$expand] = self::get($expand_table, $ret[$expand_col_id]);
        }
      }
    }

    return $ret;
  }

  /**
   * Inserts the given data and returns it
   * @param string $table
   * @param array $data
   * @return array
   */
  public static function insert($table, $data) {
    // Get first element of the table
    self::validateTable($table);
    $saved_data = end(self::$data[$table]);

    if ($saved_data === false) {
      throw new \Exception("'$table' table is empty, not able to insert new data");
    }

    // Remove unnecessary data, set id, order values
    $data = array_intersect_key($data, $saved_data);
    if (empty($data['id'])) {
      $data['id'] = $saved_data['id'] + 1;
    }
    $data = array_merge($saved_data, $data);

    // Validation
    self::validateId($table, $data['id'], true);
    self::validateChildren($data);

    // Save data
    self::$data[$table][] = $data;
    self::save();

    return $data;
  }

  /**
   * Updates the given data and returns it
   * @param string $table
   * @param int $id
   * @param array $data
   * @return array
   */
  public static function update($table, $id, $data) {
    // Get saved data
    $i = self::validateId($table, $id);
    $saved_data = self::$data[$table][$i];

    // Remove unnecessary data, set id, order values
    $data = array_merge($saved_data, array_intersect_key($data, $saved_data));
    $data['id'] = $saved_data['id'];
    $data = array_merge($saved_data, $data);

    // Validation
    self::validateChildren($data);

    // Save data
    self::$data[$table][$i] = $data;
    self::save();

    return $data;
  }

  /**
   * Deletes the given element from the table and returns its data
   * @param string $table
   * @param int $id
   * @return array
   */
  public static function delete($table, $id) {
    // Get saved data
    $i = self::validateId($table, $id);
    $saved_data = self::$data[$table][$i];

    // Validation
    self::validateParent($table, $id);

    // Save data
    unset(self::$data[$table][$i]);
    self::save();

    return $saved_data;
  }



  /// VALIDATION 

  /**
   * If the given table does not exist it will throw an error
   * @param string $table
   * @param boolean $check_plural If true, it will checks the given table's plural version (like post -> posts)
   * @throws \Exception
   */
  private static function validateTable($table, $check_plural = false) {
    if ($check_plural) {
      $regex = self::getTableRegex($table);
      $tables = array_keys(self::$data);
      sort($tables);
      $found_table = null;
      foreach ($tables as $t) {
        if (preg_match($regex, $t)) {
          $found_table = $t;
          break; 
        }
      }

      if ($found_table) {
        return $found_table;
      } else {
        throw new \Exception("missing table for '$table' element");
      }
    } else if (!isset(self::$data[$table])) {
      throw new \Exception("'$table' is missing");
    }
  }

  /**
   * If the given column is not in table it will throw an error
   * @param string $table
   * @param string $col
   * @throws \Exception
   */
  private static function validateCol($table, $col) {
    self::validateCols($table, [$col]);
  }

  /**
   * If the given columns are not in table it will throw an error
   * @param string $table
   * @param array $cols
   * @throws \Exception
   */
  private static function validateCols($table, $cols) {
    if ($invalid_cols = array_diff($cols, array_keys(end(self::$data[$table])))) {
      if (count($invalid_cols) === 1) {
        throw new \Exception("'{$invalid_cols[0]}' column is missing from '$table'");
      } else {
        throw new \Exception("'".implode("', '", $invalid_cols)."' columns are missing from '$table'");
      }
    }
  }

  /**
   * If the given id is used/not used in the table it will throw an error, otherwise gives back the element's index in the table's array
   * @param string $table
   * @param int $id
   * @param boolean $error_when_exis If true, it will throw error when the id is used in the table
   * @return int
   * @throws \Exception
   */
  private static function validateId($table, $id, $error_when_used = false) {
    $ret = null;

    foreach (self::$data[$table] as $i => $row) {
      if ($row['id'] == $id) {
        $ret = $i;
        break;
      }
    }

    if (!$error_when_used && is_null($ret)) {
      throw new \Exception("'$id' id is not used in '$table'");
    } else if ($error_when_used && !is_null($ret)) {
      throw new \Exception("'$id' id is used in '$table'");
    }

    return $ret;
  }

  /**
   * If the given data has children ids and they are not used in tables it will throw an error
   * @param array $data
   * @throws \Exception
   */
  private static function validateChildren($data) {
    foreach ($data as $col => $value) {
      if ($element = self::getElementFromIdCol($col)) {
        self::validateId(self::validateTable($element, true), $value);
      }
    }
  }

  /**
   * If the given element's id is used by another element it will throw an error
   * @param string $table
   * @param int $id
   * @throws \Exception
   */
  private static function validateParent($table, $id) {
    $regex = self::getIdColRegex($table);
    $id_col_of_table = null;

    foreach (self::$data as $t => $d) {
      $row = end($d);

      // Get the id column of the table (like postId is the id column of posts table)
      if (is_null($id_col_of_table)) {
        foreach ($row as $col => $value) {
          if (preg_match($regex, $col)) {
            $id_col_of_table = $col;
            break;
          }
        }
      }

      // Check if the given id is used
      if (isset($row[$id_col_of_table])) {
        foreach ($d as $row) {
          if ($row[$id_col_of_table] == $id) {
            throw new \Exception("not able to delete '$id' from '$table' because '{$row['id']}' in '$t' is using it");
          }
        }
      }
    }
  }


  /// HELPER METHODS

  /**
   * Returns the table's regex of the given element like post -> /post(s$|es$)/
   * @param string $element
   * @return string
   */
  private static function getTableRegex($element) {
    // like reply -> replies
    if (preg_match('/y$/', $element)) {
      $element = preg_replace('/y$/', 'i', $element);
    }
    // like wife -> wifes
    else if (preg_match('/f$/', $element)) {
      $element = preg_replace('/f$/', 'v', $element);
    }

    return '/'.$element.'(s$|es$)/';
  }

  /**
   * Returns the id column's regex of the given table like posts -> /postId$/
   * @param string $table
   * @return string
   */
  private static function getIdColRegex($table) {
    // replies -> /repl(y|i|ie)Id$/ -> reply
    if (preg_match('/ies$/', $table)) {
      return '/'.preg_replace('/ies$/', '', $table).'(y|i|ie)Id$/';
    }
    // wives -> /wi(f|fe|v|ve)Id$/ -> wife
    else if (preg_match('/ves$/', $table)) {
      return '/'.preg_replace('/ves$/', '', $table).'(f|fe|v|ve)Id$/';
    }
    // bushes -> /bushe?Id$/ -> bush
    else if (preg_match('/es$/', $table)) {
      return '/'.preg_replace('/es$/', '', $table).'e?Id$/';
    }
    // posts -> /postId$/ -> post
    else {
      return '/'.preg_replace('/s$/', '', $table).'Id$/';
    }
  }

  /**
   * Returns the element name from the given id column
   * @param string $col
   * @return string|null
   */
  private static function getElementFromIdCol($col) {
    return preg_match('/Id$/', $col) ? preg_replace('/Id$/', '', $col) : null;
  }
}