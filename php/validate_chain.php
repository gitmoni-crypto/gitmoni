<?php
$balances = json_decode(file_get_contents("balances.json"), true);
$pubkeys = json_decode(file_get_contents("public_keys.json"), true);
$txFiles = glob("transactions/*.json");

foreach ($txFiles as $file) {
    $txs = json_decode(file_get_contents($file), true);
    foreach ($txs as $tx) {
        foreach ($tx['inputs'] as $input) {
            $from = $input['from'];
            $sig = base64_decode($input['signature']);
            $amount = $input['amount'];

            if (!isset($balances[$from]) || $balances[$from] < $amount) {
                echo "❌ Insufficient funds for $from in $file\n";
                exit(1);
            }

            $pubkey = $pubkeys[$from] ?? null;
            if (!$pubkey) {
                echo "❌ No public key for $from\n";
                exit(1);
            }

            $txCopy = $tx;
            unset($txCopy['inputs'][0]['signature']);
            $data = json_encode($txCopy);

            $verified = openssl_verify($data, $sig, $pubkey, OPENSSL_ALGO_SHA256);
            if (!$verified) {
                echo "❌ Invalid signature for $from in $file\n";
                exit(1);
            }

            $balances[$from] -= $amount;
        }

        foreach ($tx['outputs'] as $output) {
            $to = $output['to'];
            $amount = $output['amount'];
            $balances[$to] = ($balances[$to] ?? 0) + $amount;
        }
    }
}
echo "✅ All transactions are valid!\n";
