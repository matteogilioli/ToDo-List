<?php

require 'db_password.php';

// Crea una variabile globale per tenere traccia dello stato della connessione al database
$GLOBALS['db_connected'] = false;

// Connessione al database
$db = new mysqli($db_host, $db_username, $db_password, $db_name);

// Verifica che la connessione sia stata effettuata con successo
if ($db)
  $GLOBALS['db_connected'] = true;
