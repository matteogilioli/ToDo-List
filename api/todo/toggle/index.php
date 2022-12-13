<?php

// Include il file database.php per gestire la connessione al database
require '../database.php';

// Verifica se la connessione al database è stata stabilita con successo
if (!$GLOBALS['db_connected'])
  die('Errore di connessione al database');
  
// Controllo se è stata effettuata una richiesta POST per cambiare lo stato di un todo
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  if (!isset($_POST["id"]) || !is_numeric($_POST["id"]))
    die('Errore: id non valido');

  if (!isset($_POST["done"]))
    die('Errore: done non valido');

  $done = $_POST["done"] === "true" ? 1 : 0;

  // Modifico il todo tramite la procedura SQL toggle_todo
  $query = "CALL toggle_todo(?, ?)";
  $stmt = $db->prepare($query);
  $stmt->bind_param('ii', $_POST['id'], $done);
  $stmt->execute();
  $stmt->close();
}

$db->close();
