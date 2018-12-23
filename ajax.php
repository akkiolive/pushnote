<?php
    //ajax送信でPOSTされたデータを受け取る
    $data = $_POST['text'];
    //「$return_array」をjson_encodeして出力
    echo $data;
    file_put_contents('notes.json', $data);

?>
