function shorten() {
  var longUrl = document.getElementById('long-url').value;
  fetch("create", {
    method: 'POST',
    body: JSON.stringify({longUrl: longUrl})
  }).then(function(response) {
    if (response.ok) {
      return response.json();
    }
  }).then(function(json) {
    document.getElementById('short-url').innerHTML = '<a href = "' + json.shortUrl + '">' + json.shortUrl + '</a>';
  }).catch(function(error) {
    document.getElementById('short-url').innerHTML = 'Error shortening: ' + error;
  });
}
