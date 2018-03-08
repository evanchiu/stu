function shorten() {
  var longUrl = document.getElementById('long-url').value;
  fetch("Prod/create", {
    method: 'POST',
    body: JSON.stringify({longUrl: longUrl})
  }).then(function(response) {
    if (response.ok) {
      return response.json();
    }
  }).then(function(json) {
    document.getElementById('short-url').innerHTML = '<a href = "' + json.shortKey + '">'
      + window.location + json.shortKey + '</a>';
  }).catch(function(error) {
    document.getElementById('short-url').innerHTML = 'Error shortening: ' + error;
  });
}
