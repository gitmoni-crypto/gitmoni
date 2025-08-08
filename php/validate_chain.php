<?php
$balances = json_decode(file_get_contents("balances.json"), true);
$txFiles = glob("transactions/*.json");

foreach ($txFiles as $file) {
    $txs = json_decode(file_get_contents($file), true);
    foreach ($txs as $tx) {
        foreach ($tx['inputs'] as $input) {
            $from = $input['from'];
            $sig = base64_decode($input['signature']);
            $pubkey = $input['public_key'];
            $amount = $input['amount'];

            if (!isset($balances[$from]) || $balances[$from] < $amount) {
                echo "❌ Insufficient funds for $from in $file\n";
                exit(1);
            }

            $derivedAddress = substr(sha1($pubkey), 0, 40);
            if ($derivedAddress !== $from) {
                echo "❌ Public key does not match 'from' address in $file\n";
                exit(1);
            }

            $txCopy = $tx;
            foreach ($txCopy['inputs'] as &$in) {
                unset($in['signature']);
            }
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
