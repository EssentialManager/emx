
	/* ######################################################################################################
    #
    #   EMX (Essential Manager X)
    #	Framework for JavaScript and PHP
    # 	Version 1.0.0
    #
    #   Developed By: Mark Hünermund Jensen
    #   www.hunermund.dk
    #	emx@hunermund.dk
    #
    #	Documentation: https://essential-manager.com/emx/
    #
    ###################################################################################################### */

    /* ======================================================================================================
       TO-DO'S
    ====================================================================================================== 

	# TODO: Version matching between PHP and JavaScript files
	# TODO: Make a cool TODO feature in JS

	Must be called via console: Emx.Todos();

	Making a passive debug mode? Stack of message must be called via console

    ======================================================================================================
        DEFINITION
    ====================================================================================================== */

	var Emx = ( function( window, undefined ) {

		var Scope = {

		    /* ======================================================================================================
		       VERSION (Emx.Version)

		       Returns the current version of the JavaScript (client) side of the framework.
		       This is typically used to notice inconsistence between the server and client side when
		       Start() is called.
		    ====================================================================================================== */

			Version: function() {

				return '1.0.0';

			},

	    	/* ======================================================================================================
		       OPTIONS (Scope.Options)

		       Get and set the options related to the core functionality of EMX
		    ====================================================================================================== */

		    Options: {

		        /* --------------------------------------------------------------------------------------------------
		           DECLARATIONS
		        -------------------------------------------------------------------------------------------------- */

		    	// The set of default options are as follows:

	    		_Config: {

	    			// Debug mode determines if debugging related error messages are shown or ignored
	    			DebugMode: false,

	    			// The debug method can be replaced to show/log debugging related error messages in a different
	    			// manner than to the browser console.
	    			Debug: function( Message ) {
	    				console.log('EMX: ' + Message);
	    			},

	    			// To prevent the automatic detection (and eventual load) of jQuery set this value to false.
	    			// Important: If jQuery is not loaded before taking EMX into use the library may fail in
	    			// several areas.

	    			// Another way to prevent the auto-loading of jQuery is to have loaded jQuery manually
	    			// in your code before calling the Start() function.
	    			AutoLoadJQuery: true,

	    			// The link to the jQuery library which will be loaded if not already done
	    			JQueryLocation: '//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js',

	    			// The default Ajax location can be used to streamline the access point of all AJAX calls.
	    			// It is typically used when no URL is supplied in AJAX calls
	    			AjaxLocation: 'ajax/',

	    			// By enabling StrictAjax any response from the server must contain a success key which
	    			// indicates if the script was succesful. If strict AJAX is enabled and success is not
	    			// returned a debug message is shown.
	    			StrictAjax: true,

	    			// Choose if the AJAX calls should automatically show the Loading message
	    			AjaxShowLoader: true,

	    			// If EMX is not located in the folder "emx" of the project root, this variable will
	    			// point to the correct location
	    			EMXLocation: '',

	    			// Disable or enable the MVC part of the framework
	    			MVC: true,

	    			// The default messages used in various cases in the Messages extension
	    			DefaultLoadingMessage: 'Loading',
	    			DefaultSuccessMessage: 'Success!',

	    			// The default function for showing messages in the native Messages extension
	    			Message: function( Message, Type ) {
	    				var Body 				= document.body || document.getElementsByTagName('body')[0] || document.documentElement;
	    				var MessageContainer 	= document.getElementById('EmxMessageContainer');

	    				if ( ! MessageContainer ) {
	    					MessageContainer 		= document.createElement('div');
	    					MessageContainer.id 	= 'EmxMessageContainer';

	    					Body.appendChild(MessageContainer);
	    				}

	    				MessageContainer.style.visibility 	= 'block';
	    				MessageContainer.style.position 	= 'fixed';
	    				MessageContainer.style.top 			= '10px';
	    				MessageContainer.style.right 		= '10px';
	    				MessageContainer.style.fontSize		= '13px';
	    				MessageContainer.style.fontWeight	= 'bold';

	    				MessageContainer.innerHTML 			= Message;
	    			},

	    			// The default function for hiding messages created by the native Messages extension
	    			HideMessage: function() {
	    				var MessageContainer 	= document.getElementById('EmxMessageContainer');

	    				MessageContainer.style.visibility 	= 'hidden';
	    			}

	    		},

		        /* --------------------------------------------------------------------------------------------------
		           GET OPTION (Scope.Options.Get)
		        -------------------------------------------------------------------------------------------------- */

	    		Get: function( Key ) {

	    			// If a specific key is provided we return only the requested value,
	    			// otherwise the entire options object is returned.
	    			
	    			return ( ! Key || Key === undefined ) ? this._Config : this._Config[Key];

	    		},

		        /* --------------------------------------------------------------------------------------------------
		           SET OPTION (Scope.Options.Set)
		        -------------------------------------------------------------------------------------------------- */

	    		Set: function( Key, Value ) {

	    			// If the Key argument is a string we assume the user requests to change or set
	    			// only one value in the configuration object.

	    			if ( typeof Key == 'string' ) {
	    				this._Config[Key] 		= Value;

	    			// However, if the user passes an object we assume several values are passed for change.
	    			} else if ( typeof Key == 'object' ) {

	    				// We cannot simply replace the object as the user may only pass a subset of the configuration
	    				// object. So instead we loop over the passed pairs and update the configuration object
	    				// accordingly.
	    				for ( i in Key ) {
	    					this._Config[i] 	= Key[i];
	    				}

	    			}

	    		}

		    },

		    /* ======================================================================================================
		       CORE (Scope.Core)

		       Holds the basic features to load and initialize the EMX libraries
		    ====================================================================================================== */

		    Core: {

		        /* ------------------------------------------------------------------------------------------------------
		           DECLARATIONS
		        ------------------------------------------------------------------------------------------------------ */

		        // The stack of URLs already added to the document
		    	_Stack: {},

		        /* ------------------------------------------------------------------------------------------------------
		           LOAD LIBRARY (Scope.Core.Load)

		           Insert a JavaScript or CSS file to be executed. The "Urls" parameter can be either a string
		           with a single URL or an object with several URLs.

		           The Callback is executed when the last of the libraries have been loaded.
		        ------------------------------------------------------------------------------------------------------ */

	    		Load: function( Urls, Callback ) {

	    			try {

		    			// If the provided argument is a string we add it to an object to ease the furhter
		    			// processing.

		    			if ( typeof Urls === 'string' ) {
		    				Urls 		= [Urls];

		    			// If the object is not a string nor an object we will throw an error
		    			} else if ( typeof Urls != 'object' ) {
		    				throw Error('The "Urls" parameter must be either string or array/object of URLs.');
		    			}

		    			// Check if the header exists
		    			var Head 		= document.head || document.getElementsByTagName('head')[0] || document.documentElement;

		    			// Iterate over the provided URLs and prepare to insert them
		    			for ( i in Urls ) {

		    				// Prepare variables for readability in the further processing
		    				var Url 		= Urls[i];
		    				var Extension 	= Url.replace(/^(.*?)\.([a-z]+)$/, '$2');
		    				var Accept 		= true;

		    				// If the library is not already loaded
			    			if ( ! this.IsLoaded(Url) ) {

			    				// Switch through the accepted file extensions
			    				switch ( Extension ) {

			    					case 'js':

			    						// Insert a script tag to the document
			    						var Element		= document.createElement('script');

							            Element.src 	= Url;
						            	Element.async 	= false;

						            	// Add the element to the head tag
						            	Head.insertBefore(Element, Head.firstChild);

			    						break;

			    					case 'css':

			    						// Insert the link tag to the document
			    						var Element 	= document.createElement('link');

							            Element.href 	= Url;
							            Element.rel 	= 'stylesheet';
							            Element.type 	= 'text/css';
							            Element.media 	= 'screen';

							            // Append the link tag on the head element
							            Head.appendChild(Element);

			    						break;

			    					default:

			    						Accept 				= false;

			    						Scope.Debug('{Extension} is unfortunately not supported for dynamic loading.'.replace('{Extension}', Extension));

			    				} /* End of switch */

			    				// If the file has been accepted this is the shared post-processing after inserting the file
			    				if ( Accept ) {

			    					// List the URL in the stack and set its default "Loaded" property to false
			    					this._Stack[Url] 	= { Loaded: false };

			    					// Add an event listener to figure out when to execute the callback
			    					Element.addEventListener('load', function() {

			    						// We start by setting this library's "Loaded" property to true
			    						Scope.Core._Stack[Url].Loaded 	= true;

			    						// We will assume that all libraries are ready until proven otherwise
			    						var Ready 		= true;

			    						// Iterate over all of the requested URLs if they have completed loading
			    						// It is important that we use the provided stack as several stacks can be loading
			    						// simultaneously and we don't want them to interrupt each other.
			    						for ( i in Urls ) {
			    							if ( ! Scope.Core._Stack[Urls[i]].Loaded ) {
			    								// ... We were proven otherwise
			    								Ready 	= false;
			    							}
			    						}

			    						// If all libraries in the stack are loaded and the callback is a function
			    						// we will execute the callback
			    						if ( Ready && typeof Callback === 'function' ) {
			    							Callback();
			    						}

							        }, false);

			    				} /* End of clause to test if Accept is set */

			    			} /* End of clause to test if URL is not loaded */

			    		} /* End of loop that iterates over all URLs */

				    } catch ( Error ) {
				    	Scope.Debug(Error);
				    }

	    		},

	    	    /* ------------------------------------------------------------------------------------------------------
	    	       IS LOADED (Scope.Core.IsLoaded)
	    	    ------------------------------------------------------------------------------------------------------ */

	    	    IsLoaded: function( Url ) {

	    	    	// Load all script and link tags into arrays
	    	    	var Scripts 	= document.getElementsByTagName('script');
	    	    	var Links 		= document.getElementsByTagName('link');

	    	    	// Iterate over all script tags and compare they src attribute to the provided Url argument
	    	    	for ( x in Scripts ) {
	    	    		if ( Scripts[x].src == Url ) {
	    	    			return true;
	    	    		}
	    	    	}

	    	    	// And in the same manner we compare the link "href" attribute to the Url argument
	    	    	for ( x in Links ) {
	    	    		if ( Links[x].href == Url ) {
	    	    			return true;
	    	    		}
	    	    	}

	    	    	// If the resource is not loaded we will return false to indicate so
	    	    	return false;

	    	    },

	    	    /* ------------------------------------------------------------------------------------------------------
	    	       EXTEND (Scope.Core.Extend)
	    	    ------------------------------------------------------------------------------------------------------ */

		    	Extend: function( Name, Library ) {

		    		try {

		    			// First off, we validate that the name fit our syntax in this library
		    			if ( ! Name.match(/^[A-Z]([a-zA-Z]){2,23}$/) ) {
		    				throw Error('Library name must conists of 3 to 24 English letters. The first letter must be capitalized.');
		    			}

		    			// Then we ensure the passed library is actually a library
		    			if ( typeof Library != 'object' ) {
		    				throw Error('Provided library is not an object.');
		    			}

		    			// Validate if the library ios not already defined
		    			if ( typeof Scope[Name] != 'undefined' ) {
		    				throw Error('Library "{Name}" is already defined.'.replace('{Name}', Name));
		    			}

		    			// And finally we run a validation to ensure the naming conventions and architecture of the library passes
		    			for ( Attribute in Library ) {
		    				if ( ! Attribute.match(/^([A-Z]|_)([a-zA-Z]){3,23}$/) ) {
		    					throw Error('Library element "{Name}" does not meet naming convention.'.replace('{Name}', Attribute));
		    				}
		    			}

		    			// If all tests are passed we create the library
		    			Emx[Name] 		= Library;

		    			// Run the initialization procedure if defined
		    			if ( typeof Emx[Name].Initialize === 'function' ) {
		    				Emx[Name].Initialize();
		    			}

		    		} catch ( Error ) {
		    			Scope.Debug(Error);
		    		}

		    	}

		    },

		    /* ======================================================================================================
		       CREATE STANDARD CLASS

		       Insert the standard class properties and methods to the class
		    ====================================================================================================== */

		    InheritStandardClass: function( Class ) {

		    	// This object holds all the properties and methods we want to be in the StandardClass
		    	var StandardClass 	= Object.create({

		    							_Instances: {},

		    							GetDependencies: function() {

		    								return this._Instances;

		    							},

		    							SetInstance: function( InstanceId, Instance ) {
		    								
		    								if ( typeof Instance === 'object' ) {
		    									this._Instances[InstanceId] 	= Instance;
		    								}

		    							},

			    						With: function( InstanceId ) {

			    							if ( typeof this._Instances[InstanceId] === 'object' ) {
			    								return this._Instances[InstanceId];
			    							} else {
			    								Scope.Debug('Instance "{instance}" has not been properly injected.'.replace('{instance}', InstanceId));
			    							}

			    						}

			    					});

		    	// In order to not destroy the current prototype construction of the provided class we iterate
		    	// over each key in the StandardClass and insert it to the provided class

		    	for ( Key in StandardClass ) {

		    		// If they key already exists in the class we throw a warning to the developer
		    		if ( typeof Class.prototype[Key] != 'undefined' ) {
		    			this.Debug('The StandardClass has overwritten the existing property/method "{method}" in the InheritStandardClass method'
		    				.replace('{method}', Key));
		    		}

		    		// Insert the property or method to the class prototype
		    		Class.prototype[Key] 	= StandardClass[Key];

		    	}

		    },

		    /* ======================================================================================================
		       FACTORY (Scope.Factory)

		       The Factory extension is intended to mimic the dependency injection model used in the PHP (server-side)
		       of the framework
		    ====================================================================================================== */

		    Factory: {

		        /* ------------------------------------------------------------------------------------------------------
		           DECLARATIONS
		        ------------------------------------------------------------------------------------------------------ */

		    	_Instances: {},

		   	    /* ------------------------------------------------------------------------------------------------------
		   	       SET INSTANCE (Scope.Factory.SetInstance)

		   	       Provide an instance to be used by the Create() method
		   	    ------------------------------------------------------------------------------------------------------ */

		    	SetInstance: function( InstanceId, Instance ) {


		    		if ( typeof Instance === 'object' ) {
		    			this._Instances[InstanceId] 	= Instance;
		    		}

		    	},

		        /* ------------------------------------------------------------------------------------------------------
		           GET INSTANCE (Scope.Factory.GetInstance)
		        ------------------------------------------------------------------------------------------------------ */

		        GetInstance: function( InstanceId ) {

		        	return this._Instances[InstanceId];

		        },

		        /* ------------------------------------------------------------------------------------------------------
		           CREATE (Scope.Factory.Create)

		           # TODO: Add support for classes in namespaces
		        ------------------------------------------------------------------------------------------------------ */

		        Create: function( ClassName ) {

		        	var Instance 			= new window[ClassName];

		        	Instance.prototype 		= window[ClassName].prototype;

		        	try {

		        		if ( typeof Instance.CreateDependencyModel !== 'function' ) {
		        			throw Error('Class must have a method called CreateDependencyModel');
		        		}

		        		var DependencyModel 	= Instance.CreateDependencyModel( new Scope.DependencyModel );
		        		var Dependencies 		= DependencyModel.GetRequirements();

		        		if ( typeof Dependencies !== 'object' ) {
		        			throw Error('Type of return by CreateDependencyModel must be an object');
		        		}

		        		for ( InstanceId in Dependencies ) {
		        			Instance.SetInstance(InstanceId, this.GetInstance(InstanceId));
		        		}

		        		return Instance;

		        	} catch ( Error ) {

		        		Scope.Debug(Error);

		        		return false;

		        	}

		        }

		    },

		    /* ======================================================================================================
		       DEPENDENCY MODEL
		    ====================================================================================================== */

		    DependencyModel: function() {

		    	// This class is defined in the bottom of this document

		    },

		    /* ======================================================================================================
		       MESSAGES (Scope.Messages)
		    ====================================================================================================== */

		    Messages: {

		        /* ------------------------------------------------------------------------------------------------------
		           SHOW (Scope.Messages.Show)

		           The key messaging function. All other functions are routing through this method.
		        ------------------------------------------------------------------------------------------------------ */

		    	Show: function( Message, Type ) {

		    		var MessageFunction 	= Scope.Options.Get('Message');

		    		if ( typeof MessageFunction === 'function' ) {
		    			MessageFunction(Message, Type);
		    		} else {
		    			Scope.Debug('Function for showing messages is not a valid function.');
		    		}

		    	},

		        /* ------------------------------------------------------------------------------------------------------
		           SUCCESS (Scope.Messages.Success)
		        ------------------------------------------------------------------------------------------------------ */

		        Success: function( Message ) {

		        	if ( ! Message ) {
		        		Message 	= Scope.Options.Get('DefaultSuccessMessage');
		        	}

		        	this.Show(Message, 'Success');

		        },

		        /* ------------------------------------------------------------------------------------------------------
		           ERROR (Scope.Messages.Error)
		        ------------------------------------------------------------------------------------------------------ */

		        Error: function( Message ) {

		        	this.Show(Message, 'Error');
		        	
		        },

		        /* ------------------------------------------------------------------------------------------------------
		           LOADING (Scope.Messages.Loading)
		        ------------------------------------------------------------------------------------------------------ */

		        Loader: function( Message ) {
		        	if ( ! Message ) {
		        		Message 	= Scope.Options.Get('DefaultLoadingMessage');
		        	}

		        	this.Show(Message, 'Loader');
		        },

		        /* ------------------------------------------------------------------------------------------------------
		           HIDE (Scope.Messages.Hide)
		        ------------------------------------------------------------------------------------------------------ */

		        Hide: function() {

		        	var HideMessageFunction 	= Scope.Options.Get('HideMessage');

		    		if ( typeof HideMessageFunction === 'function' ) {
		    			HideMessageFunction();
		    		} else {
		    			Scope.Debug('Function for hiding messages is not a valid function.');
		    		}

		        }

		    },

		    /* ======================================================================================================
		       AJAX (Scope.Ajax)
		    ====================================================================================================== */

		    Ajax: {

		        /* ------------------------------------------------------------------------------------------------------
		           REQUEST (Scope.Ajax.Request)
		        ------------------------------------------------------------------------------------------------------ */

		    	Request: function( Options ) {

		    		if ( Scope.Options.Get('AjaxShowLoader') ) {
		    			Scope.Messages.Loader();
		    		}

		    		$.ajax({

		    			url: Scope.Options.Get('AjaxLocation'),

		    			dataType: 'json',

		    			data: Options.Data,

		    			success: function( Data ) {

		    				var StrictAjax 		= Scope.Options.Get('StrictAjax');

		    				// Check if client and server versions match, if any version is provided by the PHP server-side
		    				if ( Data.Version && Data.Version != Scope.Version() ) {
		    					Scope.Debug('Warning! The JavaScript and PHP versions of the EMX framework do not appear to match.');
		    				}

		    				// Hide the loading message
		    				Scope.Messages.Hide();

		    				if ( ! StrictAjax || (StrictAjax && Data.Success != 'undefined') ) {
			    				if ( Data.Success ) {
			    					if ( typeof Options.Success === 'function' ) {
			    						Options.Success(Data.Response);
			    					} else {
			    						Scope.Messages.Success();
			    					}
			    				} else {
			    					/* SEPARATE THESE TWO ACCORDING TO ISSUE AT GITHUB */
			    					Scope.Debug(Data.Error);
			    					Scope.Messages.Error(Data.Error);
			    				}
			    			} else {
			    				Scope.Debug('');
			    			}

		    			},

		    			error: function( jqxhr, type, message ) {

		    				if ( typeof Options.Error === 'function' ) {
		    					Options.Error(type, message);
		    				} else {
		    					Scope.Debug(message);
		    				}

		    			}

		    		}); /* End of $.ajax */

		    	}

		    },

		    /* ------------------------------------------------------------------------------------------------------
		       START (Scope.Start)

		       Initialize the EMX library and process all preparations, checks and instructions to
		       begin working properly with EMX.
		    ------------------------------------------------------------------------------------------------------ */

		    Start: function( Callback ) {

		    	// Load initial variables to describe the use of MVC

		    	var UseMVC 			= this.Options.Get('MVC');
		    	var MVCLocation 	= this.Url('src/js/libs/emx-mvc.js');

		    	// If MVC use is requested to will need to handle the original callback and
		    	// add it to the callback of the MVC scripts being loaded

		    	if ( UseMVC ) {

		    		// Store original callback in a variable

		    		var OriginalCallback 	= Callback;

		    		// And then we change the actual callback function

		    		Callback 				= function() {
		    									Scope.Core.Load(MVCLocation, function() {
		    										if ( typeof OriginalCallback === 'function' ) {
		    											OriginalCallback();
		    										}
		    									});
		    								}

		    	}

		    	// If jQuery is not loaded and the options allow us to proceed with auto-loading
		    	// we will do so right now.

		    	if ( typeof jQuery == 'undefined' && this.Options.Get('AutoLoadJQuery') ) {

		    		this.Core.Load(this.Options.Get('JQueryLocation'), Callback);

		    	} else if ( typeof Callback === 'function' ) {

		    		Callback();

		    	}

		    },

		    /* ------------------------------------------------------------------------------------------------------
		       URL (Emx.Url)

		       Write an absolute URL based on a provided URI argument
		       This is - as of now - only intended for internal usage
		    ------------------------------------------------------------------------------------------------------ */

		    Url: function( Uri ) {

		    	var EMXLocation 	= this.Options.Get('EMXLocation');

		    	if ( ! EMXLocation ) {
		    		this.Debug('EMX Location not defined.');
		    	}

		    	var Url 		= EMXLocation.replace(/\/$/, '') + '/' + Uri.replace(/^\//, '');

		    	return Url;

		    },

		    /* ------------------------------------------------------------------------------------------------------
		       DEBUG (Scope.Debug)

		       Send a message to the developer in development environment (debug mode)
		    ------------------------------------------------------------------------------------------------------ */

			Debug: function( Message ) {

				// If EMX is running in debug mode we continue to see if the provided method validates
				// as a function.

	    		if ( this.Options.Get('DebugMode') ) {
	    			var DebugMethod 	= this.Options.Get('Debug');

	    			if ( typeof DebugMethod == 'function' ) {

	    				// If the method is indeed a function we call it and pass the Message as first and only
	    				// argument.

	    				DebugMethod(Message);

	    			} else {
	    				console.log('EMX: Provided debug method is not a function.');
	    				console.log('EMX: ' + Message);
	    			}
	    		}
	    	}

	    /* ------------------------------------------------------------------------------------------------------
	       FINALIZE
	    ------------------------------------------------------------------------------------------------------ */

	    };

		return Scope;

	} )( window );

    /* ======================================================================================================
       Developed by essential-manager.com
    ======================================================================================================

    #########################################################################################################
    #
    #   DependencyModel Class
    #
    ######################################################################################################### */

	( function() {

		Emx.DependencyModel.prototype 		= {

			_RequiredInstances: { },

			RequireInstanceOf: function( InstanceId ) {
				this._RequiredInstances[InstanceId] 	= { /* Placeholder for options */ };
			},

			GetRequirements: function() {
				return this._RequiredInstances;
			}

		};

	} )();