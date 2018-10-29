let convertTimestamp = function (timestamp){
	return new Date( timestamp * 1000 );
}

let tempToF = function(temp){
	return Math.round( ((temp-273.15)*1.8)+32 );
}
	
let tempToC = function(temp){
	return Math.round( temp-273.15 );
}

let convertTemp = function(temp){
	if(tempScale == 'f'){
		return tempToF(temp);
	}else{
		return tempToC(temp);
	}
}

function templateDash(){
		
	var sunrise = convertTimestamp(weather.sys.sunrise);
	var sunset = convertTimestamp(weather.sys.sunset);
	var sun = `	  
		<section class="weather-sunrise">
			<div class="grd-row">
				<div class="grd-row-col-3-6 txt--left">
					<h6>
						<i class="wi wi-sunrise"></i> 
						${ ((sunrise.getHours() + 11) % 12 + 1) }:${ sunrise.getMinutes() }
						<small>AM</small>
						
						&nbsp; 
						
						<i class="wi wi-sunset"></i> 
						${ ((sunset.getHours() + 11) % 12 + 1) }:${ sunset.getMinutes() }
						 <small>PM</small>
				  	</h6>
				</div>
				
				<div class="grd-row-col-3-6 txt--right py2">
					<img onclick="templateSettings()" class="wa-icon clickable" src="css/img/feather-settings.svg"/>
				</div>
			</div>
		</section>
	`;
	
	var hero = `
		<section class="weather-today">
		  	<h6 class="my0">Currently</h6>
			<h3 class="my0">${weather.name}</h3>
		  	<h1 class="my2">
		  		${convertTemp(weather.main.temp)}<sup><small>°</small></sup> 
				<i class="wi wi-owm-${weather.weather[0].id}"></i>
			</h1>
			<div class="my2">
		  		<h6 class="my0">Today</h6>
		  		<h3 class="my0">
			  		
					<small><i class="wi wi-direction-up"></i></small>
					${convertTemp(weather.main.temp_max)}<sup><small>°</small></sup>	
					
					<small><i class="wi wi-direction-down"></i></small>
					${convertTemp(weather.main.temp_min)}<sup><small>°</small></sup>
				</h3>
			</div>
	  </section>
	`;
	
	var forecastTable = `
		<section class="weather-forecast my2">
			<table>
				<tbody>
					${templateForecastList(forecast.days)}	  				  			
				</tbody>
			</table>
		</section> 
	`;
	
	app.innerHTML = `
		<div class="container txt--uppercase">
			${sun}
			${hero}
			${forecastTable}
		</div>
	`;
}


function templateForecastList(days){
	var list = ``;
	days.forEach(function(day) {
	    list += `
		    	<tr>
					<td>
						<h6 class="my0">${day.dayOfWeek}</h6>
					</td>
					<td>
						<i class="wi wi-owm-${day.icon}"></i>
					</td>
					<td>
						<i class="wi wi-direction-up"></i>
						${convertTemp(day.maxTemp)}<sup><small>°</small></sup>
					</td>
					<td>
						<i class="wi wi-direction-down"></i>
						${convertTemp(day.minTemp)}<sup><small>°</small></sup>
					</td>		  					  			
				</tr>
				`;
	});
	return list;
}

function templateSettings(){
	app.innerHTML = `
		<div class="container">
	
			<section class="weather-settings-header">
				<div class="grd-row">
				  	<div class="grd-row-col-3-6 txt--left"></div>
				  	<div class="grd-row-col-3-6 txt--right py2">
				  		<img onclick="templateDash()" class="wa-icon clickable" src="css/img/feather-x.svg"/>
				  	</div>
				</div>
			</section>
			
			<section class="weather-settings-body">
				<form action="#" role="form" class="my2">

					<h3 class="txt--uppercase my3">Settings</h3>
					
					<h5 class="my1">Location</h5>
					<input type="text" name="zipcode" id="zipcode" value="${ ('zipcode' in position) ? position.zipcode : ''}" placeholder="Zipcode">
					
					<div class="my3">	
						<h5 class="my1">Temperature</h5>	
						<div class="grd-row-col-6-6">
						  	<h4 class="my0">
							  	<input type="radio" name="temperature" id="fahrenheit" value="f" ${isChecked(tempScale,'f')}> 
							  	<i class="wi wi-fahrenheit"></i>
						  	</h4>				  	
						</div>
					
						<div class="grd-row-col-6-6">
						  	<h4 class="my0">
						  		<input type="radio" name="temperature" id="celsius" value="c" ${isChecked(tempScale,'c')}> 
						  		<i class="wi wi-celsius"></i>
						  	</h4>
						</div>
					</div>
								
					<input type="submit" onclick="event.preventDefault(); saveSettings()" value="Save" class="w100--s btn my2">
				
				</form>
			</section>  
	  </div>
	`;
}

function templateWelcome(){
	app.innerHTML = `
		<section class="full-page vertical-center txt--center">
			<div class="container">
				<h1>Welcome</h1>
				<h6>We're currently searching for your current location.</h6>
			</div>
		</section>
	`;
}

function templateNeedLocation(){
	app.innerHTML = `
		<section class="full-page vertical-center txt--center">
			<div class="container">
				<h1>Uh-Oh</h1>
				<h6>We're couldn't grab your location automatically.<br/>Please enter your zipcode.</h6>
			    <input type="text" name="zipcode" id="zipcode" pattern="[0-9]{5}" placeholder="Zipcode">
				<input onclick="event.preventDefault(); submitZip(document.getElementById('zipcode').value)" value="Submit" class="w100--s my1 btn">
			</div>
		</section>
	`;	
} 

function isChecked(value1, value2){
	if(value1 == value2){
		return 'checked';
	}else{
		return false;
	}
}

function saveSettings(){
	
	// save Zip
	var zipcode = document.getElementById('zipcode').value;
	if(verifyZip(zipcode)){
		localSave('zipcode', zipcode);
		localSave('country','us');
		clearWeather();
	}
	
	// Save Scale
	if(document.getElementById("fahrenheit").checked){ tempScale = 'f';}
	if(document.getElementById("celsius").checked){ tempScale = 'c';}
	localSave('tempScale', tempScale);
	
	init();
}

function verifyZip(zipcode){
	return  /^\d{5}$|^\d{5}-\d{4}$/.test(zipcode);
}

function submitZip(zipcode){
	if( verifyZip(zipcode) ){
		localSave('zipcode',zipcode);
		localSave('country','us');
		init();
	}else{
		alert("Zipcode must be 5 numbers.");
	}
}