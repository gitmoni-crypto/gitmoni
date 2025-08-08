<?php
$balances = [];
$txFiles = glob("transactions/*.json");
foreach ($txFiles as $file) {
    $txs = json_decode(file_get_contents($file), true);
    foreach ($txs as $tx) {
        foreach ($tx['inputs'] as $input) {
            $from = $input['from'];
            $sig = base64_decode($input['signature']);
            $pubkey = $input['public_key'];
            $amount = $input['amount'];
            $derivedAddress = substr(sha1($pubkey), 0, 40);
            if ($derivedAddress !== $from) {
                echo "❌ Public key mismatch for $from in $file\n";
                exit(1);
            }
            $copy = $tx;
            foreach ($copy['inputs'] as &$i) unset($i['signature']);
            $data = json_encode($copy);
            if (!openssl_verify($data, $sig, $pubkey, OPENSSL_ALGO_SHA256)) {
                echo "❌ Invalid signature for $from in $file\n";
                exit(1);
            }
            $balances[$from] = ($balances[$from] ?? 0) - $amount;
        }
        foreach ($tx['outputs'] as $output) {
            $to = $output['to'];
            $amount = $output['amount'];
            $balances[$to] = ($balances[$to] ?? 0) + $amount;
        }
    }
}
echo "✅ All transactions valid\n";
