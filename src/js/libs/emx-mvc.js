
	/* ######################################################################################################
    #
    #   EMX / MVC
    #
    ###################################################################################################### */

    /* ======================================================================================================
       TO-DO'S
    ========================================================================================================= 

	

    ==========================================================================================================
        DEFINITION
    ====================================================================================================== */

    ( function() {

        Emx.Core.Extend('MVC',  {
            
            _Viewport: undefined,

            SetView: function( PreRenderedContent ) {

                if ( this._Viewport != 'undefined' ) {
                    this._Viewport.innerHTML    = PreRenderedContent; 
                } else {
                    Emx.Debug('You have not defined a viewport to receive the content provided (MVC).');
                }

            },

            SetViewport: function( Element ) {

                this._Viewport      = Element;

            },

            Request: function( Controller, Method ) {
            
                Emx.Ajax.Request({
                    Data: {
                        EmxController: Controller,
                        EmxMethod: Method
                    },
                    Success: function( Response ) {
                        Emx.MVC.SetView(Response.ControllerResponse);
                    },
                    Error: function( Message ) {
                        Emx.Debug(Message);
                    }
                });

            }

        });

    } )();