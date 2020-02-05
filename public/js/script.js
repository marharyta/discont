document.addEventListener("submit", e => {
  e.preventDefault();

  const login = document.querySelector('input[name="login"]').value;
  const password = document.querySelector('input[name="password"]').value;

  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "login": login,
      "password": password
    })
  }).then(async res => {
    console.log("request sent, response received", res);
    // var data = await res.json();

    // if (data.hasOwnProperty("url")) {
    //   window.location = data.url;
    // }
  });
});
