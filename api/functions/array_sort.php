<?php

if (!function_exists('dsort')) {
  /**
   * Sorts an array by using the given keys and ordering (asc or desc)
   * @param array &$array
   * @param array $sort The keys which the sorting is solved (like ['id','name'])
   * @param array $order The orders for the keys (like ['asc','desc'])
   * @throws \Exception
   */
  function dsort(&$array, $sort, $order = [])
  {
    $count_sort = count($sort);

    if (!$order) {
      $order = array_fill(0, $count_sort, 'asc');
    } else {
      foreach ($order as $i => $ord) {
        if ($ord != 'asc' && $ord != 'desc') {
          throw new \Exception("dsort() error: ".($i+1).". order is invalid, value can be 'asc' or 'desc'");
        }
      }

      if (count($order) < $count_sort) {
        for ($i = 0; $i < $count_sort; ++$i) {
          $order[] = 'asc';
        }
      }
    }

    $helper_func = function($item1, $item2) use ($sort, $order, $count_sort) {
      $ret = 0;
      $i = 0;
      while ($ret == 0 && $i < $count_sort) {
        if ($item1[ $sort[$i] ] < $item2[ $sort[$i] ]) {
          $ret = $order[$i] == 'asc' ? -1 : 1;
        } else if ($item1[ $sort[$i] ] > $item2[ $sort[$i] ]) {
          $ret = $order[$i] == 'asc' ? 1 : -1;
        }

        ++$i;
      }

      return $ret;
    };

    usort($array, $helper_func);
  }
}