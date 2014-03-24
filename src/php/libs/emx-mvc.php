<?php

    #########################################################################################################
    #
    #   
    #
    #########################################################################################################

    /* ======================================================================================================
       Initialization
    ====================================================================================================== */

    namespace Emx\MVC {

        /* ======================================================================================================
           EXCEPTION CLASS
        ====================================================================================================== */

        final class Exception extends \Exception { }

        /* ======================================================================================================
           APPLICATION
        ====================================================================================================== */

    	final class Application extends \Emx\StandardClass {

            /* ------------------------------------------------------------------------------------------------------
               DECLARATIONS
            ------------------------------------------------------------------------------------------------------ */

            protected $_DefaultOptions  = array(

                                            // Enabling AJAX mode will write the output as JSON which can be
                                            // handled by the client. If AJAX mode is disabled the views will be
                                            // rendered directly

                                            'AjaxMode'                  => false,

                                            // Default locations for the controllers, models and views

                                            'ControllerBaseLocation'    => 'application/controllers/',
                                            'ModelBaseLocation'         => 'application/models/',
                                            'ViewBaseLocation'          => 'application/views/',

                                            // You can route all rendering through a common function to utilize
                                            // some popular libraries like LESS or SASS

                                            'Render'                    => null /* We cannot set a function here
                                                                            so we handle that in the constructor
                                                                         */

                                        );

            /* ------------------------------------------------------------------------------------------------------
               CONSTRUCTOR
            ------------------------------------------------------------------------------------------------------ */

    		public function __construct() {

                $this->_DefaultOptions['Render']    = function(  ) { 

                                                    };

            }

            /* ------------------------------------------------------------------------------------------------------
               CREATE DEPENDENCY MODEL
            ------------------------------------------------------------------------------------------------------ */

            protected function CreateDependencyModel( $DependencyModel ) {

                return $DependencyModel;

            }

            /* ------------------------------------------------------------------------------------------------------
               START
            ------------------------------------------------------------------------------------------------------ */

            public function Start() {

                $ControllerBaseLocation     = $this->Options()->Get('ControllerBaseLocation');
                $Controller                 = ( isset($_GET['EmxController']) ) ? (string) $_GET['EmxController'] : 'Home';
                $ControllerLocation         = sprintf('%s/%s.php', rtrim($ControllerBaseLocation, '/'), strtolower($Controller));

                $Method                     = ( isset($_GET['EmxMethod']) ) ? (string) $_GET['EmxMethod'] : '';

                try {

                    // We start off by making sure that the file containing the controller exists in the desired
                    // location

                    if ( ! file_exists($ControllerLocation) ) {
                        throw new Exception(sprintf('Controller "%s" was not found.', $ControllerLocation));
                    }

                    // Load the file we assume to contain the controller class

                    require_once            $ControllerLocation;

                    // And verify that the controller class exists

                    if ( ! class_exists($Controller) ) {
                        throw new Exception(sprintf('No class named "%s".', $Controller));
                    }

                    // We would also like to make sure that the controller is a child class of the
                    // abstract MVC controller class

                    if ( strtolower(get_parent_class($Controller)) != 'emx\mvc\controller' ) {
                        throw new Exception(sprintf('Controller "%s" must be extending Emx\Mvc\Controller.', $Controller));
                    }

                    // Instantiate an instance of the controller class

                    $ControllerInstance     = new $Controller;

                    // If the attempted method does not exist in the controller we default to Index

                    if ( ! method_exists($ControllerInstance, $Method) ) {
                        $Method             = 'Index';
                    }

                    $ControllerInstance->$Method();

                } catch ( Exception $e ) {

                    // Send a debugging message to the developer
                    \Emx\Debug($e->getMessage());

                }

            }

    	}

        /* ======================================================================================================
           CONTROLLER
        ====================================================================================================== */

        abstract class Controller {

            /* ------------------------------------------------------------------------------------------------------
               DECLARATIONS
            ------------------------------------------------------------------------------------------------------ */

            abstract public function Index();

            /* ------------------------------------------------------------------------------------------------------
               RENDER VIEW
            ------------------------------------------------------------------------------------------------------ */

            final public function Render( $View ) {



            }

        }

    }

    /* ======================================================================================================
       Developed by Essential Manager
    ====================================================================================================== */

?>
