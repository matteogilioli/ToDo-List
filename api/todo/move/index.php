<?php

// Include il file database.php per gestire la connessione al database
require '../database.php';

// Verifica se la connessione al database è stata stabilita con successo
if (!$GLOBALS['db_connected'])
  die('Errore di connessione al database');
  
// Controllo se è stata effettuata una richiesta POST per spostare un todo
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  if (!isset($_POST["todos"]) || is_array($_POST["todos"]))
    die('Errore: array dei todo non valido');

  // Eseguo query multiple per spostare tutti gli elementi
  foreach($_POST['todos'] as $todo) {
    $query = "CALL move_todo(?, ?);";
    $stmt = $db->prepare($query);
    $stmt->bind_param('ii', $todo['id'], $todo['position']);
    $stmt->execute();
    $stmt->close();
  }
}

$db->close();
