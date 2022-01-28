
import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js';


var total, final_script;

self.MonacoEnvironment = {
	getWorkerUrl: function (moduleId, label) {
		if (label === 'json') {
			return './json.worker.js';
		}
		if (label === 'css') {
			return './css.worker.js';
		}
		if (label === 'html') {
			return './html.worker.js';
		}
		if (label === 'typescript' || label === 'javascript') {
			return './ts.worker.js';
		}
		return './editor.worker.js';
	},
};

/**
 * Add or update a query string parameter. If no URI is given, we use the current
 * window.location.href value for the URI.
 * 
 * Based on the DOM URL parser described here:
 * http://james.padolsey.com/javascript/parsing-urls-with-the-dom/
 *
 * @param   (string)    uri     Optional: The URI to add or update a parameter in
 * @param   (string)    key     The key to add or update
 * @param   (string)    value   The new value to set for key
 *
 * Tested on Chrome 34, Firefox 29, IE 7 and 11
 */
function update_query_string( uri, key, value ) {

	// Use window URL if no query string is provided
	if ( ! uri ) { uri = window.location.href; }

	// Create a dummy element to parse the URI with
	var a = document.createElement( 'a' ), 

		// match the key, optional square brackets, an equals sign or end of string, the optional value
		reg_ex = new RegExp( key + '((?:\\[[^\\]]*\\])?)(=|$)(.*)' ),

		// Setup some additional variables
		qs,
		qs_len,
		key_found = false;

	// Use the JS API to parse the URI 
	a.href = uri;

	// If the URI doesn't have a query string, add it and return
	if ( ! a.search ) {

		a.search = '?' + key + '=' + value;

		return a.href;
	}

	// Split the query string by ampersands
	qs = a.search.replace( /^\?/, '' ).split( /&(?:amp;)?/ );
	qs_len = qs.length; 

	// Loop through each query string part
	while ( qs_len > 0 ) {

		qs_len--;

		// Remove empty elements to prevent double ampersands
		if ( ! qs[qs_len] ) { qs.splice(qs_len, 1); continue; }

		// Check if the current part matches our key
		if ( reg_ex.test( qs[qs_len] ) ) {

			// Replace the current value
			qs[qs_len] = qs[qs_len].replace( reg_ex, key + '$1' ) + '=' + value;

			key_found = true;
		}
	}   

	// If we haven't replaced any occurrences above, add the new parameter and value
	if ( ! key_found ) { qs.push( key + '=' + value ); }

	// Set the new query string
	a.search = '?' + qs.join( '&' );

	return a.href;
}


var editor_cmd=0;

var snippetbin_url = "https://snippet-bin.herokuapp.com";

const query_revision = "script_direct";

window.set_dirty = function(){
  document.querySelectorAll('.dirty_watcher').
    forEach(e => e.classList.add('dirty'));
  let link = document.getElementById("link");
  link.textContent = "Link to online script (you have unsaved changes)";
}

window.clear_dirty = function(){
  document.querySelectorAll('.dirty_watcher.dirty').
    forEach(e => e.classList.remove('dirty'));
  link.textContent = "Link to online script";
}

var cache = {};
function cached_get(url){  
  if (url in cache) return Promise.resolve(cache[url]);
  else {
    return axios.get(url).then(res=>{
      cache[url] = res;
      return res;
    });
  }
}

function load_revision(revision, update_history, cb){
  if (!revision) return;
  cached_get(snippetbin_url + '/load_file/'+revision).then(res=>{
    current_revision = revision;
    editor_cmd++;
    setEditorValue(res.data.text);
    if (update_history){
      let history = document.getElementById("history");
      let revision_history_data = document.getElementById("history_data");
      while(revision_history_data.firstChild) {
        revision_history_data.removeChild(revision_history_data.firstChild);
      }
      res.data.history.forEach((item, i) => {
        let option = document.createElement('option');
        option.value = i;
        option.dataset.value = item;
        revision_history_data.appendChild(option);
      });
      history.max = res.data.history.length-1;
      history.value = 0;
    }
    let link = document.getElementById("link");
    link.setAttribute("href", update_query_string(window.location.href, query_revision, current_revision));
    link.textContent = "Link to online script";
    clear_dirty();
    if(cb != undefined)
      cb();
  }).catch(err=>{
    console.log(err);
  });
}

window.save = function(event){
  event.target.disabled = true;
  const span = event.target.childNodes[2];
  span.textContent = 'Saving...';
  const fin = () => {
    span.textContent = 'Save';
    event.target.disabled = false;
  };
  axios.post(snippetbin_url + '/save_file', {
    "text": getEditorValue(),
    "original_revision": current_revision
  }).then(res=>{
    load_revision(res.data.revision, true);
    fin();
  }).catch(err=>{
    console.log('ERROR: ' + err.message);
    fin();
  });
}

function copy(){
  document.querySelectorAll('.copying_watcher').
    forEach(e => e.classList.add('copying'));

  let link = document.getElementById("link");
  link.select();
  document.execCommand("copy");
}

function copy_complete(){
  document.querySelectorAll('.copying_watcher').
    forEach(e => e.classList.remove('copying'));
}



var external_link = null;
var external_script_value = null;
/** @type {monaco.editor.IStandaloneCodeEditor} */
var editor;
var iframe, term;
var script_passed = false;
var current_revision = null;
// Ctrl+L is mandatory ! need xterm.js 3.14+
function xterm_helper(term, key) {
    function ESC(data) {
        return String.fromCharCode(27)+data
    }
    if ( key.charCodeAt(0)==12 ) {
        var cy = 0+term.buffer.cursorY
        if ( cy > 0) {
        if (cy <= term.rows) {
            term.write( ESC("[B") )
            term.write( ESC("[J") )
            term.write( ESC("[A") )
        }

        term.write( ESC("[A") )
        term.write( ESC("[K") )
        term.write( ESC("[1J"))

        for (var i=1;i<cy;i++) {
            term.write( ESC("[A") )
            term.write( ESC("[M") )
        }
        term.write( ESC("[M") )
        }
        return false
    }
    return true
}
function forward_event(event) {
    if(iframe !== undefined && iframe !== null) {
        if(iframe.contentWindow !== null)
            iframe.contentWindow.document.dispatchEvent(new MouseEvent('mouseup'));
    }
}
/* From https://stackoverflow.com/a/1634841 */
function removeURLParameter(url, parameter) {
    //prefer to use l.search if you have a location/link object
    var urlparts = url.split('?');   
    if (urlparts.length >= 2) {

        var prefix = encodeURIComponent(parameter) + '=';
        var pars = urlparts[1].split(/[&;]/g);

        //reverse iteration as may be destructive
        for (var i = pars.length; i-- > 0;) {    
            //idiom for string.startsWith
            if (pars[i].lastIndexOf(prefix, 0) !== -1) {  
                pars.splice(i, 1);
            }
        }

        return urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : '');
    }
    return url;
}
document.onmouseup = forward_event;
function editor_change() {
}


/* MONACO COMPAT */
function getEditorValue() {
    return editor.getValue();
}
function setEditorValue(val) {
    editor.setValue(val);
}
/* END MONACO COMPAT */
window.runScript = function() {
    var $this = $("#run-button");
    $this.prop("disabled", "disabled");
    term.write('\x1bc');
    

    const context = document.getElementById("canvas").getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);


    iframe.setAttribute("data-cscript", LZString.compressToEncodedURIComponent(getEditorValue()));

    clear_iframe(iframe);
    iframe.src = get_iframe_url() /*+ "&timestamp=" + new Date().getTime()*/;
    iframe.contentWindow.location.href = iframe.src;
    console.log("Iframe src: " + iframe.src, "top", window.parent);
    term.setOption('disableStdin', true);
    term.write('Loading...\r');
}
window.reenableButton = function() {
    $("#run-button").removeProp('disabled');
    if(term != undefined && term != null)
        term.setOption('disableStdin', false);
}
function get_iframe_url() {
    /* Assemble the URL */
    var num_url_chars = (window.location.href.indexOf('?'));
    var base_url = window.location.href.substr(0, (num_url_chars == -1) ? undefined : num_url_chars);
    var a = base_url.split('/');
    var newPathname = a.slice(0, a.length - 2).join('/');
    console.log(newPathname);
    newPathname += "/lvgl.html" /*+ '?' + "env=dev"*/;
    return newPathname;
}
function processScriptArg(url, lzstring){
    var script_passed_handler = function() {
        console.log("Script passed: " + script_passed);
        runScript();
        script_passed = false;
    };
    if(!lzstring) {
        // if url is a single url we convert it to array
        if(!Array.isArray(url)){
            url = [{"url": url}];
        }
        var prev_external_link = external_link;
        var request = null;

        var error_handler = function() {
            if(prev_external_link != null) {
                external_link = prev_external_link;
            }
            if(request != null)
                alert("Failed to load script due to error " + request.status + ": " + request.statusText + "\nThe contents of the external link box have been reverted.");
            else
                alert("The URL you passed is invalid.");
        };

        try {
            url.forEach(e=>{
                new URL(e.url);
            });
        } catch(e) {
            error_handler();
            return;
        }

        // last url is probably the important one
        external_link = url[url.length-1].url;
        // read text from URL location
        url.forEach(e=>{
            let request = new XMLHttpRequest();
            console.log("GET " + e.url);
            request.overrideMimeType("text/plain");
            request.open('GET', e.url, true);
            request.send(null);
            request.onerror = error_handler;
            request.onreadystatechange = function () {
                if (request.readyState === 4) {
                    if(request.status == 200) {
                        console.log(request.reponseText);
                        if(request.responseText === undefined)
                            return;
                        e.content = request.responseText;
                        // check if all of them have content
                        total = url.reduce((total, el) => total+("content" in el) ,0);
                        console.log(total+" of "+url.length+" loaded");
                        if(total==url.length){
                            final_script = "";
                            url.forEach(e=>{
                                if("comment" in e){
                                    final_script += "##### "+e.comment+" #####\n\n";
                                }
                                final_script += e.content + "\n\n";
                            })
                            setEditorValue(final_script);
                            script_passed_handler();
                        }
                    } else {
                        error_handler();
                    }
                }
            }
        });
    } else {
        external_link = null;
        // decompress LZString
        current_revision = url;
        load_revision(current_revision, true, function() {
            script_passed_handler();
        });
    }
    
}
function getSearchArg(argname) {
    /* Run custom script if passed */
    var custom = undefined;
    try {
        custom = new URL(window.location.href).searchParams.get(argname);
    } catch (e) {
        console.log(e + ": URL seems to be unsupported");
    }
    return custom;
}
function clear_iframe(iframe) {
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write("");
    iframe.contentWindow.document.close();
}

function setupPythonEditor() {
    const editorDiv = document.getElementById('editor');
    editorDiv.textContent = '';
    
    editor = monaco.editor.create(editorDiv, {
        value: 'print("hello world")',
        language: 'python',
        automaticLayout: false // the important part
    });
}
$(window).load(function() {
    $(document).on('shown.bs.tooltip', function (e) {
        setTimeout(function () {
            $(e.target).tooltip('hide');
        }, 5000);
    });
    window.clear_dirty();
    /* Enable tooltips */
    $('[data-toggle="tooltip"]').tooltip(); 

    setupPythonEditor();
    /*
    editor = ace.edit("editor");
    editor.getSession().setUseWrapMode(true);
    editor.setAutoScrollEditorIntoView(true);
    var PythonMode = ace.require("ace/mode/python").Mode;
    editor.session.setMode(new PythonMode());
    */
    iframe = document.getElementById("emscripten-iframe");
    iframe.src = "about:blank";
    iframe.contentWindow.location.href = iframe.src;
    clear_iframe(iframe);
    

    
    Terminal.applyAddon(fit);
    term = new Terminal({
        tabStopWidth : 8,
            cursorBlink : true,
            cursorStyle : 'block',
            applicationCursor : true
    });
    var mp_js_stdout = document.getElementById('mp_js_stdout');
    mp_js_stdout.value = "";
    term.open(mp_js_stdout);
    term.fit();
    term.on('data', function(key, e) {
        if ( xterm_helper(term, key) ) {
            for(var i = 0; i < key.length; i++) {
                if(iframe.contentWindow !== null)
                    iframe.contentWindow.mp_js_process_char(key.charCodeAt(i));
            }
        }
    });
    
    mp_js_stdout.addEventListener('print', function(e) {
        var text = e.data;
                            term.write(text);
    }, false);
    editor.onDidChangeModelContent(() => {
        if (editor_cmd) editor_cmd--;
        else window.set_dirty();
    });
    editor.layout();
    term.fit();
    var script = getSearchArg("script");
    var script_direct = getSearchArg("script_direct");
    var script_startup = getSearchArg("script_startup");
    if(script_direct !== undefined && script_direct !== null) {
        script_passed = true;
        processScriptArg(script_direct, true);
    } else if(script_startup !== undefined && script_startup !== null) {
        // both startup script and normal script are passed
        if(script !== undefined && script !== null) {
            script_passed = true;
            // pass an array of objects
            processScriptArg([
                {
                    "comment": "startup script",
                    "url": script_startup
                },
                {
                    "comment": "main script",
                    "url": script
                }
            ]);
        }else{
            script_passed = true;
            processScriptArg(script_startup);
        }
    } else if(script !== undefined && script !== null) {
        script_passed = true;
        processScriptArg(script);
    } else
        runScript();
});
$(window).resize(function() {
    editor.layout();
    //editor.resize();
    term.fit();
});
