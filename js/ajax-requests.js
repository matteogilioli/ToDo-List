$.ajaxSetup({ cache: false });

// Funzione per aggiungere un todo al database
export function addTodo(parent_id, description) {
  // Crea un oggetto per il todo
  var data = {
    parent_id: parent_id, // Id del todo padre
    description: description // Descrizione del todo
  };

  // Manda una richiesta AJAX al server per aggiungere il todo
  $.post('/api/todo/add/', data, () => {
    // Quando il todo è stato aggiunto, ricarica la lista dei todo, considerando la ricerca
    displayTodo($('input[type=search]').val());
  });
}

// Funzione per eliminare un todo in base all'id
export function deleteTodo(id) {
  // Crea un oggetto che contiene l'ID del todo da eliminare
  var data = {
    id: id
  };

  // Invia una richiesta AJAX POST al server per eliminare il todo
  $.post('/api/todo/delete/', data, () => {
    // Quando il todo è stato eliminato, ricarica la lista dei todo, considerando la ricerca
    displayTodo($('input[type=search]').val());
  });
}

// Funzione per riordinare i todo, aggiornando la posizione di ogni todo
export function moveTodo(todos) {
  // Crea un oggetto per il todo
  var data = {
    todos: todos, // Array con gli id dei todo e la nuova posizione
  };

  // Manda una richiesta AJAX al server per cambiare la posizione di tutti i todo
  $.post('/api/todo/move/', data, () => { /* Non serve ricaricare la lista */ });
}

// Funzione per modificare un todo nel database
export function editTodo(id, description, expiration_date) {
  // Crea un oggetto per il todo
  var data = {
    id: id, // Id del todo da modificare
    description: description, // Descrizione del todo
    expiration_date: expiration_date // Data di scadenza del todo
  };

  // Manda una richiesta AJAX al server per modificare il todo
  $.post('/api/todo/edit/', data, () => {
    // Quando il todo è stato modificato, ricarica la lista dei todo, considerando la ricerca
    displayTodo($('input[type=search]').val());
  });
}

// Funzione per modificare lo stato di completezza di un todo nel database
export function toggleTodo(id, done) {
  // Crea un oggetto per il todo
  var data = {
    id: id, // Id del todo da modificare
    done: done // Completamento del todo
  };

  // Manda una richiesta AJAX al server per modificare il todo
  $.post('/api/todo/toggle/', data, () => {
    // Quando il todo è stato modificato, ricarica la lista dei todo, considerando la ricerca
    displayTodo($('input[type=search]').val());
  });
}

// Funzione per ricerca un todo nel database
export function displayTodo(search) {
  // Crea un oggetto per il todo
  var data = {
    search: search, // Testo da cercare
  };

  // Manda una richiesta AJAX al server per modificare il todo
  $.post('/api/todo/search/', data, data => {
    // Mostra la lista dei todo ottenuti dalla ricerca
    display(data);
  });
}

// Stampo la lista dei todo contenuti nell'array "data"
function display(data) {
  // Resetto la lista dei todo
  $("#todo-list").html("");
  // Se la risposta del server è valida e contiene l'array di todo
  if (data && Array.isArray(data)) {

    data.forEach(todo => {
      // Verifico che l'oggetto todo abbia le proprietà "id", "description" e "done" valide
      if (todo && todo.id && todo.description && (todo.done >= 0 && todo.done <= 2)) {
        let done = todo.done === 2 ? false : todo.done;
        let hiddenDate = done ? "disabled" : "name='datepicker'";
        let checked = done ? "checked" : "";
        let scadenza = "";

        if (todo.expiration_date != null) {
          let today = new Date();
          today.setHours(0, 0, 0, 0);
          var date = new Date(todo.expiration_date).getTime();
          if (date < today)
            scadenza = `<span class="material-icons fs-5 me-1" style="color: orange">warning</span><span style="color: orange">Scaduto!</span>`
        }

        let html = 
        `<input class="form-check-input flex-shrink-0 fs-5 me-3 done" type="checkbox" ` + checked + `/>
        <span class="form-checked-content pt-1">
          <strong class="editable" contenteditable="` + !done + `">` + todo.description + `</strong>
          <small class="text-muted mt-1 mb-1 d-flex align-items-center">
            <span class="material-icons fs-5 me-1">access_alarm</span>
            <input class="date" style="width:80px" type="text" ` + hiddenDate + ` placeholder="Scadenza" />
            ` + scadenza + `
          </small>
        </span>
        <i class="material-icons ms-auto align-self-center" draggable="true">drag_indicator</i>
        <span class="material-icons align-self-center text-danger delete">delete</span>`;

        if (todo.parent_id == null) {
          html += "<span class='material-icons align-self-center text-success add'>add</span>";
          html = "<div class='d-flex px-2 py-2'>" + html + "</div>"
          html += "<ul class='inner-sortable list-unstyled'></ul>";
          html = "<li id='" + todo.id + "' data-parent-id='" + todo.parent_id + "' data-done='" + todo.done + "'class='bg-white'>" + html + " </li>";
          $('#todo-list').append(html);
          // Imposto l'attributo indeterminate se il todo è in stato indeterminato
          $($(`#${todo.id}`).find(".done")[0]).prop("indeterminate", todo.done === 2);
        } else {
          html = "<img src='img/child.png' width='40' height='60'>" + html;
          html = "<div class='d-flex px-2'>" + html + "</div>";
          html = "<li id='" + todo.id + "' data-parent-id='" + todo.parent_id + "' data-done='" + todo.done + "'class='bg-white'>" + html + " </li>";
          $(`#${todo.parent_id} .inner-sortable`).append(html);
        }

        // Aggiungo il datepicker
        var input = $(`#${todo.id} .date`)[0];
        var datepicker = new Datepicker(input, {buttonClass: 'btn', autohide: true, language: 'it', todayBtn: true, maxDate: "31/12/9999", todayBtnMode: 1, clearBtn: true});
        if (todo.expiration_date != null) {
          datepicker.setDate(date);
        }
      }
    });
  
    // Nascondo i todo completati se l'utente ha selezionato l'opzione
    if ($("#hide-completed").is(":checked"))
      $("li[data-done='1']").hide();
    else
      $("li[data-done='1']").show();

    sortable('.inner-sortable', {
      placeholderClass: 'list-group-item d-flex bg-light',
      forcePlaceholderSize: true,
      handle: 'i',
      itemSerializer: (serializedItem) => {
        return {  
          id: $(serializedItem.html).attr("id"),
          position: serializedItem.index + 1,
        }
      }
    });
  }
}