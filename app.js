// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD1SY-ZmhdF0w6wIFd8IBzHf3wgR8w1_0s",
    authDomain: "we-chat-homies.firebaseapp.com",
    projectId: "we-chat-homies",
    storageBucket: "we-chat-homies.appspot.com",
    messagingSenderId: "81684158297",
    appId: "1:81684158297:web:56d3b25488f9a6279e948",
    measurementId: "G-TMTK6MH425"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

// ==================== AUTH ====================

// Sign up
function signup(email, password) {
    auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
        alert('Signup successful!');
    })
    .catch(error => {
        alert(error.message);
    });
}

// Login
function login(email, password) {
    auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
        alert('Login successful!');
        document.getElementById('chat-page').style.display = 'block';
        document.getElementById('login-page').style.display = 'none';
    })
    .catch(error => {
        alert(error.message);
    });
}

// Logout
function logout() {
    auth.signOut()
    .then(() => {
        document.getElementById('chat-page').style.display = 'none';
        document.getElementById('login-page').style.display = 'block';
    })
    .catch(error => {
        alert(error.message);
    });
}

// Monitor user state
auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('chat-page').style.display = 'block';
        document.getElementById('login-page').style.display = 'none';
    } else {
        document.getElementById('chat-page').style.display = 'none';
        document.getElementById('login-page').style.display = 'block';
    }
});

// ==================== CHAT ====================

// Send message
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const messageText = messageInput.value.trim();
    const user = auth.currentUser;

    if (messageText && user) {
        db.ref('messages').push({
            text: messageText,
            sender: user.email,
            timestamp: Date.now()
        });
        messageInput.value = '';
    }
}

// Display messages
db.ref('messages').on('child_added', snapshot => {
    const message = snapshot.val();
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.innerHTML = `<strong>${message.sender}:</strong> ${message.text}`;
    document.getElementById('messages').appendChild(messageElement);
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
});

// ==================== IMAGE UPLOAD ====================

// Send image
function sendImage(file) {
    const user = auth.currentUser;
    if (!file || !user) return;

    const storageRef = storage.ref('images/' + file.name);
    storageRef.put(file).then(snapshot => {
        return snapshot.ref.getDownloadURL();
    }).then(url => {
        db.ref('messages').push({
            imageUrl: url,
            sender: user.email,
            timestamp: Date.now()
        });
    }).catch(error => {
        console.error(error);
    });
}

// Display images
db.ref('messages').on('child_added', snapshot => {
    const message = snapshot.val();
    const messageElement = document.createElement('div');
    messageElement.className = 'message';

    if (message.text) {
        messageElement.innerHTML = `<strong>${message.sender}:</strong> ${message.text}`;
    } else if (message.imageUrl) {
        messageElement.innerHTML = `<strong>${message.sender}:</strong> <br><img src="${message.imageUrl}" style="max-width:200px;">`;
    }

    document.getElementById('messages').appendChild(messageElement);
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
});

// ==================== EVENT LISTENERS ====================

document.getElementById('signupBtn').addEventListener('click', () => {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    signup(email, password);
});

document.getElementById('loginBtn').addEventListener('click', () => {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    login(email, password);
});

document.getElementById('logoutBtn').addEventListener('click', logout);

document.getElementById('sendBtn').addEventListener('click', sendMessage);

document.getElementById('imageInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    sendImage(file);
});
