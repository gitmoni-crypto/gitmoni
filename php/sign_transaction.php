<?php
// Signs a transaction using a private key
$txFile = $argv[1] ?? null;
$privKeyFile = $argv[2] ?? null;
if (!$txFile || !$privKeyFile) {
    die("Usage: php sign_transaction.php <tx.json> <private.key>\n");
}
$tx = json_decode(file_get_contents($txFile), true);
$privKey = file_get_contents($privKeyFile);
$data = json_encode($tx);
openssl_sign($data, $signature, $privKey, OPENSSL_ALGO_SHA256);
$tx['inputs'][0]['signature'] = base64_encode($signature);
file_put_contents($txFile, json_encode($tx, JSON_PRETTY_PRINT));
echo "Signed transaction saved.\n";
