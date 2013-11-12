<div class="menu cf">
	<a href="?page=operation" id="menu_briefing"<?=$page==='operation'?' class="active"':'';?>>Operation</a>
	<a href="?page=messages" id="menu_messages"<?=$page==='messages'?' class="active"':'';?>>Messages</a>
	<a href="?page=intel" id="menu_intel"<?=$page==='intel'?' class="active"':'';?>>Intel</a>
	<a href="?page=map"<?=$page==='map'?' class="active"':'';?>>Map</a>
	<a href="?page=roster"<?=$page==='roster'?' class="active"':'';?>>Roster</a>
	<a href="?page=files"<?=$page==='files'?' class="active"':'';?>>Files</a>
	<a href="?page=logout">Sign off</a>

	<div id="meta">
        <div class="logged_in_name"><?=$_SESSION["name"];?></div>
        <div id="curtime"><?=date('Y-m-d H:i:s');?></div>
    </div>
</div>
