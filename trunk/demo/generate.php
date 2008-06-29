<?php

$arr = array('Alex W', 'Dave M', 'Evan N', 'Alan G',
             'Susan H', 'Kerri L', 'Richard F', 'Andrew H',
             'Brian M', 'Tony D', 'Nicholas C', 'Robert R',
             'Homer S', 'Marge S', 'The Pantheon', 'Washington University',
             'New York University',
             'Suspendisse', 'velit', 'Etiam', 'tellus', 'eget', 'lectus',
             'semper', 'elementum', 'sit', 'ligula', 
             'neque', 'eleifend', 'lacinia', 'Sed', 'nisl', 'diam', 
             'volutpat', 'sit', 'amet', 'blandit', 'accumsan',
             'pede', 'Integer', 'nunc', 'Duis', 'molestie', 'eleifend', 'mauris',
             'eget', 'lectus', 'Cras', 'eros');
 
$data = array();
for($i=0; $i<count($arr); $i++) {
   $num_links = mt_rand(0, round(count($arr)/4));
   
   $item = array('id' => preg_replace('/\s+?/', '', $arr[$i]), 'text' => $arr[$i], 'connections' => array());
   
   for($j=0; $j<$num_links; $j++) {
      $r = mt_rand(0, count($arr) - 1);
      while(in_array(preg_replace('/\s+?/', '', $arr[$r]), $item['connections']) || $arr[$r] == $arr[$i])
         $r = mt_rand(0, count($arr) - 1);
      
      $linkStrength = ($_GET['multi'] == 1 ? mt_rand(1, 10) : 1);

      $item['connections'][] = ($_GET['multi'] == 1 ? array(preg_replace('/\s+?/', '', $arr[$r]), $linkStrength) : preg_replace('/\s+?/', '', $arr[$r]));
   }
   
   $data[] = $item;
}

print json_encode($data);
?>