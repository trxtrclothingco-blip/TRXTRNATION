// main.js - Shared JavaScript for functionality

// Solana Integration Setup
const sdk = new BrowserSDK({
  providers: ["injected"],
  addressTypes: ["solana"]
});

// Simulate Payment (from landing) - Still simulated as it's fiat, use Stripe for real £1
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

// Real Wallet Connect
async function connectWallet() {
  try {
    const { addresses } = await sdk.connect({ provider: "injected" });
    const address = addresses[0].address;
    document.getElementById('wallet-status').innerText = `Wallet: Connected (${address.slice(0,6)}...${address.slice(-4)})`;
    localStorage.setItem('walletAddress', address);
    alert("Phantom Wallet Connected!");
  } catch (err) {
    alert("Connection failed: " + err.message);
  }
}

// Featured NFTs (my-nfts)
function saveFeaturedNFTs() {
  // Simulate saving (use localStorage or backend for real)
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

// Real Buy NFT (marketplace) - Sends SOL to a recipient (replace with your wallet key)
// For real NFT transfer, integrate Metaplex for mint/transfer
async function buyNFT(nftId, priceInSol) {
  const walletAddress = localStorage.getItem('walletAddress');
  if (!walletAddress) {
    alert('Connect wallet first!');
    return;
  }

  const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');
  const from = new solanaWeb3.PublicKey(walletAddress);
  const to = new solanaWeb3.PublicKey('YOUR_RECIPIENT_PUBLIC_KEY_HERE'); // REPLACE WITH YOUR SOLANA WALLET ADDRESS

  const lamports = priceInSol * solanaWeb3.LAMPORTS_PER_SOL;

  const transaction = new solanaWeb3.Transaction().add(
    solanaWeb3.SystemProgram.transfer({
      fromPubkey: from,
      toPubkey: to,
      lamports,
    })
  );

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = from;

  try {
    const result = await sdk.solana.signAndSendTransaction(transaction, { connection });
    alert(`NFT #${nftId} purchased! Tx Signature: ${result.signature}`);
  } catch (err) {
    alert("Purchase failed: " + err.message);
  }
}
