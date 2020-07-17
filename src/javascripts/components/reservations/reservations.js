// import authData from '../../helpers/data/authData';
import moment from 'moment';
import utils from '../../helpers/utils';
import './reservations.scss';
import reservationsData from '../../helpers/data/reservationsData';

const updateAmPm = () => {
  console.error('updateAmPm called');
  const hour = $('#hour').val();
  const status = hour === '11' ? 'AM' : 'PM';
  utils.printToDom('#ampm', status);
};

const updateAmPmEvent = () => {
  $('#hour').change(updateAmPm);
};

const setSelectedIndex = (select, i) => {
  const s = select;
  s.options[i - 1].selected = true;
};

const dimCards = (shownCard) => {
  $('.reservation-card').addClass('mute-card bg-light');
  // $('.edit-reservation').addClass('hide');
  $(`#${shownCard}`).removeClass('mute-card bg-light');
  $(`#edit-btn-${shownCard}`).removeClass('btn-primary');
  $(`#edit-btn-${shownCard}`).addClass('btn-secondary');
};

const undimCards = () => {
  $('.reservation-card').removeClass('mute-card bg-light');
};

const displayReservationForm = (e) => {
  const today = moment(Date.now()).format('YYYY-MM-DD');
  const tomorrow = moment(today).add(1, 'd').format('YYYY-MM-DD');
  let existing = {
    name: '',
    partySize: 2,
    date: tomorrow,
    hour: 11,
    minutes: '00',
  };
  let formType = 'Add New';
  if (e) {
    // TODO: change color of form for editing existing res
    formType = 'Edit';
    existing = { ...e };
    existing.hour = Math.floor(existing.time / 100);
    existing.minutes = 0;
  }
  let domString = `
      <div class="row reservation-header px-3">
        <div></div>
        <h3>${formType} Reservation:</h3>
        <div class="cancel-area"><i class="far fa-2x fa-times-circle text-secondary hide" id="cancel-res-edit"></i></div>
      </div>`;
  domString += `
  <div class="container" id="reservation-form">
    <form>
      <div class="form-group row">
        <label for="name" class="col-sm-1 col-form-label">Name:</label>
        <div class="col-sm-5">
          <input type="text" class="form-control" id="name" value="${existing.name}" required>
        </div>
        <label for="date" class="col-sm-1 col-form-label">Date:</label>
        <div class="col-sm-4">
          <input type="date" min="${today}" class="form-control" id="date" value="${existing.date}" required>
        </div>
      </div>
      <div class="form-group row">
        <label for="size" class="col-sm-1 col-form-label">Party size:</label>
        <div class="col-sm-1">
          <input type="number" class="form-control" id="size" value=${existing.partySize} required" min="2" max="8">
        </div>
        <div class="col-sm-4"></div>
        <label for="time" class="col-sm-1 col-form-label">Time:</label>
        <div class="col-sm-2">
        <select id="hour" name="hour" value=${existing.hour}>
          <option value=11>11</option>
          <option value=12>12</option>
          <option value=1>1</option>
          <option value=2>2</option>
          <option value=3>3</option>
          <option value=4>4</option>
          <option value=5>5</option>
          <option value=6>6</option>
          <option value=7>7</option>
          <option value=8>8</option>
          <option value=9>9</option>
          <option value=10>10</option>
        </select>
        :
        <select id="minutes" name="minutes">
          <option value=00>00</option>
          <option value=15>15</option>
          <option value=30>30</option>
          <option value=45>45</option>
        </select>
        <span id="ampm">AM</span>
        </div>
        <div class="col-sm-3 res-form-btns">
        <button type="submit" class="btn btn-primary mx-1" id="create-reservation">Save</button>
        <button type="submit" class="btn btn-danger mx-1 hide" id="delete-reservation">Delete</button>
        </div>
      </div>
    </form>
  </div>`;
  // TODO: Add Cancel button
  utils.printToDom('#edit-reservation', domString);
  let select = existing.hour - 10;
  if (select < 0 || select > 11) { select = 0; }
  setSelectedIndex(document.getElementById('hour'), select);
  console.error('about to call updateAmPm from displayreservationForm');
  // updateAmPmEvent();
};

const displayReservations = () => new Promise((resolve, reject) => {
  let domString = `
  <div class="row mt-5 reservation-header">
    <h3>Existing Reservations:</h3>
  </div>
  <div id="results-reservations">
  `;
  reservationsData.getReservations()
    .then((reservations) => {
      reservations.forEach((reservation) => {
        const date = moment(reservation.date).format('M/D/YYYY');
        const time = moment(reservation.time, 'hhmm').format('LT');
        domString += `
        <div class="card reservation-card" id="${reservation.id}" style="width: 18rem;">
          <div class="card-header">
            ${date} at ${time}
          </div>
          <div class="card-body">
            <h5 class="card-title">${reservation.name}</h5>
            <p class="card-text">Party of ${reservation.partySize}</p>
            <a href="#" class="btn btn-primary edit-reservation" id="edit-btn-${reservation.id}" data-reservationid="${reservation.id}">Edit</a>
          </div>
        </div>`;
      });
      domString += '</div>';
      utils.printToDom('#display-reservations', domString);
      resolve();
    })
    .catch((err) => { reject(err); });
});

const reservationsPage = () => {
  undimCards();
  const domString = `
  <div class="container mt-5" id="edit-reservation">edit-reservation</div>
  <div class="container mt-5" id="display-reservations">display-reservations</div>`;
  utils.printToDom('#console', domString);
  displayReservations();
  displayReservationForm();
  updateAmPmEvent();
};

const editReservation = (e) => {
  reservationsData.getReservationById(e)
    .then((reservation) => {
      displayReservationForm(reservation);
      updateAmPm();
      updateAmPmEvent();
      $('#cancel-res-edit').removeClass('hide');
      $('#delete-reservation').removeClass('hide');
    })
    .catch((err) => console.error(err));
};

const editReservationEvent = (e) => {
  e.preventDefault();
  const reservationId = e.target.dataset.reservationid;
  editReservation(reservationId);
  dimCards(reservationId);
};

export default {
  reservationsPage, displayReservationForm, editReservationEvent, updateAmPm,
};
