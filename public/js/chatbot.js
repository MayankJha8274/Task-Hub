document.getElementById("sendBtn").onclick = sendMessage;

async function sendMessage() {
  let input = document.getElementById("chatInput").value;
  if (!input.trim()) return;

  addMessage("user", input);

  let res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: input })
  });

  let data = await res.json();
  addMessage("bot", data.reply);

  document.getElementById("chatInput").value = "";
}

function addMessage(sender, text) {
  const box = document.getElementById("chatMessages");
  box.innerHTML += `<div class="${sender}-msg">${text}</div>`;
  box.scrollTop = box.scrollHeight;
}

document.getElementById("chatIcon").onclick = () => {
  document.getElementById("chatWindow").style.display = "block";
};
