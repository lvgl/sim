parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"wDWx":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.language=exports.conf=void 0;var e={wordPattern:/(#?-?\d*\.\d\w*%?)|([@#!.:]?[\w-?]+%?)|[@#!.]/g,comments:{blockComment:["/*","*/"],lineComment:"//"},brackets:[["{","}"],["[","]"],["(",")"]],autoClosingPairs:[{open:"{",close:"}",notIn:["string","comment"]},{open:"[",close:"]",notIn:["string","comment"]},{open:"(",close:")",notIn:["string","comment"]},{open:'"',close:'"',notIn:["string","comment"]},{open:"'",close:"'",notIn:["string","comment"]}],surroundingPairs:[{open:"{",close:"}"},{open:"[",close:"]"},{open:"(",close:")"},{open:'"',close:'"'},{open:"'",close:"'"}],folding:{markers:{start:new RegExp("^\\s*\\/\\*\\s*#region\\b\\s*(.*?)\\s*\\*\\/"),end:new RegExp("^\\s*\\/\\*\\s*#endregion\\b.*\\*\\/")}}};exports.conf=e;var t={defaultToken:"",tokenPostfix:".less",identifier:"-?-?([a-zA-Z]|(\\\\(([0-9a-fA-F]{1,6}\\s?)|[^[0-9a-fA-F])))([\\w\\-]|(\\\\(([0-9a-fA-F]{1,6}\\s?)|[^[0-9a-fA-F])))*",identifierPlus:"-?-?([a-zA-Z:.]|(\\\\(([0-9a-fA-F]{1,6}\\s?)|[^[0-9a-fA-F])))([\\w\\-:.]|(\\\\(([0-9a-fA-F]{1,6}\\s?)|[^[0-9a-fA-F])))*",brackets:[{open:"{",close:"}",token:"delimiter.curly"},{open:"[",close:"]",token:"delimiter.bracket"},{open:"(",close:")",token:"delimiter.parenthesis"},{open:"<",close:">",token:"delimiter.angle"}],tokenizer:{root:[{include:"@nestedJSBegin"},["[ \\t\\r\\n]+",""],{include:"@comments"},{include:"@keyword"},{include:"@strings"},{include:"@numbers"},["[*_]?[a-zA-Z\\-\\s]+(?=:.*(;|(\\\\$)))","attribute.name","@attribute"],["url(\\-prefix)?\\(",{token:"tag",next:"@urldeclaration"}],["[{}()\\[\\]]","@brackets"],["[,:;]","delimiter"],["#@identifierPlus","tag.id"],["&","tag"],["\\.@identifierPlus(?=\\()","tag.class","@attribute"],["\\.@identifierPlus","tag.class"],["@identifierPlus","tag"],{include:"@operators"},["@(@identifier(?=[:,\\)]))","variable","@attribute"],["@(@identifier)","variable"],["@","key","@atRules"]],nestedJSBegin:[["``","delimiter.backtick"],["`",{token:"delimiter.backtick",next:"@nestedJSEnd",nextEmbedded:"text/javascript"}]],nestedJSEnd:[["`",{token:"delimiter.backtick",next:"@pop",nextEmbedded:"@pop"}]],operators:[["[<>=\\+\\-\\*\\/\\^\\|\\~]","operator"]],keyword:[["(@[\\s]*import|![\\s]*important|true|false|when|iscolor|isnumber|isstring|iskeyword|isurl|ispixel|ispercentage|isem|hue|saturation|lightness|alpha|lighten|darken|saturate|desaturate|fadein|fadeout|fade|spin|mix|round|ceil|floor|percentage)\\b","keyword"]],urldeclaration:[{include:"@strings"},["[^)\r\n]+","string"],["\\)",{token:"tag",next:"@pop"}]],attribute:[{include:"@nestedJSBegin"},{include:"@comments"},{include:"@strings"},{include:"@numbers"},{include:"@keyword"},["[a-zA-Z\\-]+(?=\\()","attribute.value","@attribute"],[">","operator","@pop"],["@identifier","attribute.value"],{include:"@operators"},["@(@identifier)","variable"],["[)\\}]","@brackets","@pop"],["[{}()\\[\\]>]","@brackets"],["[;]","delimiter","@pop"],["[,=:]","delimiter"],["\\s",""],[".","attribute.value"]],comments:[["\\/\\*","comment","@comment"],["\\/\\/+.*","comment"]],comment:[["\\*\\/","comment","@pop"],[".","comment"]],numbers:[["(\\d*\\.)?\\d+([eE][\\-+]?\\d+)?",{token:"attribute.value.number",next:"@units"}],["#[0-9a-fA-F_]+(?!\\w)","attribute.value.hex"]],units:[["(em|ex|ch|rem|vmin|vmax|vw|vh|vm|cm|mm|in|px|pt|pc|deg|grad|rad|turn|s|ms|Hz|kHz|%)?","attribute.value.unit","@pop"]],strings:[['~?"',{token:"string.delimiter",next:"@stringsEndDoubleQuote"}],["~?'",{token:"string.delimiter",next:"@stringsEndQuote"}]],stringsEndDoubleQuote:[['\\\\"',"string"],['"',{token:"string.delimiter",next:"@popall"}],[".","string"]],stringsEndQuote:[["\\\\'","string"],["'",{token:"string.delimiter",next:"@popall"}],[".","string"]],atRules:[{include:"@comments"},{include:"@strings"},["[()]","delimiter"],["[\\{;]","delimiter","@pop"],[".","key"]]}};exports.language=t;
},{}]},{},["wDWx"], null)