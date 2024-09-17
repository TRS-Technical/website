// Initialize Firebase (use the same configuration as in index.js)
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
  
  const auth = firebase.auth();
  const db = firebase.firestore();
  
  // Login form submission
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        console.log('Admin logged in:', userCredential.user);
        document.querySelector('.admin-container').style.display = 'none';
        document.getElementById('eventManagement').style.display = 'block';
        loadEvents();
      })
      .catch((error) => {
        console.error('Login error:', error);
        alert('Login failed. Please check your credentials.');
      });
  });
  
  // Add event form submission
  document.getElementById('addEventForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const eventName = document.getElementById('eventName').value;
    const eventDate = document.getElementById('eventDate').value;
    const eventTime = document.getElementById('eventTime').value;
    const eventVenue = document.getElementById('eventVenue').value;
    const eventDescription = document.getElementById('eventDescription').value;
  
    const event = {
      name: eventName,
      date: eventDate,
      time: eventTime,
      venue: eventVenue,
      description: eventDescription,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const today = new Date().toISOString().split('T')[0];
    const subcollectionName = eventDate >= today ? 'currentEvents' : 'pastEvents';
  
    db.collection('events').doc('eventsList').collection(subcollectionName).doc(eventName).set(event)
    .then(() => {
      console.log('Event added successfully');
      document.getElementById('addEventForm').reset();
      loadEvents();
    })
    .catch((error) => {
      console.error('Error adding event:', error);
    });
  });
  
  // Load events from Firestore
  function loadEvents() {
    const eventList = document.getElementById('eventList');
    eventList.innerHTML = '';
  
    // Load current events
    db.collection('events').doc('eventsList').collection('currentEvents').get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const event = doc.data();
          addEventToList(event, 'Current');
        });
      })
      .catch((error) => {
        console.error('Error loading current events:', error);
      });

    // Load past events
    db.collection('events').doc('eventsList').collection('pastEvents').get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const event = doc.data();
          addEventToList(event, 'Past');
        });
      })
      .catch((error) => {
        console.error('Error loading past events:', error);
      });
  }

  function addEventToList(event, type) {
    const eventList = document.getElementById('eventList');
    const eventElement = document.createElement('div');
    eventElement.innerHTML = `
      <h3>${event.name} (${type})</h3>
      <p>Date: ${event.date}</p>
      <p>Time: ${event.time}</p>
      <p>Venue: ${event.venue}</p>
      <p>${event.description}</p>
    `;
    eventList.appendChild(eventElement);
  }
  
  // Check auth state
  auth.onAuthStateChanged((user) => {
    if (user) {
      document.querySelector('.admin-container').style.display = 'none';
      document.getElementById('eventManagement').style.display = 'block';
      loadEvents();
    } else {
      document.querySelector('.admin-container').style.display = 'block';
      document.getElementById('eventManagement').style.display = 'none';
    }
  });