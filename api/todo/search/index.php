<?php

// Include il file database.php per gestire la connessione al database
require '../database.php';

// Verifica se la connessione al database è stata stabilita con successo
if (!$GLOBALS['db_connected'])
  die('Errore di connessione al database');

// Controllo se è stata effettuata una richiesta POST per ricerca un todo
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  if (!isset($_POST["search"]))
    die('Errore: checkbox non valida');
    
  // Ricerco il todo tramite la procedura SQL search_todo
  $query = "CALL search_todo(?)";
  $stmt = $db->prepare($query);
  $stmt->bind_param('s', $_POST['search']);
  $stmt->execute();
  $result = $stmt->get_result();
  $todo = [];
  while ($row = $result->fetch_assoc())
    $todo[] = $row;
  $stmt->close();
  // Restituisce la lista dei todo in formato JSON
  header('Content-Type: application/json');
  echo json_encode($todo);
}

$db->close();
