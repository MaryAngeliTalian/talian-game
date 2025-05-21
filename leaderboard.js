// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB4HYUzvEkQzAoZXLGZCpkRaxVCqo3--FY",
  authDomain: "createaccount-b8cbe.firebaseapp.com",
  projectId: "createaccount-b8cbe",
  storageBucket: "createaccount-b8cbe.appspot.com",
  messagingSenderId: "328611166777",
  appId: "1:328611166777:web:1d216243c79f3af2a76be8"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Show leaderboard
function showLeaderboard() {
  const leaderboardScreen = document.getElementById('leaderboardScreen');
  const leaderboardList = document.getElementById('leaderboardList');
  leaderboardList.innerHTML = '';

  db.collection('leaderboard')
    .orderBy('score', 'desc')
    .limit(10)
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        leaderboardList.innerHTML = '<li>No scores yet!</li>';
      } else {
        snapshot.forEach(doc => {
          const data = doc.data();
          const li = document.createElement('li');
          li.textContent = `${data.name}: ${data.score}`;
          leaderboardList.appendChild(li);
        });
      }
    })
    .catch(error => {
      console.error("Error loading leaderboard: ", error);
      leaderboardList.innerHTML = '<li>Error loading leaderboard.</li>';
    });

  leaderboardScreen.style.display = 'block';
}

// Hide leaderboard
function closeLeaderboard() {
  const leaderboardScreen = document.getElementById('leaderboardScreen');
  leaderboardScreen.style.display = 'none';
}
