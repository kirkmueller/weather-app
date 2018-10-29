'use strict';

const weatherAPIKey = 'a22bb8377fc6741c6f0b960b58552abb';
const openWeatherBaseURL = 'https://api.openweathermap.org/data/2.5';
const cacheTime = 10; // in minutes

function getWeather(position){
	var weatherURL = `${openWeatherBaseURL}/weather?APPID=${weatherAPIKey}`
	
	// Check if cache should be used
	if(useCache(localGet('weather_ts'))){
		var cache = localGet('weather');
		if(cache){
			return new Promise(
		    	resolve => resolve(JSON.parse(cache))
		    )
		}
	}else{
		var appendLocation = '';

		if('latitude' in position && 'longitude' in position){
			appendLocation = `&lat=${position.latitude}&lon=${position.longitude}`;
		}else if('zipcode' in position && 'country' in position){
			appendLocation = `&zip=${position.zipcode},${position.country}`;
		}
		
		return fetch(weatherURL + appendLocation, { method: 'GET' })
		.then(response => response.json())
		.then(function(response){
			if(response.cod != 200){
				return Promise.reject(response.message);
			}else{
				localSave('weather',JSON.stringify(response));
				localSave('weather_ts',new Date());
				return response;
			}
		})
		.catch(function(error){
			console.error('Error:', error);
			alert(error);
		});
	}
	
}

function getForecast(position){
	var forecastURL = `${openWeatherBaseURL}/forecast?APPID=${weatherAPIKey}`;
	
	// Check if cache should be used
	if(useCache(localGet('forecast_ts'))){
		var cache = localGet('forecast');
		if(cache){
			return new Promise(
		    	resolve => resolve(JSON.parse(cache))
		    )
		}
	}else{
		var appendLocation = '';

		if('latitude' in position && 'longitude' in position){
			appendLocation = `&lat=${position.latitude}&lon=${position.longitude}`;
		}else if('zipcode' in position && 'country' in position){
			appendLocation = `&zip=${position.zipcode},${position.country}`;
		}
		
		return fetch(forecastURL + appendLocation, { method: 'GET' })
		.then(response => response.json())
		.then(function(response){
			if(response.cod != 200){
				return Promise.reject(response.message);
			}else{
				// generate daily averages
				response.days = createDailyFromHourly(response.list);
				
				localSave('forecast',JSON.stringify(response));
				localSave('forecast_ts',new Date());
				return response;
			}
		})
		.catch(function(error){
			console.error('Error:', error);
			alert(error);
		});
	}

}

function useCache(timestamp){
	if(timestamp){
		var savedTime = Date.parse(timestamp);
		var now = new Date().getTime();
		return ( Math.floor(( (now - savedTime) / 1000) / 60) < cacheTime);
	}else{
		return false;
	}
}

function createDailyFromHourly(forecastList){
	
	var daysOfTheWeek = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	
	var forecasts = [], // array of days
		currentDate = '',
		day = {
			codes: []
		};
	
	forecastList.forEach(function(forecast, index) {
		
		// convert forecast to date
		var date = convertTimestamp(forecast.dt).getDate();
					
		if(currentDate == date){
			
			if(day.maxTemp < forecast.main.temp_max){ day.maxTemp = forecast.main.temp_max; } 
			if(day.minTemp > forecast.main.temp_min){ day.minTemp = forecast.main.temp_min; } 
			day.codes.push(forecast.weather[0].id);
			
		}else{
			
			if( index != 0){
				// Find most used weather code
			    day.icon = findMostFrequent(day.codes);
			    
			    forecasts.push({
				    date: day.date,
				    dayOfWeek: daysOfTheWeek[convertTimestamp(forecast.dt).getDay()],
				    maxTemp: day.maxTemp,
				    minTemp: day.minTemp,
				    codes: day.codes,
				    icon: day.icon
			    });
			}
			
			// Go to new day
			currentDate = date;
			day.date = date;
			day.maxTemp = forecast.main.temp_max;
			day.minTemp = forecast.main.temp_min;	
			day.codes = [];		
			day.codes.push(forecast.weather[0].id);
		}
			
	});
	
	return forecasts;
}

function findMostFrequent(array){
	var counts = {};
	var compare = 0;
	var mostFrequent;
	
	for(var i = 0, len = array.length; i < len; i++){
		var item = array[i];
		
		if(counts[item] === undefined){
		   counts[item] = 1;
		}else{
		   counts[item] = counts[item] + 1;
		}
		if(counts[item] > compare){
		    compare = counts[item];
		    mostFrequent = array[i];
		}
    }
	
	return mostFrequent;
}

function getTempScale(){
	var scale = localGet('tempScale');
	return scale ? scale : 'f';
}

function clearWeather(){
	localRemove('forecast');
	localRemove('forecast_ts');
	localRemove('weather');
	localRemove('weather_ts');
}

function clearApp(){
	localRemove('forecast');
	localRemove('forecast_ts');
	localRemove('weather');
	localRemove('weather_ts');
	localRemove('zipcode');
	localRemove('country');
}