<?php

    #########################################################################################################
    #
    #   EMX Framework
	#
	# 	Developed by Essential Manager (www.essential-manager.com)
    #
    #########################################################################################################

    namespace Emx {

   	    /* ======================================================================================================
   	       BASIC EMX INTERFACE
   	    ====================================================================================================== */

   	    interface EmxBasic {

   	    	// The VERSION constant is used primarily to check against the client-side
	    	// JavaScript to avoid conflicting versions.

	    	const VERSION 		= '1.0.2';

   	    }

        function Version() {
            return '1.0.2';
        }

   	    /* ======================================================================================================
   	       EXCEPTION
   	    ====================================================================================================== */

   	    final class Exception extends \Exception {

   	    	// For now this is a placeholder in case we should need it later on for our own purposes

   	    	public function __construct( $Message ) {

   	    		throw new \Exception( $Message );

   	    	}

   	    }

   	    /* ======================================================================================================
   	       DEBUG

   	       Call this function to send debuggin messages to the client-side (JavaScript)
   	       Unless replaced by a custom made function these messages are shown in the browser console
   	       It is an easy way to debug your PHP in AJAX environment
   	    ====================================================================================================== */

   	    function Debug( $Message ) {

            $CustomDebugFunction    = Options::Get('Debug');
            $DebugMode              = Options::Get('DebugMode');

            if ( $DebugMode ) {
                if ( is_callable($CustomDebugFunction) ) {
                    $CustomDebugFunction($Message);
                } else {
                    throw new Exception('Debug: ' . $Message);
                }
            }

   	    }

        /* ======================================================================================================
           START
        ====================================================================================================== */

        function Start( $Callback = null ) {

            // Create the directories we use through-out the framework as constant so they cannot
            // be overwritten
            define('EMX_BASE_DIR', rtrim(realpath(__DIR__), '/'));
            define('EMX_PHP_DIR', EMX_BASE_DIR . '/php');

            // Set the location to the MVC part of the framework
            $MVCLocation        = sprintf('%s/libs/emx-mvc.php', EMX_PHP_DIR);

            // If the MVC file exists and MVC is enabled in the options we load the framework
            if ( file_exists($MVCLocation) && Options::Get('MVC') ) {
                require_once    $MVCLocation;
            }

            // If the passed callback is a valid callable function we execute it
            if ( is_callable($Callback) ) {
                $Callback();
            }

        }

        /* ======================================================================================================
           OPTIONS
        ====================================================================================================== */

        final class Options {

            private static $_Config     = array(
                                            'MVC'       => true
                                        );

            public static function Get( $Key = null ) {
                if ( is_null($Key) || ! $Key ) {
                    return self::$_Config;
                } else {
                    return self::$_Config[(string) $Key];
                }
            }

            public static function Set( $Key, $Value = null ) {
                if ( is_array($Key) ) {
                    foreach ( $Key as $I => $X ) {
                        self::$_Config[(string) $I]     = $X;
                    }
                } else {
                    self::$_Config[(string) $Key]       = $Value;
                }
            }

        }

        /* ======================================================================================================
           OPTIONS CLASS
        ====================================================================================================== */

        final class StandardClassOptions {

            private $_Options       = array();

            public function Get( $Key ) {
                return $this->_Options[(string) $Key];
            }

            public function Set( $Key, $Value = null ) {
                if ( is_array($Key) ) {
                    foreach ( $Key as $I => $X ) {
                        $this->_Options[(string) $I]    = $X;
                    }
                } else {
                    $this->_Options[(string) $Key]      = $Value;
                }
            }

        }

   	    /* ======================================================================================================
   	       ABSTRACT EMX OBJECT CLASS
   	    ====================================================================================================== */

   	    abstract class StandardClass implements EmxBasic {

            /* ------------------------------------------------------------------------------------------------------
               DECLARATIONS
            ------------------------------------------------------------------------------------------------------ */

            protected $Instances    = array();

            protected $Options;

   	        /* ------------------------------------------------------------------------------------------------------
   	           ABSTRACT FUNCTIONS
   	        ------------------------------------------------------------------------------------------------------ */

   	        abstract protected function CreateDependencyModel( $DependencyModel );

   	        /* ------------------------------------------------------------------------------------------------------
   	           GET DEPENDENCIES

   	           We want to keep CreateDependencyModel as isolated as possible, so instead we have build a
   	           streamlined function ot return the dependency models to the factory
   	        ------------------------------------------------------------------------------------------------------ */

   	        final public function GetDependencies() {

   	        	return $this->CreateDependencyModel( new DependencyModel );

   	        }

            /* ------------------------------------------------------------------------------------------------------
               SET OPTIONS
            ------------------------------------------------------------------------------------------------------ */

            final public function SetOptions( $Options ) {

                $this->Options      = $Options;

                $this->Options()->Set($this->_DefaultOptions);

            }

            /* ------------------------------------------------------------------------------------------------------
               OPTIONS

               Access the options supplied to this object
            ------------------------------------------------------------------------------------------------------ */

            final public function Options() {

                return $this->Options;

            }

            /* ------------------------------------------------------------------------------------------------------
               SET INSTANCE

               This method is only intended to be called by the factory
            ------------------------------------------------------------------------------------------------------ */

            final public function SetInstance( $InstanceId, $Instance ) {

                if ( is_object($Instance) ) {
                    $this->Instances[(string) $InstanceId]  = $Instance;
                }

            }

            /* ------------------------------------------------------------------------------------------------------
               READ DEPENDENCY INJECTED INSTANCE
            ------------------------------------------------------------------------------------------------------ */

            final public function With( $InstanceId ) {

                return $this->Instances[(string) $InstanceId];

            }

   	        /* ------------------------------------------------------------------------------------------------------
   	           VERSION
   	        ------------------------------------------------------------------------------------------------------ */

   	    	final public function Version() {

   	    		return (string) self::VERSION;

   	    	}

   	    }

   	    /* ======================================================================================================
   	       DEPENDENCY MODEL

   	       The Dependency Model object is expected to be returned by the SetDependencies method of all
   	       classes created by the factory in the EMX framework.
   	    ====================================================================================================== */

   	    final class DependencyModel {

   	        /* ------------------------------------------------------------------------------------------------------
   	           DECLARATIONS
   	        ------------------------------------------------------------------------------------------------------ */

   	    	private $RequiredInstances     = array();

   	   	    /* ------------------------------------------------------------------------------------------------------
   	   	       REQUIRE INSTANCE OF

   	   	       Instruct the Factory to inject the instance named by the argument $InstanceId
   	   	    ------------------------------------------------------------------------------------------------------ */

   	    	public function RequireInstanceOf( $InstanceId ) {

   	    		// Add the instance to the array of required instances

   	    		$this->RequiredInstances[$InstanceId] 	= array(

   	    													// We can add options here should we once day want to do
   	    			
   	    												);

   	    	}

   	        /* ------------------------------------------------------------------------------------------------------
   	           GET REQUIREMENTS

   	           List all the requirements currently listed
   	           This method is typically called by the factory when the object is created
   	        ------------------------------------------------------------------------------------------------------ */

   	    	public function GetRequirements() {

   	    		return $this->RequiredInstances;

   	    	}

   	    }

   	    /* ======================================================================================================
   	       FACTORY
   	    ====================================================================================================== */

   	   	final class Factory {

            /* ------------------------------------------------------------------------------------------------------
               DECLARATIONS
            ------------------------------------------------------------------------------------------------------ */

            private static $Instances;

            /* ------------------------------------------------------------------------------------------------------
               SET INSTANCE
            ------------------------------------------------------------------------------------------------------ */

            public static function SetInstance( $InstanceId, $Instance ) {

                // Verify that the Instance ID matches against our naming convention
                
                if ( ! preg_match('/^[A-Z]([a-zA-Z]+){2,31}$/', $InstanceId) ) {
                    throw new Exception('Instance IDs must be English 3 to 32 English letters.');
                }

                // If the passed instance is an object we insert it to the stack of instances that
                // objects can require

                if ( is_object($Instance) ) {
                    self::$Instances[$InstanceId]   = $Instance;
                }

            }

            /* ------------------------------------------------------------------------------------------------------
               GET INSTANCE
            ------------------------------------------------------------------------------------------------------ */

            private static function GetInstance( $InstanceId ) {

                return self::$Instances[(string) $InstanceId];

            }

   	   	    /* ------------------------------------------------------------------------------------------------------
   	   	       CREATE
   	   	    ------------------------------------------------------------------------------------------------------ */

   	    	public static function Create( $ClassName ) {

                // Check if the class exists. First as a plain class and since as part of the Emx namespace
   	    		$ParsedClassName 	= ( class_exists($ClassName) ) ? $ClassName : sprintf('Emx\%s', $ClassName);

   	    		if ( class_exists($ParsedClassName) ) {

                    // Create an instance of the class
   	    			$Instance 			= new $ParsedClassName;

                    // Insert the options object
                    $Instance->SetOptions( new StandardClassOptions );

                    // Load a list of the dependencies the class demands
   	    			$Dependencies 		= $Instance->GetDependencies();

                    // Check if the returned list is in fact of the DependencyModel type
   	    			if ( strtolower(get_class($Dependencies)) !== 'emx\dependencymodel' ) {
   	    				Debug('Object returned by CreateDependencyModel must be of the DependencyModel type.');
   	    			}

                    // List the requirements (a function of the DependencyModel class)
                    $Requirements       = $Dependencies->GetRequirements();

                    // Iterate over the requirements
                    foreach ( $Requirements as $InstanceId => $RequirementOptions ) {

                        // Load the required instance info a separate variable
                        $RequiredInstance   = self::GetInstance($InstanceId);

                        // If the instance is an object ...
                        if ( is_object($RequiredInstance) ) {

                            // ... We inject it to the instance
                            $Instance->SetInstance($InstanceId, $RequiredInstance);

                        } else {

                            // ... Otherwise we show an error

                            Debug(sprintf('Object "%s" requested non-existing instance of "%s".', $ClassName, $InstanceId));

                        }

                    }

                    // Return the class with its injected dependencies
   	    			return $Instance;
   	    		}

                // Return null if the class was not found
   	    		return null;

   	    	}

   	    }

	    /* ==================================================================================================
	       AJAX
	    ================================================================================================== */

	    final class Ajax {

	        /* ------------------------------------------------------------------------------------------------------
	           DECLARATIONS
	        ------------------------------------------------------------------------------------------------------ */

	        private static $Response 		= array();
	        private static $ErrorState  	= false;
	        private static $ErrorMessage 	= null;

	        /* ------------------------------------------------------------------------------------------------------
	           CONSTRUCTOR
	        ------------------------------------------------------------------------------------------------------ */

	        private function __construct() { }

	        /* ------------------------------------------------------------------------------------------------------
	           SET RESPONSE

	           This response is returned and passed as JSON into the JavaScript callback procedure
	        ------------------------------------------------------------------------------------------------------ */

	        public static function SetResponse( array $Response ) {

	        	self::$Response 	= $Response;

	        }

	        /* ------------------------------------------------------------------------------------------------------
	           GET RESPONSE

	           Return the current response
	        ------------------------------------------------------------------------------------------------------ */

	        public static function GetResponse() {

	        	return self::$Response;

	        }

	        /* ------------------------------------------------------------------------------------------------------
	           STRAP ERROR HANDLER

	           Used to catch exceptions that are thrown outside Try/Catch constructs and in EMX AJAX context
	        ------------------------------------------------------------------------------------------------------ */

	        public static function StrapErrorHandler() {

	        	set_exception_handler(function( $Message ) {

	        		// Construct the JSON string - Due to the current scope we cannot use the $this
	        		// variable and the methods in the AJAX class

	        		$OutputString 		= json_encode(array(
	        								'Success' 	=> false,
	        								'Error' 	=> 'Please wrap the EMX script in a try/catch construct.',
	        								'Response' 	=> array()
	        							));


	        		// Use the Die method to make sure no other content is shown
	        		// More content will make the JSON unparsable for the client

	        		die ($OutputString);

	        	});

	        }

	        /* ------------------------------------------------------------------------------------------------------
	           TERMINATE

	           Terminate the AJAX procedure and return an error message to the client
	        ------------------------------------------------------------------------------------------------------ */

	    	public static function Terminate( $Message ) {

                // If output buffering was active we want to make sure it is not drawn to the document
                // since that will make the JSON response invalid
                
                ob_clean();

	    		self::$ErrorState 		= true;
	    		self::$ErrorMessage 	= (string) $Message;

	    		self::Execute();

	    	}

	        /* ------------------------------------------------------------------------------------------------------
	           EXECUTE
	        ------------------------------------------------------------------------------------------------------ */

	        public static function Execute() {

	        	echo json_encode(array(

	        		// The success is indicated by the reversed value of the ErrorState
	        		'Success' 	=> ! ( self::$ErrorState ),

	        		// Include the version number for comparison on the client-side
	        		'Version' 	=> Version(),

	        		// Include the response set the custom script which was executed
	        		'Response' 	=> ( ! self::$ErrorState ) ? self::GetResponse() : array(),

	        		// If an error message has been set by the Terminate method it will be included here
	        		'Error' 	=> ( self::$ErrorMessage ) ? self::$ErrorMessage : null

	        	));

	        	// End the script as the JSON has now been printed
	        	exit;

	        }

	    }

    }

    /* ======================================================================================================
       Copyright © Essential Manager. All Rights Reserved.
    ====================================================================================================== */

?>
