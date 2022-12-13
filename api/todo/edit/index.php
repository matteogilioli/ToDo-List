<?php

// Include il file database.php per gestire la connessione al database
require '../database.php';

// Verifica se la connessione al database è stata stabilita con successo
if (!$GLOBALS['db_connected'])
  die('Errore di connessione al database');
  
// Controllo se è stata effettuata una richiesta POST per modificare un todo
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  if (!isset($_POST["id"]) || !is_numeric($_POST["id"]))
    die('Errore: id non valido');

  if (!isset($_POST["description"]) || empty($_POST["description"]))
    die('Errore: descrizione del todo non valida');

  if (isset($_POST['expiration_date']))
    $expiration_date = date('Y-m-d', strtotime(substr($_POST['expiration_date'], 0, 15)));
  else
    $expiration_date = null;

  // Modifico il todo tramite la procedura SQL edit_todo
  $query = "CALL edit_todo(?, ?, ?)";
  $stmt = $db->prepare($query);
  $stmt->bind_param('iss', $_POST['id'], $_POST['description'], $expiration_date);
  $stmt->execute();
  $stmt->close();
}

$db->close();
