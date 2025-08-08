<?php
$txFile = $argv[1] ?? null;
$privKeyFile = $argv[2] ?? null;
if (!$txFile || !$privKeyFile) {
    die("Usage: php sign_transaction.php <tx.json> <private.key>\n");
}
$tx = json_decode(file_get_contents($txFile), true);
$privKey = file_get_contents($privKeyFile);
$data = $tx;
foreach ($data['inputs'] as &$input) {
    unset($input['signature']);
}
$rawData = json_encode($data);
openssl_sign($rawData, $signature, $privKey, OPENSSL_ALGO_SHA256);
$tx['inputs'][0]['signature'] = base64_encode($signature);
file_put_contents($txFile, json_encode($tx, JSON_PRETTY_PRINT));
echo "Signed transaction saved.\n";
