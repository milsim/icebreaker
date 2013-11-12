$(document).ready(function() {
	// REMOVE THIS CODE BEFORE LAUNCH
/*	var demo = setInterval(function() {
		$.get("demo.php");
	},10000);
*/

	    $("#uploader").pluploadQueue({
	        // General settings
	        runtimes : 'html5',
	        url : 'assets/plupload/upload.php',
	        max_file_size : '45mb',
	        chunk_size : '45mb',
	        unique_names : true,

	        // Resize images on clientside if we can
	        resize : {width : 2560, height : 2048, quality : 75},

	        // Specify what files to browse for
	        filters : [
	            {title : "Image files", extensions : "jpeg,jpg,gif,png"},
	            {title : "Zip files", extensions : "zip"}
	        ],

		init : {
			FileUploaded: function(up,file,info) {
			    $("#results").append(file.name + " uploaded<br>");
			}
		},

	        // Flash settings
	        flash_swf_url : 'assets/plupload/js/plupload.flash.swf',

	        // Silverlight settings
	        silverlight_xap_url : 'assets/plupload/js/plupload.silverlight.xap'
	    });

	    // Client side form validation
	    $('form').submit(function(e) {
	        var uploader = $('#uploader').pluploadQueue();

	        // Files in queue upload them first
	        if (uploader.files.length > 0) {
	            // When all files are uploaded submit form
	            uploader.bind('StateChanged', function() {
	                if (uploader.files.length === (uploader.total.uploaded + uploader.total.failed)) {
	                    $('form')[0].submit();
	                }
	            });

	            uploader.start();
	        } else {
	            alert('You must queue at least one file.');
	        }

	        return false;
	    });


	var timer = setInterval(function() {
		var d = new Date();
		var year = d.getFullYear();
		var month = d.getMonth();
		var day = d.getDate();
		var hour = d.getHours();
		var minute = d.getMinutes();
		var second = d.getSeconds();

		if (month.toString().length <2) {
			month = "0"+month;
		}
		if (hour.toString().length <2) {
			hour = "0"+hour;
		}
		if (day.toString().length <2) {
			day = "0"+day;
		}
		if (minute.toString().length <2) {
			minute = "0"+minute;
		}
		if (second.toString().length <2) {
			second = "0"+second;
		}
		var t = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
		$("#curtime").html(t);
	},1000);

	var notifyTimer = setInterval(function() {
		check_notify();
	},45000);

function check_notify() {
		$.getJSON("check_notify.php", function(json) {
			if (json.messages==1) {
				$("#menu_messages").addClass("menu_notify blinker");
			} else {
				$("#menu_messages").removeClass("menu_notify blinker");
			}
			if (json.briefing==1) {
				$("#menu_briefing").addClass("menu_notify blinker");
			} else {
				$("#menu_briefing").removeClass("menu_notify blinker");
			}
			if (json.intel==1) {
				$("#menu_intel").addClass("menu_notify blinker");
			} else {
				$("#menu_intel").removeClass("menu_notify blinker");
			}
		});
}

check_notify();

});
