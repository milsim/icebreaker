<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Postmortem | ICEBREAKER</title>

        <!-- Our customizations to the theme -->
        <link rel="stylesheet" href="assets/css/styles.css" />
        
        <!-- Google Fonts -->
        <link rel="stylesheet" href="http://fonts.googleapis.com/css?family=Press+Start+2P|Squada+One" />
        
        <!--[if lt IE 9]>
          <script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
        <![endif]-->
    </head>
    
    <body>

	    <div id="timeline-embed"></div>
	    <script type="text/javascript">
	        var timeline_config = {
	            width:              '100%',
	            height:             '600',
	            source:             'data.json',
	            embed_id:           'timeline-embed',               //OPTIONAL USE A DIFFERENT DIV ID FOR EMBED
	            start_at_end:       false,                          //OPTIONAL START AT LATEST DATE
	            start_at_slide:     '0',                            //OPTIONAL START AT SPECIFIC SLIDE
	            start_zoom_adjust:  '0',                            //OPTIONAL TWEAK THE DEFAULT ZOOM LEVEL
	            hash_bookmark:      true,                           //OPTIONAL LOCATION BAR HASHES
	            font:               'Bevan-PotanoSans',             //OPTIONAL FONT
	            debug:              true,                           //OPTIONAL DEBUG TO CONSOLE
	            lang:               'en',                           //OPTIONAL LANGUAGE
	            maptype:            'sterrain',                   //OPTIONAL MAP STYLE
	            css:                'assets/css/timeline.css',     //OPTIONAL PATH TO CSS
	            js:                 'assets/js/timeline.js'    //OPTIONAL PATH TO JS
	        }
	    </script>
	    <script type="text/javascript" src="assets/js/storyjs-embed.js"></script>
	    
    </body>
</html>