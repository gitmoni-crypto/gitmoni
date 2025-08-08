<?php
$privateKey = openssl_pkey_new(['private_key_bits' => 2048]);
openssl_pkey_export($privateKey, $privKeyOut);
$details = openssl_pkey_get_details($privateKey);
$pubKey = $details['key'];
$address = substr(sha1($pubKey), 0, 40);
echo "Address: $address\n";
echo "Private Key:\n$privKeyOut";
echo "Public Key:\n$pubKey";
