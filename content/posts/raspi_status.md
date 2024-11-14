---
title: "Raspi Status"
date: 2023-10-11T15:00:00Z
draft: false
---

<button id="restartButton">Restart webcam_stream</button>
<button id="statusButton">Check Raspberry Pi Status</button>
<div id="statusResult"></div>

<script>
document.getElementById('statusButton').addEventListener('click', function() {
    fetch('/raspi_status', {
        method: 'POST'
    })
    .then(response => response.text())
    .then(data => {
        document.getElementById('statusResult').innerText = data;
    })
    .catch(error => console.error('Error:', error));
});
document.getElementById('restartButton').addEventListener('click', function() {
    fetch('/raspi_restart_webcam', {
        method: 'POST'
    })
    .then(response => response.text())
    .then(data => {
        document.getElementById('statusResult').innerText = data;
    })
    .catch(error => console.error('Error:', error));
});
</script>
