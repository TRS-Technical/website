// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAHOkpFxiI1tDJyfPABDJEWMSpAWcvQrFU",
  authDomain: "trs-web-d7967.firebaseapp.com",
  projectId: "trs-web-d7967",
  storageBucket: "trs-web-d7967.appspot.com",
  messagingSenderId: "977642131862",
  appId: "1:977642131862:web:779daa2b7209ed08570db7",
  measurementId: "G-RML2G622KS"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

// Function to fetch and display events
function fetchEvents(eventType) {
  const eventsContent = document.getElementById('eventsContent');
  eventsContent.innerHTML = ''; // Clear existing content

  const subcollectionName = eventType === 'current' ? 'currentEvents' : 'pastEvents';

  db.collection('events').doc('eventsList').collection(subcollectionName).get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const event = doc.data();
        const eventElement = document.createElement('div');
        eventElement.className = 'event-card';
        eventElement.onclick = () => openDialog(doc.id, subcollectionName);
        eventElement.innerHTML = `
          <img src="${event.imageUrl || 'path-to-default-image.jpg'}" alt="${event.name}" class="event-image">
          <div class="event-info">
            <h3>${event.name}</h3>
            <p>Date: ${event.date}</p>
            <p>Time: ${event.time}</p>
            <p>Venue: ${event.venue}</p>
          </div>
        `;
        eventsContent.appendChild(eventElement);
      });
    })
    .catch((error) => {
      console.error("Error fetching events: ", error);
    });
}

function showCurrent() {
  fetchEvents('current');
}

function showPast() {
  fetchEvents('past');
}

function openDialog(eventId, subcollectionName) {
  const modal = document.getElementById('eventModal');
  const modalInfo = document.getElementById('modalInfo');

  db.collection('events').doc('eventsList').collection(subcollectionName).doc(eventId).get()
    .then((doc) => {
      if (doc.exists) {
        const event = doc.data();
        modalInfo.innerHTML = `
          <h2>${event.name}</h2>
          <p>Date: ${event.date}</p>
          <p>Time: ${event.time}</p>
          <p>Venue: ${event.venue}</p>
          <p>${event.description}</p>
        `;
        modal.style.display = 'block';
      } else {
        console.log("No such event!");
      }
    })
    .catch((error) => {
      console.error("Error getting event: ", error);
    });
}

function closeDialog() {
  document.getElementById('eventModal').style.display = 'none';
}

// Function to move past events
function movePastEvents() {
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

  db.collection('events').doc('eventsList').collection('currentEvents').get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const event = doc.data();
        if (event.date < today) {
          // Move to pastEvents
          db.collection('events').doc('eventsList').collection('pastEvents').doc(event.name).set(event)
            .then(() => {
              // Delete from currentEvents
              db.collection('events').doc('eventsList').collection('currentEvents').doc(event.name).delete();
            });
        }
      });
    })
    .catch((error) => {
      console.error("Error moving past events: ", error);
    });
}

// Initially show current events when the page loads and move past events
document.addEventListener('DOMContentLoaded', function() {
  movePastEvents(); // Move past events before displaying
  showCurrent();

  document.getElementById('currentBtn').addEventListener('click', showCurrent);
  document.getElementById('pastBtn').addEventListener('click', showPast);
});

// Run movePastEvents daily
setInterval(movePastEvents, 24 * 60 * 60 * 1000); // Run every 24 hours