<?php

    #########################################################################################################
    #
    #   Units
    #
    #########################################################################################################

    /* ======================================================================================================
       DEFINITION
    ====================================================================================================== */

    namespace Emx\Units {

    	use \Emx\Exception as Exception;
    	use \Emx\StandardClass as StandardClass;

    	abstract class Test extends StandardClass {

            /* ======================================================================================================
               DECLARATIONS
            ====================================================================================================== */

    		protected $_DefaultOptions 		= array(

                                                // Function to replace the way the test results are printed to the
                                                // document
    											'PrintResults' 	    => null,

                                                // Replace the test case class passed to all tests in this particular
                                                // object
                                                'TestCaseClass'     => null

    										);

            /* ======================================================================================================
               CREATE DEPENDENCY MODEL
            ====================================================================================================== */

    		protected function CreateDependencyModel( $DependencyModel ) {

    			return $DependencyModel;

    		}

            /* ======================================================================================================
               TEST

               Perform the specified tests and write out the results
            ====================================================================================================== */

    		final public function Test( array $Cases = array() ) {

                // Attempt to see if the user has provided a new test case class name
                $CustomTestClass    = strtolower($this->Options()->Get('TestCaseClass'));

                if ( $CustomTestClass ) {

                    if ( class_exists($CustomTestClass) ) {

                        // All test case classes must extend the original Emx\Units\TestCase
                        if ( strtolower(get_parent_class($CustomTestClass)) === 'emx\units\testcase' ) {

                            $TestClassName  = $CustomTestClass;

                        } else {

                            \Emx\Debug('Custom test case class must extend Emx\Units\TestCase');

                        }

                    } else {

                        \Emx\Debug(sprintf('Custom test class "%s" was not found. Remember to account for namespaces.', $CustomTestClass));

                    }

                } else {

                    // If no custom class is provided we resort to the default and original test case class
                    $TestClassName  = '\Emx\Units\TestCase';

                }

                // Iterate all passed cases
    			foreach ( $Cases as $I => $CaseMethodName ) {

                    // ... And verify that the case is an actual method in the test class
    				if ( method_exists($this, $CaseMethodName) ) {

                        // Call the method we are currently interested in and pass an instance of the resolved
                        // test case class

    					$CaseResults 		= $this->$CaseMethodName( new $TestClassName );

                        // If the returned object from the test method is not an instance of the 
                        // test case.. Well, we don't like that

    					if ( strtolower(get_class($CaseResults)) !== 'emx\units\testcase' ) {

    						\Emx\Debug(sprintf('Test method "%s" does not return instance of TestCase class.'));

    					}

                        // If everything went well we print the test reults

    					$this->PrintResults($CaseResults);

    				}
    			}
    		}

            /* ======================================================================================================
               PRINT RESULTS
            ====================================================================================================== */

    		final public function PrintResults( $Results ) {

                // Import eventual custom function to handle the printing

    			$PrintResultsMethod 	= $this->Options()->Get('PrintResults');

                // If the imported function is in fact a valid function we call it
    			if ( is_callable($PrintResultsMethod) ) {

    				$PrintResultsMethod($Results);

    			} else {

                    // Otherwise we resort to our fallback/default method
    				$this->DefaultPrintResults($Results);

    			}

    		}

            /* ======================================================================================================
               [INTERNAL] DEFAULT RESULT PRINTER

               When no method is provided for handling the printing of results or that given function is not
               callable we use this method as a fallback/default
            ====================================================================================================== */

    		final protected function DefaultPrintResults( $Results ) {

    			$Output 		= $Results->GetResults();
    			
    			foreach ( $Output as $I => $String ) {

                    // Write the complete call as Example::Method("argument", 1337)

                    $Call           = sprintf('%s::%s(%s)',
                                        $String['Class'],
                                        $String['Method'],
                                        $this->WriteArguments($String['Arguments'])
                                    );

                    // We don't like inline styles but since we cannot be sure to depend on a 
                    // proper CSS file to be loaded it will have to do for the default printer

                    $PassBlockStyle = ( $String['Passed'] )
                                        ? 'background: #99FF66; color: #669900;'
                                        : 'background: #CC6666; color: #993300;';
                    $PassBlock      = sprintf('<span style="%s">%s</span> ',
                                        $PassBlockStyle,
                                        (( $String['Passed'] ) ? 'Passed' : 'Failed')
                                    );

                    $CallBlock      = sprintf('<code>%s</code>', $Call);

                    $ReturnBlock    = sprintf('<br><small><strong>Returned:</strong> <code style="background: #dfdfdf">(%s)</code> %s</small>', 
                                        gettype($String['Return']),
                                        (( is_array($String['Return']) )
                                            ? '[' . $this->WriteArguments($String['Return']) . ']'
                                            : $String['Return'])
                                    );

                    $ExpectBlock    = sprintf('<br><small>%s</small>', $String['Expectation']);

    				echo sprintf('%s<hr>', $PassBlock . $CallBlock . $ReturnBlock . $ExpectBlock);

    			}

    		}

            /* ------------------------------------------------------------------------------------------------------
               [INTERNAL] WRITE FUNCTION ARGUMENTS

               Write out function arguments to be more similar to the way the were put into the function
               call in the first place
            ------------------------------------------------------------------------------------------------------ */

            final protected function WriteArguments( $ArrayData ) {

                $Output         = '';

                foreach ( $ArrayData as $Key => $Value ) {

                    // First of we will try to write out the data types so they are similar to the way
                    // they were put in, in the first place

                    if ( is_string($Value) ) {

                        // Strings are wrapped in quotes
                        $Value      = sprintf('"%s"', $Value);

                    } elseif ( is_bool($Value) ) {

                        // If we echo a boolean value it becomes 1 or 0. To more correctly resemble
                        // actual input we write out the full boolean definition instead
                        $Value      = ( $Value ) ? 'true' : 'false';

                    } elseif ( is_null($Value) ) {

                        // If null it also has to be written out manually to avoid an empty string
                        $Value      = 'null';

                    } elseif ( is_callable($Value) ) {

                        // Replace functions as a string indicating so
                        $Value      = 'Callable(){}';

                    } elseif ( is_resource($Value) ) {

                        // Replace resources with text
                        $Value      = 'Resource';

                    } elseif ( is_object($Value) ) {

                        // Replace objects with text
                        $Value      = 'Object';

                    } elseif ( is_array($Value) ) {

                        // Replace deeper arrays with text
                        $Value      = 'Array(...)';

                    }

                    // Prepend comma on the string if there other items are already added

                    $Output     .= (( $Output ) ? ', ' : '') . $Value;

                }

                // Return the output
                return $Output;

            }

    	}

        /* ======================================================================================================
           TEST CASE CLASS

           Library supports that the test case class is extended and used instead if additional testing
           methods are required
        ====================================================================================================== */

    	class TestCase {

            /* ------------------------------------------------------------------------------------------------------
               DECLARATIONS
            ------------------------------------------------------------------------------------------------------ */

    		protected $Results 		= array();

            protected

                // The instance of the class we are testing will be put into the $Subject varibale
                $Subject,

                // When the method has made an output it will be stored for further processing and
                // analysis
                $MethodOutput,

                // The name of the method is stored here
                $CalledMethod,

                // ... And the arguments here
                $CalledArguments;

            /* ------------------------------------------------------------------------------------------------------
               GET RESULTS
            ------------------------------------------------------------------------------------------------------ */

    		final public function GetResults() {
    			return $this->Results;
    		}

            /* ------------------------------------------------------------------------------------------------------
               ADD RESULT
            ------------------------------------------------------------------------------------------------------ */

    		final protected function AddResult( $Passed = false, $Expectation = '' ) {

    			$this->Results[] 	= array(
                                        'Class'         => get_class($this->Subject),
                                        'Method'        => (string) $this->CalledMethod,
                                        'Return'        => $this->MethodOutput,
                                        'Expectation'   => $Expectation,
                                        'Arguments'     => $this->CalledArguments,
    									'Passed' 		=> $Passed
    								);

    		}

            /* ------------------------------------------------------------------------------------------------------
               CONCERNS
            ------------------------------------------------------------------------------------------------------ */

            final public function Concerns( $ClassName ) {

                # TODO: Handle non-standardclass objects

                if ( is_null($this->Subject) ) {

                    // Create the subject based on Factory layout

                    $this->Subject  = \Emx\Factory::Create($ClassName);

                } else {

                    \Emx\Debug('Each test case can only concern one class.');

                }

                // Make the method chainable
                return $this;

            }

            /* ------------------------------------------------------------------------------------------------------
               MOCK INSTANCE ON SUBJECT
            ------------------------------------------------------------------------------------------------------ */

            final public function MockInstance( $InstanceId, $InstanceClassName ) {

                // First off we verify that an object has been allocated as the subject
                // And then we check that the class we are attempting to mock exists

                if ( ! is_null($this->Subject) && class_exists($InstanceClassName) ) {

                    // ... If it exists we make sure it is based on our abstract mock class

                    if ( strtolower(get_parent_class($InstanceClassName)) === 'emx\units\mock' ) {

                        // Create the mocking instance in the class we are testing

                        $this->Subject->SetInstance($InstanceId, new $InstanceClassName);   

                    } else {

                        \Emx\Debug('Mock objects must be extending Emx\Units\Mock');

                    }

                }

                // Make method chainable
                return $this;

            }

            /* ------------------------------------------------------------------------------------------------------
               EXPECT THAT
            ------------------------------------------------------------------------------------------------------ */

            final public function ExpectThatMethod( $MethodName, array $Arguments = array() ) {
                
                $this->CalledMethod     = (string) $MethodName;
                $this->CalledArguments  = (array) $Arguments;
                $this->MethodOutput     = call_user_func_array(array($this->Subject, $MethodName), $Arguments);

                return $this;

            }

            /* ------------------------------------------------------------------------------------------------------
               [INTERNAL] CONTAINS

               Check if an array contains one or several elements of needles array
            ------------------------------------------------------------------------------------------------------ */

            final protected function Contains( $Terms ) {

                // Iterate all items containing the needles
                foreach ( $Terms as $I => $Term ) {

                    // And then iterate over all items in the method output to compare
                    foreach ( (array) $this->MethodOutput as $X => $Compare ) {

                        if ( $Term === $Compare ) {
                            return true;
                            break;
                        }

                    }

                }

                // Return false if no needles matched the content in the output
                return false;

            }

            /* ------------------------------------------------------------------------------------------------------
               [INTERNAL] WRITE ARRAY

               Write out array content in common syntax (and not messy serialization)
            ------------------------------------------------------------------------------------------------------ */

            final protected function WriteArray( $ArrayData ) {

                $Output         = '';

                foreach ( $ArrayData as $Key => $Value ) {

                    // If the value is a string it is wrapped in quotes

                    $Output     .= (( $Output ) ? ', ' : '') . sprintf((( is_string($Value) ) ? '"%s"' : '%s'), $Value);

                }

                // Return content in braces

                return sprintf('[%s]', $Output);

            }

            /* ------------------------------------------------------------------------------------------------------
               EXPECTATIONS (CAN BE OVERRIDDEN)
            ------------------------------------------------------------------------------------------------------ */

            public function Equals( $Return ) {
                $this->AddResult(($Return === $this->MethodOutput),
                    sprintf('Expected to equal: %s', $Return)
                );
            }

            public function DiffersFrom( $Return ) {
                $this->AddResult(($Return !== $this->MethodOutput),
                    sprintf('Expected to differ from: %s', $Return)
                );
            }

            public function Matches( $Pattern ) {
                $this->AddResult((bool) preg_match($Pattern, $this->MethodOutput),
                    sprintf('Expected to match regular expression pattern: %s', $Pattern)
                );
            }

            public function Includes( array $Terms = array() ) {
                $this->AddResult($this->Contains($Terms),
                    sprintf('Expected to contain one or more elements of: %s', $this->WriteArray($Terms))
                );
            }

            public function Excludes( array $Terms = array() ) {
                $this->AddResult(! $this->Contains($Terms),
                    sprintf('Expected to NOT contain one or more elements of: %s', $this->WriteArray($Terms))
                );
            }

            public function DoesNotMatch( $Pattern ) {
                $this->AddResult( ! (bool) preg_match($Pattern, $this->MethodOutput),
                    sprintf('Expected to NOT match regular expression pattern: %s', $Pattern)
                );
            }

            public function IsInsideRange($Min, $Max) {
                $X          = (int) $this->MethodOutput;

                $this->AddResult(( $X >= $Min && $X <= $Max ),
                    sprintf('Expected to be inside range: %d - %d', $Min, $Max)
                );
            }

            public function IsOutsideRange($Min, $Max) {
                $X          = (int) $this->MethodOutput;

                $this->AddResult( ! ( $X >= $Min && $X <= $Max ),
                    sprintf('Expected to be outside range: %d - %d', $Min, $Max)
                );
            }

            public function Is( $Description, $Function ) {
                if ( is_callable($Function) ) {
                    $this->AddResult((bool) $Function($this->MethodOutput), 'Expected that output is: ' . $Description);
                }
            }

            public function IsNot( $Description, $Function ) {
                if ( is_callable($Function) ) {
                    $this->AddResult( ! (bool) $Function($this->MethodOutput), 'Expected that output is not: ' . $Description);
                }
            }

            /* ------------------------------------------------------------------------------------------------------
               POSITIVE TYPE CHECKS
            ------------------------------------------------------------------------------------------------------ */

            public function IsBoolean() { $this->AddResult(is_bool($this->MethodOutput), 'Expected to be boolean'); }
            public function IsString() { $this->AddResult(is_string($this->MethodOutput), 'Expected to be string'); }
            public function IsInteger() { $this->AddResult(is_int($this->MethodOutput), 'Expected to be integer'); }
            public function IsFloat() { $this->AddResult(is_float($this->MethodOutput), 'Expected to be float'); }
            public function IsDouble() { $this->AddResult(is_double($this->MethodOutput), 'Expected to be double'); }
            public function IsReal() { $this->AddResult(is_real($this->MethodOutput), 'Expected to be real (the number type!)'); }
            public function IsNumeric() { $this->AddResult(is_numeric($this->MethodOutput), 'Expected to be numeric'); }
            public function IsArray() { $this->AddResult(is_array($this->MethodOutput), 'Expected to be array'); }
            public function IsObject() { $this->AddResult(is_object($this->MethodOutput), 'Expected to be object'); }
            public function IsNull() { $this->AddResult(is_null($this->MethodOutput), 'Expected to be null'); }
            public function IsCallable() { $this->AddResult(is_callable($this->MethodOutput), 'Expected to be callable'); }

            /* ------------------------------------------------------------------------------------------------------
               NEGATED TYPE CHECKS
            ------------------------------------------------------------------------------------------------------ */

            public function IsNotBoolean() { $this->AddResult(! is_bool($this->MethodOutput), 'Expected to be different from boolean'); }
            public function IsNotString() { $this->AddResult(! is_string($this->MethodOutput), 'Expected to be different from string'); }
            public function IsNotInteger() { $this->AddResult(! is_int($this->MethodOutput), 'Expected to be different from integer'); }
            public function IsNotFloat() { $this->AddResult(! is_float($this->MethodOutput), 'Expected to be different from float'); }
            public function IsNotDouble() { $this->AddResult(! is_double($this->MethodOutput), 'Expected to be different from double'); }
            public function IsNotReal() { $this->AddResult(! is_real($this->MethodOutput), 'Expected to be different from real (the number type!)'); }
            public function IsNotNumeric() { $this->AddResult(! is_numeric($this->MethodOutput), 'Expected to be different from numeric'); }
            public function IsNotArray() { $this->AddResult(! is_array($this->MethodOutput), 'Expected to be different from array'); }
            public function IsNotObject() { $this->AddResult(! is_object($this->MethodOutput), 'Expected to be different from object'); }
            public function IsNotNull() { $this->AddResult(! is_null($this->MethodOutput), 'Expected to be different from null'); }
            public function IsNotCallable() { $this->AddResult(! is_callable($this->MethodOutput), 'Expected to be different from callable'); }

    	}

        /* ======================================================================================================
           MOCK
        ====================================================================================================== */

        abstract class Mock {

            /* Yeah, I'm kinda empty */

        }

    }

?>
