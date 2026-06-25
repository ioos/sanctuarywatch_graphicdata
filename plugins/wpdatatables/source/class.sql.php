<?php

defined('ABSPATH') or die("Cannot access pages directly.");

/**
 * MySQL abstract layer for the WPDataTables module
 *
 * @author cjbug@ya.ru
 * @since 10.10.2012
 *
 * */
class PDTSql
{

    private $dbhost;
    private $dbname;
    private $dbuser;
    private $dbpass;
    private $dbport;
    private $link;
    private $sqllog;
    private $query;
    private $result;
    private $error;
    private $key;

    /**
     * Constructor
     * @param string $sqlhost
     * @param string $sqldbname
     * @param string $sqluser
     * @param string $sqlpassword
     */
    function __construct($sqlhost, $sqldbname, $sqluser, $sqlpassword, $sqlport)
    {
        $this->dbhost = (((string)$sqlhost)) ? $sqlhost : '';
        $this->dbname = (((string)$sqldbname)) ? $sqldbname : '';
        $this->dbuser = (((string)$sqluser)) ? $sqluser : '';
        $this->dbpass = (((string)$sqlpassword)) ? $sqlpassword : '';
        $this->dbport = (((int)$sqlport)) ? $sqlport : '3306';
        $this->sqlConnect();
    }

    /**
     * Initializes the connection to the database
     * @return boolean
     */
    function sqlConnect()
    {
        $this->link = @mysqli_connect($this->dbhost, $this->dbuser, $this->dbpass, $this->dbname, $this->dbport);
        if (!$this->link) {
            throw new Exception(mysqli_connect_error());
        } else {
            $result = mysqli_select_db($this->link, $this->dbname);
            mysqli_query($this->link, 'SET character_set_client="utf8",character_set_connection="utf8",character_set_results="utf8"; ');
            if (!$result) {
                throw new Exception(mysqli_error($this->link));
            }
        }
        return true;
    }

    /**
     * Determines if the connection is established
     */
    public function isConnected()
    {
        return !empty($this->link);
    }

    /**
     * Close the DB connection
     * @return boolean
     */
    function sqlClose()
    {
        mysqli_close();
        return true;
    }

    /**
     * Set the group key
     * @param string $key
     */
    function setGroupKey($key)
    {
        $this->key = $key;
    }

    /**
     * Clear the group key
     */
    function dropGroupKey()
    {
        $this->key = '';
    }

    /**
     * Do a query without expected result (insert, update, delete)
     * @param $query
     * @param parameters - a single array, or all values
     * separated by comma
     * @return boolean
     */
    function doQuery()
    {
        if ($result = $this->prepare(func_get_args())) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Get a single field value from query result
     * @param $query
     * @param parameters - a single array, or all values
     * separated by comma
     * @return boolean Get
     */
    function getField()
    {
        if ($result = $this->prepare(func_get_args())) {
            $row = mysqli_fetch_row($result);
            return $row[0];
        } else {
            return false;
        }
    }

    /**
     * Get a single row from query result
     * @param $query
     * @param parameters - a single array, or all values
     * separated by comma
     * @return boolean
     */
    function getRow()
    {
        if ($result = $this->prepare(func_get_args())) {
            $row = mysqli_fetch_assoc($result);
            @mysqli_free_result($result);
            return $row;
        } else {
            return false;
        }
    }

    /**
     * Get all results of a query as an indexed array
     *
     * @return array|bool
     */
    function getArray()
    {
        $tmp = null;
        if ($result = $this->prepare(func_get_args())) {
            while ($row = mysqli_fetch_array($result))
                $tmp[] = $row;
            @mysqli_free_result($result);
            return $tmp;
        } else {
            return false;
        }
    }

    /**
     * Get all results of a query as an assoc array
     * @param $query
     * @param parameters - a single array, or all values
     * separated by comma
     * @return boolean
     */
    function getAssoc()
    {
        if ($result = $this->prepare(func_get_args())) {
            while ($row = mysqli_fetch_assoc($result))
                $tmp[] = $row;
            @mysqli_free_result($result);
            return $tmp;
        } else {
            return false;
        }
    }


    /**
     * Returns the last MySQL error
     */
    function getLastError()
    {
        return mysqli_error($this->link);
    }

    /**
     * Get the results of a query as an assoc array
     * grouped by a provided key
     * @return bool
     */
    function getAssocGroups()
    {
        $properties = func_get_args();
        $key = $properties[0];
        array_shift($properties);
        if ($result = $this->prepare($properties)) {
            while ($row = mysqli_fetch_assoc($result))
                $tmp[($row[$key])][] = $row;
            @mysqli_free_result($result);
            return $tmp;
        } else {
            return false;
        }
    }

    /**
     * Get the results of a query sorted by a provided key
     * @return bool
     */
    function getAssocByKey()
    {
        $properties = func_get_args();
        $key = $properties[0];
        array_shift($properties);
        if ($result = $this->prepare($properties)) {
            while ($row = mysqli_fetch_assoc($result)) {
                $tmp[($row[$key])] = $row;
            }
            @mysqli_free_result($result);
            return $tmp;
        } else {
            return false;
        }
    }

    /**
     * Get the results of a query as pairs (id/val)
     * @param $query
     * @param parameters - a single array, or all values
     * separated by comma
     * @return boolean
     */
    function getPairs()
    {
        if ($result = $this->prepare(func_get_args())) {
            while (@$row = mysqli_fetch_row($result))
                $tmp[strval($row[0])] = $row[1];
            @mysqli_free_result($result);
            return $tmp;
        } else {
            return false;
        }
    }


    /**
     * Prepares the query and the parameters passed
     */
    function prepare($properties)
    {
        $q = $properties[0];
        unset($properties[0]);
//        $q = preg_replace('/\?/', 'x?x', $q);
        if (count($properties) > 1) {
            foreach ($properties as $p) {
                $p = '\'' . mysqli_real_escape_string($this->link, $p) . '\'';
                $q = preg_replace('/x\?x/', $p, $q, 1);
            }
        } elseif ((count($properties) == 1) && (is_array($properties[1]))) {
            foreach ($properties[1] as $p) {
                $p = '\'' . mysqli_real_escape_string($this->link, $p) . '\'';
                $q = preg_replace('/x\?x/', $p, $q, 1);
            }
        }
        $this->query = $q;
        $this->error = '';

        $result = mysqli_query($this->link, $this->query);

        if (mysqli_error($this->link)) {
            return false;
        }

        while (mysqli_more_results($this->link)) {
            mysqli_next_result($this->link);
            mysqli_store_result($this->link);
        }

        if (@mysqli_num_rows($result)) {
            $row = mysqli_fetch_assoc($result);
            if (isset($row['error'])) {
                $this->error = $row['error'];
                return false;
            } else {
                mysqli_data_seek($result, 0);
                return $result;
            }
        } else {
            return false;
        }
    }

    function getLastInsertId()
    {
        return mysqli_insert_id($this->link);
    }

}

?>
