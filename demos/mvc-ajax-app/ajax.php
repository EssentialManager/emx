<?php

	require_once 	'../../src/emx.php';

	try {

		Emx\Options::Set(array(
			'DebugMode' 	=> true
		));

		Emx\Start(function() {

			$Application 	= Emx\Factory::Create('Mvc\Application');

			$Application->Options()->Set(array(
				'ControllerBaseLocation' 	=> 'controllers/',
				'ViewBaseLocation' 			=> 'views/',
				'ModelBaseLocation' 		=> 'models/',
				'ViewExtension'				=> 'html',
				'Render' 					=> function( $View, $Models ) {
												$Output 		= $View;

												foreach ( $Models as $I => $Model ) {
													foreach ( $Model as $Key => $Value ) {
														$Output 	= str_ireplace(sprintf('{{ %s }}', $Key), $Value, $Output);
													}
												}

												return $Output;
											}
			));

			Emx\Ajax::SetResponse($Application->Start());
			Emx\Ajax::Execute();

		});

	} catch ( Exception $e ) {
		Emx\Ajax::Terminate($e->getMessage());
	}

?>
