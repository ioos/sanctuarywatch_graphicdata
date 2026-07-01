<?php

defined('ABSPATH') or die("Cannot access pages directly.");

/**
 * Class PDTTpl is an extremely lightweight templater used to render tables
 * for the WPDataTables module.
 *
 * @author cjbug@ya.ru
 * 
 * @since September 2012
 */
class PDTTpl{
    
    private $data;
    private $body;
    private $js;
    private $css;
    
    function setTemplate($b)    { $this->body                   = $b;  }  
    function addCss($c)         { $this->data['_css'][]         = $c;  }
    function addJs($j)          { $this->data['_js'][]          = $j;  }    
    function addBread($n,$l)    { $this->breadcrumbs[$n]        = $l;  }

    function addData($key, $val){
        $this->data[$key] = $val;    
    }

    function addDataRef($key, $val){
        $this->data[$key] = $val;    
    }
    
    function showData(){
    	if(!empty($this->data)){
	        foreach ($this->data as $key=>$value) {
	            $$key=$value;   
	        }
	        unset($this->data);
	    	}
        if(!empty($_css)){
            foreach($_css as $css_file){
                echo '<link rel="stylesheet" href="'.$css_file.'" type="text/css" media="screen, projection" />'."\n";
            }
            unset($_css);
        }
        if(!empty($_js)){
            foreach($_js as $js_file){
                echo '<script type="text/javascript" src="'.$js_file.'"></script>'."\n";
            }
            unset($_js);
        }
        /**
         * New filter introduced in version 1.6
         *
         * @author Vladica Bibeskovic
         */
        $template_file = apply_filters('wpdatatables_filter_template_file_location', WDT_TEMPLATE_PATH . $this->body);
        if( file_exists( $template_file )) {
            include( $template_file );
        } else {
            include( WDT_TEMPLATE_PATH . $this->body );
        }
    }
    
    function returnData(){
        ob_start();
        $this->showData();
        $ret_val = ob_get_contents();
        ob_end_clean();
        return $ret_val;
    }
    
}
?>