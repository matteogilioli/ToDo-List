<?php

// Include il file database.php per gestire la connessione al database
require '../database.php';

// Verifica se la connessione al database è stata stabilita con successo
if (!$GLOBALS['db_connected'])
  die('Errore di connessione al database');
  
// Controllo se è stata effettuata una richiesta POST per eliminare un todo
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  if (!isset($_POST["id"]) || !is_numeric($_POST["id"]))
      die('Errore: id non valido');

  // Elimina il todo tramite la procedura SQL delete_todo
  $query = "CALL delete_todo(?)";
  $stmt = $db->prepare($query);
  $stmt->bind_param('i', $_POST['id']);
  $stmt->execute();
  $stmt->close();
} 

$db->close();
