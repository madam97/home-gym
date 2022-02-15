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
      'required_role' => ROLE_USER,
      'user_id_col' => 'userId'
    ]
  ],
  [
    'methods' => ['GET','PUT','PATCH','DELETE'], 
    'url' => 'workouts/[0-9]+',
    'options' => [
      'required_role' => ROLE_USER,
      'user_id_col' => 'userId'
    ]
  ],

  // Excercise
  [
    'methods' => ['GET'], 
    'url' => 'excercises'
  ],
  [
    'methods' => ['GET','POST','PUT','PATCH','DELETE'], 
    'url' => 'excercises(/[0-9]+)?',
    'options' => [
      //'required_role' => ROLE_ADMIN
    ]
  ],

  // Excercise types
  [
    'methods' => ['GET'], 
    'url' => 'excerciseTypes'
  ],
  [
    'methods' => ['GET','POST','PUT','PATCH','DELETE'], 
    'url' => 'excerciseTypes(/[0-9]+)?',
    'options' => [
      // 'required_role' => ROLE_ADMIN
    ]
  ],

  // Weight types
  [
    'methods' => ['GET'], 
    'url' => 'weightTypes'
  ],
  [
    'methods' => ['GET','POST','PUT','PATCH','DELETE'], 
    'url' => 'weightTypes(/[0-9]+)?',
    'options' => [
      // 'required_role' => ROLE_ADMIN
    ]
  ],
];