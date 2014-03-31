	/* ######################################################################################################
    #
    #   EMX (Essential Manager X)
    #	Framework for JavaScript and PHP
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

				return '1.0.2';

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
	    			JQueryLocation: 'https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js',

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
	    			EMXLocation: 'emx/',

	    			// Disable or enable the hook to handle the MVC component in the PHP side of the framework
	    			MVCHook: true,

	    			// The default messages used in various cases in the Messages extension
	    			DefaultLoadingMessage: 'Loading',
	    			DefaultSuccessMessage: 'Success!',

	    			// Turn off the default properties for the message container CSS
	    			// Typically used when the container is manually styled
	    			DefaultMessageContainerCSS: true,

	    			// The default function for showing messages in the native Messages extension
	    			Message: function( Message, Type ) {

	    				Emx.Messages.DefaultMethod(Message, Type);
 
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

		    	// Groups of URLs to be loaded during initialization or "on the fly"
		    	_Assets: {},

		        /* ------------------------------------------------------------------------------------------------------
		           LOAD LIBRARY (Scope.Core.Load)

		           Insert a JavaScript or CSS file to be executed. The "Urls" parameter can be either a string
		           with a single URL or an object with several URLs.

		           The Callback is executed when the last of the libraries have been loaded.
		        ------------------------------------------------------------------------------------------------------ */

	    		Load: function( Urls, Callback ) {

	    			try {

	    				// First we check to see if the Urls parameter actually refers to an asset

	    				if ( typeof Urls === 'string' && Urls.match(/^[A-Z]([a-zA-Z]){3,23}$/) ) {
	    					var Asset 	= this.GetAsset(Urls);

	    					Urls 		= Asset.Urls;
	    					Callback 	= Asset.Callback;
	    				}

		    			// If the provided argument is a string we add it to an object to ease the furhter
		    			// processing.

		    			if ( typeof Urls === 'string' ) {

		    				// If the Urls parameter is a string we load it into an array as the only element
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

			    					var FullUrl 			= Element.src || Element.href;

			    					// List the URL in the stack and set its default "Loaded" property to false
			    					this._Stack[FullUrl] 	= { Loaded: false };

			    					// Add an event listener to figure out when to execute the callback
			    					Element.addEventListener('load', function() {

			    						var Url 						= this.src || this.href;
			    						
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
	    	       UNLOAD (Scope.Core.UnLoad)

	    	       Remove a CSS or JavaScript file from the document
	    	       The URL(s) provided must be absolute
	    	    ------------------------------------------------------------------------------------------------------ */

	    	    UnLoad: function( Urls, Callback ) {

	    	    	// Test to see if the provided argument is a string
	    	    	if ( typeof Urls === 'string' ) {

	    	    		// ... And if so add it to an object for further processing
	    	    		Urls 		= [Urls]

	    	    	}

	    	    	// Test if the URLs are gathered in an object
	    	    	if ( typeof Urls === 'object' ) {

	    	    		// Iterate over the URLs
	    	    		for ( I in Urls ) {

	    	    			var Url 		= Urls[I];

	    	    			// And now we want to iterate over all SCRIPT and LINK tags
	    	    			// to compare their resource URL against the URL we are attempting
	    	    			// to remove

			    	    	var Scripts 	= document.getElementsByTagName('script');
			    	    	var Links 		= document.getElementsByTagName('link');

			    	    	// Loop over the scripts and compare SRC

			    	    	for ( X in Scripts ) {
			    	    		if ( Scripts[X].src == Url ) {
			    	    			Scripts[X].parentNode.removeChild(Scripts[X]);
			    	    		}
			    	    	}

			    	    	// And loop over the links to compare their HREF

			    	    	for ( X in Links ) {
			    	    		if ( Links[X].href == Url ) {
			    	    			Links[X].parentNode.removeChild(Links[X]);
			    	    		}
			    	    	}

	    	    		}

	    	    		// If the callback is a valid function it is executed when all
	    	    		// elements are properly removed

	    	    		if ( typeof Callback === 'function' ) {
	    	    			Callback();
	    	    		}

	    	    	}

	    	    },

	    	    /* ------------------------------------------------------------------------------------------------------
	    	       DEFINE ASSET (Scope.Core.DefineAsset)

	    	       Manage the assets and dependencies by creating groups to be easily loaded by JavaScript
	    	       and PHP alike
	    	    ------------------------------------------------------------------------------------------------------ */

	    	    DefineAsset: function( AssetId, Asset ) {

	    	    	try {

	    	    		// Check if the asset ID is allowed
	    	    		if ( ! AssetId.match(/^[A-Z]([a-zA-Z]){3,23}$/) ) {
	    	    			throw Error('Asset IDs must be 4 to 24 English letters starting with capitalized letter.');
	    	    		}

	    	    		// Verify that the passed asset is an object
	    	    		if ( typeof Asset !== 'object' ) {
	    	    			throw Error('Asset must be an object.');
	    	    		}

	    	    		// Insert the asset to our asset repository
	    	    		this._Assets[AssetId] 			= Asset;
	    	    		this._Assets[AssetId].Loaded 	= false;
	    	    		this._Assets[AssetId].Loading 	= false;

	    	    	} catch ( Error ) {
	    	    		Scope.Debug(Error);
	    	    	}

	    	    },

	    	    /* ------------------------------------------------------------------------------------------------------
	    	       LOAD ASSET (Scope.Core.LoadAsset)

	    	       Load an asset.

	    	       This function is in many ways similar to the Load function but is capable of resolving dependencies
	    	       before continuing

	    	       Possible, but unlikely issue: When two assets load dependencies simultaneously and they require the
	    	       same dependency only one of them is allowed to continue, which is done to prevent several instances
	    	       of the same script. And that's fine, but! When a given asset tries to resolve a dependency which
	    	       is being loaded by another asset it may resort to quickly to proceed with its own agenda.

	    	       WARNING! The _Callback is not intended for use by the developer. It is only intended to be used
	    	       internally.
	    	    ------------------------------------------------------------------------------------------------------ */

	    	    LoadAsset: function ( AssetId, _Callback ) {

	    	    	// Get the asset from the registry
	    	    	var Asset 					= this.GetAsset(AssetId);

	    	    	// Load the dependencies into a list
	    	    	var Dependencies 			= Asset.Dependencies;

	    	    	// We assume that all dependencies are resolved until proven otherwise
	    	    	var DependenciesResolved 	= true;

	    	    	// Iterate over the dependencies
	    	    	for ( I in Dependencies ) {

	    	    		// Check if the dependency asset is either loaded or loading

	    	    		if ( ! ( this._Assets[Dependencies[I]].Loaded | this._Assets[Dependencies[I]].Loading ) ) {

	    	    			// Load the asset and pass a callback which will call this method again to try and
	    	    			// load the asset after the dependency has been resolved
	    	    			this.LoadAsset(Dependencies[I], function() {
	    	    				Scope.Core.LoadAsset(AssetId, _Callback);
	    	    			});

	    	    			// Instruct not to complete the loading of this exact asset just yet
	    	    			DependenciesResolved 	= false;

	    	    			// Break the iteration
	    	    			break;

	    	    		}

	    	    	}

	    	    	// If all dependencies for this asset has been resolved we continue loading it
	    	    	if ( DependenciesResolved ) {

	    	    		// Set the loading property to true, to instruct other simultaneous dependency
	    	    		// resolvers that this asset is being loaded

	    	    		Scope.Core._Assets[AssetId].Loading 	= true;

	    	    		// Load the asset
	    	    		this.Load(Asset.Urls, function() {

	    	    			// Instruct that loading is completed

	    	    			Scope.Core._Assets[AssetId].Loaded 		= true;
	    	    			Scope.Core._Assets[AssetId].Loading 	= false;

	    	    			// If the asset has a developer-provided callback we execute it before
	    	    			// continuing

	    	    			if ( typeof Asset.Callback === 'function' ) {
	    	    				Asset.Callback();
	    	    			}

	    	    			// If this asset is a dependency of another asset we go back to the original
	    	    			// asset to see if more dependencies are to be loaded or if the asset itself
	    	    			// can finally load

	    	    			if ( typeof _Callback === 'function' ) {
	    	    				_Callback();
	    	    			}

	    	    		});

	    	    	}

	    	    },

	    	    /* ------------------------------------------------------------------------------------------------------
	    	       UN-LOAD ASSET (Scope.Core.UnLoadAsset)

	    	       Will first off un-load an asset

	    	       It will do so "deeply" meaning that it will also remove its dependencies, but only until
	    	       a given dependency is also required by other assets
	    	    ------------------------------------------------------------------------------------------------------ */

	    	    UnLoadAsset: function( AssetId ) {

	    	    	// Import the asset to a variable
	    	    	var Asset 		= this.GetAsset(AssetId);

	    	    	// We assume we can proceed by un-loading this asset
	    	    	var Proceed 	= true;

	    	    	// Check if any loaded assets rely on this asset
	    	    	for ( I in this._Assets ) {

	    	    		// Load the asset we want to test
	    	    		var TestAsset		= this._Assets[I];

	    	    		// Load its dependencies
	    	    		var Dependencies 	= TestAsset.Dependencies;

	    	    		// If the asset is loaded (no reason to test on un-loaded assets)
	    	    		if ( TestAsset.Loaded ) {

	    	    			// We iterate over its dependencies to see if it requires this asset which
	    	    			// we are trying to un-load
	    	    			for ( X in Dependencies ) {
	    	    				if ( Dependencies[X] == AssetId ) {
	    	    					Proceed 	= false;
	    	    				}
	    	    			}

	    	    		}

	    	    	}

	    	    	// Test if we can proceed the un-load
	    	    	if ( Proceed ) {

		    	    	this.UnLoad(Asset.Urls, function() {

		    	    		// Instruct the asset registry that the asset is no longer loader, nor loading
		    	    		Scope.Core._Assets[AssetId].Loading 	= false;
		    	    		Scope.Core._Assets[AssetId].Loaded 		= false;

		    	    		// Iterate over the dependencies to test if there are more libraries that
		    	    		// we can offload.

		    	    		for ( I in Asset.Dependencies ) {
		    	    			Scope.Core.UnLoadAsset(Asset.Dependencies[I]);
		    	    		}

		    	    	});

		    	    }

	    	    },

	    	    /* ------------------------------------------------------------------------------------------------------
	    	       GET ASSET (Scope.Core.GetAsset)
	    	    ------------------------------------------------------------------------------------------------------ */

	    	    GetAsset: function( AssetId ) {

	    	    	// Return the requested asset by ID
	    	    	return this._Assets[AssetId];

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
		           DECLARATIONS
		        ------------------------------------------------------------------------------------------------------ */

		        _Types: {

		        	Success: {
		        		Color: 'green',
		        		AutoHide: true,
		        		ClassName: 'Success',
		        		Modal: false
		        	},

		        	Error: {
		        		Color: 'red',
		        		AutoHide: true,
		        		ClassName: 'Error',
		        		Modal: false
		        	},

		        	Loader: {
		        		Color: 'blue',
		        		AutoHide: false,
		        		ClassName: 'Loader',
		        		Modal: true
		        	}

		        },

		        /* ------------------------------------------------------------------------------------------------------
		           DEFAULT METHOD (Scope.Message.DefaultMethod)
		        ------------------------------------------------------------------------------------------------------ */

		        DefaultMethod: function( Message, Type ) {

		        	// Locale the message container
    				var MessageContainer 	= document.getElementById('EmxMessageContainer');

    				// If the message container does not exist we want to create it
    				if ( ! MessageContainer ) {

			        	// Detect the body tag in case we need to manually create the message container
			        	var Body 				= document.body || document.getElementsByTagName('body')[0] || document.documentElement;

    					// Create the message container as a div and assign the correct ID
    					MessageContainer 		= document.createElement('div');
    					MessageContainer.id 	= 'EmxMessageContainer';

    					// Append the container in the body tag
    					Body.appendChild(MessageContainer);

    				}

    				// Create some default styling for the message container
    				MessageContainer.style.visibility 	= 'block';

    				if ( Scope.Options.Get('DefaultMessageContainerCSS') ) {
	    				MessageContainer.style.position 	= 'fixed';
	    				MessageContainer.style.top 			= '10px'; 
	    				MessageContainer.style.right 		= '10px';
	    				MessageContainer.style.color 		= Type.Color;
	    			}

    				// If the message type suggests a class name it will be assigned here
    				if ( Type.ClassName ) {
    					MessageContainer.className 		= Type.ClassName;
    				}

    				// If the type requests auto-hide we will do so
    				if ( Type.AutoHide ) {

    					// To ensure a given timeout does not interrupt at message shown after the current
    					// has been invoked it is given a unique ID

    					var TimeoutId 		= Math.random();

    					// Compute the time that a message should be shown
    					var Timeout 		= 850 + 80 * String(Message).length;

    					// Assign the unique identifier to the message container
    					$(MessageContainer).data('timeout-id', TimeoutId);

    					// Set a timeout procedure
    					setTimeout(function() {

    						// If the timeout identifier matches the current identifier assigned to the message container
    						// we can proceed with hiding the message
    						
    						if ( $(MessageContainer).data('timeout-id') == TimeoutId ) {
    							Emx.Messages.Hide();
    						}

    					}, Timeout);

    				}

    				// Insert the message to the container
    				MessageContainer.innerHTML 			= Message;

		        },

		        /* ------------------------------------------------------------------------------------------------------
		           CREATE MESSAGE TYPE

		           Insert a new type or replace an existing
		        ------------------------------------------------------------------------------------------------------ */

		        CreateType: function( MessageTypeId, Type ) {

		        	try {

		        		// The _Default is used to provide content in case the type does not exist
		        		// So we do not want users to override this property - as that could potentially
		        		// unset the fallback

		        		if ( MessageTypeId === '_Default' ) {
		        			throw Error('You cannot modify the default message type.');
		        		}

		        		// If the type exists we iterate over properties to avoid dropping already set properties
		        		if ( typeof this._Types[MessageTypeId] != 'undefined' ) {

		        			// Iterate over the type properties ...
		        			for ( Key in Type ) {

		        				// ... And set each
		        				this._Types[MessageTypeId][Key] 	= Type[Key];

		        			}

		        		} else {
		        			this._Types[MessageTypeId] 	= Type;
		        		}

		        	} catch ( Error ) {

		        		Scope.Debug(Error);

		        	}

		        },

		        /* ------------------------------------------------------------------------------------------------------
		           SHOW (Scope.Messages.Show)

		           The key messaging function. All other functions are routing through this method.
		        ------------------------------------------------------------------------------------------------------ */

		    	Show: function( Message, TypeId ) {

		    		// Detect the requested messaging function
		    		var MessageFunction 	= Scope.Options.Get('Message');

		    		// If it is a function ...
		    		if ( typeof MessageFunction === 'function' ) {

		    			// ... Determine the type to be passed
		    			var FinalType 		= ( typeof this._Types[TypeId] !== 'object' ) ? this._Types['_Default'] : this._Types[TypeId];

		    			// ... And execute the function to show the message
		    			MessageFunction(Message, FinalType);

		    		} else {

		    			Scope.Debug('Function for showing messages is not a valid function.');

		    		}

		    	},

		        /* ------------------------------------------------------------------------------------------------------
		           SUCCESS (Scope.Messages.Success)
		        ------------------------------------------------------------------------------------------------------ */

		        Success: function( Message ) {

		        	// If no message is set we load the default message
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

		        	// Assign the function used to hide messages
		        	var HideMessageFunction 	= Scope.Options.Get('HideMessage');

		        	// If it is a function ...
		    		if ( typeof HideMessageFunction === 'function' ) {

		    			// ... Call the hide function
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

		    				// Determine if the strict AJAX mode is requested or not
		    				var StrictAjax 		= Scope.Options.Get('StrictAjax');

		    				// Check if client and server versions match, if any version is provided by the PHP server-side
		    				if ( Data.Version && Data.Version != Scope.Version() ) {
		    					Scope.Debug('Warning! The JavaScript and PHP versions of the EMX framework do not appear to match.');
		    				}

		    				// Hide the loading message
		    				Scope.Messages.Hide();

		    				if ( typeof Data.Debugging === 'object' ) {
		    					for ( I in Data.Debugging ) {
		    						console.log('Warning: ' + Data.Debugging[I]);
		    					}
		    				}

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

		    	var UseMVCHook 		= this.Options.Get('MVCHook');
		    	var MVCLocation 	= this.Url('src/js/libs/emx-mvchook.js');

		    	// If MVC use is requested to will need to handle the original callback and
		    	// add it to the callback of the MVC scripts being loaded

		    	if ( UseMVCHook ) {

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
