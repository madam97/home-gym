<?php

class DB {
  /** @var array $data */
  static $data = [];

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

  /**
   * Returs the data from the given table
   * @param string $table
   * @param int $id
   * @param array $options
   */
  public static function get($table, $id = 0, $options = []) {
    // Returns every data
    if ($table === '' || $table === 'db') {
      $ret = self::$data;
    }
    // Returns every item in the table
    else if ($id <= 0) {
      self::checkTable($table);
      $ret = self::$data[$table];

      // Filter
      if (!empty($options['filter'])) {
        foreach ($ret as $i => $row) {
          $ok = true;
          foreach ($options['filter'] as $col => $value) {
            if ($row[$col] != $value) {
              $ok = fals;
              break;
            }
          }

          if (!$ok) {
            unset($ret[$i]);
          }
        }
      }

      // Order
      if (!empty($options['sort'])) {
        foreach ($options['sort'] as $col) {
          self::checkCol($table, $col);
        }

        dsort($ret, $options['sort'], isset($options['order']) ? $options['order'] : []);
      }

      // Get childrens - expand param
      if (!empty($options['expand'])) {
        foreach ($options['expand'] as $expand) {
          $expand_table = self::checkTable($expand, true);
          $expand_col_id = $expand.'Id';
          self::checkCol($table, $expand_col_id);

          foreach ($ret as &$row) {
            $row[$expand] = self::get($expand_table, $row[$expand_col_id]);
          }
        }
      }
    }
    // Returns an item in the table
    else {
      self::checkTable($table);

      $i = self::checkId($table, $id);
      $ret = self::$data[$table][$i];

      // Get childrens - expand param
      if (!empty($options['expand'])) {
        foreach ($options['expand'] as $expand) {
          $expand_table = self::checkTable($expand, true);
          $expand_col_id = $expand.'Id';
          self::checkCol($table, $expand_col_id);

          $ret[$expand] = self::get($expand_table, $ret[$expand_col_id]);
        }
      }
    }

    return $ret;
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
    $saved_data = DB::get($table, $id);

    // Remove unnecessary data
    $data = array_merge($saved_data, array_intersect_key($data, $saved_data));
    $data['id'] = $saved_data['id'];

    // Check if given children are valid
    foreach ($data as $col => $value) {
      if (preg_match('/Id$/', $col)) {
        self::checkId(self::checkTable(preg_replace('/Id$/', '', $col), true), $value);
      }
    }

    // Update data
    $i = self::checkId($table, $id);
    self::$data[$table][$i] = $data;

    self::save();

    return $data;
  }

  /**
   * Checks if the given table is exists, if not, throws an error
   * @param string $table
   * @param boolean $check_plural If true, it will checks the given table's plural version (like post -> posts)
   * @throws \Exception
   */
  private static function checkTable($table, $check_plural = false) {
    if ($check_plural) {
      $regex = '/'.$table.'(s$|es$)/';
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
   * Checks if the given column is in the table, if not, throws an error
   * @param string $table
   * @param string $col
   * @throws \Exception
   */
  private static function checkCol($table, $col) {
    $row = array_shift(array_values(self::$data[$table]));

    if (!isset($row[$col])) {
      throw new \Exception("'$col' column is missing from '$table'");
    }
  }

  /**
   * Checks if the given id is used in the table, if not, throws an error, otherwise gives back the element's index in the table's array
   * @param string $table
   * @param int $id
   * @return int
   * @throws \Exception
   */
  private static function checkId($table, $id) {
    $ret = null;

    foreach (self::$data[$table] as $i => $row) {
      if ($row['id'] == $id) {
        $ret = $i;
        break;
      }
    }

    if (is_null($ret)) {
      throw new \Exception("'$id' id is not in '$table'");
    }

    return $ret;
  }
}