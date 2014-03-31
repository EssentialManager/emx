<?php

	class Home extends Emx\Mvc\Controller {

		public function Index( $ControllerFeedback ) {

			$ControllerFeedback->SetContent('Welcome to my MVC driven AJAX website.');

			return $ControllerFeedback;

		}

		public function GetTime( $ControllerFeedback ) {

			$ControllerFeedback->SetData(array(
				'SendTime' 		=> date('H:i')
			));

			return $ControllerFeedback;

		}

	}

?>
