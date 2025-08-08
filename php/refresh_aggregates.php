<?php
require 'validate_chain.php';

file_put_contents("balances.json", json_encode($balances, JSON_PRETTY_PRINT));

// Optional: update join_map.json
$joinMap = [];
$txFiles = glob("transactions/*.json");
foreach ($txFiles as $file) {
    $txs = json_decode(file_get_contents($file), true);
    $ts = date("c", filemtime($file));
    foreach ($txs as $tx) {
        foreach ($tx['outputs'] as $output) {
            $to = $output['to'];
            if (!isset($joinMap[$to])) {
                $joinMap[$to] = $ts;
            }
        }
    }
}
file_put_contents("join_map.json", json_encode($joinMap, JSON_PRETTY_PRINT));
