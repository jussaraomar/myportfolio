let searchInp = document.querySelector('.weather__search')
let city = document.querySelector('.weather__city');
let day = document.querySelector('.weather__day');

let humidity = document.querySelector('.weather__indicator--humidity>.value');
let wind = document.querySelector('.weather__indicator--wind>.value');
let pressure = document.querySelector('.weather__indicator--pressure>.value');

let image = document.querySelector('.weather__image');
let temperature = document.querySelector('.weather__temperature>.value');

let forecastBlock = document.querySelector('.weather__forecast');

let suggestions = document.querySelector('#suggestions');

let weatherAPIKey = '7c27a7cb644ffc1b1e1c54bd7d046a2c';
let weatherBaseEndpoint = 'https://api.openweathermap.org/data/2.5/weather?units=metric&appid=' + weatherAPIKey;
let forecastBaseEndpoint = 'https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=' + weatherAPIKey;

let cityBaseEndpoint = 'https://api.teleport.org/api/cities/?search=';


let weatherImages = [
    {
        url: 'images/weather-icons-2/icons/clear-day.svg',
        ids: [800]
    },
    {
        url: 'images/weather-icons-2/icons/cloudy.svg',
        ids: [803, 804]
    },
    {
        url: 'images/weather-icons-2/icons/partly-cloudy-day.svg',
        ids: [801]
    },
    {
        url: 'images/weather-icons-2/icons/rain.svg',
        ids: [500, 501, 502, 503, 504]
    },
    {
        url: 'images/weather-icons-2/icons/cloudy.svg',
        ids: [802]
    },
    {
        url: 'images/weather-icons-2/icons/partly-cloudy-day-rain.svg',
        ids: [520, 521, 522, 531, 300, 301, 302, 310, 311, 312, 313, 314, 321]
    },
    {
        url: 'images/weather-icons-2/icons/snow.svg',
        ids: [511, 600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622]
    },
    {
        url: 'images/weather-icons-2/icons/thunderstorms-day-rain.svg',
        ids: [200, 201, 202, 210, 211, 212, 221, 230, 231, 232]
    },
    {
        url: 'images/weather-icons-2/icons/drizzle.svg',
        ids: [300, 301, 302, 310, 311, 312, 313, 314, 321]
    },

    {
        url: 'images/weather-icons-2/icons/mist.svg',
        ids: [701, 762, 771]
    },

    {
        url: 'images/weather-icons-2/icons/smoke.svg',
        ids: [711]
    },

    {
        url: 'images/weather-icons-2/icons/haze.svg',
        ids: [721]
    },

    {
        url: 'images/weather-icons-2/icons/dust-wind.svg',
        ids: [731]
    },

    {
        url: 'images/weather-icons-2/icons/fog.svg',
        ids: [741]
    },

    {
        url: 'images/weather-icons-2/icons/dust.svg',
        ids: [751, 761]
    },

    {
        url: 'images/weather-icons-2/icons/tornado.svg',
        ids: [781]
    }


]

let getWeatherByCityName = async (cityString) => {

    let city;
    if (cityString.includes(',')) {
        city = cityString.substring(0, cityString.indexOf(',')) + cityString.substring(cityString.lastIndexOf(','));
    } else {
        city = cityString;
    }
    let endpoint = weatherBaseEndpoint + '&q=' + city;
    let response = await fetch(endpoint);

    if (response.status !== 200) {
        alert('City not found!');
        return;
    }

    let weather = await response.json();
    return weather;
}

let getForecastByCityID = async (id) => {
    let endpoint = forecastBaseEndpoint + '&id=' + id;
    let result = await fetch(endpoint);
    let forecast = await result.json();
    let forecastList = forecast.list;
    let daily = [];

    forecastList.forEach(day => {
        let date = new Date(day.dt_txt.replace(' ', 'T'));
        let hours = date.getHours();
        if (hours === 12) {
            daily.push(day);
        }
    })

    return daily;
}

let weatherForCity = async (city) => {

    let weather = await getWeatherByCityName(city);
    if (!weather) {
        return;
    }
    let cityID = weather.id;
    updateCurrentWeather(weather);
    let forecast = await getForecastByCityID(cityID);
    updateForecast(forecast);

}

let init = () => {
    weatherForCity('Dubai').then(() => document.body.style.filter = 'blur(0)');
}

init();
searchInp.addEventListener('keydown', async (e) => {

    if (e.keyCode === 13) {
        weatherForCity(searchInp.value)
    }

})


searchInp.addEventListener('keydown', async (e) => {

    if (e.keyCode === 13) {
        let weather = await getWeatherByCityName(searchInp.value);
        if (!weather) {
            return;
        }
        let cityID = weather.id;
        updateCurrentWeather(weather);
        let forecast = await getForecastByCityID(cityID);
        updateForecast(forecast);
    }

})

searchInp.addEventListener('input', async () => {
    let endpoint = cityBaseEndpoint + searchInp.value;
    let result = await (await fetch(endpoint)).json();
    suggestions.innerHTML = '';
    let cities = result._embedded['city:search-results'];
    let length = cities.length > 5 ? 5 : cities.length;

    for (let i = 1; i < length; i++) {
        let option = document.createElement('option');
        option.value = cities[i].matching_full_name;
        suggestions.appendChild(option);
    }

    console.log(result);
})

let updateCurrentWeather = (data) => {

    city.textContent = data.name + ', ' + data.sys.country;
    day.textContent = dayOfWeek();

    humidity.textContent = data.main.humidity;
    pressure.textContent = data.main.pressure;

    let windDirection;
    let deg = data.wind.deg;

    if (deg > 45 && deg <= 135) {
        windDirection = 'East';
    }
    else if (deg > 135 && deg <= 225) {
        windDirection = 'South';
    }
    else if (deg > 225 && deg <= 315) {
        windDirection = 'West';
    }
    else {
        windDirection = 'North';
    }

    wind.textContent = `${windDirection}, ${data.wind.speed}`;

    temperature.textContent = Math.round(data.main.temp);

    let imgID = data.weather[0].id;

    weatherImages.forEach(obj => {
        if (obj.ids.includes(imgID)) {
            image.src = obj.url;
        }
    })

}


updateForecast = (forecast) => {
    forecastBlock.innerHTML = '';

    forecast.forEach(day => {
        let iconURL = 'http://openweathermap.org/img/wn/' + day.weather[0].icon + '@2x.png';
        let dayName = dayOfWeek(day.dt * 1000);

        let temperature = Math.round(day.main.temp);

        let forecastItem = `
        <article class="weather__forecast__item">
            <img src="${iconURL}" alt="${day.weather[0].description}" class="weather__forecast__icon">
            <h5 class="weather__forecast__day">${dayName}</h5>
            <p class="weather__forecast__temperature"><span>${temperature}</span>&deg;C</p>
        </article>
    `;

        forecastBlock.insertAdjacentHTML('beforeend', forecastItem);



    })


}

let dayOfWeek = (dt = new Date().getTime()) => {
    return new Date(dt).toLocaleDateString('en-EN', { 'weekday': 'long' });

}