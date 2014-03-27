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
           NAMESPACE USAGES
        ====================================================================================================== */

        use \Emx\Exception as Exception;
        use \Emx\StandardClass as StandardClass;

        /* ======================================================================================================
           APPLICATION
        ====================================================================================================== */

    	final class Application extends StandardClass {

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
                                                                         */,

                                            'ViewExtension'             => 'html'

                                        );

            /* ------------------------------------------------------------------------------------------------------
               CONSTRUCTOR
            ------------------------------------------------------------------------------------------------------ */

    		public function __construct() { }

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

                    $ControllerInstance     = \Emx\Factory::Create($Controller);

                    $ControllerInstance->Options()->Set('ModelBaseLocation', $this->Options()->Get('ModelBaseLocation'));
                    $ControllerInstance->Options()->Set('ViewBaseLocation', $this->Options()->Get('ViewBaseLocation'));
                    $ControllerInstance->Options()->Set('ViewExtension', $this->Options()->Get('ViewExtension'));

                    // If the attempted method does not exist in the controller we default to Index

                    if ( ! method_exists($ControllerInstance, $Method) ) {

                        // All controllers are required to have a method named Index, so we can safely
                        // make a fallback to that

                        $Method             = 'Index';

                    }

                    if ( $this->Options()->Get('AjaxMode') ) {

                        if ( ! ini_get('output_buffering') ) {
                            throw new Exception('Output buffering is not enabled.');
                        }

                        // We start the output buffer to collect eventual content emitted by the controller

                        ob_start();

                        $ControllerFeedback     = $ControllerInstance->$Method( new ControllerFeedback );
                        
                        ob_clean();

                        if ( strtolower(get_class($ControllerFeedback)) !== 'emx\mvc\controllerfeedback' ) {
                            throw new Exception(sprintf('Controller "%s" method "%s" must return passed instance of ControllerFeedback', $Controller, $Method));
                        }

                        $ControllerFeedback->RenderContentUsing($this->Options()->Get('Render'));

                        return $ControllerFeedback->GetResponse();

                    } else {
                        $ControllerInstance->$Method();
                    }

                } catch ( Exception $e ) {

                    // If Ajax Mode is active we run the caught error through the native
                    // native termination method

                    if ( $this->Options->Get('AjaxMode') ) {
                        \Emx\Ajax::Terminate($e->getMessage());
                    } else {
                        \Emx\Debug($e->getMessage());
                    }

                }

            }

    	}

        /* ======================================================================================================
           CONTROLLER FEEDBACK
        ====================================================================================================== */

        final class ControllerFeedback {

            /* ------------------------------------------------------------------------------------------------------
               DECLARATIONS
            ------------------------------------------------------------------------------------------------------ */

            private $Content, $Data, $Models;

            /* ------------------------------------------------------------------------------------------------------
               GET RESPONSE
            ------------------------------------------------------------------------------------------------------ */

            public function GetResponse() {

                return array(
                    // We do not typecast the View because null will indicate to the MVC Hook that we are not
                    // intending to modify the viewport

                    'View'      => $this->Content,

                    'Data'      => (array) $this->Data
                );

            }

            /* ------------------------------------------------------------------------------------------------------
               RENDER CONTENT USING
            ------------------------------------------------------------------------------------------------------ */

            public function RenderContentUsing( $Function ) {

                if ( ! is_null($this->Content) && is_callable($Function) ) {
                    $this->Content  = $Function($this->Content, $this->GetModels());
                }

            }

            /* ------------------------------------------------------------------------------------------------------
               CLEAR DATA
            ------------------------------------------------------------------------------------------------------ */

            public function ClearData() {

                $this->Data         = array();

            }

            /* ------------------------------------------------------------------------------------------------------
               SET DATA
            ------------------------------------------------------------------------------------------------------ */

            public function SetData(array $Data = array()) {

                foreach ( $Data as $Key => $Value ) {
                    $this->Data[$Key]   = $Value;
                }

            }

            /* ------------------------------------------------------------------------------------------------------
               ADD MODEL
            ------------------------------------------------------------------------------------------------------ */

            public function AddModel( $EntryId, array $ModelData = array(), $PassToBrowser = false ) {

                $this->Models[(string) $EntryId]    = $ModelData;

                if ( $PassToBrowser ) {
                    $this->Data[$EntryId]           = $ModelData;
                }

            }

            /* ------------------------------------------------------------------------------------------------------
               GET MODELS
            ------------------------------------------------------------------------------------------------------ */

            public function GetModels() {

                return $this->Models;

            }

            /* ------------------------------------------------------------------------------------------------------
               SET CONTENT / VIEW
            ------------------------------------------------------------------------------------------------------ */

            public function SetContent( $Text ) {

                $this->Content      = (string) $Text;

            }

        }

        /* ======================================================================================================
           CONTROLLER
        ====================================================================================================== */

        abstract class Controller extends \Emx\StandardClass {

            /* ------------------------------------------------------------------------------------------------------
               DECLARATIONS
            ------------------------------------------------------------------------------------------------------ */

            abstract public function Index( $ControllerFeedback );

            /* ------------------------------------------------------------------------------------------------------
               CREATE DEPENDENCY MODEL
            ------------------------------------------------------------------------------------------------------ */

            protected function CreateDependencyModel( $DependencyModel ) {
                return $DependencyModel;
            }

            /* ------------------------------------------------------------------------------------------------------
               FETCH MODEL
            ------------------------------------------------------------------------------------------------------ */

            final protected function FetchModel( $Model ) {

                // Write the location to where the model is expected to be
                $ModelLocation      = rtrim($this->Options()->Get('ModelBaseLocation'), '/')
                                        . sprintf('/%s.php', strtolower($Model));

                try {

                    // Check that the file exists
                    if ( ! file_exists($ModelLocation) ) {
                        throw new Exception(sprintf('File containing model "%s" was not found at "%s".', $Model, $ModelLocation));
                    }

                    // Load the model to the script
                    require_once        $ModelLocation;

                    // Verify that the model class exists
                    if ( ! class_exists($Model) ) {
                        throw new Exception(sprintf('Model "%s" does not exist.', $Model));
                    }

                    // Verify that the model is based on the abstract EMX MVC model class
                    if ( strtolower(get_parent_class($Model)) != 'emx\mvc\model' ) {
                        throw new Exception(sprintf('Model "%s" is not an extension of Emx\Mvc\Model.', $Model));
                    }

                    // Create the model via the factory (this also supports dependency injection)
                    $ModelInstance      = \Emx\Factory::Create($Model);

                    // Return the model
                    return $ModelInstance;

                } catch ( Exception $e ) {

                    // Show eventual debugging message
                    \Emx\Debug($e->getMessage());

                }

            }

            /* ------------------------------------------------------------------------------------------------------
               RENDER VIEW
            ------------------------------------------------------------------------------------------------------ */

            final public function FetchView( $View ) {

                $Extension          = (string) $this->Options()->Get('ViewExtension');

                if ( ! $Extension ) {
                    $Extension      = 'html';
                }

                // Define the location to the view

                $ViewLocation       = rtrim($this->Options()->Get('ViewBaseLocation'), '/')
                                        . sprintf('/%s.%s', strtolower($View), $Extension);

                try {

                    // Verify that the file exists

                    if ( ! file_exists($ViewLocation) ) {
                        throw new Exception(sprintf('View "%s" was not found at "%s"', $View, $ViewLocation));
                    }

                    return (string) file_get_contents($ViewLocation);

                } catch ( Exception $e ) {

                    // Show eventual debugging message
                    \Emx\Debug($e->getMessage());

                }

            }

        }

        /* ======================================================================================================
           MODEL
        ====================================================================================================== */

        abstract class Model extends \Emx\StandardClass {

            protected function CreateDependencyModel( $DependencyModel ) {
                return $DependencyModel;
            }

        }

    }

    /* ======================================================================================================
       Developed by Essential Manager
    ====================================================================================================== */

?>
