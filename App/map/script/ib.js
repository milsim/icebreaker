var ib;

Number.prototype.clamp = function(max, min){ return Math.max(min, Math.min(max, this)) }
String.prototype.pad = function(padding){ 
	padding = padding || "00"; 
	return ((padding) + this).substr(-padding.length); 
}

function searchToJSON(){ 
  var rep = {'?':'{"','=':'":"','&':'","'}; 
  var s = document.location.search.replace(
		/[\?\=\&]/g, function(r){ return rep[r]; }
	);
  return JSON.parse( s.length? s+'"}' : "{}" ); 
}

function Icebreaker(map){
	this.map   = map;
	this.units = ["unknown", "friendly", "neutral", "hostile"];
	this.maps  = ["juliett", "sierra", "foxtrot", "november"];
	this.timeline = false;
	this.icons = this.setupIcons();	
	this.settings = searchToJSON();
	this.setupLayers(this.maps);
	this.API = {device:{}, relations: {}};
	this.API.device.key = null;
	this.API.device.URI = "http://milsim.se/icebreaker/artemis/gps_coords.php";
	this.rel = {
		juliett: [2,0,0,3],
		sierra:  [3,2,0,2],
		foxtrot: [3,0,1,3],
		november:[3,0,0,2]
	}	
}

Icebreaker.prototype = {
	//Setup functions
	setupIcons: function(){
		var app6a = [
			"iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RjJFMkVFRkQzRDgzMTFFM0E4Nzc4NjNCREQ2RTRFREIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RjJFMkVFRkUzRDgzMTFFM0E4Nzc4NjNCREQ2RTRFREIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGMkUyRUVGQjNEODMxMUUzQTg3Nzg2M0JERDZFNEVEQiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGMkUyRUVGQzNEODMxMUUzQTg3Nzg2M0JERDZFNEVEQiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pjqt0FwAAASKSURBVHja1FpNSFRRFD6OOlr+iw6aMWBlP+RE5TZwF4oRJEGLaBUULSJIWgRRm9ontAoENwluEkIpCoKgZRGkhRYqGemgNSma5jhp33lzR968e2fe7/x44KC8mXPe/d4595zvnjcFW+9oZ0vblvanKAOu66Fd0HPQJmizuD4N/QEdgr6Ahr28aYGHEamF3odehvpNvhuF9kHvQCNeRMQrIB3QJwKMHWEQF0WEXAHxeQCCIzDsAEQiisPCR05Tq0MspNDlOv5BO6GvcpFavKm/QqukT3wUo2qaw/OepxL6q11bp1IkUoAWqZE2lUVmCdoCXch21bqrBLELC9pPo/AcS7peTBtUTsu0h77RJIVoTbKtEj6vZzO1OLfnpOrEIA7RB0seJuiEAgxXs0ZblczlZj8vgfAhzzkSVmUfjWk2yeIXvm2LUyBd0pVqmpXSKZ1wqrGNFd8ZBBKSrgS0rm1P1DahbAKRe4adaKS3cdKPLFWtBuhZofz/AalaldAfx0DYdp3KDNXrl+BmM9Bn0BGzslxkAoDL4RXThrdb6wHOhG2TgSSiwtomyCdXs0fQB6kqmi9Nx+Zmd80UBDe/Bu3JORO29ZlGk6vZTbGmdqtAbkCfQ8st7LAYGtyX7e7tRNiWffgspSZH6SX0kllD5H3w1DQKnNecEvw03YDQC1OYOQrSKvZIVEo11THgNPSNimvxIehTSu5Ug9vUgDuVoh872dh2ZANdJsHNfmNdW8rM4c1/GEAixs2u5k6VWHwQoc/04o3NMsHNGug7TVEr4l6pIK23oLf1EQlCp6SUssOdMi3jdFIBJs7NEBWfjhYUGtJpA6T6Y94MGZibqavZBX3VkvlNDYUVpC534sfTr0WaydKuB3LcE+6UaalTTl5CeiD1ig0XzTsgXADUJ1VPhg95IT5dTZZreb6Jek0LeiAT0sfztDfvgPzUiKxRPuuByGOYRRhtuh7zeBkNPzq96uG+1gMZFLMl/aSpGFzzWN4AmUR3RwNXNMRBPRA+xPRLxjzlmKIjAJW7yEQRCXVXZ+lNcC0jaRxX0nfu8twg85g07mQa36ntjzQjUz5YPbRYvOMHqzpEyl01CtAsHUwxSlWBuLq9FdIM6HqhZ6Arpi75xrwAfppuImEdREQcqPqtntl5asED5cdSNVOBCWvHAGfCtuYgouIBt2inQptTlLAI4T3TcdCq4kBmVdS2EUp+VWc6DnI6xF6UwLTSW9vVLAaLMTpluMqjpWrLPlwOsSPKRdkVtY2jd4pOgYwqqnqTbS9qm9FsApFfXi6hhNrhZvxdtrHiO4NARqRqxlNcO9yMv8s2ZGB4cd9ZA8Ij0gElN5sGbdhM45c/4++sKavVgPBtW9y8DE090CsEWwpguWW0rM2mSGuvFSA2FeAAzRqzJkVyEh0VJZfsVi23r6etcTNz4ZTqpvgrBHICxO2ZnW/c4wFl7HEEwoM9YuRm3Za4mSwrwrbXq+GDWxnSzgbxH8pYlT5hM+TFAgoy8HutoNg7XWLm1Cauvxd8aUSk0Ywnd/P410G5EwHkvwADAKg7YID2eT4xAAAAAElFTkSuQmCC", //Unknown
			
			"iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RjJFMkVFRjUzRDgzMTFFM0E4Nzc4NjNCREQ2RTRFREIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RjJFMkVFRjYzRDgzMTFFM0E4Nzc4NjNCREQ2RTRFREIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo0QzM1NTlDNDNEN0YxMUUzQTg3Nzg2M0JERDZFNEVEQiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGMkUyRUVGNDNEODMxMUUzQTg3Nzg2M0JERDZFNEVEQiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PsNQSV0AAACcSURBVHja7NoxDkAwFMbxV7GL1QHMNjdidw8H4EY2swNYxQnKxKARo/f6/5Lu/aX9OrR13nuxkESMBAgQIO9x0uk+tXx/QwYLK5Keo6EjQIC8duSROpflz5OeNik/QapMVm0QOgIECBAgQIAAAQIECBAgQIAAARIVJHivNe9SmICELsDYWkAiLvtoBdJqBlyPofxFAQIEiKocAgwAotMYHyfhPEUAAAAASUVORK5CYII=", //Friendly
			
			"iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NEMzNTU5QzIzRDdGMTFFM0E4Nzc4NjNCREQ2RTRFREIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NEMzNTU5QzMzRDdGMTFFM0E4Nzc4NjNCREQ2RTRFREIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo0QzM1NTlDMDNEN0YxMUUzQTg3Nzg2M0JERDZFNEVEQiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo0QzM1NTlDMTNEN0YxMUUzQTg3Nzg2M0JERDZFNEVEQiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgbqFwEAAADQSURBVHja7NoxCsJAEEDRnahgYWPjCQTFA3gAr2EreCbBs+QAOUCIkBPYWGghiI5TWaVI2BAm8Q8MgcCGeZudLZYVVQ1DiCQMJIB4i3HsB+Q8jRqvh2crEKlqdituaY+d08lPDV/W/SNby5NTyN6ypNmBuNu15pNrSOTdaXUfHYXba9H+9rueXTqF5PcNPQIECBAgQIAAAQIECBAgQIAAAQIECBAgjaPZ2W/xWPUfUvNUnKUF5E+aPbM8Oq05q3opsZdqXF8YoEeAAPnFV4ABAKFOKFdPsS1oAAAAAElFTkSuQmCC", //Neutral
			
			"iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RjJFMkVFRjkzRDgzMTFFM0E4Nzc4NjNCREQ2RTRFREIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RjJFMkVFRkEzRDgzMTFFM0E4Nzc4NjNCREQ2RTRFREIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGMkUyRUVGNzNEODMxMUUzQTg3Nzg2M0JERDZFNEVEQiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGMkUyRUVGODNEODMxMUUzQTg3Nzg2M0JERDZFNEVEQiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Ps4uwmQAAAHRSURBVHja1NrNSsNAEAfwydSPswfJXWjxMQoFH0XwiXyXgOhbKA30WCoePOsl7sgWQ2yaZHf+s9uFobAJzfzYbZMZUjzTaY9l0/x+ssG1Sh/QgYSsXKxd7Hys/dxJQSThRxfz1tzcz61OBXIIAcewIQKKYWMEDMNoxBXRhwQaw2jELVEtgcYwGnFJ9C2BxjAasZ9DY9gCYYFhKwQaw5YIJIatESgMp0AgMJwKoY3hlAhNDKdGaGE4B4QGhnNBxGI4J0QMhnNDhGKKVjtonQuiPb6ILt5cXp9E1wcO18umWbRXpMwRMWZlXoqibENmfV9UEDWpm3ADOczakK2LTfcMWc5XooVbjvNUCLm25NCztTZua227P/aH3DBDCJ/zv3+tKifMSETVdx/JAjMV0XdnT4oJQRx71kqCCUUMPf2aYmIQY+oRE0wsYmyFCMVoIKbU7BCMFmJqF0UVo4kI6WupYLQRoZ3GKAwCEQoJxqAQMZBRGCmKLBCxkEGMVHaCQSO6pW7MuPM19M2hKnMPQyC033w4ujLIldDaWl3MvTQERpyritCGyHjyCdaWCARkCANBoCB9mNpvvQpxwTNgxSqYBf294vSOLI+RELIA7MePAAMAMhBe9GSbn4YAAAAASUVORK5CYII=" //Hostile	
		];  
		var icons = {};
		icons.size = new OpenLayers.Size(30,30);
		icons.offset = new OpenLayers.Pixel(-icons.size.w/2, -icons.size.h/2);
		
		this.units.forEach(function(n,i){ 
			icons[i] = new OpenLayers.Icon(
				"data:image/png;base64," + app6a[i], icons.size, icons.offset
			);
		});
		return icons;
	},
	setupLayers: function(newLayers){
		var self = this;
		newLayers.forEach(function(n,i){
			self.map.addLayer( new OpenLayers.Layer.Markers( n ) );
		});
		
		if(self.settings.f == "a" && self.settings.v == "a" && self.settings.t =="a")
			self.settings.admin = true;
	},
	
	//Marker functions
	/*
	marker:
	{
		id: 		string ID,
		longitude: 	float Longetude,
		latitude: 	float Latitude,
		unit:		string Unit type,
		[
			extendable pproperties
		]
	}
	*/
	upsertMarker: function(marker, map){
//		var m = this.getMarkerByName(marker.unit_name, map);
//		if( m ) { //update
//			this.updateMarker(marker, map, m);
//		} else { //insert
			this.addMarker(marker, map);
//		}
	},
	addMarker: function(marker, map){
		var l = this.getLayerByName(map);		
		var latlon = new OpenLayers.LonLat(
			parseFloat(marker.long), 
			parseFloat(marker.lat)
		).transform(
	        new OpenLayers.Projection("EPSG:4326"), 
	        this.map.getProjectionObject()
     	);

		m = new OpenLayers.Marker(
			latlon, 
			this.icons[marker.unit_type].clone()
		);
		m.info = marker;
		m.id = marker.unit_id;
		m.name = marker.unit_name.length ? marker.unit_name : "point of intrest";
		m.info.lastUpdate = new Date( (marker.gps_latestupdate * 1000) - 3.6e6 );

		var sinceUpdate = new Date(
			+(new Date()) - 
			+m.info.lastUpdate
		);
		
		var daysSince = Math.floor(+sinceUpdate / 8.64e7);
		
		var updateCounter = [
			String(sinceUpdate.getHours()+(daysSince*24)).pad(),
			String(sinceUpdate.getMinutes()).pad(),
			String(sinceUpdate.getSeconds()).pad()
		];
		
		var opacity = (1-(+sinceUpdate / 1.2e6)).clamp(1,.15);

		m.setOpacity(opacity);

        m.popup = new OpenLayers.Popup(null,
                   latlon,
                   new OpenLayers.Size(200,100),
                   $.trim((this.settings.admin) ? 
                   	m.name + ", " + updateCounter.join(":") : m.name),
                   true);
           
        m.popup.setBackgroundColor("rgba(0,0,0,.5)");
        m.popup.autoSize=true;
        this.map.addPopup(m.popup);

		l.addMarker(m);
	},
	updateMarker: function(marker, map, m){
		console.log( marker, m )

		var latlon = m.map.getLayerPxFromLonLat( 
			new OpenLayers.LonLat( 
				parseFloat(marker.long), 
				parseFloat(marker.lat)
			).transform(
		        new OpenLayers.Projection("EPSG:4326"), 
		        this.map.getProjectionObject()
      		) 
		);
		m.popup.moveTo(latlon);
		m.moveTo(latlon);
		
		m.setUrl(this.icons[marker.unit_type].url);
		m.info = marker;			
	},
	removeMarker: function(marker, map){
		var m = this.getMarkerByName(marker.unit_name, map);
		if( m ) {
			m.popup.destroy();
			m.destroy();
		}
	},

	//Helper functions
	getObjectByKey: function(container, key, val){
		var obj = container
			.map(function(o){ 
				return o.hasOwnProperty(key) ? 
					o[key] === val ? o : false : false; 
			}).filter(function(b){ return b });
		return obj.length? obj[0] : false;
	},
	getLayerByName: function(name){
		return this.getObjectByKey(this.map.layers, "name", name);
	},
	getMarkerById: function(id, layer){
		var l = this.getLayerByName(layer);
		return !l? false : this.getObjectByKey(l.markers, "id", id);		
	},
	getMarkerByName: function(name, layer){
		var l = this.getLayerByName(layer);
		return !l? false : this.getObjectByKey(l.markers, "name", name);		
	},	
	
	//API calls
	jsonp: new OpenLayers.Protocol.Script(),
	scan: function(){
		var self = this;

		scanAni();
		this.jsonp.createRequest(
		this.API.device.URI, 
		{f: self.settings.f || "n", v: self.settings.v || "n", t: self.settings.t || "a"}, 
		function(data){ 
			self.updateMarkers(data);
			if(typeof loadTimeLine != "undefined" && self.settings.tl && !self.timeline){ 
				self.timeline = loadTimeLine()
			}
			scanAni();
		});
	},
	pinpoint: function(){
		var self = this;
		this.jsonp.createRequest(
		this.API.device.URI, 
		{f: "a", v: "a", t: "a"}, 
		function(data){ 
			self.updateMarkers(data);
		});
	}, 	
	relations: function(){
		var self = this;
		this.jsonp.createRequest(
		this.API.relations.URI, 
		{identifier: this.settings.user}, 
		function(data){ 
			//self.relations = data;
			//console.log("Icebreaker.relations Not Implemented", data);
		});
	},
	updateMarkers: function(markers){
		var self = this;
		self.markers = markers;		
		var l = ib.getLayerByName("juliett")
		if(l.markers){
			l.markers.forEach(function(n){ self.map.removePopup(n.popup); });
			l.clearMarkers();
		}

		markers.forEach(function(n,i){	
			n.unit_type = parseInt(n.unit_type, 10);	
			self.upsertMarker(n,"juliett");
		});
	}
}




