/* This file contains various utility functions.
 * Created 13 Dec 2010
 */

/* Implement the .indexOf array method using
 * the Mozilla implementation, if needed.
 * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
 */
if (!Array.prototype.indexOf)
{
    Array.prototype.indexOf = function(searchElement /*, fromIndex */)
    {
        "use strict";

        if (this === void 0 || this === null)
            throw new TypeError();

        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0)
            return -1;

        var n = 0;
        if (arguments.length > 0)
        {
            n = Number(arguments[1]);
            if (n !== n) // shortcut for verifying if it's NaN
                n = 0;
            else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0))
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
        }

        if (n >= len)
            return -1;

        var k = n >= 0
                    ? n
                    : Math.max(len - Math.abs(n), 0);

        for (; k < len; k++)
        {
            if (k in t && t[k] === searchElement)
                return k;
        }
        return -1;
    };
}

/* Array Remove - By John Resig (MIT Licensed)
 * http://ejohn.org/blog/javascript-array-remove/
 */
Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

/* Create an XML HTTP request.
 */
function xmlRequest(){
    var obj;
    //Create an XMLHttpRequest object, if possible.
    if (window.XMLHttpRequest){
        obj = new XMLHttpRequest();
    }
    //Create an ActiveXObject, for older versions
    //of Internet Explorer.
    else if (window.ActiveXObject){
        obj = new ActiveXObject("Microsoft.XMLHTTP");
    }
    else {
        obj = false;
    }
    return obj;
}

/* Check for browser compatibility of a given event.
 */
function isEventSupported(eventName){
    var tagNames = {
        'select':'input','change':'input',
        'submit':'form','reset':'form',
        'error':'img','load':'img','abort':'img'
    }
    var el = document.createElement(tagNames[eventName] || 'div');
    eventName = 'on' + eventName;
    var isSupported = (eventName in el);
    if (!isSupported){
        el.setAttribute(eventName, 'return;');
        isSupported = typeof el[eventName] == 'function';
    }
    el = null;
    return isSupported;
}

/* Check for browser compatibility of key elements.
 */
function checkCompatibility(){
    var obj = {};
    var test;
    //Input type="number"
    test = document.createElement("input");
    try {
        test.type = "number";
        obj.inputNumber = (test.type == "number");
    }
    catch(err) {
        obj.inputNumber = false;
    }
    return obj;
}

/* Test whether a variable is an array.
 */
function isArray(obj) {
    if (obj.constructor.toString().indexOf("Array") == -1){
        return false;
    }
    else {
        return true;
    }
}

/* Create a copy of an object.
 */
function copyObject(obj){
    var objCopy = {};
    for (var i in obj){
        objCopy[i] = obj[i];
    }
    return objCopy;
}

/* Remove a class name from an element if it is
 * already present, or add it if it is not (with
 * optional one-way behavior). 
 */
function toggleClass(className, element, direction){
    //Create a regular expression to
    //search for the classname, case
    //insensitively and globally
    var regex = new RegExp("( )?" + className, "gi");
    //Test for the classname
    if (regex.test(element.className)){
        //Remove it if found, unless
        //on-only is specified
        if (direction != "on"){
            element.className = element.className.replace(regex,"");
        }
    }
    else {
        //Append it if not found, unless
        //off-only is specified
        if (direction != "off"){
            element.className += " " + className;
        }
    }
    //Return true for a final state of "on", false otherwise
    return regex.test(element.className);
}

/* Create a new XML document.  This code is taken from
 * http://www.webreference.com/programming/javascript/definitive2/
 */
function newXMLDocument(rootTagName, namespaceURL) {
    if (!rootTagName){
        rootTagName = "";
    }
    if (!namespaceURL){
        namespaceURL = "";
    }
    //W3C standard
    if (document.implementation && document.implementation.createDocument) {
        return document.implementation.createDocument(namespaceURL, rootTagName, null);
    }
    //Internet Explorer 
    else { 
        //Create an empty document as an ActiveX object
        //If there is no root element, this is all we have to do
        var doc = new ActiveXObject("MSXML2.DOMDocument");
        //If there is a root tag, initialize the document
        if (rootTagName){
            //Look for a namespace prefix
            var prefix = "";
            var tagname = rootTagName;
            var p = rootTagName.indexOf(':');
            if (p != -1) {
                prefix = rootTagName.substring(0, p);
                tagname = rootTagName.substring(p + 1);
            }
            //If we have a namespace, we must have a namespace prefix
            //If we don't have a namespace, we discard any prefix
            if (namespaceURL){
                if (!prefix){
                    prefix = "a0"; // What Firefox uses
                }
                prefix += ":";
            }
            else prefix = "";
            //Create the root element (with optional
            //namespace) as a string of text
            var nsURL = namespaceURL ? " xmlns:" + prefix + '="' + namespaceURL +'"' : ""
            var text = "<" + prefix + tagname + nsURL + " />";
                   
            //And parse that text into the empty document
            doc.loadXML(text);
        }
        return doc;
    }
}

/* Get the cursor position, relative to
 * the invoking element.
 */
function getCursorPosition(evt){
    var e = evt || window.event;
    var xval;
    var yval;
    if (e.pageX || e.pageY){
        xval = e.pageX;
        yval = e.pageY;
    }
    else {
        xval = e.clientX + document.body.scrollLeft +
                document.documentElement.scrollLeft;
        yval = e.clientY + document.body.scrollTop +
                document.documentElement.scrollTop;
    }
    var offsetFind = function(obj){
        var styles = getComputedStyle(obj, null) || obj.currentStyle;
        var lborder = Number(styles.borderLeftWidth.replace(/[^0-9]/g,""));
        var lpadding = Number(styles.paddingLeft.replace(/[^0-9]/g,""));
        var tborder = Number(styles.borderTopWidth.replace(/[^0-9]/g,""));
        var tpadding = Number(styles.paddingTop.replace(/[^0-9]/g,""));
        var xOff = obj.offsetLeft + lborder + lpadding;
        var yOff = obj.offsetTop + tborder + tpadding;
        var offset = [xOff, yOff];
        if (obj.tagName == "HTML" || obj.tagName == "BODY"){
            return offset;
        }
        else {
            var offsetPar = offsetFind(obj.offsetParent);
            return [(offset[0] + offsetPar[0]), (offset[1] + offsetPar[1])]
        }
    };
    var offset = offsetFind(this);
    xval -= offset[0];
    yval -= offset[1];
    coords = { "x" : xval, "y" : yval };
    return coords;
}

/* Set up a cross-browser method for
 * picking up mousewheel events
 */
function addMouseWheelListener(element, method){
    //Set the method for use with the wheel
    element.wheelMethod = method;
    //Use the onmousewheel event, if it is available
    if (isEventSupported('mousewheel')){
        element.onmousewheel = function(evt){
            var e = evt || window.event;
            var direction = (Math.abs(e.wheelDelta) == e.wheelDelta) ? 1 : -1; //Negative is down
            this.wheelMethod(direction, evt);
            return false;
        }
    }
    //Use the DOMMouseScroll event otherwise
    else {
        element.addEventListener("DOMMouseScroll", function(evt){
            var e = evt || window.event;
            var direction = (Math.abs(e.detail) == e.detail) ? -1 : 1; //Negative is up
            this.wheelMethod(direction, evt);
            return false;
        }, false);
    }
}