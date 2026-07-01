<?php

defined('ABSPATH') or die("Cannot access pages directly.");

/**
 * Created by PhpStorm.
 * User: Milos Roksandic
 * Date: 23.2.16.
 * Time: 19.48
 */
class WDTExcelColumn {
    private $wdtColumn = null;

    public function __construct( WDTColumn $wdtColumn ) {
        $this->wdtColumn = $wdtColumn;
    }

    /**
     * Overloading methods that are not defined in this class.
     * It will call corresponding method of WDTColumn object
     *
     * @param $name
     * @param $arguments
     */
    public function __call($name, $arguments) {
        return call_user_func_array(
            array($this->wdtColumn, $name),
            $arguments
        );
    }

    // overrides
    public function returnCellValue( $cellContent ) {
        $cellValue = apply_filters( 'wpdatatables_excel_filter_cell_val', $cellContent );
        return $cellValue;
    }

    // overrides
    public static function generateColumn( $wdtColumnType = 'string', $properties = array( ) ) {
        $column = WDTColumn::generateColumn( $wdtColumnType, $properties );

        $excelColumn = new WDTExcelColumn( $column );

        return $excelColumn;
    }

    // overrides
    public function getColumnJSON() {
        $colJsDefinition = $this->getCellTypeProps();

        $colJsDefinition->title = $this->wdtColumn->getTitle();
        $colJsDefinition->data = $this->wdtColumn->getOriginalHeader();
        $colJsDefinition->defaultValue = $this->wdtColumn->getFilterDefaultValue();
        $colJsDefinition->className = $this->wdtColumn->getCSSClasses();

        if( $this->wdtColumn->getDataType() == 'float' ) {
            $decimal_places = (int) (get_option('wdtDecimalPlaces'));
            if ( $decimal_places > 0 ) {
                $format = '0,0.' . str_repeat( '0', $decimal_places );
                $colJsDefinition->format = $format;
            }
        } else if( $this->wdtColumn->getDataType() == 'formula' ) {
            $colJsDefinition->readOnly = true;
        }

        $cell_editor_type = $this->getEditorType();

        if( $cell_editor_type == 'wdt.dropdown' || $cell_editor_type == 'wdt.multi-select' ) {
            if ($this->wdtColumn->getPossibleValuesType() === 'read') {
                $colJsDefinition->source = WDTColumn::getColumnDistinctValues($this->wdtColumn);
            } elseif ($this->wdtColumn->getPossibleValuesType() === 'list') {
                $colJsDefinition->source = $this->wdtColumn->getPossibleValues();
            }
        }

        if( $cell_editor_type == 'wdt.date' || $cell_editor_type == 'date') {
            $colJsDefinition->allowEmpty = true;
            unset($colJsDefinition->defaultValue);
        }

        if( ($cell_editor_type == 'wdt.date' || $cell_editor_type == 'date')
                && !empty( $colJsDefinition->defaultValue )) {
            //TODO: check if default value is a valid date
            $colJsDefinition->defaultDate = $colJsDefinition->defaultValue;
        }

        $colJsDefinition->search = $this->wdtColumn->isSearchable();

        if( !$this->wdtColumn->isVisible() ) {
            $colJsDefinition->readOnly = true;//don't want to allow editing of hidden columns(to actually be able to hide column need to purchase PRO version)
        }

        if($this->wdtColumn->getWidth() != 'auto'){
            $colJsDefinition->width = $this->wdtColumn->getWidth();
        }

        $colJsDefinition = apply_filters( 'wpdatatables_excel_filter_column_js_definition', $colJsDefinition, $this->wdtColumn->getTitle() );
        return $colJsDefinition;
    }


    /**
     * Returning cell editor type based on set wpdt editor input type.
     * Returns false if there is column has no editor.
     * Also prevents wrong combinations of column types and editors.
     *
     * @return bool|string
     */
    public function getEditorType() {
        $editor_type = false;

        switch( $this->wdtColumn->getInputType() ) {
            case 'none':
                $editor_type = false;
                break;
            case 'text':
            case 'link':
            case 'email':
                $editor_type = 'text';
                break;
            case 'textarea':
                $editor_type = 'wdt.text_multiline';
                break;
            case 'date':
                $editor_type = 'wdt.date';
                break;
            case 'datetime':
                $editor_type = 'wdt.datetime';
                break;
            case 'time':
                $editor_type = 'wdt.time';
                break;
            case 'selectbox':
                $editor_type = 'wdt.dropdown';
                break;
            case 'multi-selectbox':
                $editor_type = 'wdt.multi-select';
                break;
            case 'attachment':
                $editor_type = 'wdt.attachment';
                break;
        }

        $renderer_type = $this->getRendererType();

        //prevent errors that might be caused by wrong combination of column types and renderers
        if( $editor_type != false ) {
            switch( $renderer_type ) {
                case 'numeric':
                    if( !in_array( $editor_type, array('numeric', 'wdt.dropdown', 'wdt.multi-select') ) ) {
                        $editor_type = 'numeric';
                    }
                    break;
                case 'wdt.date':
                    $editor_type = 'wdt.date';
                    break;
                case 'wdt.link':
                    if( !in_array( $editor_type, array('text', 'wdt.attachment', 'wdt.dropdown', 'wdt.multi-select') ) ) {
                        $editor_type = 'text';
                    }
                    break;
                case 'wdt.email':
                    if( !in_array( $editor_type, array('text', 'wdt.dropdown', 'wdt.multi-select') ) ) {
                        $editor_type = 'text';
                    }
                    break;
                case 'wdt.image':
                    if( !in_array( $editor_type, array('text', 'wdt.attachment', 'wdt.dropdown', 'wdt.multi-select') ) ) {
                        $editor_type = 'wdt.attachment';
                    }
                    break;
            }
        }

        return $editor_type;
    }


    /**
     * Returning cell renderer type based on set wpdt column type.
     * @return string
     */
    public function getRendererType() {
        switch( $this->wdtColumn->getDataType() ) {
            case 'string':
                return 'text';
            case 'int':
            case 'float':
                return 'numeric';//built in validator and editor
            case 'date':
                return 'wdt.date';
            case 'datetime':
                return 'wdt.datetime';
            case 'time':
                return 'wdt.time';
            case 'link':
                return 'wdt.link';
            case 'email':
                return 'wdt.email';
            case 'icon':
                return 'wdt.image';
            default:
                return 'text';
        }
    }

    /**
     * Returns cell validator type based on determined cell renderer type.
     * @return null|string
     */
    public function getValidatorType() {
        switch( $this->getRendererType() ) {
            case 'text':
                return null;
            case 'numeric':
                return 'numeric';//builtin validator
            case 'wdt.date':
                return 'wdt.date';
            case 'wdt.link':
                return 'wdt.link';
            case 'wdt.email':
                return 'wdt.email';
            case 'wdt.image':
                return 'wdt.link';
            default:
                return null;
        }
    }

    /**
     * Creating cell definition properties based on determined renderer, editor and validator types.
     * @return stdClass
     */
    public function getCellTypeProps() {
        $renderer_type = $this->getRendererType();
        $editor_type = $this->getEditorType();
        $validator_type = $this->getValidatorType();

        $cellProps = new stdClass();//type, renderer, validator

        //no editor
        if( $editor_type == false ) {
            $cellProps->editor = $editor_type;
        }

        if( $editor_type == 'wdt.dropdown' ) {
            $cellProps->type = 'dropdown';//using built-in validator of dropdown cell type
        } else if( $editor_type == 'wdt.multi-select' ) {
            $cellProps->type = 'wdt.multi-select';
        }

        if( $renderer_type == 'wdt.date' ) {
            $cellProps->type = 'wdt.date';
        } else if( $renderer_type == 'wdt.datetime' ) {
            $cellProps->type = 'wdt.datetime';
        } else if( $renderer_type == 'wdt.time' ) {
            $cellProps->type = 'wdt.time';
        } else if( $renderer_type == 'numeric' && ($editor_type == 'numeric' || $editor_type == false ) ) {
            $cellProps->type = 'numeric';
        } else if ( $renderer_type == 'text' && ($editor_type == 'text' || $editor_type == false ) ) {
            $cellProps->type = 'text';
        } else {
            $cellProps->renderer = $renderer_type;
            $cellProps->editor = $editor_type;

            if ( !empty($validator_type) ) {
                $cellProps->validator = $validator_type;
            }
        }

        return $cellProps;
    }
}