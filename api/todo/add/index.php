<?php

// Include il file database.php per gestire la connessione al database
require '../database.php';

// Verifica se la connessione al database è stata stabilita con successo
if (!$GLOBALS['db_connected'])
  die('Errore di connessione al database');
  
// Controllo se è stata effettuata una richiesta POST per aggiungere un todo
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  if (!isset($_POST["description"]) || empty($_POST["description"]))
    die('Errore: descrizione non valida');

  if (!isset($_POST["parent_id"]))
    die('Errore: parent_id non valido');

  // Aggiorno il valore di parent_id a null se non è stato specificato
  $parent_id = is_numeric($_POST["parent_id"]) ? $_POST["parent_id"] : null;

  // Aggiungo il todo tramite la procedura SQL insert_todo
  $query = "CALL insert_todo(?, ?)";
  $stmt = $db->prepare($query);
  $stmt->bind_param('is', $parent_id, $_POST['description']);
  $stmt->execute();
  $stmt->close();
}

$db->close();
