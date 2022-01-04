import addFormTemplate from '../templates/add-form-template.hbs';
import deleteFormTemplate from '../templates/delete-form-template.hbs';
import editFormTemplate from '../templates/edit-form-template.hbs';
import noteItemTemplate from '../templates/note-item-template.hbs';
import * as basicLightbox from 'basiclightbox';
import 'basiclightbox/dist/basicLightbox.min.css';
import randomColor from 'randomcolor';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { v4 as uuidv4 } from 'uuid';

const { listNotes, addNewNoteBtn, sectionValue } = {
  listNotes: document.querySelector('.notes'),
  addNewNoteBtn: document.querySelector('.header__button'),
  sectionValue: document.querySelector('.section__value'),
};

let notes = [];

function saveDataLS() {
  localStorage.setItem('list-of-notes', JSON.stringify(notes));
}

function loadDataLS() {
  try {
    notes = JSON.parse(localStorage.getItem('list-of-notes'));
  } catch (error) {
    Notify.failure('Unable to load data from local storage.');
  }
}

function renderMarkup() {
  if (notes === null) {
    notes = [];
    return;
  }
  const markup = notes.map(note => noteItemTemplate(note));
  listNotes.innerHTML = '';
  listNotes.insertAdjacentHTML('beforeend', markup.join(''));
}

function showQuanityNotes() {
  let quanityNotes = notes.length;
  sectionValue.textContent = quanityNotes;
}

loadDataLS();
renderMarkup();
showQuanityNotes();

const addModal = basicLightbox.create(addFormTemplate());
addNewNoteBtn.addEventListener('click', () => addModal.show());

const newNoteForm = addModal.element().querySelector('.add');
newNoteForm.addEventListener('submit', onSubmitAddForm);

function onSubmitAddForm(e) {
  e.preventDefault();

  const color = randomColor();
  const id = uuidv4();
  const randomNumber = Math.floor(Math.random() * 20);

  let valueForm = {
    title: e.target.title.value,
    id: id,
    color: color,
    imageURL: '',
    text: e.target.text.value,
    author: e.target.author.value,
    date: e.target.date.value,
  };

  fetchImage(valueForm.title)
    .then(response => response.json())
    .then(data => {
      const images = data.hits;
      const imageURL = images[randomNumber || 1].largeImageURL;
      valueForm.imageURL = imageURL;
      saveDataLS();
      renderMarkup();
    })
    .catch(error => Notify.failure('Unable to complete the request to the server.'));

  notes.push(valueForm);
  saveDataLS();
  renderMarkup();
  newNoteForm.reset();
  showQuanityNotes();
  addModal.close();
  Notify.success(`Your note "${valueForm.title.toUpperCase()}" has been successfully added.`);
}

const deleteModal = basicLightbox.create(deleteFormTemplate());
listNotes.addEventListener('click', onClickDeleteBtn);

function onClickDeleteBtn(e) {
  const deleteBtn = deleteModal.element().querySelector('[data-delete="delete"]');
  const cancelBtn = deleteModal.element().querySelector('[data-cancel="cancel"]');
  let currentID = null;

  if (e.target.classList.contains('notes__button--delete')) {
    currentID = e.target.dataset.id;
    deleteModal.show();
  }

  deleteBtn.addEventListener('click', onDeleteNote);
  function onDeleteNote() {
    const currentNote = notes.find(note => note.id === currentID);
    notes = notes.filter(note => note !== currentNote);
    saveDataLS();
    renderMarkup();
    showQuanityNotes();
    deleteModal.close();
    Notify.warning(
      `The note titled "${currentNote.title.toUpperCase()}" has been successfully deleted.`,
    );
  }

  cancelBtn.addEventListener('click', () => deleteModal.close());
  return;
}

function fetchImage(value) {
  const URL = 'https://pixabay.com/api/';
  const KEY = '11240134-58b8f655e9e0f8ae8b6e8e7de';
  const FILTER = `?key=${KEY}&q=${value}&image_type=photo&orientation=horizontal&lang=ru`;

  return fetch(`${URL}${FILTER}`);
}

listNotes.addEventListener('click', onClickEditBtn);

function onClickEditBtn(e) {
  let currentID = null;
  let currentNote = null;

  if (e.target.classList.contains('notes__button--edit')) {
    currentID = e.target.dataset.id;
    currentNote = notes.find(note => note.id === currentID);

    const editModal = basicLightbox.create(editFormTemplate(currentNote));
    editModal.show();

    const editForm = editModal.element().querySelector('.edit-form');
    editForm.addEventListener('submit', onSubmitEditForm);
    function onSubmitEditForm(e) {
      e.preventDefault();
      const modifledValueFrom = {
        ...currentNote,
        title: e.target.title.value,
        text: e.target.text.value,
        author: e.target.author.value,
        date: e.target.date.value,
      };
      notes = notes.filter(note => note !== currentNote);
      notes.push(modifledValueFrom);
      saveDataLS();
      renderMarkup();
      editForm.reset();
      editModal.close();
      Notify.info(`The note titled "${currentNote.title.toUpperCase()}" has been changed.`);
    }
  }
}

function showNotification() {
  if (notes.length === 0) {
    setTimeout(() => {
      if (!addModal.show()) {
        addModal.show();
      }
    }, 5000);
  }
}

showNotification();
