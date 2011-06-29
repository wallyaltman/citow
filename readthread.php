<?php
/*******************************************************************************
 * http://www.appliednerditry.com/chaos/readthread.php
 * Author:  Wally Altman
 * This script retrieves an HTML document from the Penny-Arcade forums, and if
 * necessary, attempts to identify the thread number (as in the "t=" parameter).
 ******************************************************************************/

$t = is_numeric($_GET["t"]) ? $_GET["t"] : null;
$p = is_numeric($_GET["p"]) ? $_GET["p"] : null;
//Build the request URL
$page = 'http://forums.penny-arcade.com/showthread.php';
if ($t) {
    $query = '?t=' . $t;
} else {
    $query = '?p=' . $p;
}
$url = $page . $query;
//Get the page
$html = file_get_contents($url);
//echo $html;
//Load as a DOM document
$doc = new DOMDocument();
$loaded = $doc->loadHTML($html);
//See if it worked
if ($loaded) {
    $xpath = new DOMXPath($doc);
    $value = $xpath->query('//div[@class="panel"]/div/div')->item(0)->nodeValue;
    if (value == 'No Thread specified. If you followed a valid link, please notify the administrator'
            || value == 'The server is too busy at the moment. Please try again later.') {
        $fail = true;
    }
} else {
    $fail = true;
}

if (!$fail) {
    if ($t) {
        $threadnum = $t;
    } else {
        $searchurl = $xpath->query('//div[@class="page"]/div/div[@class="smallfont"][1]/a[1]')->item(0)->getAttribute('href');
        $matches = array();
        preg_match('/t=(\d+)/', $searchurl, $matches);
        //var_dump($matches);
        $threadnum = is_numeric($matches[1]) ? $matches[1] : -1;
    }
} else {
    $threadnum = -1;
}
echo $threadnum;
?>

