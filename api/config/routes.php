<?php

$routes = [
  // Auth
  [
    'methods' => ['POST'], 
    'url' => 'auth/(login|logout|register|refresh)'
  ],

  // Workouts
  [
    'methods' => ['GET','POST'], 
    'url' => 'workouts',
    'options' => [
      'user_login_required' => true,
      'user_id_col' => 'userId'
    ]
  ],
  [
    'methods' => ['GET','PUT','PATCH','DELETE'], 
    'url' => 'workouts/[0-9]+',
    'options' => [
      'user_login_required' => true,
      'user_id_col' => 'userId'
    ]
  ],

  // Excercise
  [
    'methods' => ['GET'], 
    'url' => 'excercises'
  ],

  // Excercise types
  [
    'methods' => ['GET'], 
    'url' => 'excerciseTypes'
  ],

  // Weight types
  [
    'methods' => ['GET'], 
    'url' => 'weightTypes'
  ],
];