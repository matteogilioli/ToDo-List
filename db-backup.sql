-- phpMyAdmin SQL Dump
-- version 5.1.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Creato il: Dic 13, 2022 alle 19:24
-- Versione del server: 5.7.37-cll-lve
-- Versione PHP: 7.4.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `todo-list`
--

DELIMITER $$
--
-- Procedure
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `delete_todo` (IN `id` INT)   BEGIN
  DELETE items
  FROM items
  WHERE items.id = id OR items.parent_id = id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `edit_todo` (IN `id` INT, IN `description` TEXT, IN `expiration_date` DATE)   BEGIN
  	UPDATE items
  	SET items.description = description,
        items.expiration_date = expiration_date
  	WHERE items.id = id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_todo` (IN `parent_id` INT, IN `description` TEXT)   BEGIN
	DECLARE max_position INT;
    IF (parent_id IS NULL) THEN
		SELECT MAX(position)+1 INTO max_position FROM items WHERE items.parent_id IS NULL;
    ELSE
    	SELECT MAX(position)+1 INTO max_position FROM items WHERE items.parent_id = parent_id;
    END IF;
    
    IF (max_position IS NULL) THEN
    	SELECT 1 INTO max_position;
    END IF;
    
  	INSERT INTO items (parent_id, description, position)
  	VALUES (parent_id, description, max_position);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `move_todo` (IN `id` INT, IN `new_position` INT)   BEGIN
	UPDATE items
    SET items.position = new_position
    WHERE items.id = id; 
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `search_todo` (IN `search` TEXT)   BEGIN
    SELECT DISTINCT *
	FROM items
	WHERE TRIM(items.description) LIKE CONCAT('%', search, '%')
	OR items.id IN (
  		SELECT DISTINCT parent_id
  		FROM items
  		WHERE description LIKE CONCAT('%', search, '%')
    )
	ORDER BY items.parent_id, items.position ASC;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `toggle_todo` (IN `id` INT, IN `done` TINYINT)   BEGIN
    -- Aggiorna l'elemento corrispondente
  	UPDATE items
  	SET items.done = done,
    	items.done_datetime = CURRENT_TIMESTAMP
  	WHERE items.id = id;
    
    SELECT parent_id FROM items WHERE items.id = id INTO @parent_id;
    
    -- Se è un figlio
    IF @parent_id IS NOT NULL THEN
    	SELECT COUNT(*) FROM items WHERE items.parent_id = @parent_id AND items.done = 1 INTO @done_count;
    	SELECT COUNT(*) FROM items WHERE items.parent_id = @parent_id INTO @total_count;
 		
        -- Se il todo padre ha tutti i figli completati, imposta lo stato a completo
        IF @done_count = @total_count THEN
            UPDATE items SET items.done = 1 WHERE items.id = @parent_id;
        -- Se il todo padre ha alcuni figli completati, imposta lo stato a indeterminato
        ELSEIF @done_count > 0 THEN
            UPDATE items SET items.done = 2 WHERE items.id = @parent_id;
        -- Altrimenti imposta lo stato a non completato
        ELSE
            UPDATE items SET items.done = 0 WHERE items.id = @parent_id;
        END IF;
   ELSE
       -- Aggiorno i figli
    	UPDATE items
   		SET items.done = done
    	WHERE items.parent_id = id;
   END IF;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Struttura della tabella `items`
--

CREATE TABLE `items` (
  `id` int(6) UNSIGNED NOT NULL,
  `parent_id` int(6) UNSIGNED DEFAULT NULL,
  `position` int(6) DEFAULT NULL,
  `done` tinyint(1) NOT NULL DEFAULT '0',
  `description` text NOT NULL,
  `done_datetime` datetime DEFAULT NULL,
  `expiration_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `items`
--

INSERT INTO `items` (`id`, `parent_id`, `position`, `done`, `description`, `done_datetime`, `expiration_date`) VALUES
(109, NULL, 4, 0, 'Andare in lavanderia', '2022-12-13 19:23:56', '2022-12-14'),
(162, NULL, 2, 0, 'Pulire casa', '2022-12-13 19:00:07', '2022-12-07'),
(167, NULL, 1, 0, 'Preparare lo zaino', '2022-12-13 19:15:05', '2023-01-01'),
(175, 167, 1, 0, 'Occhiali da sole', '2022-12-13 19:15:04', '2022-12-19'),
(176, 167, 2, 0, 'Crema solare', '2022-12-13 17:59:33', '2022-12-12'),
(215, NULL, 5, 0, 'Fare la spesa', NULL, NULL),
(217, 215, 2, 0, 'Insalata', '2022-12-13 19:23:54', '2022-12-14'),
(218, 215, 3, 0, 'Pomodori', '2022-12-13 19:23:53', NULL),
(219, 215, 4, 0, 'Hamburger', '2022-12-13 19:23:53', NULL);

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`);
ALTER TABLE `items` ADD FULLTEXT KEY `description_idx` (`description`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `items`
--
ALTER TABLE `items`
  MODIFY `id` int(6) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=220;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
