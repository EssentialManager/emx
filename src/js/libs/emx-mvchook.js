
	/* ######################################################################################################
    #
    #   EMX / MVC
    #
    ###################################################################################################### */

    ( function() {

        Emx.Core.Extend('MVCHook',  {

            /* ======================================================================================================
               DECLARATIONS
            ====================================================================================================== */
            
            _Viewport: undefined,

            _Bindings: {
                '_Generics': {}
            },

            /* ======================================================================================================
               SET VIEW
            ====================================================================================================== */

            CompleteTransaction: function( Content, Find, Data ) {

                if ( this._Viewport != 'undefined' ) {

                    if ( typeof Content === 'string' ) {
                        this._Viewport.innerHTML    = Content; 
                    }
                    
                    this._Execute({
                        Event: 'Success',
                        Data: Data,
                        Controller: Find.Controller,
                        Method: Find.Method,
                        NoView: ( typeof Content === 'string' ) ? false : true
                    });

                } else {

                    Emx.Debug('You have not defined a viewport to receive the content provided (MVC).');

                }

            },

            /* ======================================================================================================
               [PRIVATE] EXECUTE
            ====================================================================================================== */

            _Execute: function( Options ) {

                var Find                = {
                                            'Controller': Options.Controller,
                                            'Method': Options.Method
                                        };

                var MethodName          = Options.Event;
                var NoView              = Options.NoView;

                var KeyControllerOnly   = (Find.Controller + '@').toLowerCase();
                var KeyFull             = (Find.Controller + '@' + Find.Method).toLowerCase();

                var Arguments           = {
                                            Viewport: (( ! NoView ) ? this._Viewport : undefined ),
                                            Data: Options.Data
                                        };

                if ( typeof this._Bindings._Generics[MethodName] === 'function' ) {
                    this._Bindings._Generics[MethodName](Arguments);
                }

                if ( typeof this._Bindings[KeyControllerOnly] === 'object' ) {
                    var Event           = this._Bindings[KeyControllerOnly];

                    if ( typeof Event[MethodName] === 'function' ) {
                        Event[MethodName](Arguments);
                    }
                }

                if ( typeof this._Bindings[KeyFull] === 'object' ) {
                    var Event           = this._Bindings[KeyFull];

                    if ( typeof Event[MethodName] === 'function' ) {
                        Event[MethodName](Arguments);
                    }
                }

            },

            /* ======================================================================================================
               SET VIEWPORT
            ====================================================================================================== */

            SetViewport: function( Element ) {

                if ( Element != this._Viewport ) {

                    for ( I in this._Bindings ) {
                        if ( typeof this._Bindings[I] === 'object' && typeof this._Bindings[I].ChangeViewport === 'function' ) {
                            this._Bindings[I].ChangeViewport();
                        }
                    }

                    this._Viewport      = Element;

                }

            },

            /* ======================================================================================================
               REQUEST
            ====================================================================================================== */

            Request: function( Controller, Method, Data ) {

                this._Execute({
                    'Controller': Controller,
                    'Method': Method,
                    'Event': 'BeforeLoad',
                    'NoView': true,
                    'Data': {}
                });  
            
                Emx.Ajax.Request({
                    Data: {
                        'EmxController': Controller,
                        'EmxMethod': Method,
                        'Data': Data
                    },
                    Success: function( Response ) {
                        Emx.MVCHook.CompleteTransaction(Response.View, {
                            'Controller': Controller,
                            'Method': Method
                        }, Response.Data);
                    },
                    Error: function( Message ) {
                        Emx.Debug(Message);
                    }
                });

            },

            /* ======================================================================================================
               BIND EVENT(S)
            ====================================================================================================== */

            Bind: function( To, Events ) {

                try {

                    // Check if events is passed and that a controller is assigned (granted that events is not defined
                    // we assume the user is trying to bind general events)

                    if ( ! To.Controller && Events ) {
                        throw Error('Controller must be defined when binding events.');
                    }

                    // When Events is undefined we assume that To contains the events we wish to bind
                    // In this case they are bound in a general sense

                    if ( typeof Events == 'undefined' ) {
                        var Key                                 = '_Generics';
                        this._Bindings[Key.toLowerCase()]       = To;
                    } else {
                        var Key                                 = To.Controller + '@' + (( typeof To.Method == 'string' && To.Method ) ? To.Method : '');
                        this._Bindings[Key.toLowerCase()]       = Events;
                    }
                    

                } catch ( Error ) {

                    Emx.Debug(Error);

                }

            }

        });

    } )();
