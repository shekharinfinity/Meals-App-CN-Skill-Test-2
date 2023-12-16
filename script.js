async function fetchMeals(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data.meals || [];
}

function isMealFavorited(id) {
  const arr = JSON.parse(localStorage.getItem("favouritesList")) || [];
  return arr.includes(id);
}

function updateMainCard(mealData) {
  const html = `
    <div id="card" class="card mb-3" style="width: 20rem;">
      <img src="${mealData.strMealThumb}" class="card-img-top" alt="...">
      <div class="card-body">
        <h5 class="card-title">${mealData.strMeal}</h5>
        <div class="d-flex justify-content-between mt-5">
          <button type="button" class="btn btn-outline-light" onclick="showMealDetails(${mealData.idMeal})">More Details</button>
          <button id="main${mealData.idMeal}" class="btn btn-outline-light ${isMealFavorited(mealData.idMeal) ? "active" : ""}" onclick="addRemoveToFavList(${mealData.idMeal})" style="border-radius:50%">
            <i class="fa-solid fa-heart"></i>
          </button>
        </div>
      </div>
    </div>
  `;
  return html;
}

function showNotFoundError() {
  return `
    <div class="page-wrap d-flex flex-row align-items-center">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-12 text-center">
            <span class="display-1 d-block">Not Found</span>
            <div class="mb-4 lead">
              The meal you are looking for was not found.
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function showNoFavMealsMessage() {
  return `
    <div class="page-wrap d-flex flex-row align-items-center">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-12 text-center">
            <span class="display-4 d-block">No Favourite Meal Added to List.</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function showMealList() {
  const inputValue = document.getElementById("my-search").value;
  const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${inputValue}`;
  const meals = await fetchMeals(url);
  let html = "";

  if (meals.length === 0) {
    html = showNotFoundError();
  } else {
    meals.forEach((mealData) => {
      html += updateMainCard(mealData);
    });
  }

  document.getElementById("main-card").innerHTML = html;
}

async function showMealDetails(id) {
  const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
  const mealData = await fetchMeals(url);
  const html = `
    <div id="meal-details" class="mb-5">
      <button class="btn btn-outline-light mb-3" onclick="goBack()">Back</button>
      <div id="meal-header" class="d-flex justify-content-around flex-wrap">
        <div id="meal-thumbnail">
          <img class="mb-2" src="${mealData[0].strMealThumb}" alt="" srcset="">
        </div>
        <div id="details">
          <h3>${mealData[0].strMeal}</h3>
          <h6>Category : ${mealData[0].strCategory}</h6>
          <h6>Area : ${mealData[0].strArea}</h6>
        </div>
      </div>
      <div id="meal-instruction" class="mt-3">
        <h5 class="text-center">Instruction :</h5>
        <p>${mealData[0].strInstructions}</p>
      </div>
      <div class="text-center">
        <a href="${mealData[0].strYoutube}" target="_blank" class="btn btn-outline-light mt-3">Watch Video</a>
      </div>
    </div>
  `;

  document.getElementById("main-card").innerHTML = html;
}

function goBack() {
  showMealList();
}

async function showFavMealList() {
  const arr = JSON.parse(localStorage.getItem("favouritesList")) || [];
  const url = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";
  let html = "";

  if (arr.length === 0) {
    html = showNoFavMealsMessage();
  } else {
    for (const id of arr) {
      const mealData = await fetchMeals(url + id);
      html += updateMainCard(mealData[0]);
    }
  }

  document.getElementById("favourites-body").innerHTML = html;
}

function addRemoveToFavList(id) {
  const arr = JSON.parse(localStorage.getItem("favouritesList")) || [];
  const index = arr.indexOf(id);

  if (index === -1) {
    arr.push(id);
    localStorage.setItem("favouritesList", JSON.stringify(arr));
    showNotificationModal("Your meal has been added to your favorites list.", "text-success");
  } else {
    arr.splice(index, 1);
    localStorage.setItem("favouritesList", JSON.stringify(arr));
    showNotificationModal("Your meal has been removed from your favorites list.", "text-danger");
  }

  showMealList();
  showFavMealList();
}

function showNotificationModal(message, className) {
  const modalElement = document.getElementById("notificationModal");
  const notificationText = document.getElementById("notificationText");

  if (modalElement && notificationText) {
    notificationText.textContent = message;
    notificationText.classList.remove("text-success", "text-danger");
    notificationText.classList.add(className);

    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    setTimeout(() => {
      modal.hide();
    }, 3000);
  }
}
