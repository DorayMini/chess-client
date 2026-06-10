
async function getLeaders() {
  try {
    const response = await fetch(`${window.APP_CONFIG.API_URL}/api/game/leaders`, {
      method: 'GET',
      headers: {'Content-Type': "application/json"}
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Submition failed: ", error);
  }
}


const userSession = localStorage.getItem('user_session');
const userData = JSON.parse(userSession);

function updateLeaderboard(leadersData) {
  const tbody = document.getElementById('leaderboard-body');
  tbody.innerHTML = ''; 

  const entries = Object.entries(leadersData).slice(0, 10);

  entries.forEach(([name, stats], index) => {
    const row = document.createElement('tr');
    row.classList.add("leaderboard-row");

    row.innerHTML = `
      <td><span class="rank rank-${index + 1}">#${index + 1}</span> ${name}</td>
      <td>${stats.elo}</td>
      <td class="win">${stats.wons}</td>
      <td class="draw">${stats.draws}</td>
      <td class="lose">${stats.loses}</td> 
    `;

    tbody.appendChild(row);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const result = await getLeaders();
  console.log(result);

  if (result && result.leaders) {  
    updateLeaderboard(result.leaders);
  } else {
    console.error("Error");
  }
});
