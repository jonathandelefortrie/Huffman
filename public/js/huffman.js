function HuffmanEncode(str) {
    
    var str = str;
    var count = {};
    var encoded = "";
    var encoding = {};

    var encoder = function(ary, prefix) {
        if (ary instanceof Array) {
            encoder(ary[0], prefix + "0");
            encoder(ary[1], prefix + "1");
        } else {
            encoding[ary] = prefix;
        }
    }

    for (var i = 0; i < str.length; i++) 
        if (str[i] in count) 
            count[str[i]] ++;
        else 
            count[str[i]] = 1;
 
    var pq = new BinaryHeap(function(x){return x[0];});
    for (var ch in count) 
        pq.push([count[ch], ch]);
 
    while (pq.size() > 1)
    {
        var pair1 = pq.pop();
        var pair2 = pq.pop();
        pq.push([pair1[0]+pair2[0], [pair1[1], pair2[1]]]);
    }
 
    var tree = pq.pop();
    encoder(tree[1], "");
 
    for (var i = 0; i < str.length; i++) {
        encoded += encoding[str[i]];
    }

    return {encoding:encoding,encoded:encoded};
}
 
function HuffmanDecode(encode) {

    var pos = 0;
    var decoded = "";
    var decoding = {};

    for (var ch in encode.encoding) 
        decoding[encode.encoding[ch]] = ch;

    while (pos < encode.encoded.length) {
        var key = "";
        while (!(key in decoding)) {
            key += encode.encoded[pos];
            pos++;
        }
        decoded += decoding[key];
    }
    return decoded;
}