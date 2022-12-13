// Importa le funzioni per gestire le richieste AJAX
import { addTodo, deleteTodo, editTodo, moveTodo, displayTodo, toggleTodo } from "./ajax-requests.js";

// Mostra l'elenco dei todo
displayTodo("");

// Rende i todo draggabili e li rende ordinabili
sortable('.sortable', {
  placeholderClass: 'list-group-item d-flex bg-light',
  forcePlaceholderSize: true,
  handle: 'i',
  itemSerializer: (serializedItem) => {
    return {
      id: $(serializedItem.html).attr("id"),
      position: serializedItem.index + 1
    }
  }
});

//  Ottieni variabili 
function getTodoData(id) {
  let todo = { id: id };
  todo.parent_id = $('#' + id).data('parent-id');
  todo.done = $($('#' + id).find(":checkbox")[0]).is(":checked");
  todo.description = $($('#' + id).find("strong")[0]).text();
  todo.expiration_date = $('#' + id).find(".date")[0].datepicker.getDate();
  return todo;
}

// ---------------------------- Gestione eventi ----------------------------

// Handler per la ricerca con tasto ricerca
$("#search").click(() => {
  $('input[type=search]').trigger('search');
});

// Handler per la ricerca ogni mezzo secondo dopo aver digitato
$('input[type=search]').on('input', function(){
  clearTimeout(this.delay);
  this.delay = setTimeout(function(){
    $(this).trigger('search');
  }.bind(this), 500);
}).on('search', function(){
  displayTodo(this.value);
});

// Handler per nascondere attività completate
$("#hide-completed").click((e) => {
  if ($("#hide-completed").is(":checked"))
    $("li[data-done='1']").hide();
  else
    $("li[data-done='1']").show();
});

// Handler per aggiungere un todo (padre)
$("#todo-form").submit((e) => {
  e.preventDefault();  
  let parent_id = null;
  let description = $("#todo-input").val();
  $("#todo-input").val("");
  if (description.trim() === "") // Se la descrizione è vuota, non aggiungo il todo
    return;
  addTodo(parent_id, description);
});

// Handler per aggiungere un todo figlio
$(document).on("click", ".add", (e) => {
  let description = "Nuovo todo";
  let parent_id = $(e.currentTarget).parent().parent().attr("id");
  addTodo(parent_id, description);
});

// Handler per eliminare un todo
$(document).on("click", ".delete", (e) => {
  let id = $(e.currentTarget).parent().parent().attr("id");
  deleteTodo(id);
});

// Handler per cambiare data
$(document).on("blur", ".date", (e) => {
  let todo = getTodoData($(e.currentTarget).parent().parent().parent().parent().attr("id"));
  editTodo(todo.id, todo.description, todo.expiration_date);
});

// Handler per cambiare data con invio
$(document).on("keypress", ".date", (e) => {
  if (e.which == 13)
    $(e.currentTarget).blur();
});

// Handler per aggiornare stato checkbox
$(document).on("click", ".done", (e) => {
  let todo = getTodoData($(e.currentTarget).parent().parent().attr("id"));
  toggleTodo(todo.id, todo.done);
});

// Handler per modificare la descrizione di un todo
$(document).on("focus", ".editable", (e) => {
  let item = e.currentTarget;
  // Quando clicco su un todo, registra in data("initialText") il contenuto di questo todo
  $(item).data("initialText", $(item).html());
}).on("blur", ".editable", (e) => {
  let item = e.currentTarget;
  // Quando esco dalla modifica del todo, se il contenuto è cambiato, aggiorno il database
  if ($(item).html().trim() && $(item).data("initialText")) {
    if ($(item).data("initialText").trim() !== $(item).html().trim()) {
      let todo = getTodoData($(item).parent().parent().parent().attr("id")); 
      editTodo(todo.id, todo.description, todo.expiration_date);
    }
  } else {
    // Se il contenuto è vuoto, ripristino il contenuto precedente
    $(item).html($(item).data("initialText"));
  }
});

// Handler per modificare l'ordine dei todo, quando la posizione viene cambiata
$(sortable('.sortable')).on('sortupdate', (e) => {
  let serialized = sortable(e.currentTarget, "serialize");
  moveTodo(serialized[0].items);
});

// Handler per modificare l'ordine dei todo figli, quando la posizione viene cambiata
$(document).on('sortupdate', '.inner-sortable', (e) => {
  let serialized = sortable(e.currentTarget, "serialize");
  moveTodo(serialized[0].items);
});
