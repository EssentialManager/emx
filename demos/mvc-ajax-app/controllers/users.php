<?php

    #########################################################################################################
    #
    #   USERS CONTROLLER
    #
    #########################################################################################################

	final class Users extends Emx\Mvc\Controller {

		public function Index( $ControllerFeedback ) {

			return $ControllerFeedback;

		}

		public function SignUp( $ControllerFeedback ) {
			$ControllerFeedback->SetContent($this->FetchView('signup'));

			return $ControllerFeedback;

		}

		public function BogusProfile( $ControllerFeedback ) {

			$UserData 			= $this->FetchModel('userdata');

			$ControllerFeedback->AddModel('UserData', $UserData->GetBogusUserData());
			$ControllerFeedback->SetContent($this->FetchView('profile'));

			return $ControllerFeedback;

		}

	}

    /* ======================================================================================================
       Copyright © . All Rights Reserved.
    ====================================================================================================== */

?>
