<?php
parse_str(str_replace('"', '', stripslashes($_GET['json'])), $_GET);

$arr = array('Alex W', 'Dave M', 'Evan N', 'Alan G',
             'Susan H', 'Kerri L', 'Richard F', 'Andrew H',
             'Brian M', 'Tony D', 'Nicholas C', 'Robert R',
             'Homer S', 'Marge S', 'The Pantheon', 'Washington University',
             'New York University');
 
$data = '[';
for($i=0;$i<count($arr);$i++) {
   $num_links = rand(0, round(count($arr)/2));
   
   $str = "['" . $arr[$i] . "',";
   $picked = array();
   for($j=0;$j<$num_links;$j++) {
      $r = rand(0, count($arr)-1);
      while(in_array($arr[$r], $picked) || $arr[$r] == $arr[$i])
         $r = rand(0, count($arr)-1);
      
      $linkStrength = ($_GET['multi'] == 1 ? rand(1, 10) : 1);
      if($linkStrength == 1)
         $str .= "'" . $arr[$r] . "',";
      else
         $str .= "['" . $arr[$r] . "',$linkStrength],";
      
      $picked[] = $arr[$r];
   }
   
   $data .= substr($str, 0, strlen($str) - 1) . '],';
}
$data .= ']';

print str_replace('],]', ']]', $data);
?>