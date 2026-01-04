// main.js - Shared JavaScript for functionality simulations

// Simulate Payment (from landing)
function simulatePayment() {
  alert("Payment successful! Redirecting to dashboard...");
  window.location.href = "dashboard.html";
}

// Profile Functions (dashboard)
function updateProfilePic() {
  const file = document.getElementById('profile-upload').files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('profile-pic').src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

function saveProfile() {
  const name = document.getElementById('profile-name').value;
  const bio = document.getElementById('profile-bio').value;
  const pic = document.getElementById('profile-pic').src;

  localStorage.setItem('profileName', name);
  localStorage.setItem('profileBio', bio);
  localStorage.setItem('profilePic', pic);

  alert('Profile saved!');
}

// Load Profile on Page Load
window.addEventListener('load', function() {
  if (document.getElementById('profile-name')) {
    document.getElementById('profile-name').value = localStorage.getItem('profileName') || '';
    document.getElementById('profile-bio').value = localStorage.getItem('profileBio') || '';
    document.getElementById('profile-pic').src = localStorage.getItem('profilePic') || 'https://via.placeholder.com/150';
  }
});

// Simulate Wallet Connect
function simulateWalletConnect() {
  document.getElementById('wallet-status').innerText = "Wallet: Connected (Phantom - AbCd...XyZ)";
  alert("Phantom Wallet Connected!");
}

// Featured NFTs (my-nfts)
function saveFeaturedNFTs() {
  // Simulate saving checked states (could use localStorage for persistence)
  alert('Featured NFTs updated!');
}

// Chat Functions (community)
let chatMessages = []; // Simulated chat storage

function postChatMessage() {
  const message = document.getElementById('chat-message').value;
  const imageFile = document.getElementById('chat-image').files[0];
  let imageUrl = '';

  if (imageFile) {
    const reader = new FileReader();
    reader.onload = function(e) {
      imageUrl = e.target.result;
      addMessageToFeed(message, imageUrl);
    };
    reader.readAsDataURL(imageFile);
  } else {
    addMessageToFeed(message, imageUrl);
  }

  document.getElementById('chat-message').value = '';
  document.getElementById('chat-image').value = '';
}

function addMessageToFeed(message, imageUrl) {
  const feed = document.getElementById('chat-feed');
  const msgDiv = document.createElement('div');
  msgDiv.innerHTML = `<strong>You:</strong> ${message}`;
  if (imageUrl) {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.width = '100px';
    msgDiv.appendChild(img);
  }
  feed.appendChild(msgDiv);
  feed.scrollTop = feed.scrollHeight;
}

// Simulate Buy (marketplace)
function simulateBuy(nftId) {
  if (confirm(`Buy NFT #${nftId} via Solana?`)) {
    alert(`NFT #${nftId} purchased! Check your wallet.`);
  }
}
