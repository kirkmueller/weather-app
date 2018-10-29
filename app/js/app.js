const app = document.querySelector('#weather-app');

let forecast = {};
let weather = {};
let position = {};
let tempScale = getTempScale();
let mode = 'light';

function init(){
		
	// Check if location has been saved
	getPosition().then(function(foundPosition){

		// set position
		position = foundPosition;
		
		Promise.all([getWeather(foundPosition), getForecast(foundPosition)]).then(function(values) {
			
			// set weather and forecast
			weather = values[0];
			forecast = values[1];
			
			templateDash();
		}).catch(function(){
			templateNeedLocation();
		});
		
	}).catch(function(error){
		templateNeedLocation();
	});
	
}

templateWelcome();
init();