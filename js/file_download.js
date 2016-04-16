// http://stackoverflow.com/questions/43455/how-do-i-serialize-a-dom-to-xml-text-using-javascript-in-a-cross-browser-way
function xmlToString(xmlData) {
  try {
    // Gecko- and Webkit-based browsers (Firefox, Chrome), Opera.
    return (new XMLSerializer()).serializeToString(xmlData);
  }
  catch (e) {
    try {
      // IE
      return xmlData.xml;
    }
    catch (e) {  
      //Other browsers without XML Serializer
      alert('Xmlserializer not supported');
    }
  }
  return false;
}

// http://cwestblog.com/2014/10/21/javascript-creating-a-downloadable-file-in-the-browser/
function setupDownloadLink(link) {
  //TODO: use xml2json and json2xml accordingly to it's license (LGPL 2.1)
  var xmlFromJson = json2xml(scoreJson, '  ');
  //TODO: read header from original file
  var xmlHeaderString = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n'+
  '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">\n';
  link.download = uploadedFileName.split(".xml")[0] + '[edited].xml';
  link.href = 'data:text/xml;charset=utf-8,' + encodeURIComponent(xmlHeaderString + formatXml(xmlFromJson));
}

// http://stackoverflow.com/questions/376373/pretty-printing-xml-with-javascript
// answered Mar 24 '10 at 17:18 by schellsan
// TODO: needs to be fine tuned - put leaf element with it's content on one line
function formatXml(xml) {
    var reg = /(>)\s*(<)(\/*)/g;
    var wsexp = / *(.*) +\n/g;
    var contexp = /(<.+>)(.+\n)/g;
    xml = xml.replace(reg, '$1\n$2$3').replace(wsexp, '$1\n').replace(contexp, '$1\n$2');
    var pad = 0;
    var formatted = '';
    var lines = xml.split('\n');
    var indent = 0;
    var lastType = 'other';
    // 4 types of tags - single, closing, opening, other (text, doctype, comment) - 4*4 = 16 transitions 
    var transitions = {
        'single->single'    : 0,
        'single->closing'   : -1,
        'single->opening'   : 0,
        'single->other'     : 0,
        'closing->single'   : 0,
        'closing->closing'  : -1,
        'closing->opening'  : 0,
        'closing->other'    : 0,
        'opening->single'   : 1,
        'opening->closing'  : 0, 
        'opening->opening'  : 1,
        'opening->other'    : 1,
        'other->single'     : 0,
        'other->closing'    : -1,
        'other->opening'    : 0,
        'other->other'      : 0
    };

    for (var i=0; i < lines.length; i++) {
        var ln = lines[i];
        var single = Boolean(ln.match(/<.+\/>/)); // is this line a single tag? ex. <br />
        var closing = Boolean(ln.match(/<\/.+>/)); // is this a closing tag? ex. </a>
        var opening = Boolean(ln.match(/<[^!].*>/)); // is this even a tag (that's not <!something>)
        var type = single ? 'single' : closing ? 'closing' : opening ? 'opening' : 'other';
        var fromTo = lastType + '->' + type;
        lastType = type;
        var padding = '';

        indent += transitions[fromTo];
        for (var j = 0; j < indent; j++) {
            padding += '  ';
        }

        formatted += padding + ln + '\n';
    }

    return formatted;
}