// Default BASE_PATH to / if missing
BASE_PATH = BASE_PATH || '/';

function shorten() {
  var longUrl = document.getElementById('long-url').value;
  fetch(BASE_PATH + 'create', {
    method: 'POST',
    body: JSON.stringify({longUrl: longUrl})
  }).then(function(response) {
    if (response.ok) {
      return response.json();
    }
  }).then(function(json) {
    let teenyUrl = window.location.origin + BASE_PATH + json.shortKey;
    document.getElementById('short-url').innerHTML = '<a href = "' + teenyUrl + '">' + teenyUrl + '</a>';
  }).catch(function(error) {
    document.getElementById('short-url').innerHTML = 'Error shortening: ' + error;
  });
}
