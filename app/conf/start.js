// ===========================================
// -- This function is called on start

app.start = function () {
	// update user name
	w2ui.app_toolbar.set('user', { 
		caption : app.core.user.fname + ' ' + app.core.user.lname 
	});
	// load first module
	app.load('home');
	
	// open welcome screen
	// setTimeout(function () {
	// 	$().w2popup({
	// 		title	: 'Welcome',
	// 		body	: '<div style="padding: 70px 10px 10px 10px; text-align: center; font-family: \'Helvetica Neue\', Helvetica">'+
	// 				  '		<span style="font-family: inherit; font-size: 48px; font-weight: bold; color: #555; letter-spacing: -1px; text-shadow: 2px 2px 6px #f5f5f5">KickStart</span>'+
	// 				  '		<span style="font-family: inherit; font-size: 20px; color: #666; text-shadow: 2px 2px 1px #f5f5f5; line-height: 160%; margin-top: 50px; display: block;">'+
	// 				  '			Powerful Front-End Framework for Faster and Easier Developement of Desktop-Like SPAs'+
	// 				  '		</span>'+
	// 				  '</div>',
	// 		buttons	: '<input type="button" value="Ok" style="width: 60px" onclick="$().w2popup(\'close\');">',
	// 		width	: 600,
	// 		height	: 420
	// 	});
	// }, 500);
}