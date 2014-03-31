( function() {

	Emx.Options.Set({
		DebugMode: true,
		EMXLocation: 'http://rma.nu/admin/controlpanel/application/emx/',
		AjaxLocation: 'ajax.php'
	});

	Emx.Start(function() {

		$('[data-controller]').click(function() {
			Emx.MVCHook.Request(String($(this).data('controller')), String($(this).data('method')));
		});

		Emx.MVCHook.SetViewport(document.getElementById('EmxViewport'));
		Emx.MVCHook.Request('Home', 'Index');

		Emx.MVCHook.Bind({
			Controller: 'home',
			Method: 'gettime'
		}, {
			Success: function( Response ) {
				alert('Server time: ' + Response.Data.SendTime);
			}
		});

	});

} )();
