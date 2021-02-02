import { fromEvent, of, Observable, from } from "rxjs";
import { map, filter, take } from "rxjs/operators";

// let btn = document.getElementById("btn");

// let btnEvent = fromEvent(btn, "click");

// let sub = btnEvent.subscribe((ele) => console.log("Mouse event---", ele));

// const dataSource = of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// const resultOfData = dataSource
//   .pipe(
//     take(5),
//     map((ele) => ele + 1),
//     filter((ele1) => ele1 % 2 === 0)
//   )
//   .subscribe((val) => console.log(val));

var refreshButton = document.querySelector(".refresh");
var closeButton1 = document.querySelector(".close1");
var closeButton2 = document.querySelector(".close2");
var closeButton3 = document.querySelector(".close3");

var refreshClickStream = Rx.Observable.fromEvent(refreshButton, "click");
var close1ClickStream = Rx.Observable.fromEvent(closeButton1, "click");
var close2ClickStream = Rx.Observable.fromEvent(closeButton2, "click");
var close3ClickStream = Rx.Observable.fromEvent(closeButton3, "click");

/**
 * Forming the request URL on refresh
 */
var requestStream = refreshClickStream
  // for initial results
  .startWith("startup click")
  .map(function () {
    var randomOffset = Math.floor(Math.random() * 500);
    return "https://api.github.com/users?since=" + randomOffset;
  });

// We can map through the requestStream, but that will create a stream of streams. i.e metastream
// Hence using flatMap to form a single response to single request event
var responseStream = requestStream.flatMap(function (requestUrl) {
  return from(
    new Promise((resolve) =>
      resolve(fetch(requestUrl).then((res) => res.json()))
    )
  );
});

function createSuggestionStream(closeClickStream) {
  return (
    closeClickStream
      .startWith("startup click")
      // Combining the response stream with other value picked from the list of users
      .combineLatest(responseStream, function (click, listUsers) {
        return listUsers[Math.floor(Math.random() * listUsers.length)];
      })
      .merge(
        refreshClickStream.map(function () {
          return null;
        })
      )
      .startWith(null)
  );
}

var suggestion1Stream = createSuggestionStream(close1ClickStream);
var suggestion2Stream = createSuggestionStream(close2ClickStream);
var suggestion3Stream = createSuggestionStream(close3ClickStream);

// Rendering ---------------------------------------------------
function renderSuggestion(suggestedUser, selector) {
  var suggestionEl = document.querySelector(selector);
  if (suggestedUser === null) {
    suggestionEl.style.visibility = "hidden";
  } else {
    suggestionEl.style.visibility = "visible";
    var usernameEl = suggestionEl.querySelector(".username");
    usernameEl.href = suggestedUser.html_url;
    usernameEl.textContent = suggestedUser.login;
    var imgEl = suggestionEl.querySelector("img");
    imgEl.src = "";
    imgEl.src = suggestedUser.avatar_url;
  }
}

suggestion1Stream.subscribe(function (suggestedUser) {
  renderSuggestion(suggestedUser, ".suggestion1");
});

suggestion2Stream.subscribe(function (suggestedUser) {
  renderSuggestion(suggestedUser, ".suggestion2");
});

suggestion3Stream.subscribe(function (suggestedUser) {
  renderSuggestion(suggestedUser, ".suggestion3");
});
