'use strict';

const locationText = document.querySelector('.location');
const currentTempText = document.querySelector('.currentTemp');
const currentWeatherMain = document.querySelector('.currentWeatherMain');
const weekWeatherContainer = document.querySelector('.weekContainer');
const mainF = document.querySelector('.mainFront');
const searchBar = document.getElementById('search');
const searchBtn = document.getElementById('searchBtn');
const windSpeedText = document.querySelector('.windSpeed');
const humidityText = document.querySelector('.humidity');
const todayImg = document.querySelector('.iconNow');
const timeElement = document.querySelector('.time');
const thirdDayEl = document.querySelector('.thirdDay');
const fourthDayEl = document.querySelector('.fourthDay');
const fifthDayEl = document.querySelector('.fifthDay');
const apiKey = '500578595269742781652x71552';

const month = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
let longitude;
let latitude;

const convertingWeatherCode = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Intense drizzle',
  56: 'Light freezing drizzle',
  57: 'Intense freezing drizzle',
  61: 'Slight raining',
  63: 'Rain',
  65: 'Heavy raining',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain shower',
  81: 'Moderate rain shower',
  82: 'Violent rain shower',
  85: 'Slight snow shower',
  86: 'Heavy snow shower',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

// Put focus on search bar
searchBar.focus();

// Inserting weather code and returning the actual weather
const finalCovert = weatherC => {
  return convertingWeatherCode[weatherC];
};

// Displaying current time in a nice way
const now = new Date();
const hoursStr = now.getHours() + '';
const minutesStr = now.getMinutes() + '';
// prettier-ignore
timeElement.textContent = `${getDayName(now)} ${now.getDate()}. ${month[now.getMonth()]}
${now.getFullYear()}, ${hoursStr.padStart(2, 0)}:${minutesStr.padStart(2, 0)}`;

// Displaying next five days in the week
const setDayAfter = i => {
  const today = new Date();
  return new Date(today.setDate(today.getDate() + i));
};

// Getting name of the day
function getDayName(date = new Date(), locale = 'en-US') {
  return date.toLocaleDateString(locale, { weekday: 'long' });
}
const nextTwoDays = getDayName(setDayAfter(2));
const nextThreeDays = getDayName(setDayAfter(3));
const nextFourDays = getDayName(setDayAfter(4));

// Setting values
thirdDayEl.textContent = nextTwoDays;
fourthDayEl.textContent = nextThreeDays;
fifthDayEl.textContent = nextFourDays;

// Getting location of the user
const getLocation = async function () {
  try {
    const resGeo = await fetch(
      'https://api.bigdatacloud.net/data/reverse-geocode-client'
    );

    if (!resGeo.ok) throw new Error('Location could not be found.');

    const dataGeo = await resGeo.json();
    locationText.textContent = dataGeo.city;

    // Getting current lat and lon
    latitude = dataGeo.latitude;
    longitude = dataGeo.longitude;

    gettingCurrentWeather(latitude, longitude);
    weatherForTheFollowingDays(latitude, longitude);
  } catch (err) {
    console.error(err);
  }
};

getLocation();

// Getting current weather
const gettingCurrentWeather = async function (latitude, longitude) {
  try {
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,is_day,wind_speed_10m,weather_code&forecast_days=1`
    );
    const weatherData = await weatherRes.json();

    // Puting information into HTML
    let weatherCode = weatherData.current.weather_code;
    let isItDay = weatherData.current.is_day;
    let windSpeed = weatherData.current.wind_speed_10m;
    let humidity = weatherData.current.relative_humidity_2m;

    // Displaying weather image
    let dayNight =
      isItDay === 1
        ? `./icons/${weatherCode}.svg`
        : `./icons/${weatherCode} night.svg`;

    // Clearing previous info
    mainF.innerHTML = '';
    const html = `
    <p class="currentWeatherMain fade-in">${finalCovert(weatherCode)}</p>
    <div class="mainContainer fade-in">
      <img src="${dayNight}" class="iconNow" />
      <div class="statsContainer">
        <div class="stats">
          <img src="icons/wind.svg" class="statsIcon" />
          <p class="windSpeed">${windSpeed} km/h</p>
      </div>
        <div class="stats">
          <img src="icons/humidity.svg" class="statsIcon" />
          <p class="humidity">${humidity} %</p>
        </div>
      </div>
    </div>
    <p class="currentTemp fade-in">${
      weatherData.current.temperature_2m
    } C°</p>`;

    // Inserting into container
    mainF.insertAdjacentHTML('beforeend', html);
  } catch (err) {
    console.error(err);
  }
};

// Getting weather for next 5 days
const weatherForTheFollowingDays = async function (lat, lon) {
  const weather2res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min`
  );
  const weatherData2 = await weather2res.json();

  const maxTemps = weatherData2.daily.temperature_2m_max.slice(0, 5);
  const minTemps = weatherData2.daily.temperature_2m_min.slice(0, 5);
  const weatherCodesArray = weatherData2.daily.weather_code.slice(0, 5);

  // Clear previous content
  weekWeatherContainer.innerHTML = '';

  //Weather for the whole week
  for (let i = 0; i < 5; i++) {
    const html = `
    <div class="dayContainer fade-in">
      <img src="./icons/${weatherCodesArray[i]}.svg" class="smallIcon">
      <div class="fiveTemps">
        <p class="maxTemp">${maxTemps[i]}°</p>
        <p class="minTemp">${minTemps[i]}°</p>
      </div>
    </div>
    `;

    weekWeatherContainer.insertAdjacentHTML('beforeend', html);
  }
};

// Listening to click on search
searchBtn.addEventListener('click', function () {
  const input = searchBar.value;
  const formatedInput = input.trim().toLowerCase();

  getLongAndLat(formatedInput);
});

// Listening to enter
searchBar.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    const input = searchBar.value;
    const formatedInput = input.trim().toLowerCase();

    getLongAndLat(formatedInput);
  }
});

// We get name of the place and put it into out functions
const getLongAndLat = async function (place) {
  try {
    const forwardGeo = await fetch(
      `https://geocode.xyz/${place}?json=1&auth=${apiKey}`
    );
    const fgRes = await forwardGeo.json();

    let latitude = fgRes.latt;
    let longitude = fgRes.longt;
    locationText.textContent = `${fgRes.standard.city}, ${fgRes.standard.countryname}`;

    gettingCurrentWeather(latitude, longitude);
    weatherForTheFollowingDays(latitude, longitude);
  } catch (err) {
    console.error(err);
  }
};
