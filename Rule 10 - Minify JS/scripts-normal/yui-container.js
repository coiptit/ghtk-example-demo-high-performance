/*
Copyright (c) 2007, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.2.2
*/
/**
 * The YAHOO object is the single global object used by YUI Library.  It
 * contains utility function for setting up namespaces, inheritance, and
 * logging.  YAHOO.util, YAHOO.widget, and YAHOO.example are namespaces
 * created automatically for and used by the library.
 * @module yahoo
 * @title  YAHOO Global
 */

/**
 * YAHOO_config is not included part of the library.  Instead it is an object
 * that can be defined by the implementer immediately before including the
 * YUI library.  The properties included in this object will be used to
 * configure global properties needed as soon as the library begins to load.
 * @class YAHOO_config
 * @static
 */

/**
 * A reference to a function that will be executed every time a YAHOO module
 * is loaded.  As parameter, this function will receive the version
 * information for the module. See <a href="YAHOO.env.html#getVersion">
 * YAHOO.env.getVersion</a> for the description of the version data structure.
 * @property listener
 * @static
 */
 if (typeof YAHOO == "undefined") {
    /**
     * The YAHOO global namespace object.  If YAHOO is already defined, the
     * existing YAHOO object will not be overwritten so that defined
     * namespaces are preserved.
     * @class YAHOO
     * @static
     */
    var YAHOO = {};
}

/**
 * Returns the namespace specified and creates it if it doesn't exist
 * <pre>
 * YAHOO.namespace("property.package");
 * YAHOO.namespace("YAHOO.property.package");
 * </pre>
 * Either of the above would create YAHOO.property, then
 * YAHOO.property.package
 *
 * Be careful when naming packages. Reserved words may work in some browsers
 * and not others. For instance, the following will fail in Safari:
 * <pre>
 * YAHOO.namespace("really.long.nested.namespace");
 * </pre>
 * This fails because "long" is a future reserved word in ECMAScript
 *
 * @method namespace
 * @static
 * @param  {String*} arguments 1-n namespaces to create 
 * @return {Object}  A reference to the last namespace object created
 */
YAHOO.namespace = function() {
    var a=arguments, o=null, i, j, d;
    for (i=0; i<a.length; i=i+1) {
        d=a[i].split(".");
        o=YAHOO;

        // YAHOO is implied, so it is ignored if it is included
        for (j=(d[0] == "YAHOO") ? 1 : 0; j<d.length; j=j+1) {
            o[d[j]]=o[d[j]] || {};
            o=o[d[j]];
        }
    }

    return o;
};

/**
 * Uses YAHOO.widget.Logger to output a log message, if the widget is
 * available.
 *
 * @method log
 * @static
 * @param  {String}  msg  The message to log.
 * @param  {String}  cat  The log category for the message.  Default
 *                        categories are "info", "warn", "error", time".
 *                        Custom categories can be used as well. (opt)
 * @param  {String}  src  The source of the the message (opt)
 * @return {Boolean}      True if the log operation was successful.
 */
YAHOO.log = function(msg, cat, src) {
    var l=YAHOO.widget.Logger;
    if(l && l.log) {
        return l.log(msg, cat, src);
    } else {
        return false;
    }
};


/**
 * Initializes the global by creating the default namespaces and applying
 * any new configuration information that is detected.
 * @method init
 * @static
 */
YAHOO.init = function() {
    this.namespace("util", "widget", "example");
    if (typeof YAHOO_config != "undefined") {
        var l=YAHOO_config.listener,ls=YAHOO.env.listeners,unique=true,i;
        if (l) {
            // if YAHOO is loaded multiple times we need to check to see if
            // this is a new config object.  If it is, add the new component
            // load listener to the stack
            for (i=0;i<ls.length;i=i+1) {
                if (ls[i]==l) {
                    unique=false;
                    break;
                }
            }
            if (unique) {
                ls.push(l);
            }
        }
    }
};

/**
 * Registers a module with the YAHOO object
 * @method register
 * @static
 * @param {String}   name    the name of the module (event, slider, etc)
 * @param {Function} mainClass a reference to class in the module.  This
 *                             class will be tagged with the version info
 *                             so that it will be possible to identify the
 *                             version that is in use when multiple versions
 *                             have loaded
 * @param {Object}   data      metadata object for the module.  Currently it
 *                             is expected to contain a "version" property
 *                             and a "build" property at minimum.
 */
YAHOO.register = function(name, mainClass, data) {
    var mods = YAHOO.env.modules;
    if (!mods[name]) {
        mods[name] = { versions:[], builds:[] };
    }
    var m=mods[name],v=data.version,b=data.build,ls=YAHOO.env.listeners;
    m.name = name;
    m.version = v;
    m.build = b;
    m.versions.push(v);
    m.builds.push(b);
    m.mainClass = mainClass;
    // fire the module load listeners
    for (var i=0;i<ls.length;i=i+1) {
        ls[i](m);
    }
    // label the main class
    if (mainClass) {
        mainClass.VERSION = v;
        mainClass.BUILD = b;
    } else {
        YAHOO.log("mainClass is undefined for module " + name, "warn");
    }
};

/**
 * YAHOO.env is used to keep track of what is known about the YUI library and
 * the browsing environment
 * @class YAHOO.env
 * @type Object
 * @static
 */
YAHOO.env = YAHOO.env || {
    /**
     * Keeps the version info for all YUI modules that have reported themselves
     * @property modules
     * @type Object[]
     */
    modules: [],
    
    /**
     * List of functions that should be executed every time a YUI module
     * reports itself.
     * @property listeners
     * @type Function[]
     */
    listeners: [],
    
    /**
     * Returns the version data for the specified module:
     *      <dl>
     *      <dt>name:</dt>      <dd>The name of the module</dd>
     *      <dt>version:</dt>   <dd>The version in use</dd>
     *      <dt>build:</dt>     <dd>The build number in use</dd>
     *      <dt>versions:</dt>  <dd>All versions that were registered</dd>
     *      <dt>builds:</dt>    <dd>All builds that were registered.</dd>
     *      <dt>mainClass:</dt> <dd>An object that was was stamped with the
     *                 current version and build. If 
     *                 mainClass.VERSION != version or mainClass.BUILD != build,
     *                 multiple versions of pieces of the library have been
     *                 loaded, potentially causing issues.</dd>
     *       </dl>
     *
     * @method getVersion
     * @static
     * @param {String}  name the name of the module (event, slider, etc)
     * @return {Object} The version info
     */
    getVersion: function(name) {
        return YAHOO.env.modules[name] || null;
    }
};

/**
 * Provides the language utilites and extensions used by the library
 * @class YAHOO.lang
 */
YAHOO.lang = {
    /**
     * Determines whether or not the provided object is an array
     * @method isArray
     * @param {any} obj The object being testing
     * @return Boolean
     */
    isArray: function(obj) { // frames lose type, so test constructor string
        if (obj && obj.constructor && 
                   obj.constructor.toString().indexOf('Array') > -1) {
            return true;
        } else {
            return YAHOO.lang.isObject(obj) && obj.constructor == Array;
        }
    },

    /**
     * Determines whether or not the provided object is a boolean
     * @method isBoolean
     * @param {any} obj The object being testing
     * @return Boolean
     */
    isBoolean: function(obj) {
        return typeof obj == 'boolean';
    },
    
    /**
     * Determines whether or not the provided object is a function
     * @method isFunction
     * @param {any} obj The object being testing
     * @return Boolean
     */
    isFunction: function(obj) {
        return typeof obj == 'function';
    },
        
    /**
     * Determines whether or not the provided object is null
     * @method isNull
     * @param {any} obj The object being testing
     * @return Boolean
     */
    isNull: function(obj) {
        return obj === null;
    },
        
    /**
     * Determines whether or not the provided object is a legal number
     * @method isNumber
     * @param {any} obj The object being testing
     * @return Boolean
     */
    isNumber: function(obj) {
        return typeof obj == 'number' && isFinite(obj);
    },
      
    /**
     * Determines whether or not the provided object is of type object
     * or function
     * @method isObject
     * @param {any} obj The object being testing
     * @return Boolean
     */  
    isObject: function(obj) {
        return obj && (typeof obj == 'object' || YAHOO.lang.isFunction(obj));
    },
        
    /**
     * Determines whether or not the provided object is a string
     * @method isString
     * @param {any} obj The object being testing
     * @return Boolean
     */
    isString: function(obj) {
        return typeof obj == 'string';
    },
        
    /**
     * Determines whether or not the provided object is undefined
     * @method isUndefined
     * @param {any} obj The object being testing
     * @return Boolean
     */
    isUndefined: function(obj) {
        return typeof obj == 'undefined';
    },
    
    /**
     * Determines whether or not the property was added
     * to the object instance.  Returns false if the property is not present
     * in the object, or was inherited from the prototype.
     * This abstraction is provided to enable hasOwnProperty for Safari 1.3.x.
     * There is a discrepancy between YAHOO.lang.hasOwnProperty and
     * Object.prototype.hasOwnProperty when the property is a primitive added to
     * both the instance AND prototype with the same value:
     * <pre>
     * var A = function() {};
     * A.prototype.foo = 'foo';
     * var a = new A();
     * a.foo = 'foo';
     * alert(a.hasOwnProperty('foo')); // true
     * alert(YAHOO.lang.hasOwnProperty(a, 'foo')); // false when using fallback
     * </pre>
     * @method hasOwnProperty
     * @param {any} obj The object being testing
     * @return Boolean
     */
    hasOwnProperty: function(obj, prop) {
        if (Object.prototype.hasOwnProperty) {
            return obj.hasOwnProperty(prop);
        }
        
        return !YAHOO.lang.isUndefined(obj[prop]) && 
                obj.constructor.prototype[prop] !== obj[prop];
    },
        
    /**
     * Utility to set up the prototype, constructor and superclass properties to
     * support an inheritance strategy that can chain constructors and methods.
     *
     * @method extend
     * @static
     * @param {Function} subc   the object to modify
     * @param {Function} superc the object to inherit
     * @param {Object} overrides  additional properties/methods to add to the
     *                              subclass prototype.  These will override the
     *                              matching items obtained from the superclass 
     *                              if present.
     */
    extend: function(subc, superc, overrides) {
        if (!superc||!subc) {
            throw new Error("YAHOO.lang.extend failed, please check that " +
                            "all dependencies are included.");
        }
        var F = function() {};
        F.prototype=superc.prototype;
        subc.prototype=new F();
        subc.prototype.constructor=subc;
        subc.superclass=superc.prototype;
        if (superc.prototype.constructor == Object.prototype.constructor) {
            superc.prototype.constructor=superc;
        }
    
        if (overrides) {
            for (var i in overrides) {
                subc.prototype[i]=overrides[i];
            }
        }
    },
    
    /**
     * Applies all prototype properties in the supplier to the receiver if the
     * receiver does not have these properties yet.  Optionally, one or more
     * methods/properties can be specified (as additional parameters).  This
     * option will overwrite the property if receiver has it already.
     *
     * @method augment
     * @static
     * @param {Function} r  the object to receive the augmentation
     * @param {Function} s  the object that supplies the properties to augment
     * @param {String*}  arguments zero or more properties methods to augment the
     *                             receiver with.  If none specified, everything
     *                             in the supplier will be used unless it would
     *                             overwrite an existing property in the receiver
     */
    augment: function(r, s) {
        if (!s||!r) {
            throw new Error("YAHOO.lang.augment failed, please check that " +
                            "all dependencies are included.");
        }
        var rp=r.prototype, sp=s.prototype, a=arguments, i, p;
        if (a[2]) {
            for (i=2; i<a.length; i=i+1) {
                rp[a[i]] = sp[a[i]];
            }
        } else {
            for (p in sp) { 
                if (!rp[p]) {
                    rp[p] = sp[p];
                }
            }
        }
    }
};

YAHOO.init();

/*
 * An alias for <a href="YAHOO.lang.html">YAHOO.lang</a>
 * @class YAHOO.util.Lang
 */
YAHOO.util.Lang = YAHOO.lang;

/**
 * An alias for <a href="YAHOO.lang.html#augment">YAHOO.lang.augment</a>
 * @for YAHOO
 * @method augment
 * @static
 * @param {Function} r  the object to receive the augmentation
 * @param {Function} s  the object that supplies the properties to augment
 * @param {String*}  arguments zero or more properties methods to augment the
 *                             receiver with.  If none specified, everything
 *                             in the supplier will be used unless it would
 *                             overwrite an existing property in the receiver
 */
YAHOO.augment = YAHOO.lang.augment;
       
/**
 * An alias for <a href="YAHOO.lang.html#extend">YAHOO.lang.extend</a>
 * @method extend
 * @static
 * @param {Function} subc   the object to modify
 * @param {Function} superc the object to inherit
 * @param {Object} overrides  additional properties/methods to add to the
 *                              subclass prototype.  These will override the
 *                              matching items obtained from the superclass 
 *                              if present.
 */
YAHOO.extend = YAHOO.lang.extend;

YAHOO.register("yahoo", YAHOO, {version: "2.2.2", build: "204"});
/*
Copyright (c) 2007, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.2.2
*/
/**
 * The dom module provides helper methods for manipulating Dom elements.
 * @module dom
 *
 */

(function() {
    var Y = YAHOO.util,     // internal shorthand
        getStyle,           // for load time browser branching
        setStyle,           // ditto
        id_counter = 0,     // for use with generateId
        propertyCache = {}; // for faster hyphen converts
    
    // brower detection
    var ua = navigator.userAgent.toLowerCase(),
        isOpera = (ua.indexOf('opera') > -1),
        isSafari = (ua.indexOf('safari') > -1),
        isGecko = (!isOpera && !isSafari && ua.indexOf('gecko') > -1),
        isIE = (!isOpera && ua.indexOf('msie') > -1); 
    
    // regex cache
    var patterns = {
        HYPHEN: /(-[a-z])/i, // to normalize get/setStyle
        ROOT_TAG: /body|html/i // body for quirks mode, html for standards
    };

    var toCamel = function(property) {
        if ( !patterns.HYPHEN.test(property) ) {
            return property; // no hyphens
        }
        
        if (propertyCache[property]) { // already converted
            return propertyCache[property];
        }
       
        var converted = property;
 
        while( patterns.HYPHEN.exec(converted) ) {
            converted = converted.replace(RegExp.$1,
                    RegExp.$1.substr(1).toUpperCase());
        }
        
        propertyCache[property] = converted;
        return converted;
        //return property.replace(/-([a-z])/gi, function(m0, m1) {return m1.toUpperCase()}) // cant use function as 2nd arg yet due to safari bug
    };
    
    // branching at load instead of runtime
    if (document.defaultView && document.defaultView.getComputedStyle) { // W3C DOM method
        getStyle = function(el, property) {
            var value = null;
            
            if (property == 'float') { // fix reserved word
                property = 'cssFloat';
            }

            var computed = document.defaultView.getComputedStyle(el, '');
            if (computed) { // test computed before touching for safari
                value = computed[toCamel(property)];
            }
            
            return el.style[property] || value;
        };
    } else if (document.documentElement.currentStyle && isIE) { // IE method
        getStyle = function(el, property) {                         
            switch( toCamel(property) ) {
                case 'opacity' :// IE opacity uses filter
                    var val = 100;
                    try { // will error if no DXImageTransform
                        val = el.filters['DXImageTransform.Microsoft.Alpha'].opacity;

                    } catch(e) {
                        try { // make sure its in the document
                            val = el.filters('alpha').opacity;
                        } catch(e) {
                        }
                    }
                    return val / 100;
                    break;
                case 'float': // fix reserved word
                    property = 'styleFloat'; // fall through
                default: 
                    // test currentStyle before touching
                    var value = el.currentStyle ? el.currentStyle[property] : null;
                    return ( el.style[property] || value );
            }
        };
    } else { // default to inline only
        getStyle = function(el, property) { return el.style[property]; };
    }
    
    if (isIE) {
        setStyle = function(el, property, val) {
            switch (property) {
                case 'opacity':
                    if ( YAHOO.lang.isString(el.style.filter) ) { // in case not appended
                        el.style.filter = 'alpha(opacity=' + val * 100 + ')';
                        
                        if (!el.currentStyle || !el.currentStyle.hasLayout) {
                            el.style.zoom = 1; // when no layout or cant tell
                        }
                    }
                    break;
                case 'float':
                    property = 'styleFloat';
                default:
                el.style[property] = val;
            }
        };
    } else {
        setStyle = function(el, property, val) {
            if (property == 'float') {
                property = 'cssFloat';
            }
            el.style[property] = val;
        };
    }
    
    /**
     * Provides helper methods for DOM elements.
     * @namespace YAHOO.util
     * @class Dom
     */
    YAHOO.util.Dom = {
        /**
         * Returns an HTMLElement reference.
         * @method get
         * @param {String | HTMLElement |Array} el Accepts a string to use as an ID for getting a DOM reference, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @return {HTMLElement | Array} A DOM reference to an HTML element or an array of HTMLElements.
         */
        get: function(el) {
            if ( YAHOO.lang.isString(el) ) { // ID 
                return document.getElementById(el);
            }
            
            if ( YAHOO.lang.isArray(el) ) { // Array of IDs and/or HTMLElements
                var c = [];
                for (var i = 0, len = el.length; i < len; ++i) {
                    c[c.length] = Y.Dom.get(el[i]);
                }
                
                return c;
            }

            if (el) { // assuming HTMLElement or HTMLCollection, just pass back 
                return el;
            }

            return null; // el is likely null or undefined 
        },
    
        /**
         * Normalizes currentStyle and ComputedStyle.
         * @method getStyle
         * @param {String | HTMLElement |Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @param {String} property The style property whose value is returned.
         * @return {String | Array} The current value of the style property for the element(s).
         */
        getStyle: function(el, property) {
            property = toCamel(property);
            
            var f = function(element) {
                return getStyle(element, property);
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
    
        /**
         * Wrapper for setting style properties of HTMLElements.  Normalizes "opacity" across modern browsers.
         * @method setStyle
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @param {String} property The style property to be set.
         * @param {String} val The value to apply to the given property.
         */
        setStyle: function(el, property, val) {
            property = toCamel(property);
            
            var f = function(element) {
                setStyle(element, property, val);
                
            };
            
            Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Gets the current position of an element based on page coordinates.  Element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method getXY
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements
         * @return {Array} The XY position of the element(s)
         */
        getXY: function(el) {
            var f = function(el) {
    
            // has to be part of document to have pageXY
                if ( (el.parentNode === null || el.offsetParent === null ||
                        this.getStyle(el, 'display') == 'none') && el != document.body) {
                    return false;
                }
                
                var parentNode = null;
                var pos = [];
                var box;
                
                if (el.getBoundingClientRect) { // IE
                    box = el.getBoundingClientRect();
                    var doc = document;
                    if ( !this.inDocument(el) && parent.document != document) {// might be in a frame, need to get its scroll
                        doc = parent.document;

                        if ( !this.isAncestor(doc.documentElement, el) ) {
                            return false;                      
                        }

                    }

                    var scrollTop = Math.max(doc.documentElement.scrollTop, doc.body.scrollTop);
                    var scrollLeft = Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft);
                    
                    return [box.left + scrollLeft, box.top + scrollTop];
                }
                else { // safari, opera, & gecko
                    pos = [el.offsetLeft, el.offsetTop];
                    parentNode = el.offsetParent;

                    // safari: if el is abs or any parent is abs, subtract body offsets
                    var hasAbs = this.getStyle(el, 'position') == 'absolute';

                    if (parentNode != el) {
                        while (parentNode) {
                            pos[0] += parentNode.offsetLeft;
                            pos[1] += parentNode.offsetTop;
                            if (isSafari && !hasAbs && 
                                    this.getStyle(parentNode,'position') == 'absolute' ) {
                                hasAbs = true; // we need to offset if any parent is absolutely positioned
                            }
                            parentNode = parentNode.offsetParent;
                        }
                    }

                    if (isSafari && hasAbs) { //safari doubles in this case
                        pos[0] -= document.body.offsetLeft;
                        pos[1] -= document.body.offsetTop;
                    } 
                }
                
                parentNode = el.parentNode;

                // account for any scrolled ancestors
                while ( parentNode.tagName && !patterns.ROOT_TAG.test(parentNode.tagName) ) 
                {
                   // work around opera inline scrollLeft/Top bug
                   if (Y.Dom.getStyle(parentNode, 'display') != 'inline') { 
                        pos[0] -= parentNode.scrollLeft;
                        pos[1] -= parentNode.scrollTop;
                    }
                    
                    parentNode = parentNode.parentNode; 
                }
        
                
                return pos;
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Gets the current X position of an element based on page coordinates.  The element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method getX
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements
         * @return {String | Array} The X position of the element(s)
         */
        getX: function(el) {
            var f = function(el) {
                return Y.Dom.getXY(el)[0];
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Gets the current Y position of an element based on page coordinates.  Element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method getY
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements
         * @return {String | Array} The Y position of the element(s)
         */
        getY: function(el) {
            var f = function(el) {
                return Y.Dom.getXY(el)[1];
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Set the position of an html element in page coordinates, regardless of how the element is positioned.
         * The element(s) must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method setXY
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements
         * @param {Array} pos Contains X & Y values for new position (coordinates are page-based)
         * @param {Boolean} noRetry By default we try and set the position a second time if the first fails
         */
        setXY: function(el, pos, noRetry) {
            var f = function(el) {
                var style_pos = this.getStyle(el, 'position');
                if (style_pos == 'static') { // default to relative
                    this.setStyle(el, 'position', 'relative');
                    style_pos = 'relative';
                }

                var pageXY = this.getXY(el);
                if (pageXY === false) { // has to be part of doc to have pageXY
                    return false; 
                }
                
                var delta = [ // assuming pixels; if not we will have to retry
                    parseInt( this.getStyle(el, 'left'), 10 ),
                    parseInt( this.getStyle(el, 'top'), 10 )
                ];
            
                if ( isNaN(delta[0]) ) {// in case of 'auto'
                    delta[0] = (style_pos == 'relative') ? 0 : el.offsetLeft;
                } 
                if ( isNaN(delta[1]) ) { // in case of 'auto'
                    delta[1] = (style_pos == 'relative') ? 0 : el.offsetTop;
                } 
        
                if (pos[0] !== null) { el.style.left = pos[0] - pageXY[0] + delta[0] + 'px'; }
                if (pos[1] !== null) { el.style.top = pos[1] - pageXY[1] + delta[1] + 'px'; }
              
                if (!noRetry) {
                    var newXY = this.getXY(el);

                    // if retry is true, try one more time if we miss 
                   if ( (pos[0] !== null && newXY[0] != pos[0]) || 
                        (pos[1] !== null && newXY[1] != pos[1]) ) {
                       this.setXY(el, pos, true);
                   }
                }        
        
            };
            
            Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Set the X position of an html element in page coordinates, regardless of how the element is positioned.
         * The element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method setX
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @param {Int} x The value to use as the X coordinate for the element(s).
         */
        setX: function(el, x) {
            Y.Dom.setXY(el, [x, null]);
        },
        
        /**
         * Set the Y position of an html element in page coordinates, regardless of how the element is positioned.
         * The element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method setY
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @param {Int} x To use as the Y coordinate for the element(s).
         */
        setY: function(el, y) {
            Y.Dom.setXY(el, [null, y]);
        },
        
        /**
         * Returns the region position of the given element.
         * The element must be part of the DOM tree to have a region (display:none or elements not appended return false).
         * @method getRegion
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @return {Region | Array} A Region or array of Region instances containing "top, left, bottom, right" member data.
         */
        getRegion: function(el) {
            var f = function(el) {
                var region = new Y.Region.getRegion(el);
                return region;
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Returns the width of the client (viewport).
         * @method getClientWidth
         * @deprecated Now using getViewportWidth.  This interface left intact for back compat.
         * @return {Int} The width of the viewable area of the page.
         */
        getClientWidth: function() {
            return Y.Dom.getViewportWidth();
        },
        
        /**
         * Returns the height of the client (viewport).
         * @method getClientHeight
         * @deprecated Now using getViewportHeight.  This interface left intact for back compat.
         * @return {Int} The height of the viewable area of the page.
         */
        getClientHeight: function() {
            return Y.Dom.getViewportHeight();
        },

        /**
         * Returns a array of HTMLElements with the given class.
         * For optimized performance, include a tag and/or root node when possible.
         * @method getElementsByClassName
         * @param {String} className The class name to match against
         * @param {String} tag (optional) The tag name of the elements being collected
         * @param {String | HTMLElement} root (optional) The HTMLElement or an ID to use as the starting point 
         * @return {Array} An array of elements that have the given class name
         */
        getElementsByClassName: function(className, tag, root) {
            var method = function(el) { return Y.Dom.hasClass(el, className); };
            return Y.Dom.getElementsBy(method, tag, root);
        },

        /**
         * Determines whether an HTMLElement has the given className.
         * @method hasClass
         * @param {String | HTMLElement | Array} el The element or collection to test
         * @param {String} className the class name to search for
         * @return {Boolean | Array} A boolean value or array of boolean values
         */
        hasClass: function(el, className) {
            var re = new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)');
            
            var f = function(el) {
                return re.test(el.className);
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
    
        /**
         * Adds a class name to a given element or collection of elements.
         * @method addClass         
         * @param {String | HTMLElement | Array} el The element or collection to add the class to
         * @param {String} className the class name to add to the class attribute
         */
        addClass: function(el, className) {
            var f = function(el) {
                if (this.hasClass(el, className)) { return; } // already present
                
                
                el.className = [el.className, className].join(' ');
            };
            
            Y.Dom.batch(el, f, Y.Dom, true);
        },
    
        /**
         * Removes a class name from a given element or collection of elements.
         * @method removeClass         
         * @param {String | HTMLElement | Array} el The element or collection to remove the class from
         * @param {String} className the class name to remove from the class attribute
         */
        removeClass: function(el, className) {
            var re = new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)', 'g');

            var f = function(el) {
                if (!this.hasClass(el, className)) {
                    return; // not present
                }                 

                
                var c = el.className;
                el.className = c.replace(re, ' ');
                if ( this.hasClass(el, className) ) { // in case of multiple adjacent
                    this.removeClass(el, className);
                }
                
            };
            
            Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Replace a class with another class for a given element or collection of elements.
         * If no oldClassName is present, the newClassName is simply added.
         * @method replaceClass  
         * @param {String | HTMLElement | Array} el The element or collection to remove the class from
         * @param {String} oldClassName the class name to be replaced
         * @param {String} newClassName the class name that will be replacing the old class name
         */
        replaceClass: function(el, oldClassName, newClassName) {
            if (oldClassName === newClassName) { // avoid infinite loop
                return false;
            }
            
            var re = new RegExp('(?:^|\\s+)' + oldClassName + '(?:\\s+|$)', 'g');

            var f = function(el) {
            
                if ( !this.hasClass(el, oldClassName) ) {
                    this.addClass(el, newClassName); // just add it if nothing to replace
                    return; // note return
                }
            
                el.className = el.className.replace(re, ' ' + newClassName + ' ');

                if ( this.hasClass(el, oldClassName) ) { // in case of multiple adjacent
                    this.replaceClass(el, oldClassName, newClassName);
                }
            };
            
            Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Generates a unique ID
         * @method generateId  
         * @param {String | HTMLElement | Array} el (optional) An optional element array of elements to add an ID to (no ID is added if one is already present).
         * @param {String} prefix (optional) an optional prefix to use (defaults to "yui-gen").
         * @return {String | Array} The generated ID, or array of generated IDs (or original ID if already present on an element)
         */
        generateId: function(el, prefix) {
            prefix = prefix || 'yui-gen';
            el = el || {};
            
            var f = function(el) {
                if (el) {
                    el = Y.Dom.get(el);
                } else {
                    el = {}; // just generating ID in this case
                }
                
                if (!el.id) {
                    el.id = prefix + id_counter++; 
                } // dont override existing
                
                
                return el.id;
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Determines whether an HTMLElement is an ancestor of another HTML element in the DOM hierarchy.
         * @method isAncestor
         * @param {String | HTMLElement} haystack The possible ancestor
         * @param {String | HTMLElement} needle The possible descendent
         * @return {Boolean} Whether or not the haystack is an ancestor of needle
         */
        isAncestor: function(haystack, needle) {
            haystack = Y.Dom.get(haystack);
            if (!haystack || !needle) { return false; }
            
            var f = function(needle) {
                if (haystack.contains && !isSafari) { // safari "contains" is broken
                    return haystack.contains(needle);
                }
                else if ( haystack.compareDocumentPosition ) {
                    return !!(haystack.compareDocumentPosition(needle) & 16);
                }
                else { // loop up and test each parent
                    var parent = needle.parentNode;
                    
                    while (parent) {
                        if (parent == haystack) {
                            return true;
                        }
                        else if (!parent.tagName || parent.tagName.toUpperCase() == 'HTML') {
                            return false;
                        }
                        
                        parent = parent.parentNode;
                    }
                    return false;
                }     
            };
            
            return Y.Dom.batch(needle, f, Y.Dom, true);      
        },
        
        /**
         * Determines whether an HTMLElement is present in the current document.
         * @method inDocument         
         * @param {String | HTMLElement} el The element to search for
         * @return {Boolean} Whether or not the element is present in the current document
         */
        inDocument: function(el) {
            var f = function(el) {
                return this.isAncestor(document.documentElement, el);
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Returns a array of HTMLElements that pass the test applied by supplied boolean method.
         * For optimized performance, include a tag and/or root node when possible.
         * @method getElementsBy
         * @param {Function} method - A boolean method for testing elements which receives the element as its only argument.

         * @param {String} tag (optional) The tag name of the elements being collected
         * @param {String | HTMLElement} root (optional) The HTMLElement or an ID to use as the starting point 
         * @return {Array} Array of HTMLElements
         */
        getElementsBy: function(method, tag, root) {
            tag = tag || '*';
            
            var nodes = [];
            
            if (root) {
                root = Y.Dom.get(root);
                if (!root) { // if no root node, then no children
                    return nodes;
                }
            } else {
                root = document;
            }
            
            var elements = root.getElementsByTagName(tag);
            
            if ( !elements.length && (tag == '*' && root.all) ) {
                elements = root.all; // IE < 6
            }
            
            for (var i = 0, len = elements.length; i < len; ++i) {
                if ( method(elements[i]) ) { nodes[nodes.length] = elements[i]; }
            }

            
            return nodes;
        },
        
        /**
         * Returns an array of elements that have had the supplied method applied.
         * The method is called with the element(s) as the first arg, and the optional param as the second ( method(el, o) ).
         * @method batch
         * @param {String | HTMLElement | Array} el (optional) An element or array of elements to apply the method to
         * @param {Function} method The method to apply to the element(s)
         * @param {Any} o (optional) An optional arg that is passed to the supplied method
         * @param {Boolean} override (optional) Whether or not to override the scope of "method" with "o"
         * @return {HTMLElement | Array} The element(s) with the method applied
         */
        batch: function(el, method, o, override) {
            var id = el;
            el = Y.Dom.get(el);
            
            var scope = (override) ? o : window;
            
            if (!el || el.tagName || !el.length) { // is null or not a collection (tagName for SELECT and others that can be both an element and a collection)
                if (!el) {
                    return false;
                }
                return method.call(scope, el, o);
            } 
            
            var collection = [];
            
            for (var i = 0, len = el.length; i < len; ++i) {
                if (!el[i]) {
                    id = el[i];
                }
                collection[collection.length] = method.call(scope, el[i], o);
            }
            
            return collection;
        },
        
        /**
         * Returns the height of the document.
         * @method getDocumentHeight
         * @return {Int} The height of the actual document (which includes the body and its margin).
         */
        getDocumentHeight: function() {
            var scrollHeight = (document.compatMode != 'CSS1Compat') ? document.body.scrollHeight : document.documentElement.scrollHeight;

            var h = Math.max(scrollHeight, Y.Dom.getViewportHeight());
            return h;
        },
        
        /**
         * Returns the width of the document.
         * @method getDocumentWidth
         * @return {Int} The width of the actual document (which includes the body and its margin).
         */
        getDocumentWidth: function() {
            var scrollWidth = (document.compatMode != 'CSS1Compat') ? document.body.scrollWidth : document.documentElement.scrollWidth;
            var w = Math.max(scrollWidth, Y.Dom.getViewportWidth());
            return w;
        },

        /**
         * Returns the current height of the viewport.
         * @method getViewportHeight
         * @return {Int} The height of the viewable area of the page (excludes scrollbars).
         */
        getViewportHeight: function() {
            var height = self.innerHeight; // Safari, Opera
            var mode = document.compatMode;
        
            if ( (mode || isIE) && !isOpera ) { // IE, Gecko
                height = (mode == 'CSS1Compat') ?
                        document.documentElement.clientHeight : // Standards
                        document.body.clientHeight; // Quirks
            }
        
            return height;
        },
        
        /**
         * Returns the current width of the viewport.
         * @method getViewportWidth
         * @return {Int} The width of the viewable area of the page (excludes scrollbars).
         */
        
        getViewportWidth: function() {
            var width = self.innerWidth;  // Safari
            var mode = document.compatMode;
            
            if (mode || isIE) { // IE, Gecko, Opera
                width = (mode == 'CSS1Compat') ?
                        document.documentElement.clientWidth : // Standards
                        document.body.clientWidth; // Quirks
            }
            return width;
        }
    };
})();
/**
 * A region is a representation of an object on a grid.  It is defined
 * by the top, right, bottom, left extents, so is rectangular by default.  If 
 * other shapes are required, this class could be extended to support it.
 * @namespace YAHOO.util
 * @class Region
 * @param {Int} t the top extent
 * @param {Int} r the right extent
 * @param {Int} b the bottom extent
 * @param {Int} l the left extent
 * @constructor
 */
YAHOO.util.Region = function(t, r, b, l) {

    /**
     * The region's top extent
     * @property top
     * @type Int
     */
    this.top = t;
    
    /**
     * The region's top extent as index, for symmetry with set/getXY
     * @property 1
     * @type Int
     */
    this[1] = t;

    /**
     * The region's right extent
     * @property right
     * @type int
     */
    this.right = r;

    /**
     * The region's bottom extent
     * @property bottom
     * @type Int
     */
    this.bottom = b;

    /**
     * The region's left extent
     * @property left
     * @type Int
     */
    this.left = l;
    
    /**
     * The region's left extent as index, for symmetry with set/getXY
     * @property 0
     * @type Int
     */
    this[0] = l;
};

/**
 * Returns true if this region contains the region passed in
 * @method contains
 * @param  {Region}  region The region to evaluate
 * @return {Boolean}        True if the region is contained with this region, 
 *                          else false
 */
YAHOO.util.Region.prototype.contains = function(region) {
    return ( region.left   >= this.left   && 
             region.right  <= this.right  && 
             region.top    >= this.top    && 
             region.bottom <= this.bottom    );

};

/**
 * Returns the area of the region
 * @method getArea
 * @return {Int} the region's area
 */
YAHOO.util.Region.prototype.getArea = function() {
    return ( (this.bottom - this.top) * (this.right - this.left) );
};

/**
 * Returns the region where the passed in region overlaps with this one
 * @method intersect
 * @param  {Region} region The region that intersects
 * @return {Region}        The overlap region, or null if there is no overlap
 */
YAHOO.util.Region.prototype.intersect = function(region) {
    var t = Math.max( this.top,    region.top    );
    var r = Math.min( this.right,  region.right  );
    var b = Math.min( this.bottom, region.bottom );
    var l = Math.max( this.left,   region.left   );
    
    if (b >= t && r >= l) {
        return new YAHOO.util.Region(t, r, b, l);
    } else {
        return null;
    }
};

/**
 * Returns the region representing the smallest region that can contain both
 * the passed in region and this region.
 * @method union
 * @param  {Region} region The region that to create the union with
 * @return {Region}        The union region
 */
YAHOO.util.Region.prototype.union = function(region) {
    var t = Math.min( this.top,    region.top    );
    var r = Math.max( this.right,  region.right  );
    var b = Math.max( this.bottom, region.bottom );
    var l = Math.min( this.left,   region.left   );

    return new YAHOO.util.Region(t, r, b, l);
};

/**
 * toString
 * @method toString
 * @return string the region properties
 */
YAHOO.util.Region.prototype.toString = function() {
    return ( "Region {"    +
             "top: "       + this.top    + 
             ", right: "   + this.right  + 
             ", bottom: "  + this.bottom + 
             ", left: "    + this.left   + 
             "}" );
};

/**
 * Returns a region that is occupied by the DOM element
 * @method getRegion
 * @param  {HTMLElement} el The element
 * @return {Region}         The region that the element occupies
 * @static
 */
YAHOO.util.Region.getRegion = function(el) {
    var p = YAHOO.util.Dom.getXY(el);

    var t = p[1];
    var r = p[0] + el.offsetWidth;
    var b = p[1] + el.offsetHeight;
    var l = p[0];

    return new YAHOO.util.Region(t, r, b, l);
};

/////////////////////////////////////////////////////////////////////////////


/**
 * A point is a region that is special in that it represents a single point on 
 * the grid.
 * @namespace YAHOO.util
 * @class Point
 * @param {Int} x The X position of the point
 * @param {Int} y The Y position of the point
 * @constructor
 * @extends YAHOO.util.Region
 */
YAHOO.util.Point = function(x, y) {
   if (x instanceof Array) { // accept output from Dom.getXY
      y = x[1];
      x = x[0];
   }
   
    /**
     * The X position of the point, which is also the right, left and index zero (for Dom.getXY symmetry)
     * @property x
     * @type Int
     */

    this.x = this.right = this.left = this[0] = x;
     
    /**
     * The Y position of the point, which is also the top, bottom and index one (for Dom.getXY symmetry)
     * @property y
     * @type Int
     */
    this.y = this.top = this.bottom = this[1] = y;
};

YAHOO.util.Point.prototype = new YAHOO.util.Region();

YAHOO.register("dom", YAHOO.util.Dom, {version: "2.2.2", build: "204"});
/*
Copyright (c) 2007, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.2.2
*/

/**
 * The CustomEvent class lets you define events for your application
 * that can be subscribed to by one or more independent component.
 *
 * @param {String}  type The type of event, which is passed to the callback
 *                  when the event fires
 * @param {Object}  oScope The context the event will fire from.  "this" will
 *                  refer to this object in the callback.  Default value: 
 *                  the window object.  The listener can override this.
 * @param {boolean} silent pass true to prevent the event from writing to
 *                  the debugsystem
 * @param {int}     signature the signature that the custom event subscriber
 *                  will receive. YAHOO.util.CustomEvent.LIST or 
 *                  YAHOO.util.CustomEvent.FLAT.  The default is
 *                  YAHOO.util.CustomEvent.LIST.
 * @namespace YAHOO.util
 * @class CustomEvent
 * @constructor
 */
YAHOO.util.CustomEvent = function(type, oScope, silent, signature) {

    /**
     * The type of event, returned to subscribers when the event fires
     * @property type
     * @type string
     */
    this.type = type;

    /**
     * The scope the the event will fire from by default.  Defaults to the window 
     * obj
     * @property scope
     * @type object
     */
    this.scope = oScope || window;

    /**
     * By default all custom events are logged in the debug build, set silent
     * to true to disable debug outpu for this event.
     * @property silent
     * @type boolean
     */
    this.silent = silent;

    /**
     * Custom events support two styles of arguments provided to the event
     * subscribers.  
     * <ul>
     * <li>YAHOO.util.CustomEvent.LIST: 
     *   <ul>
     *   <li>param1: event name</li>
     *   <li>param2: array of arguments sent to fire</li>
     *   <li>param3: <optional> a custom object supplied by the subscriber</li>
     *   </ul>
     * </li>
     * <li>YAHOO.util.CustomEvent.FLAT
     *   <ul>
     *   <li>param1: the first argument passed to fire.  If you need to
     *           pass multiple parameters, use and array or object literal</li>
     *   <li>param2: <optional> a custom object supplied by the subscriber</li>
     *   </ul>
     * </li>
     * </ul>
     *   @property signature
     *   @type int
     */
    this.signature = signature || YAHOO.util.CustomEvent.LIST;

    /**
     * The subscribers to this event
     * @property subscribers
     * @type Subscriber[]
     */
    this.subscribers = [];

    if (!this.silent) {
    }

    var onsubscribeType = "_YUICEOnSubscribe";

    // Only add subscribe events for events that are not generated by 
    // CustomEvent
    if (type !== onsubscribeType) {

        /**
         * Custom events provide a custom event that fires whenever there is
         * a new subscriber to the event.  This provides an opportunity to
         * handle the case where there is a non-repeating event that has
         * already fired has a new subscriber.  
         *
         * @event subscribeEvent
         * @type YAHOO.util.CustomEvent
         * @param {Function} fn The function to execute
         * @param {Object}   obj An object to be passed along when the event 
         *                       fires
         * @param {boolean|Object}  override If true, the obj passed in becomes 
         *                                   the execution scope of the listener.
         *                                   if an object, that object becomes the
         *                                   the execution scope.
         */
        this.subscribeEvent = 
                new YAHOO.util.CustomEvent(onsubscribeType, this, true);

    } 
};

/**
 * Subscriber listener sigature constant.  The LIST type returns three
 * parameters: the event type, the array of args passed to fire, and
 * the optional custom object
 * @property YAHOO.util.CustomEvent.LIST
 * @static
 * @type int
 */
YAHOO.util.CustomEvent.LIST = 0;

/**
 * Subscriber listener sigature constant.  The FLAT type returns two
 * parameters: the first argument passed to fire and the optional 
 * custom object
 * @property YAHOO.util.CustomEvent.FLAT
 * @static
 * @type int
 */
YAHOO.util.CustomEvent.FLAT = 1;

YAHOO.util.CustomEvent.prototype = {

    /**
     * Subscribes the caller to this event
     * @method subscribe
     * @param {Function} fn        The function to execute
     * @param {Object}   obj       An object to be passed along when the event 
     *                             fires
     * @param {boolean|Object}  override If true, the obj passed in becomes 
     *                                   the execution scope of the listener.
     *                                   if an object, that object becomes the
     *                                   the execution scope.
     */
    subscribe: function(fn, obj, override) {

        if (!fn) {
throw new Error("Invalid callback for subscriber to '" + this.type + "'");
        }

        if (this.subscribeEvent) {
            this.subscribeEvent.fire(fn, obj, override);
        }

        this.subscribers.push( new YAHOO.util.Subscriber(fn, obj, override) );
    },

    /**
     * Unsubscribes subscribers.
     * @method unsubscribe
     * @param {Function} fn  The subscribed function to remove, if not supplied
     *                       all will be removed
     * @param {Object}   obj  The custom object passed to subscribe.  This is
     *                        optional, but if supplied will be used to
     *                        disambiguate multiple listeners that are the same
     *                        (e.g., you subscribe many object using a function
     *                        that lives on the prototype)
     * @return {boolean} True if the subscriber was found and detached.
     */
    unsubscribe: function(fn, obj) {

        if (!fn) {
            return this.unsubscribeAll();
        }

        var found = false;
        for (var i=0, len=this.subscribers.length; i<len; ++i) {
            var s = this.subscribers[i];
            if (s && s.contains(fn, obj)) {
                this._delete(i);
                found = true;
            }
        }

        return found;
    },

    /**
     * Notifies the subscribers.  The callback functions will be executed
     * from the scope specified when the event was created, and with the 
     * following parameters:
     *   <ul>
     *   <li>The type of event</li>
     *   <li>All of the arguments fire() was executed with as an array</li>
     *   <li>The custom object (if any) that was passed into the subscribe() 
     *       method</li>
     *   </ul>
     * @method fire 
     * @param {Object*} arguments an arbitrary set of parameters to pass to 
     *                            the handler.
     * @return {boolean} false if one of the subscribers returned false, 
     *                   true otherwise
     */
    fire: function() {
        var len=this.subscribers.length;
        if (!len && this.silent) {
            return true;
        }

        var args=[], ret=true, i;

        for (i=0; i<arguments.length; ++i) {
            args.push(arguments[i]);
        }

        var argslength = args.length;

        if (!this.silent) {
        }

        for (i=0; i<len; ++i) {
            var s = this.subscribers[i];
            if (s) {
                if (!this.silent) {
                }

                var scope = s.getScope(this.scope);

                if (this.signature == YAHOO.util.CustomEvent.FLAT) {
                    var param = null;
                    if (args.length > 0) {
                        param = args[0];
                    }
                    ret = s.fn.call(scope, param, s.obj);
                } else {
                    ret = s.fn.call(scope, this.type, args, s.obj);
                }
                if (false === ret) {
                    if (!this.silent) {
                    }

                    //break;
                    return false;
                }
            }
        }

        return true;
    },

    /**
     * Removes all listeners
     * @method unsubscribeAll
     * @return {int} The number of listeners unsubscribed
     */
    unsubscribeAll: function() {
        for (var i=0, len=this.subscribers.length; i<len; ++i) {
            this._delete(len - 1 - i);
        }

        return i;
    },

    /**
     * @method _delete
     * @private
     */
    _delete: function(index) {
        var s = this.subscribers[index];
        if (s) {
            delete s.fn;
            delete s.obj;
        }

        // delete this.subscribers[index];
        this.subscribers.splice(index, 1);
    },

    /**
     * @method toString
     */
    toString: function() {
         return "CustomEvent: " + "'" + this.type  + "', " + 
             "scope: " + this.scope;

    }
};

/////////////////////////////////////////////////////////////////////

/**
 * Stores the subscriber information to be used when the event fires.
 * @param {Function} fn       The function to execute
 * @param {Object}   obj      An object to be passed along when the event fires
 * @param {boolean}  override If true, the obj passed in becomes the execution
 *                            scope of the listener
 * @class Subscriber
 * @constructor
 */
YAHOO.util.Subscriber = function(fn, obj, override) {

    /**
     * The callback that will be execute when the event fires
     * @property fn
     * @type function
     */
    this.fn = fn;

    /**
     * An optional custom object that will passed to the callback when
     * the event fires
     * @property obj
     * @type object
     */
    this.obj = obj || null;

    /**
     * The default execution scope for the event listener is defined when the
     * event is created (usually the object which contains the event).
     * By setting override to true, the execution scope becomes the custom
     * object passed in by the subscriber.  If override is an object, that 
     * object becomes the scope.
     * @property override
     * @type boolean|object
     */
    this.override = override;

};

/**
 * Returns the execution scope for this listener.  If override was set to true
 * the custom obj will be the scope.  If override is an object, that is the
 * scope, otherwise the default scope will be used.
 * @method getScope
 * @param {Object} defaultScope the scope to use if this listener does not
 *                              override it.
 */
YAHOO.util.Subscriber.prototype.getScope = function(defaultScope) {
    if (this.override) {
        if (this.override === true) {
            return this.obj;
        } else {
            return this.override;
        }
    }
    return defaultScope;
};

/**
 * Returns true if the fn and obj match this objects properties.
 * Used by the unsubscribe method to match the right subscriber.
 *
 * @method contains
 * @param {Function} fn the function to execute
 * @param {Object} obj an object to be passed along when the event fires
 * @return {boolean} true if the supplied arguments match this 
 *                   subscriber's signature.
 */
YAHOO.util.Subscriber.prototype.contains = function(fn, obj) {
    if (obj) {
        return (this.fn == fn && this.obj == obj);
    } else {
        return (this.fn == fn);
    }
};

/**
 * @method toString
 */
YAHOO.util.Subscriber.prototype.toString = function() {
    return "Subscriber { obj: " + (this.obj || "")  + 
           ", override: " +  (this.override || "no") + " }";
};

/**
 * The Event Utility provides utilities for managing DOM Events and tools
 * for building event systems
 *
 * @module event
 * @title Event Utility
 * @namespace YAHOO.util
 * @requires yahoo
 */

// The first instance of Event will win if it is loaded more than once.
// @TODO this needs to be changed so that only the state data that needs to
// be preserved is kept, while methods are overwritten/added as needed.
// This means that the module pattern can't be used.
if (!YAHOO.util.Event) {

/**
 * The event utility provides functions to add and remove event listeners,
 * event cleansing.  It also tries to automatically remove listeners it
 * registers during the unload event.
 *
 * @class Event
 * @static
 */
    YAHOO.util.Event = function() {

        /**
         * True after the onload event has fired
         * @property loadComplete
         * @type boolean
         * @static
         * @private
         */
        var loadComplete =  false;

        /**
         * True when the document is initially usable
         * @property DOMReady
         * @type boolean
         * @static
         * @private
         */
        var DOMReady = false;

        /**
         * Cache of wrapped listeners
         * @property listeners
         * @type array
         * @static
         * @private
         */
        var listeners = [];

        /**
         * User-defined unload function that will be fired before all events
         * are detached
         * @property unloadListeners
         * @type array
         * @static
         * @private
         */
        var unloadListeners = [];

        /**
         * Cache of DOM0 event handlers to work around issues with DOM2 events
         * in Safari
         * @property legacyEvents
         * @static
         * @private
         */
        var legacyEvents = [];

        /**
         * Listener stack for DOM0 events
         * @property legacyHandlers
         * @static
         * @private
         */
        var legacyHandlers = [];

        /**
         * The number of times to poll after window.onload.  This number is
         * increased if additional late-bound handlers are requested after
         * the page load.
         * @property retryCount
         * @static
         * @private
         */
        var retryCount = 0;

        /**
         * onAvailable listeners
         * @property onAvailStack
         * @static
         * @private
         */
        var onAvailStack = [];

        /**
         * Lookup table for legacy events
         * @property legacyMap
         * @static
         * @private
         */
        var legacyMap = [];

        /**
         * Counter for auto id generation
         * @property counter
         * @static
         * @private
         */
        var counter = 0;
        
        /**
         * addListener/removeListener can throw errors in unexpected scenarios.
         * These errors are suppressed, the method returns false, and this property
         * is set
         * @property lastError
         * @type Error
         */
        var lastError = null;

        return {

            /**
             * The number of times we should look for elements that are not
             * in the DOM at the time the event is requested after the document
             * has been loaded.  The default is 200@amp;50 ms, so it will poll
             * for 10 seconds or until all outstanding handlers are bound
             * (whichever comes first).
             * @property POLL_RETRYS
             * @type int
             * @static
             * @final
             */
            POLL_RETRYS: 200,

            /**
             * The poll interval in milliseconds
             * @property POLL_INTERVAL
             * @type int
             * @static
             * @final
             */
            POLL_INTERVAL: 10,

            /**
             * Element to bind, int constant
             * @property EL
             * @type int
             * @static
             * @final
             */
            EL: 0,

            /**
             * Type of event, int constant
             * @property TYPE
             * @type int
             * @static
             * @final
             */
            TYPE: 1,

            /**
             * Function to execute, int constant
             * @property FN
             * @type int
             * @static
             * @final
             */
            FN: 2,

            /**
             * Function wrapped for scope correction and cleanup, int constant
             * @property WFN
             * @type int
             * @static
             * @final
             */
            WFN: 3,

            /**
             * Object passed in by the user that will be returned as a 
             * parameter to the callback, int constant
             * @property OBJ
             * @type int
             * @static
             * @final
             */
            OBJ: 3,

            /**
             * Adjusted scope, either the element we are registering the event
             * on or the custom object passed in by the listener, int constant
             * @property ADJ_SCOPE
             * @type int
             * @static
             * @final
             */
            ADJ_SCOPE: 4,

            /**
             * Safari detection is necessary to work around the preventDefault
             * bug that makes it so you can't cancel a href click from the 
             * handler.  Since this function has been used outside of this
             * utility, it was changed to detect all KHTML browser to be more
             * friendly towards the non-Safari browsers that share the engine.
             * Internally, the preventDefault bug detection now uses the
             * webkit property.
             * @property isSafari
             * @private
             * @static
             * @deprecated
             */
            isSafari: (/KHTML/gi).test(navigator.userAgent),
            
            /**
             * If WebKit is detected, we keep track of the version number of
             * the engine.  The webkit property will contain a string with
             * the webkit version number if webkit is detected, null
             * otherwise.
             * Safari 1.3.2 (312.6): 312.8.1 <-- currently the latest
             *                       available on Mac OSX 10.3.
             * Safari 2.0.2: 416 <-- hasOwnProperty introduced
             * Safari 2.0.4: 418 <-- preventDefault fixed (I believe)
             * Safari 2.0.4 (419.3): 418.9.1 <-- current release
             *
             * http://developer.apple.com/internet/safari/uamatrix.html
             * @property webkit
             * @type string
             * @static
             */
            webkit: function() {
                var v=navigator.userAgent.match(/AppleWebKit\/([^ ]*)/);
                if (v&&v[1]) {
                    return v[1];
                }
                return null;
            }(),
            
            /**
             * IE detection needed to properly calculate pageX and pageY.  
             * capabilities checking didn't seem to work because another 
             * browser that does not provide the properties have the values 
             * calculated in a different manner than IE.
             * @property isIE
             * @private
             * @static
             */
            isIE: (!this.webkit && !navigator.userAgent.match(/opera/gi) && 
                    navigator.userAgent.match(/msie/gi)),

            /**
             * poll handle
             * @property _interval
             * @private
             */
            _interval: null,

            /**
             * @method startInterval
             * @static
             * @private
             */
            startInterval: function() {
                if (!this._interval) {
                    var self = this;
                    var callback = function() { self._tryPreloadAttach(); };
                    this._interval = setInterval(callback, this.POLL_INTERVAL);
                }
            },

            /**
             * Executes the supplied callback when the item with the supplied
             * id is found.  This is meant to be used to execute behavior as
             * soon as possible as the page loads.  If you use this after the
             * initial page load it will poll for a fixed time for the element.
             * The number of times it will poll and the frequency are
             * configurable.  By default it will poll for 10 seconds.
             *
             * @method onAvailable
             *
             * @param {string}   p_id the id of the element to look for.
             * @param {function} p_fn what to execute when the element is found.
             * @param {object}   p_obj an optional object to be passed back as
             *                   a parameter to p_fn.
             * @param {boolean}  p_override If set to true, p_fn will execute
             *                   in the scope of p_obj
             *
             * @static
             */
            onAvailable: function(p_id, p_fn, p_obj, p_override) {
                onAvailStack.push( { id:         p_id, 
                                     fn:         p_fn, 
                                     obj:        p_obj, 
                                     override:   p_override, 
                                     checkReady: false    } );
                retryCount = this.POLL_RETRYS;
                this.startInterval();
            },

            /**
             * Executes the supplied callback when the DOM is first usable.
             *
             * @method onDOMReady
             *
             * @param {function} p_fn what to execute when the element is found.
             * @param {object}   p_obj an optional object to be passed back as
             *                   a parameter to p_fn.
             * @param {boolean}  p_scope If set to true, p_fn will execute
             *                   in the scope of p_obj, if set to an object it
             *                   will execute in the scope of that object
             *
             * @static
             */
            onDOMReady: function(p_fn, p_obj, p_override) {
                this.DOMReadyEvent.subscribe(p_fn, p_obj, p_override);
            },

            /**
             * Works the same way as onAvailable, but additionally checks the
             * state of sibling elements to determine if the content of the
             * available element is safe to modify.
             *
             * @method onContentReady
             *
             * @param {string}   p_id the id of the element to look for.
             * @param {function} p_fn what to execute when the element is ready.
             * @param {object}   p_obj an optional object to be passed back as
             *                   a parameter to p_fn.
             * @param {boolean}  p_override If set to true, p_fn will execute
             *                   in the scope of p_obj
             *
             * @static
             */
            onContentReady: function(p_id, p_fn, p_obj, p_override) {
                onAvailStack.push( { id:         p_id, 
                                     fn:         p_fn, 
                                     obj:        p_obj, 
                                     override:   p_override,
                                     checkReady: true      } );

                retryCount = this.POLL_RETRYS;
                this.startInterval();
            },

            /**
             * Appends an event handler
             *
             * @method addListener
             *
             * @param {Object}   el        The html element to assign the 
             *                             event to
             * @param {String}   sType     The type of event to append
             * @param {Function} fn        The method the event invokes
             * @param {Object}   obj    An arbitrary object that will be 
             *                             passed as a parameter to the handler
             * @param {boolean}  override  If true, the obj passed in becomes
             *                             the execution scope of the listener
             * @return {boolean} True if the action was successful or defered,
             *                        false if one or more of the elements 
             *                        could not have the listener attached,
             *                        or if the operation throws an exception.
             * @static
             */
            addListener: function(el, sType, fn, obj, override) {


                if (!fn || !fn.call) {
                    return false;
                }

                // The el argument can be an array of elements or element ids.
                if ( this._isValidCollection(el)) {
                    var ok = true;
                    for (var i=0,len=el.length; i<len; ++i) {
                        ok = this.on(el[i], 
                                       sType, 
                                       fn, 
                                       obj, 
                                       override) && ok;
                    }
                    return ok;

                } else if (typeof el == "string") {
                    var oEl = this.getEl(el);
                    // If the el argument is a string, we assume it is 
                    // actually the id of the element.  If the page is loaded
                    // we convert el to the actual element, otherwise we 
                    // defer attaching the event until onload event fires

                    // check to see if we need to delay hooking up the event 
                    // until after the page loads.
                    if (oEl) {
                        el = oEl;
                    } else {
                        // defer adding the event until the element is available
                        this.onAvailable(el, function() {
                           YAHOO.util.Event.on(el, sType, fn, obj, override);
                        });

                        return true;
                    }
                }

                // Element should be an html element or an array if we get 
                // here.
                if (!el) {
                    return false;
                }

                // we need to make sure we fire registered unload events 
                // prior to automatically unhooking them.  So we hang on to 
                // these instead of attaching them to the window and fire the
                // handles explicitly during our one unload event.
                if ("unload" == sType && obj !== this) {
                    unloadListeners[unloadListeners.length] =
                            [el, sType, fn, obj, override];
                    return true;
                }


                // if the user chooses to override the scope, we use the custom
                // object passed in, otherwise the executing scope will be the
                // HTML element that the event is registered on
                var scope = el;
                if (override) {
                    if (override === true) {
                        scope = obj;
                    } else {
                        scope = override;
                    }
                }

                // wrap the function so we can return the obj object when
                // the event fires;
                var wrappedFn = function(e) {
                        return fn.call(scope, YAHOO.util.Event.getEvent(e), 
                                obj);
                    };

                var li = [el, sType, fn, wrappedFn, scope];
                var index = listeners.length;
                // cache the listener so we can try to automatically unload
                listeners[index] = li;

                if (this.useLegacyEvent(el, sType)) {
                    var legacyIndex = this.getLegacyIndex(el, sType);

                    // Add a new dom0 wrapper if one is not detected for this
                    // element
                    if ( legacyIndex == -1 || 
                                el != legacyEvents[legacyIndex][0] ) {

                        legacyIndex = legacyEvents.length;
                        legacyMap[el.id + sType] = legacyIndex;

                        // cache the signature for the DOM0 event, and 
                        // include the existing handler for the event, if any
                        legacyEvents[legacyIndex] = 
                            [el, sType, el["on" + sType]];
                        legacyHandlers[legacyIndex] = [];

                        el["on" + sType] = 
                            function(e) {
                                YAHOO.util.Event.fireLegacyEvent(
                                    YAHOO.util.Event.getEvent(e), legacyIndex);
                            };
                    }

                    // add a reference to the wrapped listener to our custom
                    // stack of events
                    //legacyHandlers[legacyIndex].push(index);
                    legacyHandlers[legacyIndex].push(li);

                } else {
                    try {
                        this._simpleAdd(el, sType, wrappedFn, false);
                    } catch(ex) {
                        // handle an error trying to attach an event.  If it fails
                        // we need to clean up the cache
                        this.lastError = ex;
                        this.removeListener(el, sType, fn);
                        return false;
                    }
                }

                return true;
                
            },

            /**
             * When using legacy events, the handler is routed to this object
             * so we can fire our custom listener stack.
             * @method fireLegacyEvent
             * @static
             * @private
             */
            fireLegacyEvent: function(e, legacyIndex) {
                var ok=true,le,lh,li,scope,ret;
                
                lh = legacyHandlers[legacyIndex];
                for (var i=0,len=lh.length; i<len; ++i) {
                    li = lh[i];
                    if ( li && li[this.WFN] ) {
                        scope = li[this.ADJ_SCOPE];
                        ret = li[this.WFN].call(scope, e);
                        ok = (ok && ret);
                    }
                }

                // Fire the original handler if we replaced one.  We fire this
                // after the other events to keep stopPropagation/preventDefault
                // that happened in the DOM0 handler from touching our DOM2
                // substitute
                le = legacyEvents[legacyIndex];
                if (le && le[2]) {
                    le[2](e);
                }
                
                return ok;
            },

            /**
             * Returns the legacy event index that matches the supplied 
             * signature
             * @method getLegacyIndex
             * @static
             * @private
             */
            getLegacyIndex: function(el, sType) {
                var key = this.generateId(el) + sType;
                if (typeof legacyMap[key] == "undefined") { 
                    return -1;
                } else {
                    return legacyMap[key];
                }
            },

            /**
             * Logic that determines when we should automatically use legacy
             * events instead of DOM2 events.  Currently this is limited to old
             * Safari browsers with a broken preventDefault
             * @method useLegacyEvent
             * @static
             * @private
             */
            useLegacyEvent: function(el, sType) {
                if (this.webkit && ("click"==sType || "dblclick"==sType)) {
                    var v = parseInt(this.webkit, 10);
                    if (!isNaN(v) && v<418) {
                        return true;
                    }
                }
                return false;
            },
                    
            /**
             * Removes an event handler
             *
             * @method removeListener
             *
             * @param {Object} el the html element or the id of the element to 
             * assign the event to.
             * @param {String} sType the type of event to remove.
             * @param {Function} fn the method the event invokes.  If fn is
             * undefined, then all event handlers for the type of event are 
             * removed.
             * @return {boolean} true if the unbind was successful, false 
             * otherwise.
             * @static
             */
            removeListener: function(el, sType, fn) {
                var i, len;

                // The el argument can be a string
                if (typeof el == "string") {
                    el = this.getEl(el);
                // The el argument can be an array of elements or element ids.
                } else if ( this._isValidCollection(el)) {
                    var ok = true;
                    for (i=0,len=el.length; i<len; ++i) {
                        ok = ( this.removeListener(el[i], sType, fn) && ok );
                    }
                    return ok;
                }

                if (!fn || !fn.call) {
                    //return false;
                    return this.purgeElement(el, false, sType);
                }


                if ("unload" == sType) {

                    for (i=0, len=unloadListeners.length; i<len; i++) {
                        var li = unloadListeners[i];
                        if (li && 
                            li[0] == el && 
                            li[1] == sType && 
                            li[2] == fn) {
                                unloadListeners.splice(i, 1);
                                return true;
                        }
                    }

                    return false;
                }

                var cacheItem = null;

                // The index is a hidden parameter; needed to remove it from
                // the method signature because it was tempting users to
                // try and take advantage of it, which is not possible.
                var index = arguments[3];
  
                if ("undefined" == typeof index) {
                    index = this._getCacheIndex(el, sType, fn);
                }

                if (index >= 0) {
                    cacheItem = listeners[index];
                }

                if (!el || !cacheItem) {
                    return false;
                }


                if (this.useLegacyEvent(el, sType)) {
                    var legacyIndex = this.getLegacyIndex(el, sType);
                    var llist = legacyHandlers[legacyIndex];
                    if (llist) {
                        for (i=0, len=llist.length; i<len; ++i) {
                            li = llist[i];
                            if (li && 
                                li[this.EL] == el && 
                                li[this.TYPE] == sType && 
                                li[this.FN] == fn) {
                                    llist.splice(i, 1);
                                    break;
                            }
                        }
                    }

                } else {
                    try {
                        this._simpleRemove(el, sType, cacheItem[this.WFN], false);
                    } catch(ex) {
                        this.lastError = ex;
                        return false;
                    }
                }

                // removed the wrapped handler
                delete listeners[index][this.WFN];
                delete listeners[index][this.FN];
                listeners.splice(index, 1);

                return true;

            },

            /**
             * Returns the event's target element
             * @method getTarget
             * @param {Event} ev the event
             * @param {boolean} resolveTextNode when set to true the target's
             *                  parent will be returned if the target is a 
             *                  text node.  @deprecated, the text node is
             *                  now resolved automatically
             * @return {HTMLElement} the event's target
             * @static
             */
            getTarget: function(ev, resolveTextNode) {
                var t = ev.target || ev.srcElement;
                return this.resolveTextNode(t);
            },

            /**
             * In some cases, some browsers will return a text node inside
             * the actual element that was targeted.  This normalizes the
             * return value for getTarget and getRelatedTarget.
             * @method resolveTextNode
             * @param {HTMLElement} node node to resolve
             * @return {HTMLElement} the normized node
             * @static
             */
            resolveTextNode: function(node) {
                // if (node && node.nodeName && 
                        // "#TEXT" == node.nodeName.toUpperCase()) {
                if (node && 3 == node.nodeType) {
                    return node.parentNode;
                } else {
                    return node;
                }
            },

            /**
             * Returns the event's pageX
             * @method getPageX
             * @param {Event} ev the event
             * @return {int} the event's pageX
             * @static
             */
            getPageX: function(ev) {
                var x = ev.pageX;
                if (!x && 0 !== x) {
                    x = ev.clientX || 0;

                    if ( this.isIE ) {
                        x += this._getScrollLeft();
                    }
                }

                return x;
            },

            /**
             * Returns the event's pageY
             * @method getPageY
             * @param {Event} ev the event
             * @return {int} the event's pageY
             * @static
             */
            getPageY: function(ev) {
                var y = ev.pageY;
                if (!y && 0 !== y) {
                    y = ev.clientY || 0;

                    if ( this.isIE ) {
                        y += this._getScrollTop();
                    }
                }


                return y;
            },

            /**
             * Returns the pageX and pageY properties as an indexed array.
             * @method getXY
             * @param {Event} ev the event
             * @return {[x, y]} the pageX and pageY properties of the event
             * @static
             */
            getXY: function(ev) {
                return [this.getPageX(ev), this.getPageY(ev)];
            },

            /**
             * Returns the event's related target 
             * @method getRelatedTarget
             * @param {Event} ev the event
             * @return {HTMLElement} the event's relatedTarget
             * @static
             */
            getRelatedTarget: function(ev) {
                var t = ev.relatedTarget;
                if (!t) {
                    if (ev.type == "mouseout") {
                        t = ev.toElement;
                    } else if (ev.type == "mouseover") {
                        t = ev.fromElement;
                    }
                }

                return this.resolveTextNode(t);
            },

            /**
             * Returns the time of the event.  If the time is not included, the
             * event is modified using the current time.
             * @method getTime
             * @param {Event} ev the event
             * @return {Date} the time of the event
             * @static
             */
            getTime: function(ev) {
                if (!ev.time) {
                    var t = new Date().getTime();
                    try {
                        ev.time = t;
                    } catch(ex) { 
                        this.lastError = ex;
                        return t;
                    }
                }

                return ev.time;
            },

            /**
             * Convenience method for stopPropagation + preventDefault
             * @method stopEvent
             * @param {Event} ev the event
             * @static
             */
            stopEvent: function(ev) {
                this.stopPropagation(ev);
                this.preventDefault(ev);
            },

            /**
             * Stops event propagation
             * @method stopPropagation
             * @param {Event} ev the event
             * @static
             */
            stopPropagation: function(ev) {
                if (ev.stopPropagation) {
                    ev.stopPropagation();
                } else {
                    ev.cancelBubble = true;
                }
            },

            /**
             * Prevents the default behavior of the event
             * @method preventDefault
             * @param {Event} ev the event
             * @static
             */
            preventDefault: function(ev) {
                if (ev.preventDefault) {
                    ev.preventDefault();
                } else {
                    ev.returnValue = false;
                }
            },
             
            /**
             * Finds the event in the window object, the caller's arguments, or
             * in the arguments of another method in the callstack.  This is
             * executed automatically for events registered through the event
             * manager, so the implementer should not normally need to execute
             * this function at all.
             * @method getEvent
             * @param {Event} e the event parameter from the handler
             * @return {Event} the event 
             * @static
             */
            getEvent: function(e) {
                var ev = e || window.event;

                if (!ev) {
                    var c = this.getEvent.caller;
                    while (c) {
                        ev = c.arguments[0];
                        if (ev && Event == ev.constructor) {
                            break;
                        }
                        c = c.caller;
                    }
                }

                return ev;
            },

            /**
             * Returns the charcode for an event
             * @method getCharCode
             * @param {Event} ev the event
             * @return {int} the event's charCode
             * @static
             */
            getCharCode: function(ev) {
                return ev.charCode || ev.keyCode || 0;
            },

            /**
             * Locating the saved event handler data by function ref
             *
             * @method _getCacheIndex
             * @static
             * @private
             */
            _getCacheIndex: function(el, sType, fn) {
                for (var i=0,len=listeners.length; i<len; ++i) {
                    var li = listeners[i];
                    if ( li                 && 
                         li[this.FN] == fn  && 
                         li[this.EL] == el  && 
                         li[this.TYPE] == sType ) {
                        return i;
                    }
                }

                return -1;
            },

            /**
             * Generates an unique ID for the element if it does not already 
             * have one.
             * @method generateId
             * @param el the element to create the id for
             * @return {string} the resulting id of the element
             * @static
             */
            generateId: function(el) {
                var id = el.id;

                if (!id) {
                    id = "yuievtautoid-" + counter;
                    ++counter;
                    el.id = id;
                }

                return id;
            },


            /**
             * We want to be able to use getElementsByTagName as a collection
             * to attach a group of events to.  Unfortunately, different 
             * browsers return different types of collections.  This function
             * tests to determine if the object is array-like.  It will also 
             * fail if the object is an array, but is empty.
             * @method _isValidCollection
             * @param o the object to test
             * @return {boolean} true if the object is array-like and populated
             * @static
             * @private
             */
            _isValidCollection: function(o) {
                return ( o                    && // o is something
                         o.length             && // o is indexed
                         typeof o != "string" && // o is not a string
                         !o.tagName           && // o is not an HTML element
                         !o.alert             && // o is not a window
                         typeof o[0] != "undefined" );

            },

            /**
             * @private
             * @property elCache
             * DOM element cache
             * @static
             * @deprecated Elements are not cached any longer
             */
            elCache: {},

            /**
             * We cache elements bound by id because when the unload event 
             * fires, we can no longer use document.getElementById
             * @method getEl
             * @static
             * @private
             * @deprecated Elements are not cached any longer
             */
            getEl: function(id) {
                return document.getElementById(id);
            },

            /**
             * Clears the element cache
             * @deprecated Elements are not cached any longer
             * @method clearCache
             * @static
             * @private
             */
            clearCache: function() { },

            /**
             * Custom event the fires when the dom is initially usable
             * @event DOMReadyEvent
             */
            DOMReadyEvent: new YAHOO.util.CustomEvent("DOMReady", this),

            /**
             * hook up any deferred listeners
             * @method _load
             * @static
             * @private
             */
            _load: function(e) {
                if (!loadComplete) {
                    loadComplete = true;
                    var EU = YAHOO.util.Event;

                    // just in case DOMReady did not go off for some reason
                    EU._ready();

                    // Remove the listener to assist with the IE memory issue, but not
                    // for other browsers because FF 1.0x does not like it.
                    if (this.isIE) {
                        EU._simpleRemove(window, "load", EU._load);
                    }
                }
            },

            /**
             * Fires the DOMReady event listeners the first time the document is
             * usable.
             * @method _ready
             * @static
             * @private
             */
            _ready: function(e) {
                if (!DOMReady) {
                    DOMReady=true;
                    var EU = YAHOO.util.Event;

                    // Fire the content ready custom event
                    EU.DOMReadyEvent.fire();

                    // Remove the DOMContentLoaded (FF/Opera)
                    EU._simpleRemove(document, "DOMContentLoaded", EU._ready);
                }
            },

            /**
             * Polling function that runs before the onload event fires, 
             * attempting to attach to DOM Nodes as soon as they are 
             * available
             * @method _tryPreloadAttach
             * @static
             * @private
             */
            _tryPreloadAttach: function() {

                if (this.locked) {
                    return false;
                }


                if (this.isIE && !DOMReady) {
                    return false;
                }

                this.locked = true;


                // keep trying until after the page is loaded.  We need to 
                // check the page load state prior to trying to bind the 
                // elements so that we can be certain all elements have been 
                // tested appropriately
                var tryAgain = !loadComplete;
                if (!tryAgain) {
                    tryAgain = (retryCount > 0);
                }

                // onAvailable
                var notAvail = [];

                var executeItem = function (el, item) {
                    var scope = el;
                    if (item.override) {
                        if (item.override === true) {
                            scope = item.obj;
                        } else {
                            scope = item.override;
                        }
                    }
                    item.fn.call(scope, item.obj);
                };

                var i,len,item,el;

                // onAvailable
                for (i=0,len=onAvailStack.length; i<len; ++i) {
                    item = onAvailStack[i];
                    if (item && !item.checkReady) {
                        el = this.getEl(item.id);
                        if (el) {
                            executeItem(el, item);
                            onAvailStack[i] = null;
                        } else {
                            notAvail.push(item);
                        }
                    }
                }

                // onContentReady
                for (i=0,len=onAvailStack.length; i<len; ++i) {
                    item = onAvailStack[i];
                    if (item && item.checkReady) {
                        el = this.getEl(item.id);

                        if (el) {
                            // The element is available, but not necessarily ready
                            // @todo should we test parentNode.nextSibling?
                            if (loadComplete || el.nextSibling) {
                                executeItem(el, item);
                                onAvailStack[i] = null;
                            }
                        } else {
                            notAvail.push(item);
                        }
                    }
                }

                retryCount = (notAvail.length === 0) ? 0 : retryCount - 1;

                if (tryAgain) {
                    // we may need to strip the nulled out items here
                    this.startInterval();
                } else {
                    clearInterval(this._interval);
                    this._interval = null;
                }

                this.locked = false;

                return true;

            },

            /**
             * Removes all listeners attached to the given element via addListener.
             * Optionally, the node's children can also be purged.
             * Optionally, you can specify a specific type of event to remove.
             * @method purgeElement
             * @param {HTMLElement} el the element to purge
             * @param {boolean} recurse recursively purge this element's children
             * as well.  Use with caution.
             * @param {string} sType optional type of listener to purge. If
             * left out, all listeners will be removed
             * @static
             */
            purgeElement: function(el, recurse, sType) {
                var elListeners = this.getListeners(el, sType);
                if (elListeners) {
                    for (var i=0,len=elListeners.length; i<len ; ++i) {
                        var l = elListeners[i];
                        // can't use the index on the changing collection
                        //this.removeListener(el, l.type, l.fn, l.index);
                        this.removeListener(el, l.type, l.fn);
                    }
                }

                if (recurse && el && el.childNodes) {
                    for (i=0,len=el.childNodes.length; i<len ; ++i) {
                        this.purgeElement(el.childNodes[i], recurse, sType);
                    }
                }
            },

            /**
             * Returns all listeners attached to the given element via addListener.
             * Optionally, you can specify a specific type of event to return.
             * @method getListeners
             * @param el {HTMLElement} the element to inspect 
             * @param sType {string} optional type of listener to return. If
             * left out, all listeners will be returned
             * @return {Object} the listener. Contains the following fields:
             * &nbsp;&nbsp;type:   (string)   the type of event
             * &nbsp;&nbsp;fn:     (function) the callback supplied to addListener
             * &nbsp;&nbsp;obj:    (object)   the custom object supplied to addListener
             * &nbsp;&nbsp;adjust: (boolean)  whether or not to adjust the default scope
             * &nbsp;&nbsp;index:  (int)      its position in the Event util listener cache
             * @static
             */           
            getListeners: function(el, sType) {
                var results=[], searchLists;
                if (!sType) {
                    searchLists = [listeners, unloadListeners];
                } else if (sType == "unload") {
                    searchLists = [unloadListeners];
                } else {
                    searchLists = [listeners];
                }

                for (var j=0;j<searchLists.length; ++j) {
                    var searchList = searchLists[j];
                    if (searchList && searchList.length > 0) {
                        for (var i=0,len=searchList.length; i<len ; ++i) {
                            var l = searchList[i];
                            if ( l  && l[this.EL] === el && 
                                    (!sType || sType === l[this.TYPE]) ) {
                                results.push({
                                    type:   l[this.TYPE],
                                    fn:     l[this.FN],
                                    obj:    l[this.OBJ],
                                    adjust: l[this.ADJ_SCOPE],
                                    index:  i
                                });
                            }
                        }
                    }
                }

                return (results.length) ? results : null;
            },

            /**
             * Removes all listeners registered by pe.event.  Called 
             * automatically during the unload event.
             * @method _unload
             * @static
             * @private
             */
            _unload: function(e) {

                var EU = YAHOO.util.Event, i, j, l, len, index;

                for (i=0,len=unloadListeners.length; i<len; ++i) {
                    l = unloadListeners[i];
                    if (l) {
                        var scope = window;
                        if (l[EU.ADJ_SCOPE]) {
                            if (l[EU.ADJ_SCOPE] === true) {
                                scope = l[EU.OBJ];
                            } else {
                                scope = l[EU.ADJ_SCOPE];
                            }
                        }
                        l[EU.FN].call(scope, EU.getEvent(e), l[EU.OBJ] );
                        unloadListeners[i] = null;
                        l=null;
                        scope=null;
                    }
                }

                unloadListeners = null;

                if (listeners && listeners.length > 0) {
                    j = listeners.length;
                    while (j) {
                        index = j-1;
                        l = listeners[index];
                        if (l) {
                            EU.removeListener(l[EU.EL], l[EU.TYPE], 
                                    l[EU.FN], index);
                        } 
                        j = j - 1;
                    }
                    l=null;

                    EU.clearCache();
                }

                for (i=0,len=legacyEvents.length; i<len; ++i) {
                    // dereference the element
                    //delete legacyEvents[i][0];
                    legacyEvents[i][0] = null;

                    // delete the array item
                    //delete legacyEvents[i];
                    legacyEvents[i] = null;
                }

                legacyEvents = null;

                EU._simpleRemove(window, "unload", EU._unload);

            },

            /**
             * Returns scrollLeft
             * @method _getScrollLeft
             * @static
             * @private
             */
            _getScrollLeft: function() {
                return this._getScroll()[1];
            },

            /**
             * Returns scrollTop
             * @method _getScrollTop
             * @static
             * @private
             */
            _getScrollTop: function() {
                return this._getScroll()[0];
            },

            /**
             * Returns the scrollTop and scrollLeft.  Used to calculate the 
             * pageX and pageY in Internet Explorer
             * @method _getScroll
             * @static
             * @private
             */
            _getScroll: function() {
                var dd = document.documentElement, db = document.body;
                if (dd && (dd.scrollTop || dd.scrollLeft)) {
                    return [dd.scrollTop, dd.scrollLeft];
                } else if (db) {
                    return [db.scrollTop, db.scrollLeft];
                } else {
                    return [0, 0];
                }
            },
            
            /**
             * Used by old versions of CustomEvent, restored for backwards
             * compatibility
             * @method regCE
             * @private
             */
            regCE: function() {
                // does nothing
            },

            /**
             * Adds a DOM event directly without the caching, cleanup, scope adj, etc
             *
             * @method _simpleAdd
             * @param {HTMLElement} el      the element to bind the handler to
             * @param {string}      sType   the type of event handler
             * @param {function}    fn      the callback to invoke
             * @param {boolen}      capture capture or bubble phase
             * @static
             * @private
             */
            _simpleAdd: function () {
                if (window.addEventListener) {
                    return function(el, sType, fn, capture) {
                        el.addEventListener(sType, fn, (capture));
                    };
                } else if (window.attachEvent) {
                    return function(el, sType, fn, capture) {
                        el.attachEvent("on" + sType, fn);
                    };
                } else {
                    return function(){};
                }
            }(),

            /**
             * Basic remove listener
             *
             * @method _simpleRemove
             * @param {HTMLElement} el      the element to bind the handler to
             * @param {string}      sType   the type of event handler
             * @param {function}    fn      the callback to invoke
             * @param {boolen}      capture capture or bubble phase
             * @static
             * @private
             */
            _simpleRemove: function() {
                if (window.removeEventListener) {
                    return function (el, sType, fn, capture) {
                        el.removeEventListener(sType, fn, (capture));
                    };
                } else if (window.detachEvent) {
                    return function (el, sType, fn) {
                        el.detachEvent("on" + sType, fn);
                    };
                } else {
                    return function(){};
                }
            }()
        };

    }();

    (function() {
        var EU = YAHOO.util.Event;

        /**
         * YAHOO.util.Event.on is an alias for addListener
         * @method on
         * @see addListener
         * @static
         */
        EU.on = EU.addListener;

        /////////////////////////////////////////////////////////////
        // DOMReady
        // based on work by: Dean Edwards/John Resig/Matthias Miller 

        // Internet Explorer: use the readyState of a defered script.
        // This isolates what appears to be a safe moment to manipulate
        // the DOM prior to when the document's readyState suggests
        // it is safe to do so.
        if (EU.isIE) {
	
            document.write(
'<scr' + 'ipt id="_yui_eu_dr" defer="true" src="//:"></script>');
        
            var el = document.getElementById("_yui_eu_dr");
            el.onreadystatechange = function() {
                if ("complete" == this.readyState) {
                    this.parentNode.removeChild(this);
                    YAHOO.util.Event._ready();
                }
            };

            el=null;

            // Process onAvailable/onContentReady items when when the 
            // DOM is ready.
            YAHOO.util.Event.onDOMReady(
                    YAHOO.util.Event._tryPreloadAttach,
                    YAHOO.util.Event, true);
        
        // Safari: The document's readyState in Safari currently will
        // change to loaded/complete before images are loaded.
        } else if (EU.webkit) {

            EU._drwatch = setInterval(function(){
                var rs=document.readyState;
                if ("loaded" == rs || "complete" == rs) {
                    clearInterval(EU._drwatch);
                    EU._drwatch = null;
                    EU._ready();
                }
            }, EU.POLL_INTERVAL); 

        // FireFox and Opera: These browsers provide a event for this
        // moment.
        } else {

            EU._simpleAdd(document, "DOMContentLoaded", EU._ready);

        }
        /////////////////////////////////////////////////////////////

        EU._simpleAdd(window, "load", EU._load);
        EU._simpleAdd(window, "unload", EU._unload);
        EU._tryPreloadAttach();
    })();
}
/**
 * EventProvider is designed to be used with YAHOO.augment to wrap 
 * CustomEvents in an interface that allows events to be subscribed to 
 * and fired by name.  This makes it possible for implementing code to
 * subscribe to an event that either has not been created yet, or will
 * not be created at all.
 *
 * @Class EventProvider
 */
YAHOO.util.EventProvider = function() { };

YAHOO.util.EventProvider.prototype = {

    /**
     * Private storage of custom events
     * @property __yui_events
     * @type Object[]
     * @private
     */
    __yui_events: null,

    /**
     * Private storage of custom event subscribers
     * @property __yui_subscribers
     * @type Object[]
     * @private
     */
    __yui_subscribers: null,
    
    /**
     * Subscribe to a CustomEvent by event type
     *
     * @method subscribe
     * @param p_type     {string}   the type, or name of the event
     * @param p_fn       {function} the function to exectute when the event fires
     * @param p_obj
     * @param p_obj      {Object}   An object to be passed along when the event 
     *                              fires
     * @param p_override {boolean}  If true, the obj passed in becomes the 
     *                              execution scope of the listener
     */
    subscribe: function(p_type, p_fn, p_obj, p_override) {

        this.__yui_events = this.__yui_events || {};
        var ce = this.__yui_events[p_type];

        if (ce) {
            ce.subscribe(p_fn, p_obj, p_override);
        } else {
            this.__yui_subscribers = this.__yui_subscribers || {};
            var subs = this.__yui_subscribers;
            if (!subs[p_type]) {
                subs[p_type] = [];
            }
            subs[p_type].push(
                { fn: p_fn, obj: p_obj, override: p_override } );
        }
    },

    /**
     * Unsubscribes one or more listeners the from the specified event
     * @method unsubscribe
     * @param p_type {string}   The type, or name of the event
     * @param p_fn   {Function} The subscribed function to unsubscribe, if not
     *                          supplied, all subscribers will be removed.
     * @param p_obj  {Object}   The custom object passed to subscribe.  This is
     *                        optional, but if supplied will be used to
     *                        disambiguate multiple listeners that are the same
     *                        (e.g., you subscribe many object using a function
     *                        that lives on the prototype)
     * @return {boolean} true if the subscriber was found and detached.
     */
    unsubscribe: function(p_type, p_fn, p_obj) {
        this.__yui_events = this.__yui_events || {};
        var ce = this.__yui_events[p_type];
        if (ce) {
            return ce.unsubscribe(p_fn, p_obj);
        } else {
            return false;
        }
    },
    
    /**
     * Removes all listeners from the specified event
     * @method unsubscribeAll
     * @param p_type {string}   The type, or name of the event
     */
    unsubscribeAll: function(p_type) {
        return this.unsubscribe(p_type);
    },

    /**
     * Creates a new custom event of the specified type.  If a custom event
     * by that name already exists, it will not be re-created.  In either
     * case the custom event is returned. 
     *
     * @method createEvent
     *
     * @param p_type {string} the type, or name of the event
     * @param p_config {object} optional config params.  Valid properties are:
     *
     *  <ul>
     *    <li>
     *      scope: defines the default execution scope.  If not defined
     *      the default scope will be this instance.
     *    </li>
     *    <li>
     *      silent: if true, the custom event will not generate log messages.
     *      This is false by default.
     *    </li>
     *    <li>
     *      onSubscribeCallback: specifies a callback to execute when the
     *      event has a new subscriber.  This will fire immediately for
     *      each queued subscriber if any exist prior to the creation of
     *      the event.
     *    </li>
     *  </ul>
     *
     *  @return {CustomEvent} the custom event
     *
     */
    createEvent: function(p_type, p_config) {

        this.__yui_events = this.__yui_events || {};
        var opts = p_config || {};
        var events = this.__yui_events;

        if (events[p_type]) {
        } else {

            var scope  = opts.scope  || this;
            var silent = opts.silent || null;

            var ce = new YAHOO.util.CustomEvent(p_type, scope, silent,
                    YAHOO.util.CustomEvent.FLAT);
            events[p_type] = ce;

            if (opts.onSubscribeCallback) {
                ce.subscribeEvent.subscribe(opts.onSubscribeCallback);
            }

            this.__yui_subscribers = this.__yui_subscribers || {};
            var qs = this.__yui_subscribers[p_type];

            if (qs) {
                for (var i=0; i<qs.length; ++i) {
                    ce.subscribe(qs[i].fn, qs[i].obj, qs[i].override);
                }
            }
        }

        return events[p_type];
    },


   /**
     * Fire a custom event by name.  The callback functions will be executed
     * from the scope specified when the event was created, and with the 
     * following parameters:
     *   <ul>
     *   <li>The first argument fire() was executed with</li>
     *   <li>The custom object (if any) that was passed into the subscribe() 
     *       method</li>
     *   </ul>
     * @method fireEvent
     * @param p_type    {string}  the type, or name of the event
     * @param arguments {Object*} an arbitrary set of parameters to pass to 
     *                            the handler.
     * @return {boolean} the return value from CustomEvent.fire, or null if 
     *                   the custom event does not exist.
     */
    fireEvent: function(p_type, arg1, arg2, etc) {

        this.__yui_events = this.__yui_events || {};
        var ce = this.__yui_events[p_type];

        if (ce) {
            var args = [];
            for (var i=1; i<arguments.length; ++i) {
                args.push(arguments[i]);
            }
            return ce.fire.apply(ce, args);
        } else {
            return null;
        }
    },

    /**
     * Returns true if the custom event of the provided type has been created
     * with createEvent.
     * @method hasEvent
     * @param type {string} the type, or name of the event
     */
    hasEvent: function(type) {
        if (this.__yui_events) {
            if (this.__yui_events[type]) {
                return true;
            }
        }
        return false;
    }

};

/**
* KeyListener is a utility that provides an easy interface for listening for
* keydown/keyup events fired against DOM elements.
* @namespace YAHOO.util
* @class KeyListener
* @constructor
* @param {HTMLElement} attachTo The element or element ID to which the key 
*                               event should be attached
* @param {String}      attachTo The element or element ID to which the key
*                               event should be attached
* @param {Object}      keyData  The object literal representing the key(s) 
*                               to detect. Possible attributes are 
*                               shift(boolean), alt(boolean), ctrl(boolean) 
*                               and keys(either an int or an array of ints 
*                               representing keycodes).
* @param {Function}    handler  The CustomEvent handler to fire when the 
*                               key event is detected
* @param {Object}      handler  An object literal representing the handler. 
* @param {String}      event    Optional. The event (keydown or keyup) to 
*                               listen for. Defaults automatically to keydown.
*/
YAHOO.util.KeyListener = function(attachTo, keyData, handler, event) {
    if (!attachTo) {
    } else if (!keyData) {
    } else if (!handler) {
    } 
    
    if (!event) {
        event = YAHOO.util.KeyListener.KEYDOWN;
    }

    /**
    * The CustomEvent fired internally when a key is pressed
    * @event keyEvent
    * @private
    * @param {Object} keyData The object literal representing the key(s) to 
    *                         detect. Possible attributes are shift(boolean), 
    *                         alt(boolean), ctrl(boolean) and keys(either an 
    *                         int or an array of ints representing keycodes).
    */
    var keyEvent = new YAHOO.util.CustomEvent("keyPressed");
    
    /**
    * The CustomEvent fired when the KeyListener is enabled via the enable() 
    * function
    * @event enabledEvent
    * @param {Object} keyData The object literal representing the key(s) to 
    *                         detect. Possible attributes are shift(boolean), 
    *                         alt(boolean), ctrl(boolean) and keys(either an 
    *                         int or an array of ints representing keycodes).
    */
    this.enabledEvent = new YAHOO.util.CustomEvent("enabled");

    /**
    * The CustomEvent fired when the KeyListener is disabled via the 
    * disable() function
    * @event disabledEvent
    * @param {Object} keyData The object literal representing the key(s) to 
    *                         detect. Possible attributes are shift(boolean), 
    *                         alt(boolean), ctrl(boolean) and keys(either an 
    *                         int or an array of ints representing keycodes).
    */
    this.disabledEvent = new YAHOO.util.CustomEvent("disabled");

    if (typeof attachTo == 'string') {
        attachTo = document.getElementById(attachTo);
    }

    if (typeof handler == 'function') {
        keyEvent.subscribe(handler);
    } else {
        keyEvent.subscribe(handler.fn, handler.scope, handler.correctScope);
    }

    /**
    * Handles the key event when a key is pressed.
    * @method handleKeyPress
    * @param {DOMEvent} e   The keypress DOM event
    * @param {Object}   obj The DOM event scope object
    * @private
    */
    function handleKeyPress(e, obj) {
        if (! keyData.shift) {  
            keyData.shift = false; 
        }
        if (! keyData.alt) {    
            keyData.alt = false;
        }
        if (! keyData.ctrl) {
            keyData.ctrl = false;
        }

        // check held down modifying keys first
        if (e.shiftKey == keyData.shift && 
            e.altKey   == keyData.alt &&
            e.ctrlKey  == keyData.ctrl) { // if we pass this, all modifiers match
            
            var dataItem;
            var keyPressed;

            if (keyData.keys instanceof Array) {
                for (var i=0;i<keyData.keys.length;i++) {
                    dataItem = keyData.keys[i];

                    if (dataItem == e.charCode ) {
                        keyEvent.fire(e.charCode, e);
                        break;
                    } else if (dataItem == e.keyCode) {
                        keyEvent.fire(e.keyCode, e);
                        break;
                    }
                }
            } else {
                dataItem = keyData.keys;
                if (dataItem == e.charCode ) {
                    keyEvent.fire(e.charCode, e);
                } else if (dataItem == e.keyCode) {
                    keyEvent.fire(e.keyCode, e);
                }
            }
        }
    }

    /**
    * Enables the KeyListener by attaching the DOM event listeners to the 
    * target DOM element
    * @method enable
    */
    this.enable = function() {
        if (! this.enabled) {
            YAHOO.util.Event.addListener(attachTo, event, handleKeyPress);
            this.enabledEvent.fire(keyData);
        }
        /**
        * Boolean indicating the enabled/disabled state of the Tooltip
        * @property enabled
        * @type Boolean
        */
        this.enabled = true;
    };

    /**
    * Disables the KeyListener by removing the DOM event listeners from the 
    * target DOM element
    * @method disable
    */
    this.disable = function() {
        if (this.enabled) {
            YAHOO.util.Event.removeListener(attachTo, event, handleKeyPress);
            this.disabledEvent.fire(keyData);
        }
        this.enabled = false;
    };

    /**
    * Returns a String representation of the object.
    * @method toString
    * @return {String}  The string representation of the KeyListener
    */ 
    this.toString = function() {
        return "KeyListener [" + keyData.keys + "] " + attachTo.tagName + 
                (attachTo.id ? "[" + attachTo.id + "]" : "");
    };

};

/**
* Constant representing the DOM "keydown" event.
* @property YAHOO.util.KeyListener.KEYDOWN
* @static
* @final
* @type String
*/
YAHOO.util.KeyListener.KEYDOWN = "keydown";

/**
* Constant representing the DOM "keyup" event.
* @property YAHOO.util.KeyListener.KEYUP
* @static
* @final
* @type String
*/
YAHOO.util.KeyListener.KEYUP = "keyup";
YAHOO.register("event", YAHOO.util.Event, {version: "2.2.2", build: "204"});
/*
Copyright (c) 2007, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.2.2
*/
/**
 * The Connection Manager provides a simplified interface to the XMLHttpRequest
 * object.  It handles cross-browser instantiantion of XMLHttpRequest, negotiates the
 * interactive states and server response, returning the results to a pre-defined
 * callback you create.
 *
 * @namespace YAHOO.util
 * @module connection
 * @requires yahoo
 */

/**
 * The Connection Manager singleton provides methods for creating and managing
 * asynchronous transactions.
 *
 * @class Connect
 */

YAHOO.util.Connect =
{
  /**
   * @description Array of MSFT ActiveX ids for XMLHttpRequest.
   * @property _msxml_progid
   * @private
   * @static
   * @type array
   */
	_msxml_progid:[
		'MSXML2.XMLHTTP.3.0',
		'MSXML2.XMLHTTP',
		'Microsoft.XMLHTTP'
		],

  /**
   * @description Object literal of HTTP header(s)
   * @property _http_header
   * @private
   * @static
   * @type object
   */
	_http_headers:{},

  /**
   * @description Determines if HTTP headers are set.
   * @property _has_http_headers
   * @private
   * @static
   * @type boolean
   */
	_has_http_headers:false,

 /**
  * @description Determines if a default header of
  * Content-Type of 'application/x-www-form-urlencoded'
  * will be added to any client HTTP headers sent for POST
  * transactions.
  * @property _use_default_post_header
  * @private
  * @static
  * @type boolean
  */
    _use_default_post_header:true,

 /**
  * @description Determines if a default header of
  * Content-Type of 'application/x-www-form-urlencoded'
  * will be added to client HTTP headers sent for POST
  * transactions.
  * @property _default_post_header
  * @private
  * @static
  * @type boolean
  */
    _default_post_header:'application/x-www-form-urlencoded; charset=UTF-8',

 /**
  * @description Determines if a default header of
  * 'X-Requested-With: XMLHttpRequest'
  * will be added to each transaction.
  * @property _use_default_xhr_header
  * @private
  * @static
  * @type boolean
  */
    _use_default_xhr_header:true,

 /**
  * @description The default header value for the label
  * "X-Requested-With".  This is sent with each
  * transaction, by default, to identify the
  * request as being made by YUI Connection Manager.
  * @property _default_xhr_header
  * @private
  * @static
  * @type boolean
  */
    _default_xhr_header:'XMLHttpRequest',

 /**
  * @description Determines if custom, default headers
  * are set for each transaction.
  * @property _has_default_header
  * @private
  * @static
  * @type boolean
  */
    _has_default_headers:true,

 /**
  * @description Determines if custom, default headers
  * are set for each transaction.
  * @property _has_default_header
  * @private
  * @static
  * @type boolean
  */
    _default_headers:{},

 /**
  * @description Property modified by setForm() to determine if the data
  * should be submitted as an HTML form.
  * @property _isFormSubmit
  * @private
  * @static
  * @type boolean
  */
    _isFormSubmit:false,

 /**
  * @description Property modified by setForm() to determine if a file(s)
  * upload is expected.
  * @property _isFileUpload
  * @private
  * @static
  * @type boolean
  */
    _isFileUpload:false,

 /**
  * @description Property modified by setForm() to set a reference to the HTML
  * form node if the desired action is file upload.
  * @property _formNode
  * @private
  * @static
  * @type object
  */
    _formNode:null,

 /**
  * @description Property modified by setForm() to set the HTML form data
  * for each transaction.
  * @property _sFormData
  * @private
  * @static
  * @type string
  */
    _sFormData:null,

 /**
  * @description Collection of polling references to the polling mechanism in handleReadyState.
  * @property _poll
  * @private
  * @static
  * @type object
  */
    _poll:{},

 /**
  * @description Queue of timeout values for each transaction callback with a defined timeout value.
  * @property _timeOut
  * @private
  * @static
  * @type object
  */
    _timeOut:{},

  /**
   * @description The polling frequency, in milliseconds, for HandleReadyState.
   * when attempting to determine a transaction's XHR readyState.
   * The default is 50 milliseconds.
   * @property _polling_interval
   * @private
   * @static
   * @type int
   */
     _polling_interval:50,

  /**
   * @description A transaction counter that increments the transaction id for each transaction.
   * @property _transaction_id
   * @private
   * @static
   * @type int
   */
     _transaction_id:0,

  /**
   * @description Tracks the name-value pair of the "clicked" submit button if multiple submit
   * buttons are present in an HTML form; and, if YAHOO.util.Event is available.
   * @property _submitElementValue
   * @private
   * @static
   * @type string
   */
	 _submitElementValue:null,

  /**
   * @description Determines whether YAHOO.util.Event is available and returns true or false.
   * If true, an event listener is bound at the document level to trap click events that
   * resolve to a target type of "Submit".  This listener will enable setForm() to determine
   * the clicked "Submit" value in a multi-Submit button, HTML form.
   * @property _hasSubmitListener
   * @private
   * @static
   * @type boolean
   */
	 _hasSubmitListener:(function()
	 {
		if(YAHOO.util.Event){
			YAHOO.util.Event.addListener(
				document,
				'click',
				function(e){
					var obj = YAHOO.util.Event.getTarget(e);
					if(obj.type == 'submit'){
						YAHOO.util.Connect._submitElementValue = encodeURIComponent(obj.name) + "=" + encodeURIComponent(obj.value);
					}
				})
			return true;
	    }
	    return false;
	 })(),

  /**
   * @description Member to add an ActiveX id to the existing xml_progid array.
   * In the event(unlikely) a new ActiveX id is introduced, it can be added
   * without internal code modifications.
   * @method setProgId
   * @public
   * @static
   * @param {string} id The ActiveX id to be added to initialize the XHR object.
   * @return void
   */
	setProgId:function(id)
	{
		this._msxml_progid.unshift(id);
	},

  /**
   * @description Member to enable or disable the default POST header.
   * @method setDefaultPostHeader
   * @public
   * @static
   * @param {boolean} b Set and use default header - true or false .
   * @return void
   */
	setDefaultPostHeader:function(b)
	{
		this._use_default_post_header = b;
	},

  /**
   * @description Member to enable or disable the default POST header.
   * @method setDefaultXhrHeader
   * @public
   * @static
   * @param {boolean} b Set and use default header - true or false .
   * @return void
   */
	setDefaultXhrHeader:function(b)
	{
		this._use_default_xhr_header = b;
	},

  /**
   * @description Member to modify the default polling interval.
   * @method setPollingInterval
   * @public
   * @static
   * @param {int} i The polling interval in milliseconds.
   * @return void
   */
	setPollingInterval:function(i)
	{
		if(typeof i == 'number' && isFinite(i)){
			this._polling_interval = i;
		}
	},

  /**
   * @description Instantiates a XMLHttpRequest object and returns an object with two properties:
   * the XMLHttpRequest instance and the transaction id.
   * @method createXhrObject
   * @private
   * @static
   * @param {int} transactionId Property containing the transaction id for this transaction.
   * @return object
   */
	createXhrObject:function(transactionId)
	{
		var obj,http;
		try
		{
			// Instantiates XMLHttpRequest in non-IE browsers and assigns to http.
			http = new XMLHttpRequest();
			//  Object literal with http and tId properties
			obj = { conn:http, tId:transactionId };
		}
		catch(e)
		{
			for(var i=0; i<this._msxml_progid.length; ++i){
				try
				{
					// Instantiates XMLHttpRequest for IE and assign to http.
					http = new ActiveXObject(this._msxml_progid[i]);
					//  Object literal with conn and tId properties
					obj = { conn:http, tId:transactionId };
					break;
				}
				catch(e){}
			}
		}
		finally
		{
			return obj;
		}
	},

  /**
   * @description This method is called by asyncRequest to create a
   * valid connection object for the transaction.  It also passes a
   * transaction id and increments the transaction id counter.
   * @method getConnectionObject
   * @private
   * @static
   * @return {object}
   */
	getConnectionObject:function()
	{
		var o;
		var tId = this._transaction_id;

		try
		{
			o = this.createXhrObject(tId);
			if(o){
				this._transaction_id++;
			}
		}
		catch(e){}
		finally
		{
			return o;
		}
	},

  /**
   * @description Method for initiating an asynchronous request via the XHR object.
   * @method asyncRequest
   * @public
   * @static
   * @param {string} method HTTP transaction method
   * @param {string} uri Fully qualified path of resource
   * @param {callback} callback User-defined callback function or object
   * @param {string} postData POST body
   * @return {object} Returns the connection object
   */
	asyncRequest:function(method, uri, callback, postData)
	{
		var o = this.getConnectionObject();

		if(!o){
			return null;
		}
		else{
			if(this._isFormSubmit){
				if(this._isFileUpload){
					this.uploadFile(o.tId, callback, uri, postData);
					this.releaseObject(o);

					return;
				}

				//If the specified HTTP method is GET, setForm() will return an
				//encoded string that is concatenated to the uri to
				//create a querystring.
				if(method.toUpperCase() == 'GET'){
					if(this._sFormData.length != 0){
						// If the URI already contains a querystring, append an ampersand
						// and then concatenate _sFormData to the URI.
						uri += ((uri.indexOf('?') == -1)?'?':'&') + this._sFormData;
					}
					else{
						uri += "?" + this._sFormData;
					}
				}
				else if(method.toUpperCase() == 'POST'){
					//If POST data exist in addition to the HTML form data,
					//it will be concatenated to the form data.
					postData = postData?this._sFormData + "&" + postData:this._sFormData;
				}
			}

			o.conn.open(method, uri, true);

			if(this._use_default_xhr_header){
				if(!this._default_headers['X-Requested-With']){
					this.initHeader('X-Requested-With', this._default_xhr_header, true);
				}
			}
			if(this._isFormSubmit || (postData && this._use_default_post_header)){
				this.initHeader('Content-Type', this._default_post_header);
				if(this._isFormSubmit){
					this.resetFormState();
				}
			}

			if(this._has_default_headers || this._has_http_headers){
				this.setHeader(o);
			}

			this.handleReadyState(o, callback);
			o.conn.send(postData || null);

			return o;
		}
	},

  /**
   * @description This method serves as a timer that polls the XHR object's readyState
   * property during a transaction, instead of binding a callback to the
   * onreadystatechange event.  Upon readyState 4, handleTransactionResponse
   * will process the response, and the timer will be cleared.
   * @method handleReadyState
   * @private
   * @static
   * @param {object} o The connection object
   * @param {callback} callback The user-defined callback object
   * @return {void}
   */
    handleReadyState:function(o, callback)
    {
		var oConn = this;

		if(callback && callback.timeout){
			this._timeOut[o.tId] = window.setTimeout(function(){ oConn.abort(o, callback, true); }, callback.timeout);
		}

		this._poll[o.tId] = window.setInterval(
			function(){
				if(o.conn && o.conn.readyState === 4){
					window.clearInterval(oConn._poll[o.tId]);
					delete oConn._poll[o.tId];

					if(callback && callback.timeout){
						delete oConn._timeOut[o.tId];
					}

					oConn.handleTransactionResponse(o, callback);
				}
			}
		,this._polling_interval);
    },

  /**
   * @description This method attempts to interpret the server response and
   * determine whether the transaction was successful, or if an error or
   * exception was encountered.
   * @method handleTransactionResponse
   * @private
   * @static
   * @param {object} o The connection object
   * @param {object} callback The sser-defined callback object
   * @param {boolean} isAbort Determines if the transaction was aborted.
   * @return {void}
   */
    handleTransactionResponse:function(o, callback, isAbort)
    {
		// If no valid callback is provided, then do not process any callback handling.
		if(!callback){
			this.releaseObject(o);
			return;
		}

		var httpStatus, responseObject;

		try
		{
			if(o.conn.status !== undefined && o.conn.status !== 0){
				httpStatus = o.conn.status;
			}
			else{
				httpStatus = 13030;
			}
		}
		catch(e){

			 // 13030 is the custom code to indicate the condition -- in Mozilla/FF --
			 // when the o object's status and statusText properties are
			 // unavailable, and a query attempt throws an exception.
			httpStatus = 13030;
		}

		if(httpStatus >= 200 && httpStatus < 300 || httpStatus === 1223){
			responseObject = this.createResponseObject(o, callback.argument);
			if(callback.success){
				if(!callback.scope){
					callback.success(responseObject);
				}
				else{
					// If a scope property is defined, the callback will be fired from
					// the context of the object.
					callback.success.apply(callback.scope, [responseObject]);
				}
			}
		}
		else{
			switch(httpStatus){
				// The following cases are wininet.dll error codes that may be encountered.
				case 12002: // Server timeout
				case 12029: // 12029 to 12031 correspond to dropped connections.
				case 12030:
				case 12031:
				case 12152: // Connection closed by server.
				case 13030: // See above comments for variable status.
					responseObject = this.createExceptionObject(o.tId, callback.argument, (isAbort?isAbort:false));
					if(callback.failure){
						if(!callback.scope){
							callback.failure(responseObject);
						}
						else{
							callback.failure.apply(callback.scope, [responseObject]);
						}
					}
					break;
				default:
					responseObject = this.createResponseObject(o, callback.argument);
					if(callback.failure){
						if(!callback.scope){
							callback.failure(responseObject);
						}
						else{
							callback.failure.apply(callback.scope, [responseObject]);
						}
					}
			}
		}

		this.releaseObject(o);
		responseObject = null;
    },

  /**
   * @description This method evaluates the server response, creates and returns the results via
   * its properties.  Success and failure cases will differ in the response
   * object's property values.
   * @method createResponseObject
   * @private
   * @static
   * @param {object} o The connection object
   * @param {callbackArg} callbackArg The user-defined argument or arguments to be passed to the callback
   * @return {object}
   */
    createResponseObject:function(o, callbackArg)
    {
		var obj = {};
		var headerObj = {};

		try
		{
			var headerStr = o.conn.getAllResponseHeaders();
			var header = headerStr.split('\n');
			for(var i=0; i<header.length; i++){
				var delimitPos = header[i].indexOf(':');
				if(delimitPos != -1){
					headerObj[header[i].substring(0,delimitPos)] = header[i].substring(delimitPos+2);
				}
			}
		}
		catch(e){}

		obj.tId = o.tId;
		// Normalize IE's response to HTTP 204 when Win error 1223.
		obj.status = (o.conn.status == 1223)?204:o.conn.status;
		// Normalize IE's statusText to "No Content" instead of "Unknown".
		obj.statusText = (o.conn.status == 1223)?"No Content":o.conn.statusText;
		obj.getResponseHeader = headerObj;
		obj.getAllResponseHeaders = headerStr;
		obj.responseText = o.conn.responseText;
		obj.responseXML = o.conn.responseXML;

		if(typeof callbackArg !== undefined){
			obj.argument = callbackArg;
		}

		return obj;
    },

  /**
   * @description If a transaction cannot be completed due to dropped or closed connections,
   * there may be not be enough information to build a full response object.
   * The failure callback will be fired and this specific condition can be identified
   * by a status property value of 0.
   *
   * If an abort was successful, the status property will report a value of -1.
   *
   * @method createExceptionObject
   * @private
   * @static
   * @param {int} tId The Transaction Id
   * @param {callbackArg} callbackArg The user-defined argument or arguments to be passed to the callback
   * @param {boolean} isAbort Determines if the exception case is caused by a transaction abort
   * @return {object}
   */
    createExceptionObject:function(tId, callbackArg, isAbort)
    {
		var COMM_CODE = 0;
		var COMM_ERROR = 'communication failure';
		var ABORT_CODE = -1;
		var ABORT_ERROR = 'transaction aborted';

		var obj = {};

		obj.tId = tId;
		if(isAbort){
			obj.status = ABORT_CODE;
			obj.statusText = ABORT_ERROR;
		}
		else{
			obj.status = COMM_CODE;
			obj.statusText = COMM_ERROR;
		}

		if(callbackArg){
			obj.argument = callbackArg;
		}

		return obj;
    },

  /**
   * @description Method that initializes the custom HTTP headers for the each transaction.
   * @method initHeader
   * @public
   * @static
   * @param {string} label The HTTP header label
   * @param {string} value The HTTP header value
   * @param {string} isDefault Determines if the specific header is a default header
   * automatically sent with each transaction.
   * @return {void}
   */
	initHeader:function(label,value,isDefault)
	{
		var headerObj = (isDefault)?this._default_headers:this._http_headers;

		if(headerObj[label] === undefined){
			headerObj[label] = value;
		}
		else{
			// Concatenate multiple values, comma-delimited,
			// for the same header label,
			headerObj[label] =  value + "," + headerObj[label];
		}

		if(isDefault){
			this._has_default_headers = true;
		}
		else{
			this._has_http_headers = true;
		}
	},


  /**
   * @description Accessor that sets the HTTP headers for each transaction.
   * @method setHeader
   * @private
   * @static
   * @param {object} o The connection object for the transaction.
   * @return {void}
   */
	setHeader:function(o)
	{
		if(this._has_default_headers){
			for(var prop in this._default_headers){
				if(YAHOO.lang.hasOwnProperty(this._default_headers,prop)){
					o.conn.setRequestHeader(prop, this._default_headers[prop]);
				}
			}
		}

		if(this._has_http_headers){
			for(var prop in this._http_headers){
				if(YAHOO.lang.hasOwnProperty(this._http_headers,prop)){
					o.conn.setRequestHeader(prop, this._http_headers[prop]);
				}
			}
			delete this._http_headers;

			this._http_headers = {};
			this._has_http_headers = false;
		}
	},

  /**
   * @description Resets the default HTTP headers object
   * @method resetDefaultHeaders
   * @public
   * @static
   * @return {void}
   */
	resetDefaultHeaders:function(){
		delete this._default_headers
		this._default_headers = {};
		this._has_default_headers = false;
	},

  /**
   * @description This method assembles the form label and value pairs and
   * constructs an encoded string.
   * asyncRequest() will automatically initialize the
   * transaction with a HTTP header Content-Type of
   * application/x-www-form-urlencoded.
   * @method setForm
   * @public
   * @static
   * @param {string || object} form id or name attribute, or form object.
   * @param {string} optional boolean to indicate SSL environment.
   * @param {string || boolean} optional qualified path of iframe resource for SSL in IE.
   * @return {string} string of the HTML form field name and value pairs..
   */
	setForm:function(formId, isUpload, secureUri)
	{
		this.resetFormState();
		var oForm;
		if(typeof formId == 'string'){
			// Determine if the argument is a form id or a form name.
			// Note form name usage is deprecated by supported
			// here for legacy reasons.
			oForm = (document.getElementById(formId) || document.forms[formId]);
		}
		else if(typeof formId == 'object'){
			// Treat argument as an HTML form object.
			oForm = formId;
		}
		else{
			return;
		}

		// If the isUpload argument is true, setForm will call createFrame to initialize
		// an iframe as the form target.
		//
		// The argument secureURI is also required by IE in SSL environments
		// where the secureURI string is a fully qualified HTTP path, used to set the source
		// of the iframe, to a stub resource in the same domain.
		if(isUpload){

			// Create iframe in preparation for file upload.
			this.createFrame(secureUri?secureUri:null);

			// Set form reference and file upload properties to true.
			this._isFormSubmit = true;
			this._isFileUpload = true;
			this._formNode = oForm;

			return;
		}

		var oElement, oName, oValue, oDisabled;
		var hasSubmit = false;

		// Iterate over the form elements collection to construct the
		// label-value pairs.
		for (var i=0; i<oForm.elements.length; i++){
			oElement = oForm.elements[i];
			oDisabled = oForm.elements[i].disabled;
			oName = oForm.elements[i].name;
			oValue = oForm.elements[i].value;

			// Do not submit fields that are disabled or
			// do not have a name attribute value.
			if(!oDisabled && oName)
			{
				switch (oElement.type)
				{
					case 'select-one':
					case 'select-multiple':
						for(var j=0; j<oElement.options.length; j++){
							if(oElement.options[j].selected){
								if(window.ActiveXObject){
									this._sFormData += encodeURIComponent(oName) + '=' + encodeURIComponent(oElement.options[j].attributes['value'].specified?oElement.options[j].value:oElement.options[j].text) + '&';
								}
								else{
									this._sFormData += encodeURIComponent(oName) + '=' + encodeURIComponent(oElement.options[j].hasAttribute('value')?oElement.options[j].value:oElement.options[j].text) + '&';
								}

							}
						}
						break;
					case 'radio':
					case 'checkbox':
						if(oElement.checked){
							this._sFormData += encodeURIComponent(oName) + '=' + encodeURIComponent(oValue) + '&';
						}
						break;
					case 'file':
						// stub case as XMLHttpRequest will only send the file path as a string.
					case undefined:
						// stub case for fieldset element which returns undefined.
					case 'reset':
						// stub case for input type reset button.
					case 'button':
						// stub case for input type button elements.
						break;
					case 'submit':
						if(hasSubmit === false){
							if(this._hasSubmitListener){
								this._sFormData += this._submitElementValue + '&';
							}
							else{
								this._sFormData += encodeURIComponent(oName) + '=' + encodeURIComponent(oValue) + '&';
							}

							hasSubmit = true;
						}
						break;
					default:
						this._sFormData += encodeURIComponent(oName) + '=' + encodeURIComponent(oValue) + '&';
						break;
				}
			}
		}

		this._isFormSubmit = true;
		this._sFormData = this._sFormData.substr(0, this._sFormData.length - 1);


		return this._sFormData;
	},

  /**
   * @description Resets HTML form properties when an HTML form or HTML form
   * with file upload transaction is sent.
   * @method resetFormState
   * @private
   * @static
   * @return {void}
   */
	resetFormState:function(){
		this._isFormSubmit = false;
		this._isFileUpload = false;
		this._formNode = null;
		this._sFormData = "";
	},

  /**
   * @description Creates an iframe to be used for form file uploads.  It is remove from the
   * document upon completion of the upload transaction.
   * @method createFrame
   * @private
   * @static
   * @param {string} optional qualified path of iframe resource for SSL in IE.
   * @return {void}
   */
	createFrame:function(secureUri){

		// IE does not allow the setting of id and name attributes as object
		// properties via createElement().  A different iframe creation
		// pattern is required for IE.
		var frameId = 'yuiIO' + this._transaction_id;
		if(window.ActiveXObject){
			var io = document.createElement('<iframe id="' + frameId + '" name="' + frameId + '" />');

			// IE will throw a security exception in an SSL environment if the
			// iframe source is undefined.
			if(typeof secureUri == 'boolean'){
				io.src = 'javascript:false';
			}
			else if(typeof secureURI == 'string'){
				// Deprecated
				io.src = secureUri;
			}
		}
		else{
			var io = document.createElement('iframe');
			io.id = frameId;
			io.name = frameId;
		}

		io.style.position = 'absolute';
		io.style.top = '-1000px';
		io.style.left = '-1000px';

		document.body.appendChild(io);
	},

  /**
   * @description Parses the POST data and creates hidden form elements
   * for each key-value, and appends them to the HTML form object.
   * @method appendPostData
   * @private
   * @static
   * @param {string} postData The HTTP POST data
   * @return {array} formElements Collection of hidden fields.
   */
	appendPostData:function(postData)
	{
		var formElements = [];
		var postMessage = postData.split('&');
		for(var i=0; i < postMessage.length; i++){
			var delimitPos = postMessage[i].indexOf('=');
			if(delimitPos != -1){
				formElements[i] = document.createElement('input');
				formElements[i].type = 'hidden';
				formElements[i].name = postMessage[i].substring(0,delimitPos);
				formElements[i].value = postMessage[i].substring(delimitPos+1);
				this._formNode.appendChild(formElements[i]);
			}
		}

		return formElements;
	},

  /**
   * @description Uploads HTML form, including files/attachments, to the
   * iframe created in createFrame.
   * @method uploadFile
   * @private
   * @static
   * @param {int} id The transaction id.
   * @param {object} callback - User-defined callback object.
   * @param {string} uri Fully qualified path of resource.
   * @return {void}
   */
	uploadFile:function(id, callback, uri, postData){

		// Each iframe has an id prefix of "yuiIO" followed
		// by the unique transaction id.
		var frameId = 'yuiIO' + id;
		var uploadEncoding = 'multipart/form-data';
		var io = document.getElementById(frameId);

		// Initialize the HTML form properties in case they are
		// not defined in the HTML form.
		this._formNode.setAttribute('action', uri);
		this._formNode.setAttribute('method', 'POST');
		this._formNode.setAttribute("target", frameId);

		if(this._formNode.encoding){
			// IE does not respect property enctype for HTML forms.
			// Instead it uses the property - "encoding".
			this._formNode.encoding = uploadEncoding;
		}
		else{
			this._formNode.enctype = uploadEncoding;
		}


		if(postData){
			var oElements = this.appendPostData(postData);
		}

		this._formNode.submit();

		if(oElements && oElements.length > 0){
			for(var i=0; i < oElements.length; i++){
				this._formNode.removeChild(oElements[i]);
			}
		}

		// Reset HTML form status properties.
		this.resetFormState();

		// Create the upload callback handler that fires when the iframe
		// receives the load event.  Subsequently, the event handler is detached
		// and the iframe removed from the document.

		var uploadCallback = function()
		{
			var obj = {};
			obj.tId = id;
			obj.argument = callback.argument;

			try
			{
				obj.responseText = io.contentWindow.document.body?io.contentWindow.document.body.innerHTML:null;
				obj.responseXML = io.contentWindow.document.XMLDocument?io.contentWindow.document.XMLDocument:io.contentWindow.document;
			}
			catch(e){}

			if(callback && callback.upload){
				if(!callback.scope){
					callback.upload(obj);
				}
				else{
					callback.upload.apply(callback.scope, [obj]);
				}
			}

			if(YAHOO.util.Event){
				YAHOO.util.Event.removeListener(io, "load", uploadCallback);
			}
			else if(window.detachEvent){
				io.detachEvent('onload', uploadCallback);
			}
			else{
				io.removeEventListener('load', uploadCallback, false);
			}
			setTimeout(
				function(){
					document.body.removeChild(io);
				}, 100);
		};


		// Bind the onload handler to the iframe to detect the file upload response.
		if(YAHOO.util.Event){
			YAHOO.util.Event.addListener(io, "load", uploadCallback);
		}
		else if(window.attachEvent){
			io.attachEvent('onload', uploadCallback);
		}
		else{
			io.addEventListener('load', uploadCallback, false);
		}
	},

  /**
   * @description Method to terminate a transaction, if it has not reached readyState 4.
   * @method abort
   * @public
   * @static
   * @param {object} o The connection object returned by asyncRequest.
   * @param {object} callback  User-defined callback object.
   * @param {string} isTimeout boolean to indicate if abort was a timeout.
   * @return {boolean}
   */
	abort:function(o, callback, isTimeout)
	{
		if(this.isCallInProgress(o)){
			o.conn.abort();
			window.clearInterval(this._poll[o.tId]);
			delete this._poll[o.tId];
			if(isTimeout){
				delete this._timeOut[o.tId];
			}

			this.handleTransactionResponse(o, callback, true);

			return true;
		}
		else{
			return false;
		}
	},

  /**
   * Public method to check if the transaction is still being processed.
   *
   * @method isCallInProgress
   * @public
   * @static
   * @param {object} o The connection object returned by asyncRequest
   * @return {boolean}
   */
	isCallInProgress:function(o)
	{
		// if the XHR object assigned to the transaction has not been dereferenced,
		// then check its readyState status.  Otherwise, return false.
		if(o.conn){
			return o.conn.readyState !== 4 && o.conn.readyState !== 0;
		}
		else{
			//The XHR object has been destroyed.
			return false;
		}
	},

  /**
   * @description Dereference the XHR instance and the connection object after the transaction is completed.
   * @method releaseObject
   * @private
   * @static
   * @param {object} o The connection object
   * @return {void}
   */
	releaseObject:function(o)
	{
		//dereference the XHR instance.
		o.conn = null;
		//dereference the connection object.
		o = null;
	}
};

YAHOO.register("connection", YAHOO.util.Connect, {version: "2.2.2", build: "204"});
/*
Copyright (c) 2007, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.2.2
*/
/**
 * The animation module provides allows effects to be added to HTMLElements.
 * @module animation
 * @requires yahoo, event, dom
 */

/**
 *
 * Base animation class that provides the interface for building animated effects.
 * <p>Usage: var myAnim = new YAHOO.util.Anim(el, { width: { from: 10, to: 100 } }, 1, YAHOO.util.Easing.easeOut);</p>
 * @class Anim
 * @namespace YAHOO.util
 * @requires YAHOO.util.AnimMgr
 * @requires YAHOO.util.Easing
 * @requires YAHOO.util.Dom
 * @requires YAHOO.util.Event
 * @requires YAHOO.util.CustomEvent
 * @constructor
 * @param {String | HTMLElement} el Reference to the element that will be animated
 * @param {Object} attributes The attribute(s) to be animated.  
 * Each attribute is an object with at minimum a "to" or "by" member defined.  
 * Additional optional members are "from" (defaults to current value), "units" (defaults to "px").  
 * All attribute names use camelCase.
 * @param {Number} duration (optional, defaults to 1 second) Length of animation (frames or seconds), defaults to time-based
 * @param {Function} method (optional, defaults to YAHOO.util.Easing.easeNone) Computes the values that are applied to the attributes per frame (generally a YAHOO.util.Easing method)
 */

YAHOO.util.Anim = function(el, attributes, duration, method) {
    if (el) {
        this.init(el, attributes, duration, method); 
    }
};

YAHOO.util.Anim.prototype = {
    /**
     * Provides a readable name for the Anim instance.
     * @method toString
     * @return {String}
     */
    toString: function() {
        var el = this.getEl();
        var id = el.id || el.tagName;
        return ("Anim " + id);
    },
    
    patterns: { // cached for performance
        noNegatives:        /width|height|opacity|padding/i, // keep at zero or above
        offsetAttribute:  /^((width|height)|(top|left))$/, // use offsetValue as default
        defaultUnit:        /width|height|top$|bottom$|left$|right$/i, // use 'px' by default
        offsetUnit:         /\d+(em|%|en|ex|pt|in|cm|mm|pc)$/i // IE may return these, so convert these to offset
    },
    
    /**
     * Returns the value computed by the animation's "method".
     * @method doMethod
     * @param {String} attr The name of the attribute.
     * @param {Number} start The value this attribute should start from for this animation.
     * @param {Number} end  The value this attribute should end at for this animation.
     * @return {Number} The Value to be applied to the attribute.
     */
    doMethod: function(attr, start, end) {
        return this.method(this.currentFrame, start, end - start, this.totalFrames);
    },
    
    /**
     * Applies a value to an attribute.
     * @method setAttribute
     * @param {String} attr The name of the attribute.
     * @param {Number} val The value to be applied to the attribute.
     * @param {String} unit The unit ('px', '%', etc.) of the value.
     */
    setAttribute: function(attr, val, unit) {
        if ( this.patterns.noNegatives.test(attr) ) {
            val = (val > 0) ? val : 0;
        }

        YAHOO.util.Dom.setStyle(this.getEl(), attr, val + unit);
    },                        
    
    /**
     * Returns current value of the attribute.
     * @method getAttribute
     * @param {String} attr The name of the attribute.
     * @return {Number} val The current value of the attribute.
     */
    getAttribute: function(attr) {
        var el = this.getEl();
        var val = YAHOO.util.Dom.getStyle(el, attr);

        if (val !== 'auto' && !this.patterns.offsetUnit.test(val)) {
            return parseFloat(val);
        }
        
        var a = this.patterns.offsetAttribute.exec(attr) || [];
        var pos = !!( a[3] ); // top or left
        var box = !!( a[2] ); // width or height
        
        // use offsets for width/height and abs pos top/left
        if ( box || (YAHOO.util.Dom.getStyle(el, 'position') == 'absolute' && pos) ) {
            val = el['offset' + a[0].charAt(0).toUpperCase() + a[0].substr(1)];
        } else { // default to zero for other 'auto'
            val = 0;
        }

        return val;
    },
    
    /**
     * Returns the unit to use when none is supplied.
     * @method getDefaultUnit
     * @param {attr} attr The name of the attribute.
     * @return {String} The default unit to be used.
     */
    getDefaultUnit: function(attr) {
         if ( this.patterns.defaultUnit.test(attr) ) {
            return 'px';
         }
         
         return '';
    },
        
    /**
     * Sets the actual values to be used during the animation.  Should only be needed for subclass use.
     * @method setRuntimeAttribute
     * @param {Object} attr The attribute object
     * @private 
     */
    setRuntimeAttribute: function(attr) {
        var start;
        var end;
        var attributes = this.attributes;

        this.runtimeAttributes[attr] = {};
        
        var isset = function(prop) {
            return (typeof prop !== 'undefined');
        };
        
        if ( !isset(attributes[attr]['to']) && !isset(attributes[attr]['by']) ) {
            return false; // note return; nothing to animate to
        }
        
        start = ( isset(attributes[attr]['from']) ) ? attributes[attr]['from'] : this.getAttribute(attr);

        // To beats by, per SMIL 2.1 spec
        if ( isset(attributes[attr]['to']) ) {
            end = attributes[attr]['to'];
        } else if ( isset(attributes[attr]['by']) ) {
            if (start.constructor == Array) {
                end = [];
                for (var i = 0, len = start.length; i < len; ++i) {
                    end[i] = start[i] + attributes[attr]['by'][i];
                }
            } else {
                end = start + attributes[attr]['by'];
            }
        }
        
        this.runtimeAttributes[attr].start = start;
        this.runtimeAttributes[attr].end = end;

        // set units if needed
        this.runtimeAttributes[attr].unit = ( isset(attributes[attr].unit) ) ? attributes[attr]['unit'] : this.getDefaultUnit(attr);
    },

    /**
     * Constructor for Anim instance.
     * @method init
     * @param {String | HTMLElement} el Reference to the element that will be animated
     * @param {Object} attributes The attribute(s) to be animated.  
     * Each attribute is an object with at minimum a "to" or "by" member defined.  
     * Additional optional members are "from" (defaults to current value), "units" (defaults to "px").  
     * All attribute names use camelCase.
     * @param {Number} duration (optional, defaults to 1 second) Length of animation (frames or seconds), defaults to time-based
     * @param {Function} method (optional, defaults to YAHOO.util.Easing.easeNone) Computes the values that are applied to the attributes per frame (generally a YAHOO.util.Easing method)
     */ 
    init: function(el, attributes, duration, method) {
        /**
         * Whether or not the animation is running.
         * @property isAnimated
         * @private
         * @type Boolean
         */
        var isAnimated = false;
        
        /**
         * A Date object that is created when the animation begins.
         * @property startTime
         * @private
         * @type Date
         */
        var startTime = null;
        
        /**
         * The number of frames this animation was able to execute.
         * @property actualFrames
         * @private
         * @type Int
         */
        var actualFrames = 0; 

        /**
         * The element to be animated.
         * @property el
         * @private
         * @type HTMLElement
         */
        el = YAHOO.util.Dom.get(el);
        
        /**
         * The collection of attributes to be animated.  
         * Each attribute must have at least a "to" or "by" defined in order to animate.  
         * If "to" is supplied, the animation will end with the attribute at that value.  
         * If "by" is supplied, the animation will end at that value plus its starting value. 
         * If both are supplied, "to" is used, and "by" is ignored. 
         * Optional additional member include "from" (the value the attribute should start animating from, defaults to current value), and "unit" (the units to apply to the values).
         * @property attributes
         * @type Object
         */
        this.attributes = attributes || {};
        
        /**
         * The length of the animation.  Defaults to "1" (second).
         * @property duration
         * @type Number
         */
        this.duration = duration || 1;
        
        /**
         * The method that will provide values to the attribute(s) during the animation. 
         * Defaults to "YAHOO.util.Easing.easeNone".
         * @property method
         * @type Function
         */
        this.method = method || YAHOO.util.Easing.easeNone;

        /**
         * Whether or not the duration should be treated as seconds.
         * Defaults to true.
         * @property useSeconds
         * @type Boolean
         */
        this.useSeconds = true; // default to seconds
        
        /**
         * The location of the current animation on the timeline.
         * In time-based animations, this is used by AnimMgr to ensure the animation finishes on time.
         * @property currentFrame
         * @type Int
         */
        this.currentFrame = 0;
        
        /**
         * The total number of frames to be executed.
         * In time-based animations, this is used by AnimMgr to ensure the animation finishes on time.
         * @property totalFrames
         * @type Int
         */
        this.totalFrames = YAHOO.util.AnimMgr.fps;
        
        
        /**
         * Returns a reference to the animated element.
         * @method getEl
         * @return {HTMLElement}
         */
        this.getEl = function() { return el; };
        
        /**
         * Checks whether the element is currently animated.
         * @method isAnimated
         * @return {Boolean} current value of isAnimated.     
         */
        this.isAnimated = function() {
            return isAnimated;
        };
        
        /**
         * Returns the animation start time.
         * @method getStartTime
         * @return {Date} current value of startTime.      
         */
        this.getStartTime = function() {
            return startTime;
        };        
        
        this.runtimeAttributes = {};
        
        
        
        /**
         * Starts the animation by registering it with the animation manager. 
         * @method animate  
         */
        this.animate = function() {
            if ( this.isAnimated() ) {
                return false;
            }
            
            this.currentFrame = 0;
            
            this.totalFrames = ( this.useSeconds ) ? Math.ceil(YAHOO.util.AnimMgr.fps * this.duration) : this.duration;
    
            YAHOO.util.AnimMgr.registerElement(this);
        };
          
        /**
         * Stops the animation.  Normally called by AnimMgr when animation completes.
         * @method stop
         * @param {Boolean} finish (optional) If true, animation will jump to final frame.
         */ 
        this.stop = function(finish) {
            if (finish) {
                 this.currentFrame = this.totalFrames;
                 this._onTween.fire();
            }
            YAHOO.util.AnimMgr.stop(this);
        };
        
        var onStart = function() {            
            this.onStart.fire();
            
            this.runtimeAttributes = {};
            for (var attr in this.attributes) {
                this.setRuntimeAttribute(attr);
            }
            
            isAnimated = true;
            actualFrames = 0;
            startTime = new Date(); 
        };
        
        /**
         * Feeds the starting and ending values for each animated attribute to doMethod once per frame, then applies the resulting value to the attribute(s).
         * @private
         */
         
        var onTween = function() {
            var data = {
                duration: new Date() - this.getStartTime(),
                currentFrame: this.currentFrame
            };
            
            data.toString = function() {
                return (
                    'duration: ' + data.duration +
                    ', currentFrame: ' + data.currentFrame
                );
            };
            
            this.onTween.fire(data);
            
            var runtimeAttributes = this.runtimeAttributes;
            
            for (var attr in runtimeAttributes) {
                this.setAttribute(attr, this.doMethod(attr, runtimeAttributes[attr].start, runtimeAttributes[attr].end), runtimeAttributes[attr].unit); 
            }
            
            actualFrames += 1;
        };
        
        var onComplete = function() {
            var actual_duration = (new Date() - startTime) / 1000 ;
            
            var data = {
                duration: actual_duration,
                frames: actualFrames,
                fps: actualFrames / actual_duration
            };
            
            data.toString = function() {
                return (
                    'duration: ' + data.duration +
                    ', frames: ' + data.frames +
                    ', fps: ' + data.fps
                );
            };
            
            isAnimated = false;
            actualFrames = 0;
            this.onComplete.fire(data);
        };
        
        /**
         * Custom event that fires after onStart, useful in subclassing
         * @private
         */    
        this._onStart = new YAHOO.util.CustomEvent('_start', this, true);

        /**
         * Custom event that fires when animation begins
         * Listen via subscribe method (e.g. myAnim.onStart.subscribe(someFunction)
         * @event onStart
         */    
        this.onStart = new YAHOO.util.CustomEvent('start', this);
        
        /**
         * Custom event that fires between each frame
         * Listen via subscribe method (e.g. myAnim.onTween.subscribe(someFunction)
         * @event onTween
         */
        this.onTween = new YAHOO.util.CustomEvent('tween', this);
        
        /**
         * Custom event that fires after onTween
         * @private
         */
        this._onTween = new YAHOO.util.CustomEvent('_tween', this, true);
        
        /**
         * Custom event that fires when animation ends
         * Listen via subscribe method (e.g. myAnim.onComplete.subscribe(someFunction)
         * @event onComplete
         */
        this.onComplete = new YAHOO.util.CustomEvent('complete', this);
        /**
         * Custom event that fires after onComplete
         * @private
         */
        this._onComplete = new YAHOO.util.CustomEvent('_complete', this, true);

        this._onStart.subscribe(onStart);
        this._onTween.subscribe(onTween);
        this._onComplete.subscribe(onComplete);
    }
};

/**
 * Handles animation queueing and threading.
 * Used by Anim and subclasses.
 * @class AnimMgr
 * @namespace YAHOO.util
 */
YAHOO.util.AnimMgr = new function() {
    /** 
     * Reference to the animation Interval.
     * @property thread
     * @private
     * @type Int
     */
    var thread = null;
    
    /** 
     * The current queue of registered animation objects.
     * @property queue
     * @private
     * @type Array
     */    
    var queue = [];

    /** 
     * The number of active animations.
     * @property tweenCount
     * @private
     * @type Int
     */        
    var tweenCount = 0;

    /** 
     * Base frame rate (frames per second). 
     * Arbitrarily high for better x-browser calibration (slower browsers drop more frames).
     * @property fps
     * @type Int
     * 
     */
    this.fps = 1000;

    /** 
     * Interval delay in milliseconds, defaults to fastest possible.
     * @property delay
     * @type Int
     * 
     */
    this.delay = 1;

    /**
     * Adds an animation instance to the animation queue.
     * All animation instances must be registered in order to animate.
     * @method registerElement
     * @param {object} tween The Anim instance to be be registered
     */
    this.registerElement = function(tween) {
        queue[queue.length] = tween;
        tweenCount += 1;
        tween._onStart.fire();
        this.start();
    };
    
    /**
     * removes an animation instance from the animation queue.
     * All animation instances must be registered in order to animate.
     * @method unRegister
     * @param {object} tween The Anim instance to be be registered
     * @param {Int} index The index of the Anim instance
     * @private
     */
    this.unRegister = function(tween, index) {
        tween._onComplete.fire();
        index = index || getIndex(tween);
        if (index != -1) {
            queue.splice(index, 1);
        }
        
        tweenCount -= 1;
        if (tweenCount <= 0) {
            this.stop();
        }
    };
    
    /**
     * Starts the animation thread.
	* Only one thread can run at a time.
     * @method start
     */    
    this.start = function() {
        if (thread === null) {
            thread = setInterval(this.run, this.delay);
        }
    };

    /**
     * Stops the animation thread or a specific animation instance.
     * @method stop
     * @param {object} tween A specific Anim instance to stop (optional)
     * If no instance given, Manager stops thread and all animations.
     */    
    this.stop = function(tween) {
        if (!tween) {
            clearInterval(thread);
            
            for (var i = 0, len = queue.length; i < len; ++i) {
                if ( queue[0].isAnimated() ) {
                    this.unRegister(queue[0], 0);  
                }
            }

            queue = [];
            thread = null;
            tweenCount = 0;
        }
        else {
            this.unRegister(tween);
        }
    };
    
    /**
     * Called per Interval to handle each animation frame.
     * @method run
     */    
    this.run = function() {
        for (var i = 0, len = queue.length; i < len; ++i) {
            var tween = queue[i];
            if ( !tween || !tween.isAnimated() ) { continue; }

            if (tween.currentFrame < tween.totalFrames || tween.totalFrames === null)
            {
                tween.currentFrame += 1;
                
                if (tween.useSeconds) {
                    correctFrame(tween);
                }
                tween._onTween.fire();          
            }
            else { YAHOO.util.AnimMgr.stop(tween, i); }
        }
    };
    
    var getIndex = function(anim) {
        for (var i = 0, len = queue.length; i < len; ++i) {
            if (queue[i] == anim) {
                return i; // note return;
            }
        }
        return -1;
    };
    
    /**
     * On the fly frame correction to keep animation on time.
     * @method correctFrame
     * @private
     * @param {Object} tween The Anim instance being corrected.
     */
    var correctFrame = function(tween) {
        var frames = tween.totalFrames;
        var frame = tween.currentFrame;
        var expected = (tween.currentFrame * tween.duration * 1000 / tween.totalFrames);
        var elapsed = (new Date() - tween.getStartTime());
        var tweak = 0;
        
        if (elapsed < tween.duration * 1000) { // check if falling behind
            tweak = Math.round((elapsed / expected - 1) * tween.currentFrame);
        } else { // went over duration, so jump to end
            tweak = frames - (frame + 1); 
        }
        if (tweak > 0 && isFinite(tweak)) { // adjust if needed
            if (tween.currentFrame + tweak >= frames) {// dont go past last frame
                tweak = frames - (frame + 1);
            }
            
            tween.currentFrame += tweak;      
        }
    };
};
/**
 * Used to calculate Bezier splines for any number of control points.
 * @class Bezier
 * @namespace YAHOO.util
 *
 */
YAHOO.util.Bezier = new function() {
    /**
     * Get the current position of the animated element based on t.
     * Each point is an array of "x" and "y" values (0 = x, 1 = y)
     * At least 2 points are required (start and end).
     * First point is start. Last point is end.
     * Additional control points are optional.     
     * @method getPosition
     * @param {Array} points An array containing Bezier points
     * @param {Number} t A number between 0 and 1 which is the basis for determining current position
     * @return {Array} An array containing int x and y member data
     */
    this.getPosition = function(points, t) {  
        var n = points.length;
        var tmp = [];

        for (var i = 0; i < n; ++i){
            tmp[i] = [points[i][0], points[i][1]]; // save input
        }
        
        for (var j = 1; j < n; ++j) {
            for (i = 0; i < n - j; ++i) {
                tmp[i][0] = (1 - t) * tmp[i][0] + t * tmp[parseInt(i + 1, 10)][0];
                tmp[i][1] = (1 - t) * tmp[i][1] + t * tmp[parseInt(i + 1, 10)][1]; 
            }
        }
    
        return [ tmp[0][0], tmp[0][1] ]; 
    
    };
};
(function() {
/**
 * Anim subclass for color transitions.
 * <p>Usage: <code>var myAnim = new Y.ColorAnim(el, { backgroundColor: { from: '#FF0000', to: '#FFFFFF' } }, 1, Y.Easing.easeOut);</code> Color values can be specified with either 112233, #112233, 
 * [255,255,255], or rgb(255,255,255)</p>
 * @class ColorAnim
 * @namespace YAHOO.util
 * @requires YAHOO.util.Anim
 * @requires YAHOO.util.AnimMgr
 * @requires YAHOO.util.Easing
 * @requires YAHOO.util.Bezier
 * @requires YAHOO.util.Dom
 * @requires YAHOO.util.Event
 * @constructor
 * @extends YAHOO.util.Anim
 * @param {HTMLElement | String} el Reference to the element that will be animated
 * @param {Object} attributes The attribute(s) to be animated.
 * Each attribute is an object with at minimum a "to" or "by" member defined.
 * Additional optional members are "from" (defaults to current value), "units" (defaults to "px").
 * All attribute names use camelCase.
 * @param {Number} duration (optional, defaults to 1 second) Length of animation (frames or seconds), defaults to time-based
 * @param {Function} method (optional, defaults to YAHOO.util.Easing.easeNone) Computes the values that are applied to the attributes per frame (generally a YAHOO.util.Easing method)
 */
    YAHOO.util.ColorAnim = function(el, attributes, duration,  method) {
        YAHOO.util.ColorAnim.superclass.constructor.call(this, el, attributes, duration, method);
    };
    
    YAHOO.extend(YAHOO.util.ColorAnim, YAHOO.util.Anim);
    
    // shorthand
    var Y = YAHOO.util;
    var superclass = Y.ColorAnim.superclass;
    var proto = Y.ColorAnim.prototype;
    
    proto.toString = function() {
        var el = this.getEl();
        var id = el.id || el.tagName;
        return ("ColorAnim " + id);
    };

    proto.patterns.color = /color$/i;
    proto.patterns.rgb            = /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i;
    proto.patterns.hex            = /^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i;
    proto.patterns.hex3          = /^#?([0-9A-F]{1})([0-9A-F]{1})([0-9A-F]{1})$/i;
    proto.patterns.transparent = /^transparent|rgba\(0, 0, 0, 0\)$/; // need rgba for safari
    
    /**
     * Attempts to parse the given string and return a 3-tuple.
     * @method parseColor
     * @param {String} s The string to parse.
     * @return {Array} The 3-tuple of rgb values.
     */
    proto.parseColor = function(s) {
        if (s.length == 3) { return s; }
    
        var c = this.patterns.hex.exec(s);
        if (c && c.length == 4) {
            return [ parseInt(c[1], 16), parseInt(c[2], 16), parseInt(c[3], 16) ];
        }
    
        c = this.patterns.rgb.exec(s);
        if (c && c.length == 4) {
            return [ parseInt(c[1], 10), parseInt(c[2], 10), parseInt(c[3], 10) ];
        }
    
        c = this.patterns.hex3.exec(s);
        if (c && c.length == 4) {
            return [ parseInt(c[1] + c[1], 16), parseInt(c[2] + c[2], 16), parseInt(c[3] + c[3], 16) ];
        }
        
        return null;
    };

    proto.getAttribute = function(attr) {
        var el = this.getEl();
        if (  this.patterns.color.test(attr) ) {
            var val = YAHOO.util.Dom.getStyle(el, attr);
            
            if (this.patterns.transparent.test(val)) { // bgcolor default
                var parent = el.parentNode; // try and get from an ancestor
                val = Y.Dom.getStyle(parent, attr);
            
                while (parent && this.patterns.transparent.test(val)) {
                    parent = parent.parentNode;
                    val = Y.Dom.getStyle(parent, attr);
                    if (parent.tagName.toUpperCase() == 'HTML') {
                        val = '#fff';
                    }
                }
            }
        } else {
            val = superclass.getAttribute.call(this, attr);
        }

        return val;
    };
    
    proto.doMethod = function(attr, start, end) {
        var val;
    
        if ( this.patterns.color.test(attr) ) {
            val = [];
            for (var i = 0, len = start.length; i < len; ++i) {
                val[i] = superclass.doMethod.call(this, attr, start[i], end[i]);
            }
            
            val = 'rgb('+Math.floor(val[0])+','+Math.floor(val[1])+','+Math.floor(val[2])+')';
        }
        else {
            val = superclass.doMethod.call(this, attr, start, end);
        }

        return val;
    };

    proto.setRuntimeAttribute = function(attr) {
        superclass.setRuntimeAttribute.call(this, attr);
        
        if ( this.patterns.color.test(attr) ) {
            var attributes = this.attributes;
            var start = this.parseColor(this.runtimeAttributes[attr].start);
            var end = this.parseColor(this.runtimeAttributes[attr].end);
            // fix colors if going "by"
            if ( typeof attributes[attr]['to'] === 'undefined' && typeof attributes[attr]['by'] !== 'undefined' ) {
                end = this.parseColor(attributes[attr].by);
            
                for (var i = 0, len = start.length; i < len; ++i) {
                    end[i] = start[i] + end[i];
                }
            }
            
            this.runtimeAttributes[attr].start = start;
            this.runtimeAttributes[attr].end = end;
        }
    };
})();
/*
TERMS OF USE - EASING EQUATIONS
Open source under the BSD License.
Copyright 2001 Robert Penner All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * Neither the name of the author nor the names of contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * Singleton that determines how an animation proceeds from start to end.
 * @class Easing
 * @namespace YAHOO.util
*/

YAHOO.util.Easing = {

    /**
     * Uniform speed between points.
     * @method easeNone
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeNone: function (t, b, c, d) {
    	return c*t/d + b;
    },
    
    /**
     * Begins slowly and accelerates towards end. (quadratic)
     * @method easeIn
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeIn: function (t, b, c, d) {
    	return c*(t/=d)*t + b;
    },

    /**
     * Begins quickly and decelerates towards end.  (quadratic)
     * @method easeOut
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeOut: function (t, b, c, d) {
    	return -c *(t/=d)*(t-2) + b;
    },
    
    /**
     * Begins slowly and decelerates towards end. (quadratic)
     * @method easeBoth
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeBoth: function (t, b, c, d) {
    	if ((t/=d/2) < 1) {
            return c/2*t*t + b;
        }
        
    	return -c/2 * ((--t)*(t-2) - 1) + b;
    },
    
    /**
     * Begins slowly and accelerates towards end. (quartic)
     * @method easeInStrong
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeInStrong: function (t, b, c, d) {
    	return c*(t/=d)*t*t*t + b;
    },
    
    /**
     * Begins quickly and decelerates towards end.  (quartic)
     * @method easeOutStrong
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeOutStrong: function (t, b, c, d) {
    	return -c * ((t=t/d-1)*t*t*t - 1) + b;
    },
    
    /**
     * Begins slowly and decelerates towards end. (quartic)
     * @method easeBothStrong
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeBothStrong: function (t, b, c, d) {
    	if ((t/=d/2) < 1) {
            return c/2*t*t*t*t + b;
        }
        
    	return -c/2 * ((t-=2)*t*t*t - 2) + b;
    },

    /**
     * Snap in elastic effect.
     * @method elasticIn
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} a Amplitude (optional)
     * @param {Number} p Period (optional)
     * @return {Number} The computed value for the current animation frame
     */

    elasticIn: function (t, b, c, d, a, p) {
    	if (t == 0) {
            return b;
        }
        if ( (t /= d) == 1 ) {
            return b+c;
        }
        if (!p) {
            p=d*.3;
        }
        
    	if (!a || a < Math.abs(c)) {
            a = c; 
            var s = p/4;
        }
    	else {
            var s = p/(2*Math.PI) * Math.asin (c/a);
        }
        
    	return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
    },

    /**
     * Snap out elastic effect.
     * @method elasticOut
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} a Amplitude (optional)
     * @param {Number} p Period (optional)
     * @return {Number} The computed value for the current animation frame
     */
    elasticOut: function (t, b, c, d, a, p) {
    	if (t == 0) {
            return b;
        }
        if ( (t /= d) == 1 ) {
            return b+c;
        }
        if (!p) {
            p=d*.3;
        }
        
    	if (!a || a < Math.abs(c)) {
            a = c;
            var s = p / 4;
        }
    	else {
            var s = p/(2*Math.PI) * Math.asin (c/a);
        }
        
    	return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
    },
    
    /**
     * Snap both elastic effect.
     * @method elasticBoth
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} a Amplitude (optional)
     * @param {Number} p Period (optional)
     * @return {Number} The computed value for the current animation frame
     */
    elasticBoth: function (t, b, c, d, a, p) {
    	if (t == 0) {
            return b;
        }
        
        if ( (t /= d/2) == 2 ) {
            return b+c;
        }
        
        if (!p) {
            p = d*(.3*1.5);
        }
        
    	if ( !a || a < Math.abs(c) ) {
            a = c; 
            var s = p/4;
        }
    	else {
            var s = p/(2*Math.PI) * Math.asin (c/a);
        }
        
    	if (t < 1) {
            return -.5*(a*Math.pow(2,10*(t-=1)) * 
                    Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
        }
    	return a*Math.pow(2,-10*(t-=1)) * 
                Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
    },


    /**
     * Backtracks slightly, then reverses direction and moves to end.
     * @method backIn
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} s Overshoot (optional)
     * @return {Number} The computed value for the current animation frame
     */
    backIn: function (t, b, c, d, s) {
    	if (typeof s == 'undefined') {
            s = 1.70158;
        }
    	return c*(t/=d)*t*((s+1)*t - s) + b;
    },

    /**
     * Overshoots end, then reverses and comes back to end.
     * @method backOut
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} s Overshoot (optional)
     * @return {Number} The computed value for the current animation frame
     */
    backOut: function (t, b, c, d, s) {
    	if (typeof s == 'undefined') {
            s = 1.70158;
        }
    	return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
    },
    
    /**
     * Backtracks slightly, then reverses direction, overshoots end, 
     * then reverses and comes back to end.
     * @method backBoth
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} s Overshoot (optional)
     * @return {Number} The computed value for the current animation frame
     */
    backBoth: function (t, b, c, d, s) {
    	if (typeof s == 'undefined') {
            s = 1.70158; 
        }
        
    	if ((t /= d/2 ) < 1) {
            return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
        }
    	return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
    },

    /**
     * Bounce off of start.
     * @method bounceIn
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    bounceIn: function (t, b, c, d) {
    	return c - YAHOO.util.Easing.bounceOut(d-t, 0, c, d) + b;
    },
    
    /**
     * Bounces off end.
     * @method bounceOut
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    bounceOut: function (t, b, c, d) {
    	if ((t/=d) < (1/2.75)) {
    		return c*(7.5625*t*t) + b;
    	} else if (t < (2/2.75)) {
    		return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
    	} else if (t < (2.5/2.75)) {
    		return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
    	}
        return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
    },
    
    /**
     * Bounces off start and end.
     * @method bounceBoth
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    bounceBoth: function (t, b, c, d) {
    	if (t < d/2) {
            return YAHOO.util.Easing.bounceIn(t*2, 0, c, d) * .5 + b;
        }
    	return YAHOO.util.Easing.bounceOut(t*2-d, 0, c, d) * .5 + c*.5 + b;
    }
};

(function() {
/**
 * Anim subclass for moving elements along a path defined by the "points" 
 * member of "attributes".  All "points" are arrays with x, y coordinates.
 * <p>Usage: <code>var myAnim = new YAHOO.util.Motion(el, { points: { to: [800, 800] } }, 1, YAHOO.util.Easing.easeOut);</code></p>
 * @class Motion
 * @namespace YAHOO.util
 * @requires YAHOO.util.Anim
 * @requires YAHOO.util.AnimMgr
 * @requires YAHOO.util.Easing
 * @requires YAHOO.util.Bezier
 * @requires YAHOO.util.Dom
 * @requires YAHOO.util.Event
 * @requires YAHOO.util.CustomEvent 
 * @constructor
 * @extends YAHOO.util.Anim
 * @param {String | HTMLElement} el Reference to the element that will be animated
 * @param {Object} attributes The attribute(s) to be animated.  
 * Each attribute is an object with at minimum a "to" or "by" member defined.  
 * Additional optional members are "from" (defaults to current value), "units" (defaults to "px").  
 * All attribute names use camelCase.
 * @param {Number} duration (optional, defaults to 1 second) Length of animation (frames or seconds), defaults to time-based
 * @param {Function} method (optional, defaults to YAHOO.util.Easing.easeNone) Computes the values that are applied to the attributes per frame (generally a YAHOO.util.Easing method)
 */
    YAHOO.util.Motion = function(el, attributes, duration,  method) {
        if (el) { // dont break existing subclasses not using YAHOO.extend
            YAHOO.util.Motion.superclass.constructor.call(this, el, attributes, duration, method);
        }
    };

    YAHOO.extend(YAHOO.util.Motion, YAHOO.util.ColorAnim);
    
    // shorthand
    var Y = YAHOO.util;
    var superclass = Y.Motion.superclass;
    var proto = Y.Motion.prototype;

    proto.toString = function() {
        var el = this.getEl();
        var id = el.id || el.tagName;
        return ("Motion " + id);
    };
    
    proto.patterns.points = /^points$/i;
    
    proto.setAttribute = function(attr, val, unit) {
        if (  this.patterns.points.test(attr) ) {
            unit = unit || 'px';
            superclass.setAttribute.call(this, 'left', val[0], unit);
            superclass.setAttribute.call(this, 'top', val[1], unit);
        } else {
            superclass.setAttribute.call(this, attr, val, unit);
        }
    };

    proto.getAttribute = function(attr) {
        if (  this.patterns.points.test(attr) ) {
            var val = [
                superclass.getAttribute.call(this, 'left'),
                superclass.getAttribute.call(this, 'top')
            ];
        } else {
            val = superclass.getAttribute.call(this, attr);
        }

        return val;
    };

    proto.doMethod = function(attr, start, end) {
        var val = null;

        if ( this.patterns.points.test(attr) ) {
            var t = this.method(this.currentFrame, 0, 100, this.totalFrames) / 100;				
            val = Y.Bezier.getPosition(this.runtimeAttributes[attr], t);
        } else {
            val = superclass.doMethod.call(this, attr, start, end);
        }
        return val;
    };

    proto.setRuntimeAttribute = function(attr) {
        if ( this.patterns.points.test(attr) ) {
            var el = this.getEl();
            var attributes = this.attributes;
            var start;
            var control = attributes['points']['control'] || [];
            var end;
            var i, len;
            
            if (control.length > 0 && !(control[0] instanceof Array) ) { // could be single point or array of points
                control = [control];
            } else { // break reference to attributes.points.control
                var tmp = []; 
                for (i = 0, len = control.length; i< len; ++i) {
                    tmp[i] = control[i];
                }
                control = tmp;
            }

            if (Y.Dom.getStyle(el, 'position') == 'static') { // default to relative
                Y.Dom.setStyle(el, 'position', 'relative');
            }
    
            if ( isset(attributes['points']['from']) ) {
                Y.Dom.setXY(el, attributes['points']['from']); // set position to from point
            } 
            else { Y.Dom.setXY( el, Y.Dom.getXY(el) ); } // set it to current position
            
            start = this.getAttribute('points'); // get actual top & left
            
            // TO beats BY, per SMIL 2.1 spec
            if ( isset(attributes['points']['to']) ) {
                end = translateValues.call(this, attributes['points']['to'], start);
                
                var pageXY = Y.Dom.getXY(this.getEl());
                for (i = 0, len = control.length; i < len; ++i) {
                    control[i] = translateValues.call(this, control[i], start);
                }

                
            } else if ( isset(attributes['points']['by']) ) {
                end = [ start[0] + attributes['points']['by'][0], start[1] + attributes['points']['by'][1] ];
                
                for (i = 0, len = control.length; i < len; ++i) {
                    control[i] = [ start[0] + control[i][0], start[1] + control[i][1] ];
                }
            }

            this.runtimeAttributes[attr] = [start];
            
            if (control.length > 0) {
                this.runtimeAttributes[attr] = this.runtimeAttributes[attr].concat(control); 
            }

            this.runtimeAttributes[attr][this.runtimeAttributes[attr].length] = end;
        }
        else {
            superclass.setRuntimeAttribute.call(this, attr);
        }
    };
    
    var translateValues = function(val, start) {
        var pageXY = Y.Dom.getXY(this.getEl());
        val = [ val[0] - pageXY[0] + start[0], val[1] - pageXY[1] + start[1] ];

        return val; 
    };
    
    var isset = function(prop) {
        return (typeof prop !== 'undefined');
    };
})();
(function() {
/**
 * Anim subclass for scrolling elements to a position defined by the "scroll"
 * member of "attributes".  All "scroll" members are arrays with x, y scroll positions.
 * <p>Usage: <code>var myAnim = new YAHOO.util.Scroll(el, { scroll: { to: [0, 800] } }, 1, YAHOO.util.Easing.easeOut);</code></p>
 * @class Scroll
 * @namespace YAHOO.util
 * @requires YAHOO.util.Anim
 * @requires YAHOO.util.AnimMgr
 * @requires YAHOO.util.Easing
 * @requires YAHOO.util.Bezier
 * @requires YAHOO.util.Dom
 * @requires YAHOO.util.Event
 * @requires YAHOO.util.CustomEvent 
 * @extends YAHOO.util.Anim
 * @constructor
 * @param {String or HTMLElement} el Reference to the element that will be animated
 * @param {Object} attributes The attribute(s) to be animated.  
 * Each attribute is an object with at minimum a "to" or "by" member defined.  
 * Additional optional members are "from" (defaults to current value), "units" (defaults to "px").  
 * All attribute names use camelCase.
 * @param {Number} duration (optional, defaults to 1 second) Length of animation (frames or seconds), defaults to time-based
 * @param {Function} method (optional, defaults to YAHOO.util.Easing.easeNone) Computes the values that are applied to the attributes per frame (generally a YAHOO.util.Easing method)
 */
    YAHOO.util.Scroll = function(el, attributes, duration,  method) {
        if (el) { // dont break existing subclasses not using YAHOO.extend
            YAHOO.util.Scroll.superclass.constructor.call(this, el, attributes, duration, method);
        }
    };

    YAHOO.extend(YAHOO.util.Scroll, YAHOO.util.ColorAnim);
    
    // shorthand
    var Y = YAHOO.util;
    var superclass = Y.Scroll.superclass;
    var proto = Y.Scroll.prototype;

    proto.toString = function() {
        var el = this.getEl();
        var id = el.id || el.tagName;
        return ("Scroll " + id);
    };

    proto.doMethod = function(attr, start, end) {
        var val = null;
    
        if (attr == 'scroll') {
            val = [
                this.method(this.currentFrame, start[0], end[0] - start[0], this.totalFrames),
                this.method(this.currentFrame, start[1], end[1] - start[1], this.totalFrames)
            ];
            
        } else {
            val = superclass.doMethod.call(this, attr, start, end);
        }
        return val;
    };

    proto.getAttribute = function(attr) {
        var val = null;
        var el = this.getEl();
        
        if (attr == 'scroll') {
            val = [ el.scrollLeft, el.scrollTop ];
        } else {
            val = superclass.getAttribute.call(this, attr);
        }
        
        return val;
    };

    proto.setAttribute = function(attr, val, unit) {
        var el = this.getEl();
        
        if (attr == 'scroll') {
            el.scrollLeft = val[0];
            el.scrollTop = val[1];
        } else {
            superclass.setAttribute.call(this, attr, val, unit);
        }
    };
})();
YAHOO.register("animation", YAHOO.util.Anim, {version: "2.2.2", build: "204"});
/*
Copyright (c) 2007, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.2.2
*/
/**
* Config is a utility used within an Object to allow the implementer to maintain a list of local configuration properties and listen for changes to those properties dynamically using CustomEvent. The initial values are also maintained so that the configuration can be reset at any given point to its initial state.
* @namespace YAHOO.util
* @class Config
* @constructor
* @param {Object}	owner	The owner Object to which this Config Object belongs
*/
YAHOO.util.Config = function(owner) {
	if (owner) {
		this.init(owner);
	}
};

/**
 * Constant representing the CustomEvent type for the config changed event.
 * @property YAHOO.util.Config.CONFIG_CHANGED_EVENT
 * @private
 * @static
 * @final
 */
YAHOO.util.Config.CONFIG_CHANGED_EVENT = "configChanged";

/**
 * Constant representing the boolean type string
 * @property YAHOO.util.Config.BOOLEAN_TYPE
 * @private
 * @static
 * @final
 */
YAHOO.util.Config.BOOLEAN_TYPE = "boolean";

YAHOO.util.Config.prototype = {
	
	/**
	* Object reference to the owner of this Config Object
	* @property owner
	* @type Object
	*/
	owner : null,

	/**
	* Boolean flag that specifies whether a queue is currently being executed
	* @property queueInProgress
	* @type Boolean
	*/
	queueInProgress : false,

	/**
	* Maintains the local collection of configuration property objects and their specified values
	* @property config
	* @private
	* @type Object
	*/ 
	config : null,

	/**
	* Maintains the local collection of configuration property objects as they were initially applied.
	* This object is used when resetting a property.
	* @property initialConfig
	* @private
	* @type Object
	*/ 
	initialConfig : null,

	/**
	* Maintains the local, normalized CustomEvent queue
	* @property eventQueue
	* @private
	* @type Object
	*/ 
	eventQueue : null,

	/**
	* Custom Event, notifying subscribers when Config properties are set (setProperty is called without the silent flag
	* @event configChangedEvent
	*/
	configChangedEvent : null,

	/**
	* Validates that the value passed in is a Boolean.
	* @method checkBoolean
	* @param	{Object}	val	The value to validate
	* @return	{Boolean}	true, if the value is valid
	*/	
	checkBoolean: function(val) {
		return (typeof val == YAHOO.util.Config.BOOLEAN_TYPE);
	},

	/**
	* Validates that the value passed in is a number.
	* @method checkNumber
	* @param	{Object}	val	The value to validate
	* @return	{Boolean}	true, if the value is valid
	*/
	checkNumber: function(val) {
		return (!isNaN(val));
	},

	/**
	* Fires a configuration property event using the specified value. 
	* @method fireEvent
	* @private
	* @param {String}	key			The configuration property's name
	* @param {value}	Object		The value of the correct type for the property
	*/ 
	fireEvent : function( key, value ) {
		var property = this.config[key];

		if (property && property.event) {
			property.event.fire(value);
		}	
	},

	/**
	* Adds a property to the Config Object's private config hash.
	* @method addProperty
	* @param {String}	key	The configuration property's name
	* @param {Object}	propertyObject	The Object containing all of this property's arguments
	*/
	addProperty : function( key, propertyObject ) {
		key = key.toLowerCase();

		this.config[key] = propertyObject;

		propertyObject.event = new YAHOO.util.CustomEvent(key, this.owner);
		propertyObject.key = key;

		if (propertyObject.handler) {
			propertyObject.event.subscribe(propertyObject.handler, this.owner);
		}

		this.setProperty(key, propertyObject.value, true);
		
		if (! propertyObject.suppressEvent) {
			this.queueProperty(key, propertyObject.value);
		}
		
	},

	/**
	* Returns a key-value configuration map of the values currently set in the Config Object.
	* @method getConfig
	* @return {Object} The current config, represented in a key-value map
	*/
	getConfig : function() {
		var cfg = {};
			
		for (var prop in this.config) {
			var property = this.config[prop];
			if (property && property.event) {
				cfg[prop] = property.value;
			}
		}
		
		return cfg;
	},

	/**
	* Returns the value of specified property.
	* @method getProperty
	* @param {String} key	The name of the property
	* @return {Object}		The value of the specified property
	*/
	getProperty : function(key) {
		var property = this.config[key.toLowerCase()];
		if (property && property.event) {
			return property.value;
		} else {
			return undefined;
		}
	},

	/**
	* Resets the specified property's value to its initial value.
	* @method resetProperty
	* @param {String} key	The name of the property
	* @return {Boolean} True is the property was reset, false if not
	*/
	resetProperty : function(key) {
		key = key.toLowerCase();

		var property = this.config[key];
		if (property && property.event) {
			if (this.initialConfig[key] && !YAHOO.lang.isUndefined(this.initialConfig[key]))	{
				this.setProperty(key, this.initialConfig[key]);
			}
			return true;
		} else {
			return false;
		}
	},

	/**
	* Sets the value of a property. If the silent property is passed as true, the property's event will not be fired.
	* @method setProperty
	* @param {String} key		The name of the property
	* @param {String} value		The value to set the property to
	* @param {Boolean} silent	Whether the value should be set silently, without firing the property event.
	* @return {Boolean}			True, if the set was successful, false if it failed.
	*/
	setProperty : function(key, value, silent) {
		key = key.toLowerCase();

		if (this.queueInProgress && ! silent) {
			this.queueProperty(key,value); // Currently running through a queue... 
			return true;
		} else {
			var property = this.config[key];
			if (property && property.event) {
				if (property.validator && ! property.validator(value)) { // validator
					return false;
				} else {
					property.value = value;
					if (! silent) {
						this.fireEvent(key, value);
						this.configChangedEvent.fire([key, value]);
					}
					return true;
				}
			} else {
				return false;
			}
		}
	},

	/**
	* Sets the value of a property and queues its event to execute. If the event is already scheduled to execute, it is
	* moved from its current position to the end of the queue.
	* @method queueProperty
	* @param {String} key	The name of the property
	* @param {String} value	The value to set the property to
	* @return {Boolean}		true, if the set was successful, false if it failed.
	*/	
	queueProperty : function(key, value) {
		key = key.toLowerCase();

		var property = this.config[key];
							
		if (property && property.event) {
			if (!YAHOO.lang.isUndefined(value) && property.validator && ! property.validator(value)) { // validator
				return false;
			} else {

				if (!YAHOO.lang.isUndefined(value)) {
					property.value = value;
				} else {
					value = property.value;
				}

				var foundDuplicate = false;
				var iLen = this.eventQueue.length;
				for (var i=0; i < iLen; i++) {
					var queueItem = this.eventQueue[i];

					if (queueItem) {
						var queueItemKey = queueItem[0];
						var queueItemValue = queueItem[1];
						
						if (queueItemKey == key) {
							// found a dupe... push to end of queue, null current item, and break
							this.eventQueue[i] = null;
							this.eventQueue.push([key, (!YAHOO.lang.isUndefined(value) ? value : queueItemValue)]);
							foundDuplicate = true;
							break;
						}
					}
				}
				
				if (! foundDuplicate && !YAHOO.lang.isUndefined(value)) { // this is a refire, or a new property in the queue
					this.eventQueue.push([key, value]);
				}
			}

			if (property.supercedes) {
				var sLen = property.supercedes.length;
				for (var s=0; s < sLen; s++) {
					var supercedesCheck = property.supercedes[s];
					var qLen = this.eventQueue.length;
					for (var q=0; q < qLen; q++) {
						var queueItemCheck = this.eventQueue[q];

						if (queueItemCheck) {
							var queueItemCheckKey = queueItemCheck[0];
							var queueItemCheckValue = queueItemCheck[1];
							
							if ( queueItemCheckKey == supercedesCheck.toLowerCase() ) {
								this.eventQueue.push([queueItemCheckKey, queueItemCheckValue]);
								this.eventQueue[q] = null;
								break;
							}
						}
					}
				}
			}

			return true;
		} else {
			return false;
		}
	},

	/**
	* Fires the event for a property using the property's current value.
	* @method refireEvent
	* @param {String} key	The name of the property
	*/
	refireEvent : function(key) {
		key = key.toLowerCase();

		var property = this.config[key];
		if (property && property.event && !YAHOO.lang.isUndefined(property.value)) {
			if (this.queueInProgress) {
				this.queueProperty(key);
			} else {
				this.fireEvent(key, property.value);
			}
		}
	},

	/**
	* Applies a key-value Object literal to the configuration, replacing any existing values, and queueing the property events.
	* Although the values will be set, fireQueue() must be called for their associated events to execute.
	* @method applyConfig
	* @param {Object}	userConfig	The configuration Object literal
	* @param {Boolean}	init		When set to true, the initialConfig will be set to the userConfig passed in, so that calling a reset will reset the properties to the passed values.
	*/
	applyConfig : function(userConfig, init) {
		if (init) {
			this.initialConfig = userConfig;
		}
		for (var prop in userConfig) {
			this.queueProperty(prop, userConfig[prop]);
		}
	},

	/**
	* Refires the events for all configuration properties using their current values.
	* @method refresh
	*/
	refresh : function() {
		for (var prop in this.config) {
			this.refireEvent(prop);
		}
	},

	/**
	* Fires the normalized list of queued property change events
	* @method fireQueue
	*/
	fireQueue : function() {
		this.queueInProgress = true;
		for (var i=0;i<this.eventQueue.length;i++) {
			var queueItem = this.eventQueue[i];
			if (queueItem) {
				var key = queueItem[0];
				var value = queueItem[1];
				
				var property = this.config[key];
				property.value = value;

				this.fireEvent(key,value);
			}
		}
		
		this.queueInProgress = false;
		this.eventQueue = [];
	},

	/**
	* Subscribes an external handler to the change event for any given property. 
	* @method subscribeToConfigEvent
	* @param {String}	key			The property name
	* @param {Function}	handler		The handler function to use subscribe to the property's event
	* @param {Object}	obj			The Object to use for scoping the event handler (see CustomEvent documentation)
	* @param {Boolean}	override	Optional. If true, will override "this" within the handler to map to the scope Object passed into the method.
	* @return {Boolean}				True, if the subscription was successful, otherwise false.
	*/	
	subscribeToConfigEvent : function(key, handler, obj, override) {
		var property = this.config[key.toLowerCase()];
		if (property && property.event) {
			if (! YAHOO.util.Config.alreadySubscribed(property.event, handler, obj)) {
				property.event.subscribe(handler, obj, override);
			}
			return true;
		} else {
			return false;
		}
	},

	/**
	* Unsubscribes an external handler from the change event for any given property. 
	* @method unsubscribeFromConfigEvent
	* @param {String}	key			The property name
	* @param {Function}	handler		The handler function to use subscribe to the property's event
	* @param {Object}	obj			The Object to use for scoping the event handler (see CustomEvent documentation)
	* @return {Boolean}				True, if the unsubscription was successful, otherwise false.
	*/
	unsubscribeFromConfigEvent : function(key, handler, obj) {
		var property = this.config[key.toLowerCase()];
		if (property && property.event) {
			return property.event.unsubscribe(handler, obj);
		} else {
			return false;
		}
	},

	/**
	* Returns a string representation of the Config object
	* @method toString
	* @return {String}	The Config object in string format.
	*/
	toString : function() {
		var output = "Config";
		if (this.owner) {
			output += " [" + this.owner.toString() + "]";
		}
		return output;
	},

	/**
	* Returns a string representation of the Config object's current CustomEvent queue
	* @method outputEventQueue
	* @return {String}	The string list of CustomEvents currently queued for execution
	*/
	outputEventQueue : function() {
		var output = "";
		for (var q=0;q<this.eventQueue.length;q++) {
			var queueItem = this.eventQueue[q];
			if (queueItem) {
				output += queueItem[0] + "=" + queueItem[1] + ", ";
			}
		}
		return output;
	}
};


/**
* Initializes the configuration Object and all of its local members.
* @method init
* @param {Object}	owner	The owner Object to which this Config Object belongs
*/
YAHOO.util.Config.prototype.init = function(owner) {
	this.owner = owner;
	this.configChangedEvent = new YAHOO.util.CustomEvent(YAHOO.util.CONFIG_CHANGED_EVENT, this);
	this.queueInProgress = false;
	this.config = {};
	this.initialConfig = {};
	this.eventQueue = [];
};

/**
* Checks to determine if a particular function/Object pair are already subscribed to the specified CustomEvent
* @method YAHOO.util.Config.alreadySubscribed
* @static
* @param {YAHOO.util.CustomEvent} evt	The CustomEvent for which to check the subscriptions
* @param {Function}	fn	The function to look for in the subscribers list
* @param {Object}	obj	The execution scope Object for the subscription
* @return {Boolean}	true, if the function/Object pair is already subscribed to the CustomEvent passed in
*/
YAHOO.util.Config.alreadySubscribed = function(evt, fn, obj) {
	for (var e=0;e<evt.subscribers.length;e++) {
		var subsc = evt.subscribers[e];
		if (subsc && subsc.obj == obj && subsc.fn == fn) {
			return true;
		}
	}
	return false;
};
/**
*  The Container family of components is designed to enable developers to create different kinds of content-containing modules on the web. Module and Overlay are the most basic containers, and they can be used directly or extended to build custom containers. Also part of the Container family are four UI controls that extend Module and Overlay: Tooltip, Panel, Dialog, and SimpleDialog.
* @module container
* @title Container
* @requires yahoo,dom,event,dragdrop,animation
*/

/**
* Module is a JavaScript representation of the Standard Module Format. Standard Module Format is a simple standard for markup containers where child nodes representing the header, body, and footer of the content are denoted using the CSS classes "hd", "bd", and "ft" respectively. Module is the base class for all other classes in the YUI Container package.
* @namespace YAHOO.widget
* @class Module
* @constructor
* @param {String} el			The element ID representing the Module <em>OR</em>
* @param {HTMLElement} el		The element representing the Module
* @param {Object} userConfig	The configuration Object literal containing the configuration that should be set for this module. See configuration documentation for more details.
*/
YAHOO.widget.Module = function(el, userConfig) {
	if (el) {
		this.init(el, userConfig);
	} else {
	}
};

/**
* Constant representing the prefix path to use for non-secure images
* @property YAHOO.widget.Module.IMG_ROOT
* @static
* @final
* @type String
*/
YAHOO.widget.Module.IMG_ROOT = null;

/**
* Constant representing the prefix path to use for securely served images
* @property YAHOO.widget.Module.IMG_ROOT_SSL
* @static
* @final
* @type String
*/
YAHOO.widget.Module.IMG_ROOT_SSL = null;

/**
* Constant for the default CSS class name that represents a Module
* @property YAHOO.widget.Module.CSS_MODULE
* @static
* @final
* @type String
*/
YAHOO.widget.Module.CSS_MODULE = "yui-module";

/**
* Constant representing the module header
* @property YAHOO.widget.Module.CSS_HEADER
* @static
* @final
* @type String
*/
YAHOO.widget.Module.CSS_HEADER = "hd";

/**
* Constant representing the module body
* @property YAHOO.widget.Module.CSS_BODY
* @static
* @final
* @type String
*/
YAHOO.widget.Module.CSS_BODY = "bd";

/**
* Constant representing the module footer
* @property YAHOO.widget.Module.CSS_FOOTER
* @static
* @final
* @type String
*/
YAHOO.widget.Module.CSS_FOOTER = "ft";

/**
* Constant representing the url for the "src" attribute of the iframe used to monitor changes to the browser's base font size
* @property YAHOO.widget.Module.RESIZE_MONITOR_SECURE_URL
* @static
* @final
* @type String
*/
YAHOO.widget.Module.RESIZE_MONITOR_SECURE_URL = "javascript:false;";

/**
* Singleton CustomEvent fired when the font size is changed in the browser.
* Opera's "zoom" functionality currently does not support text size detection.
* @event YAHOO.widget.Module.textResizeEvent
*/
YAHOO.widget.Module.textResizeEvent = new YAHOO.util.CustomEvent("textResize");

/**
* Constant representing the name of the Module's events
* @property YAHOO.widget.Module._EVENT_TYPES
* @private
* @final
* @type Object
*/
YAHOO.widget.Module._EVENT_TYPES = {

    "BEFORE_INIT": "beforeInit",
    "INIT": "init",
    "APPEND": "append",
    "BEFORE_RENDER": "beforeRender",
    "RENDER": "render",
    "CHANGE_HEADER": "changeHeader",
    "CHANGE_BODY": "changeBody",
    "CHANGE_FOOTER": "changeFooter",
    "CHANGE_CONTENT": "changeContent",
    "DESTORY": "destroy",
    "BEFORE_SHOW": "beforeShow",
    "SHOW": "show",
    "BEFORE_HIDE": "beforeHide",
    "HIDE": "hide"

};
    
/**
* Constant representing the Module's configuration properties
* @property YAHOO.widget.Module._DEFAULT_CONFIG
* @private
* @final
* @type Object
*/
YAHOO.widget.Module._DEFAULT_CONFIG = {

    "VISIBLE": { 
        key: "visible", 
        value: true, 
        validator: YAHOO.lang.isBoolean 
    },

    "EFFECT": { 
        key: "effect", 
        suppressEvent:true, 
        supercedes:["visible"] 
    },

    "MONITOR_RESIZE": { 
        key: "monitorresize", 
        value:true  
    }

};


YAHOO.widget.Module.prototype = {

	/**
	* The class's constructor function
	* @property contructor
	* @type Function
	*/
	constructor : YAHOO.widget.Module,

	/**
	* The main module element that contains the header, body, and footer
	* @property element
	* @type HTMLElement
	*/
	element : null,

	/**
	* The header element, denoted with CSS class "hd"
	* @property header
	* @type HTMLElement
	*/
	header : null,

	/**
	* The body element, denoted with CSS class "bd"
	* @property body
	* @type HTMLElement
	*/
	body : null,

	/**
	* The footer element, denoted with CSS class "ft"
	* @property footer
	* @type HTMLElement
	*/
	footer : null,

	/**
	* The id of the element
	* @property id
	* @type String
	*/
	id : null,

	/**
	* The String representing the image root
	* @property imageRoot
	* @type String
	*/
	imageRoot : YAHOO.widget.Module.IMG_ROOT,

	/**
	* Initializes the custom events for Module which are fired automatically at appropriate times by the Module class.
	* @method initEvents
	*/
	initEvents : function() {

        var EVENT_TYPES = YAHOO.widget.Module._EVENT_TYPES;

		/**
		* CustomEvent fired prior to class initalization.
		* @event beforeInitEvent
		* @param {class} classRef	class reference of the initializing class, such as this.beforeInitEvent.fire(YAHOO.widget.Module)
		*/
		this.beforeInitEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.BEFORE_INIT, this);

		/**
		* CustomEvent fired after class initalization.
		* @event initEvent
		* @param {class} classRef	class reference of the initializing class, such as this.beforeInitEvent.fire(YAHOO.widget.Module)
		*/		
		this.initEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.INIT, this);

		/**
		* CustomEvent fired when the Module is appended to the DOM
		* @event appendEvent
		*/
		this.appendEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.APPEND, this);

		/**
		* CustomEvent fired before the Module is rendered
		* @event beforeRenderEvent
		*/
		this.beforeRenderEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.BEFORE_RENDER, this);

		/**
		* CustomEvent fired after the Module is rendered
		* @event renderEvent
		*/
		this.renderEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.RENDER, this);
	
		/**
		* CustomEvent fired when the header content of the Module is modified
		* @event changeHeaderEvent
		* @param {String/HTMLElement} content	String/element representing the new header content
		*/
		this.changeHeaderEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.CHANGE_HEADER, this);
		
		/**
		* CustomEvent fired when the body content of the Module is modified
		* @event changeBodyEvent
		* @param {String/HTMLElement} content	String/element representing the new body content
		*/		
		this.changeBodyEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.CHANGE_BODY, this);
		
		/**
		* CustomEvent fired when the footer content of the Module is modified
		* @event changeFooterEvent
		* @param {String/HTMLElement} content	String/element representing the new footer content
		*/
		this.changeFooterEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.CHANGE_FOOTER, this);

		/**
		* CustomEvent fired when the content of the Module is modified
		* @event changeContentEvent
		*/
		this.changeContentEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.CHANGE_CONTENT, this);

		/**
		* CustomEvent fired when the Module is destroyed
		* @event destroyEvent
		*/
		this.destroyEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.DESTORY, this);
		
		/**
		* CustomEvent fired before the Module is shown
		* @event beforeShowEvent
		*/
		this.beforeShowEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.BEFORE_SHOW, this);

		/**
		* CustomEvent fired after the Module is shown
		* @event showEvent
		*/
		this.showEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.SHOW, this);

		/**
		* CustomEvent fired before the Module is hidden
		* @event beforeHideEvent
		*/
		this.beforeHideEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.BEFORE_HIDE, this);

		/**
		* CustomEvent fired after the Module is hidden
		* @event hideEvent
		*/
		this.hideEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.HIDE, this);
	}, 

	/**
	* String representing the current user-agent platform
	* @property platform
	* @type String
	*/
	platform : function() {
					var ua = navigator.userAgent.toLowerCase();
					if (ua.indexOf("windows") != -1 || ua.indexOf("win32") != -1) {
						return "windows";
					} else if (ua.indexOf("macintosh") != -1) {
						return "mac";
					} else {
						return false;
					}
				}(),

	/**
	* String representing the current user-agent browser
	* @property browser
	* @type String
	*/
	browser : function() {
			var ua = navigator.userAgent.toLowerCase();
				  if (ua.indexOf('opera')!=-1) { // Opera (check first in case of spoof)
					 return 'opera';
				  } else if (ua.indexOf('msie 7')!=-1) { // IE7
					 return 'ie7';
				  } else if (ua.indexOf('msie') !=-1) { // IE
					 return 'ie';
				  } else if (ua.indexOf('safari')!=-1) { // Safari (check before Gecko because it includes "like Gecko")
					 return 'safari';
				  } else if (ua.indexOf('gecko') != -1) { // Gecko
					 return 'gecko';
				  } else {
					 return false;
				  }
			}(),

	/**
	* Boolean representing whether or not the current browsing context is secure (https)
	* @property isSecure
	* @type Boolean
	*/
	isSecure : function() {
		if (window.location.href.toLowerCase().indexOf("https") === 0) {
			return true;
		} else {
			return false;
		}
	}(),

	/**
	* Initializes the custom events for Module which are fired automatically at appropriate times by the Module class.
	*/
	initDefaultConfig : function() {
		// Add properties //

    	var DEFAULT_CONFIG = YAHOO.widget.Module._DEFAULT_CONFIG;

		/**
		* Specifies whether the Module is visible on the page.
		* @config visible
		* @type Boolean
		* @default true
		*/
		this.cfg.addProperty(
		          DEFAULT_CONFIG.VISIBLE.key, 
		          {
		              handler: this.configVisible, 
		              value: DEFAULT_CONFIG.VISIBLE.value, 
		              validator: DEFAULT_CONFIG.VISIBLE.validator
                  }
              );

		/**
		* Object or array of objects representing the ContainerEffect classes that are active for animating the container.
		* @config effect
		* @type Object
		* @default null
		*/
		this.cfg.addProperty(
                    DEFAULT_CONFIG.EFFECT.key, 
                    {
                        suppressEvent: DEFAULT_CONFIG.EFFECT.suppressEvent, 
                        supercedes: DEFAULT_CONFIG.EFFECT.supercedes
                    }
                );

		/**
		* Specifies whether to create a special proxy iframe to monitor for user font resizing in the document
		* @config monitorresize
		* @type Boolean
		* @default true
		*/
		this.cfg.addProperty(
		          DEFAULT_CONFIG.MONITOR_RESIZE.key,
		          {
		              handler: this.configMonitorResize,
		              value: DEFAULT_CONFIG.MONITOR_RESIZE.value
                  }
              );
		
	},

	/**
	* The Module class's initialization method, which is executed for Module and all of its subclasses. This method is automatically called by the constructor, and  sets up all DOM references for pre-existing markup, and creates required markup if it is not already present.
	* @method init
	* @param {String}	el	The element ID representing the Module <em>OR</em>
	* @param {HTMLElement}	el	The element representing the Module
	* @param {Object}	userConfig	The configuration Object literal containing the configuration that should be set for this module. See configuration documentation for more details.
	*/
	init : function(el, userConfig) {

		this.initEvents();

		this.beforeInitEvent.fire(YAHOO.widget.Module);

		/**
		* The Module's Config object used for monitoring configuration properties.
		* @property cfg
		* @type YAHOO.util.Config
		*/
		this.cfg = new YAHOO.util.Config(this);

		if (this.isSecure) {
			this.imageRoot = YAHOO.widget.Module.IMG_ROOT_SSL;
		}

		if (typeof el == "string") {
			var elId = el;

			el = document.getElementById(el);
			if (! el) {
				el = document.createElement("div");
				el.id = elId;
			}
		}

		this.element = el;

		if (el.id) {
			this.id = el.id;
		}

		var childNodes = this.element.childNodes;

		if (childNodes) {
			for (var i=0;i<childNodes.length;i++) {
				var child = childNodes[i];
				switch (child.className) {
					case YAHOO.widget.Module.CSS_HEADER:
						this.header = child;
						break;
					case YAHOO.widget.Module.CSS_BODY:
						this.body = child;
						break;
					case YAHOO.widget.Module.CSS_FOOTER:
						this.footer = child;
						break;
				}
			}
		}

		this.initDefaultConfig();

		YAHOO.util.Dom.addClass(this.element, YAHOO.widget.Module.CSS_MODULE);

		if (userConfig) {
			this.cfg.applyConfig(userConfig, true);
		}

		// Subscribe to the fireQueue() method of Config so that any queued configuration changes are
		// excecuted upon render of the Module
		if (! YAHOO.util.Config.alreadySubscribed(this.renderEvent, this.cfg.fireQueue, this.cfg)) {
			this.renderEvent.subscribe(this.cfg.fireQueue, this.cfg, true);
		}

		this.initEvent.fire(YAHOO.widget.Module);
	},

	/**
	* Initialized an empty IFRAME that is placed out of the visible area that can be used to detect text resize.
	* @method initResizeMonitor
	*/
	initResizeMonitor : function() {

        if(this.browser != "opera") {

            var resizeMonitor = document.getElementById("_yuiResizeMonitor");

            if (! resizeMonitor) {

                resizeMonitor = document.createElement("iframe");

                var bIE = (this.browser.indexOf("ie") === 0);

                if(this.isSecure && YAHOO.widget.Module.RESIZE_MONITOR_SECURE_URL && bIE) {
                   resizeMonitor.src = YAHOO.widget.Module.RESIZE_MONITOR_SECURE_URL;
                }

                resizeMonitor.id = "_yuiResizeMonitor";
                resizeMonitor.style.visibility = "hidden";

                document.body.appendChild(resizeMonitor);

                resizeMonitor.style.width = "10em";
                resizeMonitor.style.height = "10em";
                resizeMonitor.style.position = "absolute";

                var nLeft = -1 * resizeMonitor.offsetWidth;
                var nTop = -1 * resizeMonitor.offsetHeight;

                resizeMonitor.style.top = nTop + "px";
                resizeMonitor.style.left = nLeft + "px";
                resizeMonitor.style.borderStyle = "none";
                resizeMonitor.style.borderWidth = "0";
                YAHOO.util.Dom.setStyle(resizeMonitor, "opacity", "0");

                resizeMonitor.style.visibility = "visible";

                if(!bIE) {

                    var doc = resizeMonitor.contentWindow.document;

                    doc.open();
                    doc.close();

                }
            }

			var fireTextResize = function() {
				YAHOO.widget.Module.textResizeEvent.fire();
			};

            if(resizeMonitor && resizeMonitor.contentWindow) {
                this.resizeMonitor = resizeMonitor;

				YAHOO.widget.Module.textResizeEvent.subscribe(this.onDomResize, this, true);

				if (! YAHOO.widget.Module.textResizeInitialized) {
					if (! YAHOO.util.Event.addListener(this.resizeMonitor.contentWindow, "resize", fireTextResize)) {
						// This will fail in IE if document.domain has changed, so we must change the listener to
						// use the resizeMonitor element instead
						YAHOO.util.Event.addListener(this.resizeMonitor, "resize", fireTextResize);
					}
					YAHOO.widget.Module.textResizeInitialized = true;
				}
            }

        }

	},

	/**
	* Event handler fired when the resize monitor element is resized.
	* @method onDomResize
	* @param {DOMEvent} e	The DOM resize event
	* @param {Object} obj	The scope object passed to the handler
	*/
	onDomResize : function(e, obj) {

        var nLeft = -1 * this.resizeMonitor.offsetWidth,
            nTop = -1 * this.resizeMonitor.offsetHeight;

        this.resizeMonitor.style.top = nTop + "px";
        this.resizeMonitor.style.left =  nLeft + "px";

	},

	/**
	* Sets the Module's header content to the HTML specified, or appends the passed element to the header. If no header is present, one will be automatically created.
	* @method setHeader
	* @param {String}	headerContent	The HTML used to set the header <em>OR</em>
	* @param {HTMLElement}	headerContent	The HTMLElement to append to the header
	*/
	setHeader : function(headerContent) {
		if (! this.header) {
			this.header = document.createElement("div");
			this.header.className = YAHOO.widget.Module.CSS_HEADER;
		}

		if (typeof headerContent == "string") {
			this.header.innerHTML = headerContent;
		} else {
			this.header.innerHTML = "";
			this.header.appendChild(headerContent);
		}

		this.changeHeaderEvent.fire(headerContent);
		this.changeContentEvent.fire();
	},

	/**
	* Appends the passed element to the header. If no header is present, one will be automatically created.
	* @method appendToHeader
	* @param {HTMLElement}	element	The element to append to the header
	*/
	appendToHeader : function(element) {
		if (! this.header) {
			this.header = document.createElement("div");
			this.header.className = YAHOO.widget.Module.CSS_HEADER;
		}

		this.header.appendChild(element);
		this.changeHeaderEvent.fire(element);
		this.changeContentEvent.fire();
	},

	/**
	* Sets the Module's body content to the HTML specified, or appends the passed element to the body. If no body is present, one will be automatically created.
	* @method setBody
	* @param {String}	bodyContent	The HTML used to set the body <em>OR</em>
	* @param {HTMLElement}	bodyContent	The HTMLElement to append to the body
	*/
	setBody : function(bodyContent) {
		if (! this.body) {
			this.body = document.createElement("div");
			this.body.className = YAHOO.widget.Module.CSS_BODY;
		}

		if (typeof bodyContent == "string")
		{
			this.body.innerHTML = bodyContent;
		} else {
			this.body.innerHTML = "";
			this.body.appendChild(bodyContent);
		}

		this.changeBodyEvent.fire(bodyContent);
		this.changeContentEvent.fire();
	},

	/**
	* Appends the passed element to the body. If no body is present, one will be automatically created.
	* @method appendToBody
	* @param {HTMLElement}	element	The element to append to the body
	*/
	appendToBody : function(element) {
		if (! this.body) {
			this.body = document.createElement("div");
			this.body.className = YAHOO.widget.Module.CSS_BODY;
		}

		this.body.appendChild(element);
		this.changeBodyEvent.fire(element);
		this.changeContentEvent.fire();
	},

	/**
	* Sets the Module's footer content to the HTML specified, or appends the passed element to the footer. If no footer is present, one will be automatically created.
	* @method setFooter
	* @param {String}	footerContent	The HTML used to set the footer <em>OR</em>
	* @param {HTMLElement}	footerContent	The HTMLElement to append to the footer
	*/
	setFooter : function(footerContent) {
		if (! this.footer) {
			this.footer = document.createElement("div");
			this.footer.className = YAHOO.widget.Module.CSS_FOOTER;
		}

		if (typeof footerContent == "string") {
			this.footer.innerHTML = footerContent;
		} else {
			this.footer.innerHTML = "";
			this.footer.appendChild(footerContent);
		}

		this.changeFooterEvent.fire(footerContent);
		this.changeContentEvent.fire();
	},

	/**
	* Appends the passed element to the footer. If no footer is present, one will be automatically created.
	* @method appendToFooter
	* @param {HTMLElement}	element	The element to append to the footer
	*/
	appendToFooter : function(element) {
		if (! this.footer) {
			this.footer = document.createElement("div");
			this.footer.className = YAHOO.widget.Module.CSS_FOOTER;
		}

		this.footer.appendChild(element);
		this.changeFooterEvent.fire(element);
		this.changeContentEvent.fire();
	},

	/**
	* Renders the Module by inserting the elements that are not already in the main Module into their correct places. Optionally appends the Module to the specified node prior to the render's execution. NOTE: For Modules without existing markup, the appendToNode argument is REQUIRED. If this argument is ommitted and the current element is not present in the document, the function will return false, indicating that the render was a failure.
	* @method render
	* @param {String}	appendToNode	The element id to which the Module should be appended to prior to rendering <em>OR</em>
	* @param {HTMLElement}	appendToNode	The element to which the Module should be appended to prior to rendering
	* @param {HTMLElement}	moduleElement	OPTIONAL. The element that represents the actual Standard Module container.
	* @return {Boolean} Success or failure of the render
	*/
	render : function(appendToNode, moduleElement) {
		this.beforeRenderEvent.fire();

		if (! moduleElement) {
			moduleElement = this.element;
		}

		var me = this;
		var appendTo = function(element) {
			if (typeof element == "string") {
				element = document.getElementById(element);
			}

			if (element) {
				element.appendChild(me.element);
				me.appendEvent.fire();
			}
		};

		if (appendToNode) {
			appendTo(appendToNode);
		} else { // No node was passed in. If the element is not pre-marked up, this fails
			if (! YAHOO.util.Dom.inDocument(this.element)) {
				return false;
			}
		}

		// Need to get everything into the DOM if it isn't already

		if (this.header && ! YAHOO.util.Dom.inDocument(this.header)) {
			// There is a header, but it's not in the DOM yet... need to add it
			var firstChild = moduleElement.firstChild;
			if (firstChild) { // Insert before first child if exists
				moduleElement.insertBefore(this.header, firstChild);
			} else { // Append to empty body because there are no children
				moduleElement.appendChild(this.header);
			}
		}

		if (this.body && ! YAHOO.util.Dom.inDocument(this.body)) {
			// There is a body, but it's not in the DOM yet... need to add it
			if (this.footer && YAHOO.util.Dom.isAncestor(this.moduleElement, this.footer)) { // Insert before footer if exists in DOM
				moduleElement.insertBefore(this.body, this.footer);
			} else { // Append to element because there is no footer
				moduleElement.appendChild(this.body);
			}
		}

		if (this.footer && ! YAHOO.util.Dom.inDocument(this.footer)) {
			// There is a footer, but it's not in the DOM yet... need to add it
			moduleElement.appendChild(this.footer);
		}

		this.renderEvent.fire();
		return true;
	},

	/**
	* Removes the Module element from the DOM and sets all child elements to null.
	* @method destroy
	*/
	destroy : function() {
		var parent;

		if (this.element) {
			YAHOO.util.Event.purgeElement(this.element, true);
			parent = this.element.parentNode;
		}
		if (parent) {
			parent.removeChild(this.element);
		}

		this.element = null;
		this.header = null;
		this.body = null;
		this.footer = null;

		for (var e in this) {
			if (e instanceof YAHOO.util.CustomEvent) {
				e.unsubscribeAll();
			}
		}

		YAHOO.widget.Module.textResizeEvent.unsubscribe(this.onDomResize, this);

		this.destroyEvent.fire();
	},

	/**
	* Shows the Module element by setting the visible configuration property to true. Also fires two events: beforeShowEvent prior to the visibility change, and showEvent after.
	* @method show
	*/
	show : function() {
		this.cfg.setProperty("visible", true);
	},

	/**
	* Hides the Module element by setting the visible configuration property to false. Also fires two events: beforeHideEvent prior to the visibility change, and hideEvent after.
	* @method hide
	*/
	hide : function() {
		this.cfg.setProperty("visible", false);
	},

	// BUILT-IN EVENT HANDLERS FOR MODULE //

	/**
	* Default event handler for changing the visibility property of a Module. By default, this is achieved by switching the "display" style between "block" and "none".
	* This method is responsible for firing showEvent and hideEvent.
	* @param {String} type	The CustomEvent type (usually the property name)
	* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
	* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
	* @method configVisible
	*/
	configVisible : function(type, args, obj) {
		var visible = args[0];
		if (visible) {
			this.beforeShowEvent.fire();
			YAHOO.util.Dom.setStyle(this.element, "display", "block");
			this.showEvent.fire();
		} else {
			this.beforeHideEvent.fire();
			YAHOO.util.Dom.setStyle(this.element, "display", "none");
			this.hideEvent.fire();
		}
	},

	/**
	* Default event handler for the "monitorresize" configuration property
	* @param {String} type	The CustomEvent type (usually the property name)
	* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
	* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
	* @method configMonitorResize
	*/
	configMonitorResize : function(type, args, obj) {
		var monitor = args[0];
		if (monitor) {
			this.initResizeMonitor();
		} else {
			YAHOO.widget.Module.textResizeEvent.unsubscribe(this.onDomResize, this, true);
			this.resizeMonitor = null;
		}
	}
};

/**
* Returns a String representation of the Object.
* @method toString
* @return {String}	The string representation of the Module
*/
YAHOO.widget.Module.prototype.toString = function() {
	return "Module " + this.id;
};
/**
* Overlay is a Module that is absolutely positioned above the page flow. It has convenience methods for positioning and sizing, as well as options for controlling zIndex and constraining the Overlay's position to the current visible viewport. Overlay also contains a dynamicly generated IFRAME which is placed beneath it for Internet Explorer 6 and 5.x so that it will be properly rendered above SELECT elements.
* @namespace YAHOO.widget
* @class Overlay
* @extends YAHOO.widget.Module
* @param {String}	el	The element ID representing the Overlay <em>OR</em>
* @param {HTMLElement}	el	The element representing the Overlay
* @param {Object}	userConfig	The configuration object literal containing 10/23/2006the configuration that should be set for this Overlay. See configuration documentation for more details.
* @constructor
*/
YAHOO.widget.Overlay = function(el, userConfig) {
	YAHOO.widget.Overlay.superclass.constructor.call(this, el, userConfig);
};

YAHOO.extend(YAHOO.widget.Overlay, YAHOO.widget.Module);

/**
* Constant representing the name of the Overlay's events
* @property YAHOO.widget.Overlay._EVENT_TYPES
* @private
* @final
* @type Object
*/
YAHOO.widget.Overlay._EVENT_TYPES = {

    "BEFORE_MOVE": "beforeMove",
    "MOVE": "move"

};

/**
* Constant representing the Overlay's configuration properties
* @property YAHOO.widget.Overlay._DEFAULT_CONFIG
* @private
* @final
* @type Object
*/
YAHOO.widget.Overlay._DEFAULT_CONFIG = {

    "X": { 
        key: "x", 
        validator:YAHOO.lang.isNumber, 
        suppressEvent:true, supercedes:["iframe"] 
    },

    "Y": { 
        key: "y", 
        validator:YAHOO.lang.isNumber, 
        suppressEvent:true, supercedes:["iframe"] 
    },

    "XY": { 
        key: "xy", 
        suppressEvent:true, 
        supercedes:["iframe"] 
    },

    "CONTEXT": { 
        key: "context", 
        suppressEvent:true, 
        supercedes:["iframe"] 
    },

    "FIXED_CENTER": { 
        key: "fixedcenter", 
        value:false, 
        validator:YAHOO.lang.isBoolean, 
        supercedes:["iframe","visible"] 
    },

    "WIDTH": { 
        key: "width", 
        suppressEvent:true, 
        supercedes:["iframe"] 
    }, 

    "HEIGHT": { 
        key: "height", 
        suppressEvent:true, 
        supercedes:["iframe"] 
    }, 

    "ZINDEX": { 
        key: "zindex", 
        value:null 
    }, 

    "CONSTRAIN_TO_VIEWPORT": { 
        key: "constraintoviewport", 
        value:false, 
        validator:YAHOO.lang.isBoolean, 
        supercedes:["iframe","x","y","xy"] 
    }, 

    "IFRAME": { 
        key: "iframe", 
        value:(YAHOO.widget.Module.prototype.browser == "ie" ? true : false), 
        validator:YAHOO.lang.isBoolean, 
        supercedes:["zIndex"] 
    }

};

/**
* The URL that will be placed in the iframe
* @property YAHOO.widget.Overlay.IFRAME_SRC
* @static
* @final
* @type String
*/
YAHOO.widget.Overlay.IFRAME_SRC = "javascript:false;";

/**
* Constant representing the top left corner of an element, used for configuring the context element alignment
* @property YAHOO.widget.Overlay.TOP_LEFT
* @static
* @final
* @type String
*/
YAHOO.widget.Overlay.TOP_LEFT = "tl";

/**
* Constant representing the top right corner of an element, used for configuring the context element alignment
* @property YAHOO.widget.Overlay.TOP_RIGHT
* @static
* @final
* @type String
*/
YAHOO.widget.Overlay.TOP_RIGHT = "tr";

/**
* Constant representing the top bottom left corner of an element, used for configuring the context element alignment
* @property YAHOO.widget.Overlay.BOTTOM_LEFT
* @static
* @final
* @type String
*/
YAHOO.widget.Overlay.BOTTOM_LEFT = "bl";

/**
* Constant representing the bottom right corner of an element, used for configuring the context element alignment
* @property YAHOO.widget.Overlay.BOTTOM_RIGHT
* @static
* @final
* @type String
*/
YAHOO.widget.Overlay.BOTTOM_RIGHT = "br";

/**
* Constant representing the default CSS class used for an Overlay
* @property YAHOO.widget.Overlay.CSS_OVERLAY
* @static
* @final
* @type String
*/
YAHOO.widget.Overlay.CSS_OVERLAY = "yui-overlay";

/**
* The Overlay initialization method, which is executed for Overlay and all of its subclasses. This method is automatically called by the constructor, and  sets up all DOM references for pre-existing markup, and creates required markup if it is not already present.
* @method init
* @param {String}	el	The element ID representing the Overlay <em>OR</em>
* @param {HTMLElement}	el	The element representing the Overlay
* @param {Object}	userConfig	The configuration object literal containing the configuration that should be set for this Overlay. See configuration documentation for more details.
*/
YAHOO.widget.Overlay.prototype.init = function(el, userConfig) {
	YAHOO.widget.Overlay.superclass.init.call(this, el/*, userConfig*/);  // Note that we don't pass the user config in here yet because we only want it executed once, at the lowest subclass level

	this.beforeInitEvent.fire(YAHOO.widget.Overlay);

	YAHOO.util.Dom.addClass(this.element, YAHOO.widget.Overlay.CSS_OVERLAY);

	if (userConfig) {
		this.cfg.applyConfig(userConfig, true);
	}

	if (this.platform == "mac" && this.browser == "gecko") {
		if (! YAHOO.util.Config.alreadySubscribed(this.showEvent,this.showMacGeckoScrollbars,this)) {
			this.showEvent.subscribe(this.showMacGeckoScrollbars,this,true);
		}
		if (! YAHOO.util.Config.alreadySubscribed(this.hideEvent,this.hideMacGeckoScrollbars,this)) {
			this.hideEvent.subscribe(this.hideMacGeckoScrollbars,this,true);
		}
	}

	this.initEvent.fire(YAHOO.widget.Overlay);

};

/**
* Initializes the custom events for Overlay which are fired automatically at appropriate times by the Overlay class.
* @method initEvents
*/
YAHOO.widget.Overlay.prototype.initEvents = function() {
	YAHOO.widget.Overlay.superclass.initEvents.call(this);

    var EVENT_TYPES = YAHOO.widget.Overlay._EVENT_TYPES;

	/**
	* CustomEvent fired before the Overlay is moved.
	* @event beforeMoveEvent
	* @param {Number} x	x coordinate
	* @param {Number} y	y coordinate
	*/
	this.beforeMoveEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.BEFORE_MOVE, this);

	/**
	* CustomEvent fired after the Overlay is moved.
	* @event moveEvent
	* @param {Number} x	x coordinate
	* @param {Number} y	y coordinate
	*/
	this.moveEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.MOVE, this);
};

/**
* Initializes the class's configurable properties which can be changed using the Overlay's Config object (cfg).
* @method initDefaultConfig
*/
YAHOO.widget.Overlay.prototype.initDefaultConfig = function() {
	YAHOO.widget.Overlay.superclass.initDefaultConfig.call(this);


	// Add overlay config properties //

    var DEFAULT_CONFIG = YAHOO.widget.Overlay._DEFAULT_CONFIG;

	/**
	* The absolute x-coordinate position of the Overlay
	* @config x
	* @type Number
	* @default null
	*/
	this.cfg.addProperty(
	           DEFAULT_CONFIG.X.key, 
	           { 
	               handler: this.configX, 
	               validator: DEFAULT_CONFIG.X.validator, 
	               suppressEvent: DEFAULT_CONFIG.X.suppressEvent, 
	               supercedes: DEFAULT_CONFIG.X.supercedes
               }
           );

	/**
	* The absolute y-coordinate position of the Overlay
	* @config y
	* @type Number
	* @default null
	*/
	this.cfg.addProperty(
	           DEFAULT_CONFIG.Y.key,
	           {
	               handler: this.configY, 
	               validator: DEFAULT_CONFIG.Y.validator, 
	               suppressEvent: DEFAULT_CONFIG.Y.suppressEvent, 
	               supercedes: DEFAULT_CONFIG.Y.supercedes
               }
           );

	/**
	* An array with the absolute x and y positions of the Overlay
	* @config xy
	* @type Number[]
	* @default null
	*/
	this.cfg.addProperty(
	           DEFAULT_CONFIG.XY.key,
	           {
	               handler: this.configXY, 
	               suppressEvent: DEFAULT_CONFIG.XY.suppressEvent, 
	               supercedes: DEFAULT_CONFIG.XY.supercedes
               }
           );

	/**
	* The array of context arguments for context-sensitive positioning. The format is: [id or element, element corner, context corner]. For example, setting this property to ["img1", "tl", "bl"] would align the Overlay's top left corner to the context element's bottom left corner.
	* @config context
	* @type Array
	* @default null
	*/
	this.cfg.addProperty(
	           DEFAULT_CONFIG.CONTEXT.key,
	           {
	               handler: this.configContext, 
	               suppressEvent: DEFAULT_CONFIG.CONTEXT.suppressEvent, 
	               supercedes: DEFAULT_CONFIG.CONTEXT.supercedes
               }
           );

	/**
	* True if the Overlay should be anchored to the center of the viewport.
	* @config fixedcenter
	* @type Boolean
	* @default false
	*/
	this.cfg.addProperty(
               DEFAULT_CONFIG.FIXED_CENTER.key, 
               {
                    handler: this.configFixedCenter,
                    value: DEFAULT_CONFIG.FIXED_CENTER.value, 
                    validator: DEFAULT_CONFIG.FIXED_CENTER.validator, 
                    supercedes: DEFAULT_CONFIG.FIXED_CENTER.supercedes
                }
            );

	/**
	* CSS width of the Overlay.
	* @config width
	* @type String
	* @default null
	*/
	this.cfg.addProperty(
	           DEFAULT_CONFIG.WIDTH.key,
	           {
	               handler: this.configWidth, 
	               suppressEvent: DEFAULT_CONFIG.WIDTH.suppressEvent, 
	               supercedes: DEFAULT_CONFIG.WIDTH.supercedes
               }
           );

	/**
	* CSS height of the Overlay.
	* @config height
	* @type String
	* @default null
	*/
	this.cfg.addProperty(
	           DEFAULT_CONFIG.HEIGHT.key, 
	           {
	               handler: this.configHeight, 
	               suppressEvent: DEFAULT_CONFIG.HEIGHT.suppressEvent, 
	               supercedes: DEFAULT_CONFIG.HEIGHT.supercedes
               }
           );

	/**
	* CSS z-index of the Overlay.
	* @config zIndex
	* @type Number
	* @default null
	*/
	this.cfg.addProperty(
	           DEFAULT_CONFIG.ZINDEX.key, 
	           {
	               handler: this.configzIndex,
	               value: DEFAULT_CONFIG.ZINDEX.value
               }
           );

	/**
	* True if the Overlay should be prevented from being positioned out of the viewport.
	* @config constraintoviewport
	* @type Boolean
	* @default false
	*/
	this.cfg.addProperty(
	           DEFAULT_CONFIG.CONSTRAIN_TO_VIEWPORT.key, 
	           {
	               handler: this.configConstrainToViewport, 
	               value: DEFAULT_CONFIG.CONSTRAIN_TO_VIEWPORT.value, 
	               validator: DEFAULT_CONFIG.CONSTRAIN_TO_VIEWPORT.validator, 
	               supercedes: DEFAULT_CONFIG.CONSTRAIN_TO_VIEWPORT.supercedes
               }
           );

	/**
	* True if the Overlay should have an IFRAME shim (for correcting the select z-index bug in IE6 and below).
	* @config iframe
	* @type Boolean
	* @default true for IE6 and below, false for all others
	*/
	this.cfg.addProperty(
	           DEFAULT_CONFIG.IFRAME.key, 
	           {
	               handler: this.configIframe, 
	               value: DEFAULT_CONFIG.IFRAME.value, 
	               validator: DEFAULT_CONFIG.IFRAME.validator, 
	               supercedes: DEFAULT_CONFIG.IFRAME.supercedes
	           }
           );

};

/**
* Moves the Overlay to the specified position. This function is identical to calling this.cfg.setProperty("xy", [x,y]);
* @method moveTo
* @param {Number}	x	The Overlay's new x position
* @param {Number}	y	The Overlay's new y position
*/
YAHOO.widget.Overlay.prototype.moveTo = function(x, y) {
	this.cfg.setProperty("xy",[x,y]);
};

/**
* Adds a special CSS class to the Overlay when Mac/Gecko is in use, to work around a Gecko bug where
* scrollbars cannot be hidden. See https://bugzilla.mozilla.org/show_bug.cgi?id=187435
* @method hideMacGeckoScrollbars
*/
YAHOO.widget.Overlay.prototype.hideMacGeckoScrollbars = function() {
	YAHOO.util.Dom.removeClass(this.element, "show-scrollbars");
	YAHOO.util.Dom.addClass(this.element, "hide-scrollbars");
};

/**
* Removes a special CSS class from the Overlay when Mac/Gecko is in use, to work around a Gecko bug where
* scrollbars cannot be hidden. See https://bugzilla.mozilla.org/show_bug.cgi?id=187435
* @method showMacGeckoScrollbars
*/
YAHOO.widget.Overlay.prototype.showMacGeckoScrollbars = function() {
	YAHOO.util.Dom.removeClass(this.element, "hide-scrollbars");
	YAHOO.util.Dom.addClass(this.element, "show-scrollbars");
};

// BEGIN BUILT-IN PROPERTY EVENT HANDLERS //

/**
* The default event handler fired when the "visible" property is changed. This method is responsible for firing showEvent and hideEvent.
* @method configVisible
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configVisible = function(type, args, obj) {
	var visible = args[0];
	var currentVis = YAHOO.util.Dom.getStyle(this.element, "visibility");

	if (currentVis == "inherit") {
		var e = this.element.parentNode;
		while (e.nodeType != 9 && e.nodeType != 11) {
			currentVis = YAHOO.util.Dom.getStyle(e, "visibility");
			if (currentVis != "inherit") { break; }
			e = e.parentNode;
		}
		if (currentVis == "inherit") {
			currentVis = "visible";
		}
	}

	var effect = this.cfg.getProperty("effect");

	var effectInstances = [];
	if (effect) {
		if (effect instanceof Array) {
			for (var i=0;i<effect.length;i++) {
				var eff = effect[i];
				effectInstances[effectInstances.length] = eff.effect(this, eff.duration);
			}
		} else {
			effectInstances[effectInstances.length] = effect.effect(this, effect.duration);
		}
	}

	var isMacGecko = (this.platform == "mac" && this.browser == "gecko");

	if (visible) { // Show
		if (isMacGecko) {
			this.showMacGeckoScrollbars();
		}

		if (effect) { // Animate in
			if (visible) { // Animate in if not showing
				if (currentVis != "visible" || currentVis === "") {
					this.beforeShowEvent.fire();
					for (var j=0;j<effectInstances.length;j++) {
						var ei = effectInstances[j];
						if (j === 0 && ! YAHOO.util.Config.alreadySubscribed(ei.animateInCompleteEvent,this.showEvent.fire,this.showEvent)) {
							ei.animateInCompleteEvent.subscribe(this.showEvent.fire,this.showEvent,true); // Delegate showEvent until end of animateInComplete
						}
						ei.animateIn();
					}
				}
			}
		} else { // Show
			if (currentVis != "visible" || currentVis === "") {
				this.beforeShowEvent.fire();
				YAHOO.util.Dom.setStyle(this.element, "visibility", "visible");
				this.cfg.refireEvent("iframe");
				this.showEvent.fire();
			}
		}

	} else { // Hide
		if (isMacGecko) {
			this.hideMacGeckoScrollbars();
		}

		if (effect) { // Animate out if showing
			if (currentVis == "visible") {
				this.beforeHideEvent.fire();
				for (var k=0;k<effectInstances.length;k++) {
					var h = effectInstances[k];
					if (k === 0 && ! YAHOO.util.Config.alreadySubscribed(h.animateOutCompleteEvent,this.hideEvent.fire,this.hideEvent)) {
						h.animateOutCompleteEvent.subscribe(this.hideEvent.fire,this.hideEvent,true); // Delegate hideEvent until end of animateOutComplete
					}
					h.animateOut();
				}
			} else if (currentVis === "") {
				YAHOO.util.Dom.setStyle(this.element, "visibility", "hidden");
			}
		} else { // Simple hide
			if (currentVis == "visible" || currentVis === "") {
				this.beforeHideEvent.fire();
				YAHOO.util.Dom.setStyle(this.element, "visibility", "hidden");
				this.cfg.refireEvent("iframe");
				this.hideEvent.fire();
			}
		}
	}
};

/**
* Center event handler used for centering on scroll/resize, but only if the Overlay is visible
* @method doCenterOnDOMEvent
*/
YAHOO.widget.Overlay.prototype.doCenterOnDOMEvent = function() {
	if (this.cfg.getProperty("visible")) {
		this.center();
	}
};

/**
* The default event handler fired when the "fixedcenter" property is changed.
* @method configFixedCenter
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configFixedCenter = function(type, args, obj) {
	var val = args[0];

	if (val) {
		this.center();

		if (! YAHOO.util.Config.alreadySubscribed(this.beforeShowEvent, this.center, this)) {
			this.beforeShowEvent.subscribe(this.center, this, true);
		}

		if (! YAHOO.util.Config.alreadySubscribed(YAHOO.widget.Overlay.windowResizeEvent, this.doCenterOnDOMEvent, this)) {
			YAHOO.widget.Overlay.windowResizeEvent.subscribe(this.doCenterOnDOMEvent, this, true);
		}

		if (! YAHOO.util.Config.alreadySubscribed(YAHOO.widget.Overlay.windowScrollEvent, this.doCenterOnDOMEvent, this)) {
			YAHOO.widget.Overlay.windowScrollEvent.subscribe( this.doCenterOnDOMEvent, this, true);
		}
	} else {
		YAHOO.widget.Overlay.windowResizeEvent.unsubscribe(this.doCenterOnDOMEvent, this);
		YAHOO.widget.Overlay.windowScrollEvent.unsubscribe(this.doCenterOnDOMEvent, this);
	}
};

/**
* The default event handler fired when the "height" property is changed.
* @method configHeight
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configHeight = function(type, args, obj) {
	var height = args[0];
	var el = this.element;
	YAHOO.util.Dom.setStyle(el, "height", height);
	this.cfg.refireEvent("iframe");
};

/**
* The default event handler fired when the "width" property is changed.
* @method configWidth
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configWidth = function(type, args, obj) {
	var width = args[0];
	var el = this.element;
	YAHOO.util.Dom.setStyle(el, "width", width);
	this.cfg.refireEvent("iframe");
};

/**
* The default event handler fired when the "zIndex" property is changed.
* @method configzIndex
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configzIndex = function(type, args, obj) {
	var zIndex = args[0];

	var el = this.element;

	if (! zIndex) {
		zIndex = YAHOO.util.Dom.getStyle(el, "zIndex");
		if (! zIndex || isNaN(zIndex)) {
			zIndex = 0;
		}
	}

	if (this.iframe) {
		if (zIndex <= 0) {
			zIndex = 1;
		}
		YAHOO.util.Dom.setStyle(this.iframe, "zIndex", (zIndex-1));
	}

	YAHOO.util.Dom.setStyle(el, "zIndex", zIndex);
	this.cfg.setProperty("zIndex", zIndex, true);
};

/**
* The default event handler fired when the "xy" property is changed.
* @method configXY
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configXY = function(type, args, obj) {
	var pos = args[0];
	var x = pos[0];
	var y = pos[1];

	this.cfg.setProperty("x", x);
	this.cfg.setProperty("y", y);

	this.beforeMoveEvent.fire([x,y]);

	x = this.cfg.getProperty("x");
	y = this.cfg.getProperty("y");


	this.cfg.refireEvent("iframe");
	this.moveEvent.fire([x,y]);
};

/**
* The default event handler fired when the "x" property is changed.
* @method configX
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configX = function(type, args, obj) {
	var x = args[0];
	var y = this.cfg.getProperty("y");

	this.cfg.setProperty("x", x, true);
	this.cfg.setProperty("y", y, true);

	this.beforeMoveEvent.fire([x,y]);

	x = this.cfg.getProperty("x");
	y = this.cfg.getProperty("y");

	YAHOO.util.Dom.setX(this.element, x, true);

	this.cfg.setProperty("xy", [x, y], true);

	this.cfg.refireEvent("iframe");
	this.moveEvent.fire([x, y]);
};

/**
* The default event handler fired when the "y" property is changed.
* @method configY
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configY = function(type, args, obj) {
	var x = this.cfg.getProperty("x");
	var y = args[0];

	this.cfg.setProperty("x", x, true);
	this.cfg.setProperty("y", y, true);

	this.beforeMoveEvent.fire([x,y]);

	x = this.cfg.getProperty("x");
	y = this.cfg.getProperty("y");

	YAHOO.util.Dom.setY(this.element, y, true);

	this.cfg.setProperty("xy", [x, y], true);

	this.cfg.refireEvent("iframe");
	this.moveEvent.fire([x, y]);
};

/**
* Shows the iframe shim, if it has been enabled
* @method showIframe
*/
YAHOO.widget.Overlay.prototype.showIframe = function() {
	if (this.iframe) {
		this.iframe.style.display = "block";
	}
};

/**
* Hides the iframe shim, if it has been enabled
* @method hideIframe
*/
YAHOO.widget.Overlay.prototype.hideIframe = function() {
	if (this.iframe) {
		this.iframe.style.display = "none";
	}
};

/**
* The default event handler fired when the "iframe" property is changed.
* @method configIframe
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configIframe = function(type, args, obj) {

	var val = args[0];

	if (val) { // IFRAME shim is enabled

		if (! YAHOO.util.Config.alreadySubscribed(this.showEvent, this.showIframe, this)) {
			this.showEvent.subscribe(this.showIframe, this, true);
		}
		if (! YAHOO.util.Config.alreadySubscribed(this.hideEvent, this.hideIframe, this)) {
			this.hideEvent.subscribe(this.hideIframe, this, true);
		}

		var x = this.cfg.getProperty("x");
		var y = this.cfg.getProperty("y");

		if (! x || ! y) {
			this.syncPosition();
			x = this.cfg.getProperty("x");
			y = this.cfg.getProperty("y");
		}


		if (! isNaN(x) && ! isNaN(y)) {
			if (! this.iframe) {
				this.iframe = document.createElement("iframe");
				if (this.isSecure) {
					this.iframe.src = YAHOO.widget.Overlay.IFRAME_SRC;
				}

				var parent = this.element.parentNode;
				if (parent) {
					parent.appendChild(this.iframe);
				} else {
					document.body.appendChild(this.iframe);
				}

				YAHOO.util.Dom.setStyle(this.iframe, "position", "absolute");
				YAHOO.util.Dom.setStyle(this.iframe, "border", "none");
				YAHOO.util.Dom.setStyle(this.iframe, "margin", "0");
				YAHOO.util.Dom.setStyle(this.iframe, "padding", "0");
				YAHOO.util.Dom.setStyle(this.iframe, "opacity", "0");
				if (this.cfg.getProperty("visible")) {
					this.showIframe();
				} else {
					this.hideIframe();
				}
			}

			var iframeDisplay = YAHOO.util.Dom.getStyle(this.iframe, "display");

			if (iframeDisplay == "none") {
				this.iframe.style.display = "block";
			}

			YAHOO.util.Dom.setXY(this.iframe, [x,y]);

			var width = this.element.clientWidth;
			var height = this.element.clientHeight;

			YAHOO.util.Dom.setStyle(this.iframe, "width", (width+2) + "px");
			YAHOO.util.Dom.setStyle(this.iframe, "height", (height+2) + "px");

			if (iframeDisplay == "none") {
				this.iframe.style.display = "none";
			}
		}
	} else {
		if (this.iframe) {
			this.iframe.style.display = "none";
		}
		this.showEvent.unsubscribe(this.showIframe, this);
		this.hideEvent.unsubscribe(this.hideIframe, this);
	}
};


/**
* The default event handler fired when the "constraintoviewport" property is changed.
* @method configConstrainToViewport
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configConstrainToViewport = function(type, args, obj) {
	var val = args[0];
	if (val) {
		if (! YAHOO.util.Config.alreadySubscribed(this.beforeMoveEvent, this.enforceConstraints, this)) {
			this.beforeMoveEvent.subscribe(this.enforceConstraints, this, true);
		}
	} else {
		this.beforeMoveEvent.unsubscribe(this.enforceConstraints, this);
	}
};

/**
* The default event handler fired when the "context" property is changed.
* @method configContext
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configContext = function(type, args, obj) {
	var contextArgs = args[0];

	if (contextArgs) {
		var contextEl = contextArgs[0];
		var elementMagnetCorner = contextArgs[1];
		var contextMagnetCorner = contextArgs[2];

		if (contextEl) {
			if (typeof contextEl == "string") {
				this.cfg.setProperty("context", [document.getElementById(contextEl),elementMagnetCorner,contextMagnetCorner], true);
			}

			if (elementMagnetCorner && contextMagnetCorner) {
				this.align(elementMagnetCorner, contextMagnetCorner);
			}
		}
	}
};


// END BUILT-IN PROPERTY EVENT HANDLERS //

/**
* Aligns the Overlay to its context element using the specified corner points (represented by the constants TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, and BOTTOM_RIGHT.
* @method align
* @param {String} elementAlign		The String representing the corner of the Overlay that should be aligned to the context element
* @param {String} contextAlign		The corner of the context element that the elementAlign corner should stick to.
*/
YAHOO.widget.Overlay.prototype.align = function(elementAlign, contextAlign) {
	var contextArgs = this.cfg.getProperty("context");
	if (contextArgs) {
		var context = contextArgs[0];

		var element = this.element;
		var me = this;

		if (! elementAlign) {
			elementAlign = contextArgs[1];
		}

		if (! contextAlign) {
			contextAlign = contextArgs[2];
		}

		if (element && context) {
			var contextRegion = YAHOO.util.Dom.getRegion(context);

			var doAlign = function(v,h) {
				switch (elementAlign) {
					case YAHOO.widget.Overlay.TOP_LEFT:
						me.moveTo(h,v);
						break;
					case YAHOO.widget.Overlay.TOP_RIGHT:
						me.moveTo(h-element.offsetWidth,v);
						break;
					case YAHOO.widget.Overlay.BOTTOM_LEFT:
						me.moveTo(h,v-element.offsetHeight);
						break;
					case YAHOO.widget.Overlay.BOTTOM_RIGHT:
						me.moveTo(h-element.offsetWidth,v-element.offsetHeight);
						break;
				}
			};

			switch (contextAlign) {
				case YAHOO.widget.Overlay.TOP_LEFT:
					doAlign(contextRegion.top, contextRegion.left);
					break;
				case YAHOO.widget.Overlay.TOP_RIGHT:
					doAlign(contextRegion.top, contextRegion.right);
					break;
				case YAHOO.widget.Overlay.BOTTOM_LEFT:
					doAlign(contextRegion.bottom, contextRegion.left);
					break;
				case YAHOO.widget.Overlay.BOTTOM_RIGHT:
					doAlign(contextRegion.bottom, contextRegion.right);
					break;
			}
		}
	}
};

/**
* The default event handler executed when the moveEvent is fired, if the "constraintoviewport" is set to true.
* @method enforceConstraints
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.enforceConstraints = function(type, args, obj) {
	var pos = args[0];

	var x = pos[0];
	var y = pos[1];

	var offsetHeight = this.element.offsetHeight;
	var offsetWidth = this.element.offsetWidth;

	var viewPortWidth = YAHOO.util.Dom.getViewportWidth();
	var viewPortHeight = YAHOO.util.Dom.getViewportHeight();

	var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
	var scrollY = document.documentElement.scrollTop || document.body.scrollTop;

	var topConstraint = scrollY + 10;
	var leftConstraint = scrollX + 10;
	var bottomConstraint = scrollY + viewPortHeight - offsetHeight - 10;
	var rightConstraint = scrollX + viewPortWidth - offsetWidth - 10;

	if (x < leftConstraint) {
		x = leftConstraint;
	} else if (x > rightConstraint) {
		x = rightConstraint;
	}

	if (y < topConstraint) {
		y = topConstraint;
	} else if (y > bottomConstraint) {
		y = bottomConstraint;
	}

	this.cfg.setProperty("x", x, true);
	this.cfg.setProperty("y", y, true);
	this.cfg.setProperty("xy", [x,y], true);
};

/**
* Centers the container in the viewport.
* @method center
*/
YAHOO.widget.Overlay.prototype.center = function() {
	var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
	var scrollY = document.documentElement.scrollTop || document.body.scrollTop;

	var viewPortWidth = YAHOO.util.Dom.getClientWidth();
	var viewPortHeight = YAHOO.util.Dom.getClientHeight();

	var elementWidth = this.element.offsetWidth;
	var elementHeight = this.element.offsetHeight;

	var x = (viewPortWidth / 2) - (elementWidth / 2) + scrollX;
	var y = (viewPortHeight / 2) - (elementHeight / 2) + scrollY;

	this.cfg.setProperty("xy", [parseInt(x, 10), parseInt(y, 10)]);

	this.cfg.refireEvent("iframe");
};

/**
* Synchronizes the Panel's "xy", "x", and "y" properties with the Panel's position in the DOM. This is primarily used to update position information during drag & drop.
* @method syncPosition
*/
YAHOO.widget.Overlay.prototype.syncPosition = function() {
	var pos = YAHOO.util.Dom.getXY(this.element);
	this.cfg.setProperty("x", pos[0], true);
	this.cfg.setProperty("y", pos[1], true);
	this.cfg.setProperty("xy", pos, true);
};

/**
* Event handler fired when the resize monitor element is resized.
* @method onDomResize
* @param {DOMEvent} e	The resize DOM event
* @param {Object} obj	The scope object
*/
YAHOO.widget.Overlay.prototype.onDomResize = function(e, obj) {
	YAHOO.widget.Overlay.superclass.onDomResize.call(this, e, obj);
	var me = this;
	setTimeout(function() {
		me.syncPosition();
		me.cfg.refireEvent("iframe");
		me.cfg.refireEvent("context");
	}, 0);
};

/**
* Removes the Overlay element from the DOM and sets all child elements to null.
* @method destroy
*/
YAHOO.widget.Overlay.prototype.destroy = function() {
	if (this.iframe) {
		this.iframe.parentNode.removeChild(this.iframe);
	}

	this.iframe = null;

	YAHOO.widget.Overlay.windowResizeEvent.unsubscribe(this.doCenterOnDOMEvent, this);
	YAHOO.widget.Overlay.windowScrollEvent.unsubscribe(this.doCenterOnDOMEvent, this);

	YAHOO.widget.Overlay.superclass.destroy.call(this);
};

/**
* Returns a String representation of the object.
* @method toString
* @return {String} The string representation of the Overlay.
*/
YAHOO.widget.Overlay.prototype.toString = function() {
	return "Overlay " + this.id;
};

/**
* A singleton CustomEvent used for reacting to the DOM event for window scroll
* @event YAHOO.widget.Overlay.windowScrollEvent
*/
YAHOO.widget.Overlay.windowScrollEvent = new YAHOO.util.CustomEvent("windowScroll");

/**
* A singleton CustomEvent used for reacting to the DOM event for window resize
* @event YAHOO.widget.Overlay.windowResizeEvent
*/
YAHOO.widget.Overlay.windowResizeEvent = new YAHOO.util.CustomEvent("windowResize");

/**
* The DOM event handler used to fire the CustomEvent for window scroll
* @method YAHOO.widget.Overlay.windowScrollHandler
* @static
* @param {DOMEvent} e The DOM scroll event
*/
YAHOO.widget.Overlay.windowScrollHandler = function(e) {
	if (YAHOO.widget.Module.prototype.browser == "ie" || YAHOO.widget.Module.prototype.browser == "ie7") {
		if (! window.scrollEnd) {
			window.scrollEnd = -1;
		}
		clearTimeout(window.scrollEnd);
		window.scrollEnd = setTimeout(function() { YAHOO.widget.Overlay.windowScrollEvent.fire(); }, 1);
	} else {
		YAHOO.widget.Overlay.windowScrollEvent.fire();
	}
};

/**
* The DOM event handler used to fire the CustomEvent for window resize
* @method YAHOO.widget.Overlay.windowResizeHandler
* @static
* @param {DOMEvent} e The DOM resize event
*/
YAHOO.widget.Overlay.windowResizeHandler = function(e) {
	if (YAHOO.widget.Module.prototype.browser == "ie" || YAHOO.widget.Module.prototype.browser == "ie7") {
		if (! window.resizeEnd) {
			window.resizeEnd = -1;
		}
		clearTimeout(window.resizeEnd);
		window.resizeEnd = setTimeout(function() { YAHOO.widget.Overlay.windowResizeEvent.fire(); }, 100);
	} else {
		YAHOO.widget.Overlay.windowResizeEvent.fire();
	}
};

/**
* A boolean that indicated whether the window resize and scroll events have already been subscribed to.
* @property YAHOO.widget.Overlay._initialized
* @private
* @type Boolean
*/
YAHOO.widget.Overlay._initialized = null;

if (YAHOO.widget.Overlay._initialized === null) {
	YAHOO.util.Event.addListener(window, "scroll", YAHOO.widget.Overlay.windowScrollHandler);
	YAHOO.util.Event.addListener(window, "resize", YAHOO.widget.Overlay.windowResizeHandler);

	YAHOO.widget.Overlay._initialized = true;
}
/**
* OverlayManager is used for maintaining the focus status of multiple Overlays.* @namespace YAHOO.widget
* @namespace YAHOO.widget
* @class OverlayManager
* @constructor
* @param {Array}	overlays	Optional. A collection of Overlays to register with the manager.
* @param {Object}	userConfig		The object literal representing the user configuration of the OverlayManager
*/
YAHOO.widget.OverlayManager = function(userConfig) {
	this.init(userConfig);
};

/**
* The CSS class representing a focused Overlay
* @property YAHOO.widget.OverlayManager.CSS_FOCUSED
* @static
* @final
* @type String
*/
YAHOO.widget.OverlayManager.CSS_FOCUSED = "focused";

YAHOO.widget.OverlayManager.prototype = {
	/**
	* The class's constructor function
	* @property contructor
	* @type Function
	*/
	constructor : YAHOO.widget.OverlayManager,

	/**
	* The array of Overlays that are currently registered
	* @property overlays
	* @type YAHOO.widget.Overlay[]
	*/
	overlays : null,

	/**
	* Initializes the default configuration of the OverlayManager
	* @method initDefaultConfig
	*/
	initDefaultConfig : function() {
		/**
		* The collection of registered Overlays in use by the OverlayManager
		* @config overlays
		* @type YAHOO.widget.Overlay[]
		* @default null
		*/
		this.cfg.addProperty("overlays", { suppressEvent:true } );

		/**
		* The default DOM event that should be used to focus an Overlay
		* @config focusevent
		* @type String
		* @default "mousedown"
		*/
		this.cfg.addProperty("focusevent", { value:"mousedown" } );
	},

	/**
	* Initializes the OverlayManager
	* @method init
	* @param {YAHOO.widget.Overlay[]}	overlays	Optional. A collection of Overlays to register with the manager.
	* @param {Object}	userConfig		The object literal representing the user configuration of the OverlayManager
	*/
	init : function(userConfig) {
		/**
		* The OverlayManager's Config object used for monitoring configuration properties.
		* @property cfg
		* @type YAHOO.util.Config
		*/
		this.cfg = new YAHOO.util.Config(this);

		this.initDefaultConfig();

		if (userConfig) {
			this.cfg.applyConfig(userConfig, true);
		}
		this.cfg.fireQueue();

		/**
		* The currently activated Overlay
		* @property activeOverlay
		* @private
		* @type YAHOO.widget.Overlay
		*/
		var activeOverlay = null;

		/**
		* Returns the currently focused Overlay
		* @method getActive
		* @return {YAHOO.widget.Overlay}	The currently focused Overlay
		*/
		this.getActive = function() {
			return activeOverlay;
		};

		/**
		* Focuses the specified Overlay
		* @method focus
		* @param {YAHOO.widget.Overlay} overlay	The Overlay to focus
		* @param {String} overlay	The id of the Overlay to focus
		*/
		this.focus = function(overlay) {

			var o = this.find(overlay);

			if (o) {

                if (activeOverlay != o) {

                    if(activeOverlay) {
    
                        activeOverlay.blur();
    
                    }
    
                    activeOverlay = o;
    
                    YAHOO.util.Dom.addClass(activeOverlay.element, YAHOO.widget.OverlayManager.CSS_FOCUSED);
    
                    this.overlays.sort(this.compareZIndexDesc);
    
                    var topZIndex = YAHOO.util.Dom.getStyle(this.overlays[0].element, "zIndex");
    
                    if (! isNaN(topZIndex) && this.overlays[0] != overlay) {
    
                        activeOverlay.cfg.setProperty("zIndex", (parseInt(topZIndex, 10) + 2));
    
                    }
    
                    this.overlays.sort(this.compareZIndexDesc);
    
                    o.focusEvent.fire();
                
                }

			}

		};

		/**
		* Removes the specified Overlay from the manager
		* @method remove
		* @param {YAHOO.widget.Overlay}	overlay	The Overlay to remove
		* @param {String} overlay	The id of the Overlay to remove
		*/
		this.remove = function(overlay) {
			var o = this.find(overlay);
			if (o) {
				var originalZ = YAHOO.util.Dom.getStyle(o.element, "zIndex");
				o.cfg.setProperty("zIndex", -1000, true);
				this.overlays.sort(this.compareZIndexDesc);
				this.overlays = this.overlays.slice(0, this.overlays.length-1);

                o.hideEvent.unsubscribe(o.blur);
                o.destroyEvent.unsubscribe(this._onOverlayDestroy, o);

                if (o.element) {

        			YAHOO.util.Event.removeListener(o.element, this.cfg.getProperty("focusevent"), this._onOverlayElementFocus);

                }

				o.cfg.setProperty("zIndex", originalZ, true);
				o.cfg.setProperty("manager", null);

                o.focusEvent.unsubscribeAll();
                o.blurEvent.unsubscribeAll();

				o.focusEvent = null;
				o.blurEvent = null;

				o.focus = null;
				o.blur = null;
			}
		};

		/**
		* Removes focus from all registered Overlays in the manager
		* @method blurAll
		*/
		this.blurAll = function() {
			for (var o=0;o<this.overlays.length;o++) {
                this.overlays[o].blur();
			}
		};


        this._onOverlayBlur = function(p_sType, p_aArgs) {
            activeOverlay = null;
        };


		var overlays = this.cfg.getProperty("overlays");

		if (! this.overlays) {
			this.overlays = [];
		}

		if (overlays) {
			this.register(overlays);
			this.overlays.sort(this.compareZIndexDesc);
		}
	},


    /**
    * @method _onOverlayElementFocus
    * @description Event handler for the DOM event that is used to focus 
    * the Overlay instance as specified by the "focusevent" 
    * configuration property.
    * @private
    * @param {Event} p_oEvent Object representing the DOM event object passed 
    * back by the event utility (YAHOO.util.Event).
    */
    _onOverlayElementFocus: function(p_oEvent) {
    
        var oTarget = YAHOO.util.Event.getTarget(p_oEvent),
            oClose = this.close;

        
        if (
            oClose && 
            (
                oTarget == oClose ||  
                YAHOO.util.Dom.isAncestor(oClose, oTarget)
            )
        ) {
        
            this.blur();
        
        }
        else {
        
            this.focus();
        
        }
    
    },


    /**
    * @method _onOverlayDestroy
    * @description "destroy" event handler for the Overlay.
    * @private
    * @param {String} p_sType String representing the name of the event that 
    * was fired.
    * @param {Array} p_aArgs Array of arguments sent when the event was fired.
    * @param {YAHOO.widget.Overlay} p_oOverlay Object representing the menu that 
    * fired the event.
    */
    _onOverlayDestroy: function(p_sType, p_aArgs, p_oOverlay) {

        this.remove(p_oOverlay);
    
    },

	/**
	* Registers an Overlay or an array of Overlays with the manager. Upon registration, the Overlay receives functions for focus and blur, along with CustomEvents for each.
	* @method register
	* @param {YAHOO.widget.Overlay}	overlay		An Overlay to register with the manager.
	* @param {YAHOO.widget.Overlay[]}	overlay		An array of Overlays to register with the manager.
	* @return	{Boolean}	True if any Overlays are registered.
	*/
	register : function(overlay) {
		if (overlay instanceof YAHOO.widget.Overlay) {
			overlay.cfg.addProperty("manager", { value:this } );

			overlay.focusEvent = new YAHOO.util.CustomEvent("focus", overlay);
			overlay.blurEvent = new YAHOO.util.CustomEvent("blur", overlay);

			var mgr=this;

			overlay.focus = function() {
				mgr.focus(this);
			};

			overlay.blur = function() {
                if(mgr.getActive() == this) {
                    YAHOO.util.Dom.removeClass(this.element, YAHOO.widget.OverlayManager.CSS_FOCUSED);
                    this.blurEvent.fire();
				}
			};

            overlay.blurEvent.subscribe(mgr._onOverlayBlur);

            overlay.hideEvent.subscribe(overlay.blur);
            
            overlay.destroyEvent.subscribe(this._onOverlayDestroy, overlay, this);

			YAHOO.util.Event.addListener(overlay.element, this.cfg.getProperty("focusevent"), this._onOverlayElementFocus, null, overlay);

			var zIndex = YAHOO.util.Dom.getStyle(overlay.element, "zIndex");
			if (! isNaN(zIndex)) {
				overlay.cfg.setProperty("zIndex", parseInt(zIndex, 10));
			} else {
				overlay.cfg.setProperty("zIndex", 0);
			}

			this.overlays.push(overlay);
			return true;
		} else if (overlay instanceof Array) {
			var regcount = 0;
			for (var i=0;i<overlay.length;i++) {
				if (this.register(overlay[i])) {
					regcount++;
				}
			}
			if (regcount > 0) {
				return true;
			}
		} else {
			return false;
		}
	},

	/**
	* Attempts to locate an Overlay by instance or ID.
	* @method find
	* @param {YAHOO.widget.Overlay}	overlay		An Overlay to locate within the manager
	* @param {String}	overlay		An Overlay id to locate within the manager
	* @return	{YAHOO.widget.Overlay}	The requested Overlay, if found, or null if it cannot be located.
	*/
	find : function(overlay) {
		if (overlay instanceof YAHOO.widget.Overlay) {
			for (var o=0;o<this.overlays.length;o++) {
				if (this.overlays[o] == overlay) {
					return this.overlays[o];
				}
			}
		} else if (typeof overlay == "string") {
			for (var p=0;p<this.overlays.length;p++) {
				if (this.overlays[p].id == overlay) {
					return this.overlays[p];
				}
			}
		}
		return null;
	},

	/**
	* Used for sorting the manager's Overlays by z-index.
	* @method compareZIndexDesc
	* @private
	* @return {Number}	0, 1, or -1, depending on where the Overlay should fall in the stacking order.
	*/
	compareZIndexDesc : function(o1, o2) {
		var zIndex1 = o1.cfg.getProperty("zIndex");
		var zIndex2 = o2.cfg.getProperty("zIndex");

		if (zIndex1 > zIndex2) {
			return -1;
		} else if (zIndex1 < zIndex2) {
			return 1;
		} else {
			return 0;
		}
	},

	/**
	* Shows all Overlays in the manager.
	* @method showAll
	*/
	showAll : function() {
		for (var o=0;o<this.overlays.length;o++) {
			this.overlays[o].show();
		}
	},

	/**
	* Hides all Overlays in the manager.
	* @method hideAll
	*/
	hideAll : function() {
		for (var o=0;o<this.overlays.length;o++) {
			this.overlays[o].hide();
		}
	},

	/**
	* Returns a string representation of the object.
	* @method toString
	* @return {String}	The string representation of the OverlayManager
	*/
	toString : function() {
		return "OverlayManager";
	}

};
/**
* Tooltip is an implementation of Overlay that behaves like an OS tooltip, displaying when the user mouses over a particular element, and disappearing on mouse out.
* @namespace YAHOO.widget
* @class Tooltip
* @extends YAHOO.widget.Overlay
* @constructor
* @param {String}	el	The element ID representing the Tooltip <em>OR</em>
* @param {HTMLElement}	el	The element representing the Tooltip
* @param {Object}	userConfig	The configuration object literal containing the configuration that should be set for this Overlay. See configuration documentation for more details.
*/
YAHOO.widget.Tooltip = function(el, userConfig) {
	YAHOO.widget.Tooltip.superclass.constructor.call(this, el, userConfig);
};

YAHOO.extend(YAHOO.widget.Tooltip, YAHOO.widget.Overlay);

/**
* Constant representing the Tooltip CSS class
* @property YAHOO.widget.Tooltip.CSS_TOOLTIP
* @static
* @final
* @type String
*/
YAHOO.widget.Tooltip.CSS_TOOLTIP = "yui-tt";

/**
* Constant representing the Tooltip's configuration properties
* @property YAHOO.widget.Tooltip._DEFAULT_CONFIG
* @private
* @final
* @type Object
*/
YAHOO.widget.Tooltip._DEFAULT_CONFIG = {

    "PREVENT_OVERLAP": { 
        key: "preventoverlap", 
        value:true, 
        validator:YAHOO.lang.isBoolean, 
        supercedes:["x","y","xy"] 
    },

    "SHOW_DELAY": { 
        key: "showdelay", 
        value:200, 
        validator:YAHOO.lang.isNumber 
    }, 

    "AUTO_DISMISS_DELAY": { 
        key: "autodismissdelay", 
        value:5000, 
        validator:YAHOO.lang.isNumber 
    }, 

    "HIDE_DELAY": { 
        key: "hidedelay", 
        value:250, 
        validator:YAHOO.lang.isNumber 
    }, 

    "TEXT": { 
        key: "text", 
        suppressEvent:true 
    }, 

    "CONTAINER": { 
        key: "container"
    }

};

/**
* The Tooltip initialization method. This method is automatically called by the constructor. A Tooltip is automatically rendered by the init method, and it also is set to be invisible by default, and constrained to viewport by default as well.
* @method init
* @param {String}	el	The element ID representing the Tooltip <em>OR</em>
* @param {HTMLElement}	el	The element representing the Tooltip
* @param {Object}	userConfig	The configuration object literal containing the configuration that should be set for this Tooltip. See configuration documentation for more details.
*/
YAHOO.widget.Tooltip.prototype.init = function(el, userConfig) {

	if (document.readyState && document.readyState != "complete") {
		var deferredInit = function() {
			this.init(el, userConfig);
		};
		YAHOO.util.Event.addListener(window, "load", deferredInit, this, true);
	} else {
		YAHOO.widget.Tooltip.superclass.init.call(this, el);

		this.beforeInitEvent.fire(YAHOO.widget.Tooltip);

		YAHOO.util.Dom.addClass(this.element, YAHOO.widget.Tooltip.CSS_TOOLTIP);

		if (userConfig) {
			this.cfg.applyConfig(userConfig, true);
		}

		this.cfg.queueProperty("visible",false);
		this.cfg.queueProperty("constraintoviewport",true);

		this.setBody("");
		this.render(this.cfg.getProperty("container"));

		this.initEvent.fire(YAHOO.widget.Tooltip);
	}
};

/**
* Initializes the class's configurable properties which can be changed using the Overlay's Config object (cfg).
* @method initDefaultConfig
*/
YAHOO.widget.Tooltip.prototype.initDefaultConfig = function() {
	YAHOO.widget.Tooltip.superclass.initDefaultConfig.call(this);

    var DEFAULT_CONFIG = YAHOO.widget.Tooltip._DEFAULT_CONFIG;

	/**
	* Specifies whether the Tooltip should be kept from overlapping its context element.
	* @config preventoverlap
	* @type Boolean
	* @default true
	*/
	this.cfg.addProperty(
	           DEFAULT_CONFIG.PREVENT_OVERLAP.key,
	           {
	               value: DEFAULT_CONFIG.PREVENT_OVERLAP.value, 
	               validator: DEFAULT_CONFIG.PREVENT_OVERLAP.validator, 
	               supercedes: DEFAULT_CONFIG.PREVENT_OVERLAP.supercedes
               }
           );

	/**
	* The number of milliseconds to wait before showing a Tooltip on mouseover.
	* @config showdelay
	* @type Number
	* @default 200
	*/
	this.cfg.addProperty(
                DEFAULT_CONFIG.SHOW_DELAY.key,
                {
                    handler: this.configShowDelay,
                    value: 200, 
                    validator: DEFAULT_CONFIG.SHOW_DELAY.validator
                }
          );

	/**
	* The number of milliseconds to wait before automatically dismissing a Tooltip after the mouse has been resting on the context element.
	* @config autodismissdelay
	* @type Number
	* @default 5000
	*/
	this.cfg.addProperty(
                DEFAULT_CONFIG.AUTO_DISMISS_DELAY.key,	
                {
                    handler: this.configAutoDismissDelay,
                    value: DEFAULT_CONFIG.AUTO_DISMISS_DELAY.value,
                    validator: DEFAULT_CONFIG.AUTO_DISMISS_DELAY.validator
                }
            );

	/**
	* The number of milliseconds to wait before hiding a Tooltip on mouseover.
	* @config hidedelay
	* @type Number
	* @default 250
	*/
	this.cfg.addProperty(
                DEFAULT_CONFIG.HIDE_DELAY.key,
                {
                    handler: this.configHideDelay,
                    value: DEFAULT_CONFIG.HIDE_DELAY.value, 
                    validator: DEFAULT_CONFIG.HIDE_DELAY.validator
                }
            );

	/**
	* Specifies the Tooltip's text.
	* @config text
	* @type String
	* @default null
	*/
    this.cfg.addProperty(
                DEFAULT_CONFIG.TEXT.key,
                {
                    handler: this.configText,
                    suppressEvent: DEFAULT_CONFIG.TEXT.suppressEvent
                }
            );

	/**
	* Specifies the container element that the Tooltip's markup should be rendered into.
	* @config container
	* @type HTMLElement/String
	* @default document.body
	*/
    this.cfg.addProperty(
                DEFAULT_CONFIG.CONTAINER.key,
                {
                    handler: this.configContainer,
                    value: document.body
                }
            );

	/**
	* Specifies the element or elements that the Tooltip should be anchored to on mouseover.
	* @config context
	* @type HTMLElement[]/String[]
	* @default null
	*/	

};

// BEGIN BUILT-IN PROPERTY EVENT HANDLERS //

/**
* The default event handler fired when the "text" property is changed.
* @method configText
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Tooltip.prototype.configText = function(type, args, obj) {
	var text = args[0];
	if (text) {
		this.setBody(text);
	}
};

/**
* The default event handler fired when the "container" property is changed.
* @method configContainer
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Tooltip.prototype.configContainer = function(type, args, obj) {
	var container = args[0];
	if (typeof container == 'string') {
		this.cfg.setProperty("container", document.getElementById(container), true);
	}
};

/**
* @method _removeEventListeners
* @description Removes all of the DOM event handlers from the HTML element(s) 
* that trigger the display of the tooltip.
* @protected
*/
YAHOO.widget.Tooltip.prototype._removeEventListeners = function() {

    var aElements = this._context;
    
    if (aElements) {

        var nElements = aElements.length;
        
        if (nElements > 0) {
        
            var i = nElements - 1,
                oElement;
            
            do {

                oElement = aElements[i];

                YAHOO.util.Event.removeListener(oElement, "mouseover", this.onContextMouseOver);
                YAHOO.util.Event.removeListener(oElement, "mousemove", this.onContextMouseMove);
                YAHOO.util.Event.removeListener(oElement, "mouseout", this.onContextMouseOut);
            
            }
            while(i--);
        
        }

    }

};

/**
* The default event handler fired when the "context" property is changed.
* @method configContext
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Tooltip.prototype.configContext = function(type, args, obj) {
	var context = args[0];
	if (context) {

		// Normalize parameter into an array
		if (! (context instanceof Array)) {
			if (typeof context == "string") {
				this.cfg.setProperty("context", [document.getElementById(context)], true);
			} else { // Assuming this is an element
				this.cfg.setProperty("context", [context], true);
			}
			context = this.cfg.getProperty("context");
		}


		// Remove any existing mouseover/mouseout listeners
        this._removeEventListeners();

		// Add mouseover/mouseout listeners to context elements
		this._context = context;

        var aElements = this._context;
        
        if (aElements) {
    
            var nElements = aElements.length;
            
            if (nElements > 0) {
            
                var i = nElements - 1,
                    oElement;
                
                do {
    
                    oElement = aElements[i];
    
                    YAHOO.util.Event.addListener(oElement, "mouseover", this.onContextMouseOver, this);
                    YAHOO.util.Event.addListener(oElement, "mousemove", this.onContextMouseMove, this);
                    YAHOO.util.Event.addListener(oElement, "mouseout", this.onContextMouseOut, this);
                
                }
                while(i--);
            
            }
    
        }

	}
};

// END BUILT-IN PROPERTY EVENT HANDLERS //

// BEGIN BUILT-IN DOM EVENT HANDLERS //

/**
* The default event handler fired when the user moves the mouse while over the context element.
* @method onContextMouseMove
* @param {DOMEvent} e	The current DOM event
* @param {Object}	obj	The object argument
*/
YAHOO.widget.Tooltip.prototype.onContextMouseMove = function(e, obj) {
	obj.pageX = YAHOO.util.Event.getPageX(e);
	obj.pageY = YAHOO.util.Event.getPageY(e);

};

/**
* The default event handler fired when the user mouses over the context element.
* @method onContextMouseOver
* @param {DOMEvent} e	The current DOM event
* @param {Object}	obj	The object argument
*/
YAHOO.widget.Tooltip.prototype.onContextMouseOver = function(e, obj) {

	if (obj.hideProcId) {
		clearTimeout(obj.hideProcId);
		obj.hideProcId = null;
	}

	var context = this;
	YAHOO.util.Event.addListener(context, "mousemove", obj.onContextMouseMove, obj);

	if (context.title) {
		obj._tempTitle = context.title;
		context.title = "";
	}

	/**
	* The unique process ID associated with the thread responsible for showing the Tooltip.
	* @type int
	*/
	obj.showProcId = obj.doShow(e, context);
};

/**
* The default event handler fired when the user mouses out of the context element.
* @method onContextMouseOut
* @param {DOMEvent} e	The current DOM event
* @param {Object}	obj	The object argument
*/
YAHOO.widget.Tooltip.prototype.onContextMouseOut = function(e, obj) {
	var el = this;

	if (obj._tempTitle) {
		el.title = obj._tempTitle;
		obj._tempTitle = null;
	}

	if (obj.showProcId) {
		clearTimeout(obj.showProcId);
		obj.showProcId = null;
	}

	if (obj.hideProcId) {
		clearTimeout(obj.hideProcId);
		obj.hideProcId = null;
	}


	obj.hideProcId = setTimeout(function() {
				obj.hide();
				}, obj.cfg.getProperty("hidedelay"));
};

// END BUILT-IN DOM EVENT HANDLERS //

/**
* Processes the showing of the Tooltip by setting the timeout delay and offset of the Tooltip.
* @method doShow
* @param {DOMEvent} e	The current DOM event
* @return {Number}	The process ID of the timeout function associated with doShow
*/
YAHOO.widget.Tooltip.prototype.doShow = function(e, context) {

	var yOffset = 25;
	if (this.browser == "opera" && context.tagName && context.tagName.toUpperCase() == "A") {
		yOffset += 12;
	}

	var me = this;
	return setTimeout(
		function() {
			if (me._tempTitle) {
				me.setBody(me._tempTitle);
			} else {
				me.cfg.refireEvent("text");
			}

			me.moveTo(me.pageX, me.pageY + yOffset);
			if (me.cfg.getProperty("preventoverlap")) {
				me.preventOverlap(me.pageX, me.pageY);
			}

			YAHOO.util.Event.removeListener(context, "mousemove", me.onContextMouseMove);

			me.show();
			me.hideProcId = me.doHide();
		},
	this.cfg.getProperty("showdelay"));
};

/**
* Sets the timeout for the auto-dismiss delay, which by default is 5 seconds, meaning that a tooltip will automatically dismiss itself after 5 seconds of being displayed.
* @method doHide
*/
YAHOO.widget.Tooltip.prototype.doHide = function() {
	var me = this;
	return setTimeout(
		function() {
			me.hide();
		},
		this.cfg.getProperty("autodismissdelay"));
};

/**
* Fired when the Tooltip is moved, this event handler is used to prevent the Tooltip from overlapping with its context element.
* @method preventOverlay
* @param {Number} pageX	The x coordinate position of the mouse pointer
* @param {Number} pageY	The y coordinate position of the mouse pointer
*/
YAHOO.widget.Tooltip.prototype.preventOverlap = function(pageX, pageY) {

	var height = this.element.offsetHeight;

	var elementRegion = YAHOO.util.Dom.getRegion(this.element);

	elementRegion.top -= 5;
	elementRegion.left -= 5;
	elementRegion.right += 5;
	elementRegion.bottom += 5;

	var mousePoint = new YAHOO.util.Point(pageX, pageY);


	if (elementRegion.contains(mousePoint)) {
		this.cfg.setProperty("y", (pageY-height-5));
	}
};

/**
* Removes the Tooltip element from the DOM and sets all child elements to null.
* @method destroy
*/
YAHOO.widget.Tooltip.prototype.destroy = function() {

    // Remove any existing mouseover/mouseout listeners
    this._removeEventListeners();

    YAHOO.widget.Tooltip.superclass.destroy.call(this);  

};

/**
* Returns a string representation of the object.
* @method toString
* @return {String}	The string representation of the Tooltip
*/
YAHOO.widget.Tooltip.prototype.toString = function() {
	return "Tooltip " + this.id;
};
/**
* Panel is an implementation of Overlay that behaves like an OS window, with a draggable header and an optional close icon at the top right.
* @namespace YAHOO.widget
* @class Panel
* @extends YAHOO.widget.Overlay
* @constructor
* @param {String}	el	The element ID representing the Panel <em>OR</em>
* @param {HTMLElement}	el	The element representing the Panel
* @param {Object}	userConfig	The configuration object literal containing the configuration that should be set for this Panel. See configuration documentation for more details.
*/
YAHOO.widget.Panel = function(el, userConfig) {
	YAHOO.widget.Panel.superclass.constructor.call(this, el, userConfig);
};

YAHOO.extend(YAHOO.widget.Panel, YAHOO.widget.Overlay);

/**
* Constant representing the default CSS class used for a Panel
* @property YAHOO.widget.Panel.CSS_PANEL
* @static
* @final
* @type String
*/
YAHOO.widget.Panel.CSS_PANEL = "yui-panel";

/**
* Constant representing the default CSS class used for a Panel's wrapping container
* @property YAHOO.widget.Panel.CSS_PANEL_CONTAINER
* @static
* @final
* @type String
*/
YAHOO.widget.Panel.CSS_PANEL_CONTAINER = "yui-panel-container";

/**
* Constant representing the name of the Panel's events
* @property YAHOO.widget.Panel._EVENT_TYPES
* @private
* @final
* @type Object
*/
YAHOO.widget.Panel._EVENT_TYPES = {

	"SHOW_MASK": "showMask",
	"HIDE_MASK": "hideMask",
	"DRAG": "drag"

};

/**
* Constant representing the Panel's configuration properties
* @property YAHOO.widget.Panel._DEFAULT_CONFIG
* @private
* @final
* @type Object
*/
YAHOO.widget.Panel._DEFAULT_CONFIG = {

    "CLOSE": { 
        key: "close", 
        value:true, 
        validator:YAHOO.lang.isBoolean, 
        supercedes:["visible"] 
    },

    "DRAGGABLE": { 
        key: "draggable", 
        value:(YAHOO.util.DD ? true : false), 
        validator:YAHOO.lang.isBoolean, 
        supercedes:["visible"]  
    },

    "UNDERLAY": { 
        key: "underlay", 
        value:"shadow", 
        supercedes:["visible"] 
    },

    "MODAL": { 
        key: "modal", 
        value:false, 
        validator:YAHOO.lang.isBoolean, 
        supercedes:["visible"] 
    },

    "KEY_LISTENERS": { 
        key: "keylisteners", 
        suppressEvent:true, 
        supercedes:["visible"] 
    }

};

/**
* The Overlay initialization method, which is executed for Overlay and all of its subclasses. This method is automatically called by the constructor, and  sets up all DOM references for pre-existing markup, and creates required markup if it is not already present.
* @method init
* @param {String}	el	The element ID representing the Overlay <em>OR</em>
* @param {HTMLElement}	el	The element representing the Overlay
* @param {Object}	userConfig	The configuration object literal containing the configuration that should be set for this Overlay. See configuration documentation for more details.
*/
YAHOO.widget.Panel.prototype.init = function(el, userConfig) {
	YAHOO.widget.Panel.superclass.init.call(this, el/*, userConfig*/);  // Note that we don't pass the user config in here yet because we only want it executed once, at the lowest subclass level

	this.beforeInitEvent.fire(YAHOO.widget.Panel);

	YAHOO.util.Dom.addClass(this.element, YAHOO.widget.Panel.CSS_PANEL);

	this.buildWrapper();

	if (userConfig) {
		this.cfg.applyConfig(userConfig, true);
	}

	this.beforeRenderEvent.subscribe(function() {
		var draggable = this.cfg.getProperty("draggable");
		if (draggable) {
			if (! this.header) {
				this.setHeader("&#160;");
			}
		}
	}, this, true);


    this.renderEvent.subscribe(function() {

        /*
            If no value for the "width" configuration property was specified, 
            set it to the offsetWidth. If the "width" is not set, then in IE 
            you can only drag the panel when you put the cursor on the
            header's text.
        */

        var sWidth = this.cfg.getProperty("width");
        
        if(!sWidth) {

            this.cfg.setProperty("width", (this.element.offsetWidth + "px"));
        
        }
    
    });


	var me = this;

	var doBlur = function() {
		this.blur();
	};

	this.showMaskEvent.subscribe(function() {

		var checkFocusable = function(el) {

            var sTagName = el.tagName.toUpperCase(),
                bFocusable = false;
            
            switch(sTagName) {
            
                case "A":
                case "BUTTON":
                case "SELECT":
                case "TEXTAREA":

                    if (! YAHOO.util.Dom.isAncestor(me.element, el)) {
                        YAHOO.util.Event.addListener(el, "focus", doBlur, el, true);
                        bFocusable = true;
                    }

                break;

                case "INPUT":

                    if (el.type != "hidden" && ! YAHOO.util.Dom.isAncestor(me.element, el)) {

                        YAHOO.util.Event.addListener(el, "focus", doBlur, el, true);
                        bFocusable = true;

                    }

                break;
            
            }

            return bFocusable;

		};

		this.focusableElements = YAHOO.util.Dom.getElementsBy(checkFocusable);
	}, this, true);

	this.hideMaskEvent.subscribe(function() {
		for (var i=0;i<this.focusableElements.length;i++) {
			var el2 = this.focusableElements[i];
			YAHOO.util.Event.removeListener(el2, "focus", doBlur);
		}
	}, this, true);

	this.beforeShowEvent.subscribe(function() {
		this.cfg.refireEvent("underlay");
	}, this, true);
	this.initEvent.fire(YAHOO.widget.Panel);
};

/**
* Initializes the custom events for Module which are fired automatically at appropriate times by the Module class.
*/
YAHOO.widget.Panel.prototype.initEvents = function() {
	YAHOO.widget.Panel.superclass.initEvents.call(this);

    var EVENT_TYPES = YAHOO.widget.Panel._EVENT_TYPES;

	/**
	* CustomEvent fired after the modality mask is shown
	* @event showMaskEvent
	*/
	this.showMaskEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.SHOW_MASK, this);

	/**
	* CustomEvent fired after the modality mask is hidden
	* @event hideMaskEvent
	*/
	this.hideMaskEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.HIDE_MASK, this);

	/**
	* CustomEvent when the Panel is dragged
	* @event dragEvent
	*/
	this.dragEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.DRAG, this);
};

/**
* Initializes the class's configurable properties which can be changed using the Panel's Config object (cfg).
* @method initDefaultConfig
*/
YAHOO.widget.Panel.prototype.initDefaultConfig = function() {
	YAHOO.widget.Panel.superclass.initDefaultConfig.call(this);

    // Add panel config properties //

    var DEFAULT_CONFIG = YAHOO.widget.Panel._DEFAULT_CONFIG;

	/**
	* True if the Panel should display a "close" button
	* @config close
	* @type Boolean
	* @default true
	*/
    this.cfg.addProperty(
                DEFAULT_CONFIG.CLOSE.key,
                { 
                    handler: this.configClose, 
                    value: DEFAULT_CONFIG.CLOSE.value, 
                    validator: DEFAULT_CONFIG.CLOSE.validator, 
                    supercedes: DEFAULT_CONFIG.CLOSE.supercedes
                } 
            );

	/**
	* True if the Panel should be draggable.  Default value is "true" if the Drag and Drop utility is included, otherwise it is "false."
	* @config draggable
	* @type Boolean
	* @default true
	*/
    this.cfg.addProperty(
                DEFAULT_CONFIG.DRAGGABLE.key, 
                { 
                    handler: this.configDraggable, 
                    value: DEFAULT_CONFIG.DRAGGABLE.value, 
                    validator: DEFAULT_CONFIG.DRAGGABLE.validator, 
                    supercedes: DEFAULT_CONFIG.DRAGGABLE.supercedes 
                } 
            );

	/**
	* Sets the type of underlay to display for the Panel. Valid values are "shadow", "matte", and "none".
	* @config underlay
	* @type String
	* @default shadow
	*/
    this.cfg.addProperty(
                DEFAULT_CONFIG.UNDERLAY.key, 
                { 
                    handler: this.configUnderlay, 
                    value: DEFAULT_CONFIG.UNDERLAY.value, 
                    supercedes: DEFAULT_CONFIG.UNDERLAY.supercedes
                } 
            );

	/**
	* True if the Panel should be displayed in a modal fashion, automatically creating a transparent mask over the document that will not be removed until the Panel is dismissed.
	* @config modal
	* @type Boolean
	* @default false
	*/
    this.cfg.addProperty(
                DEFAULT_CONFIG.MODAL.key,
                { 
                    handler: this.configModal, 
                    value: DEFAULT_CONFIG.MODAL.value,
                    validator: DEFAULT_CONFIG.MODAL.validator, 
                    supercedes: DEFAULT_CONFIG.MODAL.supercedes 
                } 
            );

	/**
	* A KeyListener (or array of KeyListeners) that will be enabled when the Panel is shown, and disabled when the Panel is hidden.
	* @config keylisteners
	* @type YAHOO.util.KeyListener[]
	* @default null
	*/
    this.cfg.addProperty(
                DEFAULT_CONFIG.KEY_LISTENERS.key, 
                { 
                    handler: this.configKeyListeners, 
                    suppressEvent: DEFAULT_CONFIG.KEY_LISTENERS.suppressEvent, 
                    supercedes: DEFAULT_CONFIG.KEY_LISTENERS.supercedes
                } 
            );

};

// BEGIN BUILT-IN PROPERTY EVENT HANDLERS //

/**
* The default event handler fired when the "close" property is changed. The method controls the appending or hiding of the close icon at the top right of the Panel.
* @method configClose
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Panel.prototype.configClose = function(type, args, obj) {
	var val = args[0];

	var doHide = function(e, obj) {
		obj.hide();
	};

	if (val) {
		if (! this.close) {
			this.close = document.createElement("span");
			YAHOO.util.Dom.addClass(this.close, "container-close");
			this.close.innerHTML = "&#160;";
			this.innerElement.appendChild(this.close);
			YAHOO.util.Event.addListener(this.close, "click", doHide, this);
		} else {
			this.close.style.display = "block";
		}
	} else {
		if (this.close) {
			this.close.style.display = "none";
		}
	}
};

/**
* The default event handler fired when the "draggable" property is changed.
* @method configDraggable
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Panel.prototype.configDraggable = function(type, args, obj) {

	var val = args[0];
	if (val) {

        if (!YAHOO.util.DD) {
    

            this.cfg.setProperty("draggable", false);
    
            return;
        
        }

		if (this.header) {
			YAHOO.util.Dom.setStyle(this.header,"cursor","move");
			this.registerDragDrop();
		}
	} else {
		if (this.dd) {
			this.dd.unreg();
		}
		if (this.header) {
			YAHOO.util.Dom.setStyle(this.header,"cursor","auto");
		}
	}
};

/**
* The default event handler fired when the "underlay" property is changed.
* @method configUnderlay
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Panel.prototype.configUnderlay = function(type, args, obj) {
	var val = args[0];

	switch (val.toLowerCase()) {
		case "shadow":
			YAHOO.util.Dom.removeClass(this.element, "matte");
			YAHOO.util.Dom.addClass(this.element, "shadow");

			if (! this.underlay) { // create if not already in DOM
				this.underlay = document.createElement("div");
				this.underlay.className = "underlay";
				this.underlay.innerHTML = "&#160;";
				this.element.appendChild(this.underlay);
			}

			this.sizeUnderlay();
			break;
		case "matte":
			YAHOO.util.Dom.removeClass(this.element, "shadow");
			YAHOO.util.Dom.addClass(this.element, "matte");
			break;
		default:
			YAHOO.util.Dom.removeClass(this.element, "shadow");
			YAHOO.util.Dom.removeClass(this.element, "matte");
			break;
	}
};

/**
* The default event handler fired when the "modal" property is changed. This handler subscribes or unsubscribes to the show and hide events to handle the display or hide of the modality mask.
* @method configModal
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Panel.prototype.configModal = function(type, args, obj) {
	var modal = args[0];

	if (modal) {
		this.buildMask();

		if (! YAHOO.util.Config.alreadySubscribed( this.beforeShowEvent, this.showMask, this ) ) {
			this.beforeShowEvent.subscribe(this.showMask, this, true);
		}
		if (! YAHOO.util.Config.alreadySubscribed( this.hideEvent, this.hideMask, this) ) {
			this.hideEvent.subscribe(this.hideMask, this, true);
		}
		if (! YAHOO.util.Config.alreadySubscribed( YAHOO.widget.Overlay.windowResizeEvent, this.sizeMask, this ) ) {
			YAHOO.widget.Overlay.windowResizeEvent.subscribe(this.sizeMask, this, true);
		}
		if (! YAHOO.util.Config.alreadySubscribed( this.destroyEvent, this.removeMask, this) ) {
			this.destroyEvent.subscribe(this.removeMask, this, true);
		}

		this.cfg.refireEvent("zIndex");
	} else {
		this.beforeShowEvent.unsubscribe(this.showMask, this);
		this.hideEvent.unsubscribe(this.hideMask, this);
		YAHOO.widget.Overlay.windowResizeEvent.unsubscribe(this.sizeMask, this);
		this.destroyEvent.unsubscribe(this.removeMask, this);
	}
};

/**
* Removes the modality mask.
* @method removeMask
*/
YAHOO.widget.Panel.prototype.removeMask = function() {

    var oMask = this.mask;

    if(oMask) {
    
        /*
            Hide the mask before destroying it to ensure that DOM
            event handlers on focusable elements get removed.
        */

        this.hideMask();
    
        var oParentNode = oMask.parentNode;

        if(oParentNode) {

            oParentNode.removeChild(oMask);

        }

        this.mask = null;
    }
    
};

/**
* The default event handler fired when the "keylisteners" property is changed.
* @method configKeyListeners
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Panel.prototype.configKeyListeners = function(type, args, obj) {
	var listeners = args[0];

	if (listeners) {
		if (listeners instanceof Array) {
			for (var i=0;i<listeners.length;i++) {
				var listener = listeners[i];

				if (! YAHOO.util.Config.alreadySubscribed(this.showEvent, listener.enable, listener)) {
					this.showEvent.subscribe(listener.enable, listener, true);
				}
				if (! YAHOO.util.Config.alreadySubscribed(this.hideEvent, listener.disable, listener)) {
					this.hideEvent.subscribe(listener.disable, listener, true);
					this.destroyEvent.subscribe(listener.disable, listener, true);
				}
			}
		} else {
			if (! YAHOO.util.Config.alreadySubscribed(this.showEvent, listeners.enable, listeners)) {
				this.showEvent.subscribe(listeners.enable, listeners, true);
			}
			if (! YAHOO.util.Config.alreadySubscribed(this.hideEvent, listeners.disable, listeners)) {
				this.hideEvent.subscribe(listeners.disable, listeners, true);
				this.destroyEvent.subscribe(listeners.disable, listeners, true);
			}
		}
	}
};

/**
* The default event handler fired when the "height" property is changed.
* @method configHeight
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Panel.prototype.configHeight = function(type, args, obj) {
	var height = args[0];
	var el = this.innerElement;
	YAHOO.util.Dom.setStyle(el, "height", height);
	this.cfg.refireEvent("underlay");
	this.cfg.refireEvent("iframe");
};

/**
* The default event handler fired when the "width" property is changed.
* @method configWidth
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Panel.prototype.configWidth = function(type, args, obj) {
	var width = args[0];
	var el = this.innerElement;
	YAHOO.util.Dom.setStyle(el, "width", width);
	this.cfg.refireEvent("underlay");
	this.cfg.refireEvent("iframe");
};

/**
* The default event handler fired when the "zIndex" property is changed.
* @method configzIndex
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Panel.prototype.configzIndex = function(type, args, obj) {
	YAHOO.widget.Panel.superclass.configzIndex.call(this, type, args, obj);

	var maskZ = 0;
	var currentZ = YAHOO.util.Dom.getStyle(this.element, "zIndex");

	if (this.mask) {
		if (! currentZ || isNaN(currentZ)) {
			currentZ = 0;
		}

		if (currentZ === 0) {
			this.cfg.setProperty("zIndex", 1);
		} else {
			maskZ = currentZ - 1;
			YAHOO.util.Dom.setStyle(this.mask, "zIndex", maskZ);
		}

	}
};

// END BUILT-IN PROPERTY EVENT HANDLERS //


/**
* Builds the wrapping container around the Panel that is used for positioning the shadow and matte underlays. The container element is assigned to a  local instance variable called container, and the element is reinserted inside of it.
* @method buildWrapper
*/
YAHOO.widget.Panel.prototype.buildWrapper = function() {
	var elementParent = this.element.parentNode;
	var originalElement = this.element;

	var wrapper = document.createElement("div");
	wrapper.className = YAHOO.widget.Panel.CSS_PANEL_CONTAINER;
	wrapper.id = originalElement.id + "_c";

	if (elementParent) {
		elementParent.insertBefore(wrapper, originalElement);
	}

	wrapper.appendChild(originalElement);

	this.element = wrapper;
	this.innerElement = originalElement;

	YAHOO.util.Dom.setStyle(this.innerElement, "visibility", "inherit");
};

/**
* Adjusts the size of the shadow based on the size of the element.
* @method sizeUnderlay
*/
YAHOO.widget.Panel.prototype.sizeUnderlay = function() {
	if (this.underlay && this.browser != "gecko" && this.browser != "safari") {
		this.underlay.style.width = this.innerElement.offsetWidth + "px";
		this.underlay.style.height = this.innerElement.offsetHeight + "px";
	}
};

/**
* Event handler fired when the resize monitor element is resized.
* @method onDomResize
* @param {DOMEvent} e	The resize DOM event
* @param {Object} obj	The scope object
*/
YAHOO.widget.Panel.prototype.onDomResize = function(e, obj) {
	YAHOO.widget.Panel.superclass.onDomResize.call(this, e, obj);
	var me = this;
	setTimeout(function() {
		me.sizeUnderlay();
	}, 0);
};

/**
* Registers the Panel's header for drag & drop capability.
* @method registerDragDrop
*/
YAHOO.widget.Panel.prototype.registerDragDrop = function() {
	if (this.header) {

        if(!YAHOO.util.DD) {


            return;
        
        }

		this.dd = new YAHOO.util.DD(this.element.id, this.id);

		if (! this.header.id) {
			this.header.id = this.id + "_h";
		}

		var me = this;

		this.dd.startDrag = function() {

			if (me.browser == "ie") {
				YAHOO.util.Dom.addClass(me.element,"drag");
			}

			if (me.cfg.getProperty("constraintoviewport")) {
				var offsetHeight = me.element.offsetHeight;
				var offsetWidth = me.element.offsetWidth;

				var viewPortWidth = YAHOO.util.Dom.getViewportWidth();
				var viewPortHeight = YAHOO.util.Dom.getViewportHeight();

				var scrollX = window.scrollX || document.documentElement.scrollLeft;
				var scrollY = window.scrollY || document.documentElement.scrollTop;

				var topConstraint = scrollY + 10;
				var leftConstraint = scrollX + 10;
				var bottomConstraint = scrollY + viewPortHeight - offsetHeight - 10;
				var rightConstraint = scrollX + viewPortWidth - offsetWidth - 10;

				this.minX = leftConstraint;
				this.maxX = rightConstraint;
				this.constrainX = true;

				this.minY = topConstraint;
				this.maxY = bottomConstraint;
				this.constrainY = true;
			} else {
				this.constrainX = false;
				this.constrainY = false;
			}

			me.dragEvent.fire("startDrag", arguments);
		};

		this.dd.onDrag = function() {
			me.syncPosition();
			me.cfg.refireEvent("iframe");
			if (this.platform == "mac" && this.browser == "gecko") {
				this.showMacGeckoScrollbars();
			}

			me.dragEvent.fire("onDrag", arguments);
		};

		this.dd.endDrag = function() {
			if (me.browser == "ie") {
				YAHOO.util.Dom.removeClass(me.element,"drag");
			}

			me.dragEvent.fire("endDrag", arguments);
		};

		this.dd.setHandleElId(this.header.id);
		this.dd.addInvalidHandleType("INPUT");
		this.dd.addInvalidHandleType("SELECT");
		this.dd.addInvalidHandleType("TEXTAREA");
	}
};

/**
* Builds the mask that is laid over the document when the Panel is configured to be modal.
* @method buildMask
*/
YAHOO.widget.Panel.prototype.buildMask = function() {
	if (! this.mask) {
		this.mask = document.createElement("div");
		this.mask.id = this.id + "_mask";
		this.mask.className = "mask";
		this.mask.innerHTML = "&#160;";

		var maskClick = function(e, obj) {
			YAHOO.util.Event.stopEvent(e);
		};

		var firstChild = document.body.firstChild;
		if (firstChild)	{
			document.body.insertBefore(this.mask, document.body.firstChild);
		} else {
			document.body.appendChild(this.mask);
		}
	}
};

/**
* Hides the modality mask.
* @method hideMask
*/
YAHOO.widget.Panel.prototype.hideMask = function() {
	if (this.cfg.getProperty("modal") && this.mask) {
		this.mask.style.display = "none";
		this.hideMaskEvent.fire();
		YAHOO.util.Dom.removeClass(document.body, "masked");
	}
};

/**
* Shows the modality mask.
* @method showMask
*/
YAHOO.widget.Panel.prototype.showMask = function() {
	if (this.cfg.getProperty("modal") && this.mask) {
		YAHOO.util.Dom.addClass(document.body, "masked");
		this.sizeMask();
		this.mask.style.display = "block";
		this.showMaskEvent.fire();
	}
};

/**
* Sets the size of the modality mask to cover the entire scrollable area of the document
* @method sizeMask
*/
YAHOO.widget.Panel.prototype.sizeMask = function() {
	if (this.mask) {
		this.mask.style.height = YAHOO.util.Dom.getDocumentHeight()+"px";
		this.mask.style.width = YAHOO.util.Dom.getDocumentWidth()+"px";
	}
};

/**
* Renders the Panel by inserting the elements that are not already in the main Panel into their correct places. Optionally appends the Panel to the specified node prior to the render's execution. NOTE: For Panels without existing markup, the appendToNode argument is REQUIRED. If this argument is ommitted and the current element is not present in the document, the function will return false, indicating that the render was a failure.
* @method render
* @param {String}	appendToNode	The element id to which the Module should be appended to prior to rendering <em>OR</em>
* @param {HTMLElement}	appendToNode	The element to which the Module should be appended to prior to rendering
* @return {boolean} Success or failure of the render
*/
YAHOO.widget.Panel.prototype.render = function(appendToNode) {
	return YAHOO.widget.Panel.superclass.render.call(this, appendToNode, this.innerElement);
};

/**
* Removes the Panel element from the DOM and sets all child elements to null.
* @method destroy
*/
YAHOO.widget.Panel.prototype.destroy = function() {

    YAHOO.widget.Overlay.windowResizeEvent.unsubscribe(this.sizeMask, this);

    if(this.close) {
    
        YAHOO.util.Event.purgeElement(this.close);

    }

    YAHOO.widget.Panel.superclass.destroy.call(this);  

};

/**
* Returns a String representation of the object.
* @method toString
* @return {String} The string representation of the Panel.
*/
YAHOO.widget.Panel.prototype.toString = function() {
	return "Panel " + this.id;
};
/**
* Dialog is an implementation of Panel that can be used to submit form data. Built-in functionality for buttons with event handlers is included, and button sets can be build dynamically, or the preincluded ones for Submit/Cancel and OK/Cancel can be utilized. Forms can be processed in 3 ways -- via an asynchronous Connection utility call, a simple form POST or GET, or manually.
* @namespace YAHOO.widget
* @class Dialog
* @extends YAHOO.widget.Panel
* @constructor
* @param {String}	el	The element ID representing the Dialog <em>OR</em>
* @param {HTMLElement}	el	The element representing the Dialog
* @param {Object}	userConfig	The configuration object literal containing the configuration that should be set for this Dialog. See configuration documentation for more details.
*/
YAHOO.widget.Dialog = function(el, userConfig) {
	YAHOO.widget.Dialog.superclass.constructor.call(this, el, userConfig);
};

YAHOO.extend(YAHOO.widget.Dialog, YAHOO.widget.Panel);

/**
* Constant representing the default CSS class used for a Dialog
* @property YAHOO.widget.Dialog.CSS_DIALOG
* @static
* @final
* @type String
*/
YAHOO.widget.Dialog.CSS_DIALOG = "yui-dialog";

/**
* Constant representing the name of the Dialog's events
* @property YAHOO.widget.Dialog._EVENT_TYPES
* @private
* @final
* @type Object
*/
YAHOO.widget.Dialog._EVENT_TYPES = {

	"BEFORE_SUBMIT": "beforeSubmit",
	"SUBMIT": "submit",
	"MANUAL_SUBMIT": "manualSubmit",
	"ASYNC_SUBMIT": "asyncSubmit",
	"FORM_SUBMIT": "formSubmit",
	"CANCEL": "cancel"

};

/**
* Constant representing the Dialog's configuration properties
* @property YAHOO.widget.Dialog._DEFAULT_CONFIG
* @private
* @final
* @type Object
*/
YAHOO.widget.Dialog._DEFAULT_CONFIG = {

	"POST_METHOD": { 
	   key: "postmethod", 
	   value: "async" 
    },

	"BUTTONS": { 
	   key: "buttons", 
	   value: "none" 
    }

};

/**
* Initializes the class's configurable properties which can be changed using the Dialog's Config object (cfg).
* @method initDefaultConfig
*/
YAHOO.widget.Dialog.prototype.initDefaultConfig = function() {
	YAHOO.widget.Dialog.superclass.initDefaultConfig.call(this);

	/**
	* The internally maintained callback object for use with the Connection utility
	* @property callback
	* @type Object
	*/
	this.callback = {
		/**
		* The function to execute upon success of the Connection submission
		* @property callback.success
		* @type Function
		*/
		success : null,
		/**
		* The function to execute upon failure of the Connection submission
		* @property callback.failure
		* @type Function
		*/
		failure : null,
		/**
		* The arbitraty argument or arguments to pass to the Connection callback functions
		* @property callback.argument
		* @type Object
		*/
		argument: null
	};

	// Add form dialog config properties //
	
	var DEFAULT_CONFIG = YAHOO.widget.Dialog._DEFAULT_CONFIG;
	
	/**
	* The method to use for posting the Dialog's form. Possible values are "async", "form", and "manual".
	* @config postmethod
	* @type String
	* @default async
	*/
	this.cfg.addProperty(
	           DEFAULT_CONFIG.POST_METHOD.key, 
                {
                    handler: this.configPostMethod, 
                    value: DEFAULT_CONFIG.POST_METHOD.value, 
                    validator: function(val) {
                        if (val != "form" && val != "async" && val != "none" && val != "manual") {
                            return false;
                        } else {
                            return true;
                        }
                    }
                }
            );

	/**
	* Object literal(s) defining the buttons for the Dialog's footer.
	* @config buttons
	* @type Object[]
	* @default "none"
	*/
	this.cfg.addProperty(
	           DEFAULT_CONFIG.BUTTONS.key,
	           {
	               handler: this.configButtons,
	               value: DEFAULT_CONFIG.BUTTONS.value
               }
           );	
	
};

/**
* Initializes the custom events for Dialog which are fired automatically at appropriate times by the Dialog class.
* @method initEvents
*/
YAHOO.widget.Dialog.prototype.initEvents = function() {
	YAHOO.widget.Dialog.superclass.initEvents.call(this);

    var EVENT_TYPES = YAHOO.widget.Dialog._EVENT_TYPES;

	/**
	* CustomEvent fired prior to submission
	* @event beforeSumitEvent
	*/	
	this.beforeSubmitEvent	= new YAHOO.util.CustomEvent(EVENT_TYPES.BEFORE_SUBMIT, this);
	
	/**
	* CustomEvent fired after submission
	* @event submitEvent
	*/
	this.submitEvent		= new YAHOO.util.CustomEvent(EVENT_TYPES.SUBMIT, this);

	/**
	* CustomEvent fired prior to manual submission
	* @event manualSubmitEvent
	*/
	this.manualSubmitEvent	= new YAHOO.util.CustomEvent(EVENT_TYPES.MANUAL_SUBMIT, this);

	/**
	* CustomEvent fired prior to asynchronous submission
	* @event asyncSubmitEvent
	*/	
	this.asyncSubmitEvent	= new YAHOO.util.CustomEvent(EVENT_TYPES.ASYNC_SUBMIT, this);

	/**
	* CustomEvent fired prior to form-based submission
	* @event formSubmitEvent
	*/
	this.formSubmitEvent	= new YAHOO.util.CustomEvent(EVENT_TYPES.FORM_SUBMIT, this);

	/**
	* CustomEvent fired after cancel
	* @event cancelEvent
	*/
	this.cancelEvent		= new YAHOO.util.CustomEvent(EVENT_TYPES.CANCEL, this);
};

/**
* The Dialog initialization method, which is executed for Dialog and all of its subclasses. This method is automatically called by the constructor, and  sets up all DOM references for pre-existing markup, and creates required markup if it is not already present.
* @method init
* @param {String}	el	The element ID representing the Dialog <em>OR</em>
* @param {HTMLElement}	el	The element representing the Dialog
* @param {Object}	userConfig	The configuration object literal containing the configuration that should be set for this Dialog. See configuration documentation for more details.
*/
YAHOO.widget.Dialog.prototype.init = function(el, userConfig) {
	YAHOO.widget.Dialog.superclass.init.call(this, el/*, userConfig*/);  // Note that we don't pass the user config in here yet because we only want it executed once, at the lowest subclass level

	this.beforeInitEvent.fire(YAHOO.widget.Dialog);

	YAHOO.util.Dom.addClass(this.element, YAHOO.widget.Dialog.CSS_DIALOG);

	this.cfg.setProperty("visible", false);

	if (userConfig) {
		this.cfg.applyConfig(userConfig, true);
	}

	this.showEvent.subscribe(this.focusFirst, this, true);
	this.beforeHideEvent.subscribe(this.blurButtons, this, true);

	this.beforeRenderEvent.subscribe(function() {
		var buttonCfg = this.cfg.getProperty("buttons");
		if (buttonCfg && buttonCfg != "none") {
			if (! this.footer) {
				this.setFooter("");
			}
		}
	}, this, true);

	this.initEvent.fire(YAHOO.widget.Dialog);
};

/**
* Performs the submission of the Dialog form depending on the value of "postmethod" property.
* @method doSubmit
*/
YAHOO.widget.Dialog.prototype.doSubmit = function() {
	var pm = this.cfg.getProperty("postmethod");
	switch (pm) {
		case "async":
			var method = this.form.getAttribute("method") || 'POST';
			method = method.toUpperCase();
			YAHOO.util.Connect.setForm(this.form);
			var cObj = YAHOO.util.Connect.asyncRequest(method, this.form.getAttribute("action"), this.callback);
			this.asyncSubmitEvent.fire();
			break;
		case "form":
			this.form.submit();
			this.formSubmitEvent.fire();
			break;
		case "none":
		case "manual":
			this.manualSubmitEvent.fire();
			break;
	}
};

/**
* @method _onFormKeyDown
* @description "keydown" event handler for the dialog's form.
* @protected
* @param {Event} p_oEvent Object representing the DOM event object passed 
* back by the event utility (YAHOO.util.Event).
*/
YAHOO.widget.Dialog.prototype._onFormKeyDown = function(p_oEvent) {

    var oTarget = YAHOO.util.Event.getTarget(p_oEvent),
        nCharCode = YAHOO.util.Event.getCharCode(p_oEvent);

    if (
        nCharCode == 13 && 
        oTarget.tagName && 
        oTarget.tagName.toUpperCase() == "INPUT"
    ) {

        var sType = oTarget.type;

        if(
            sType == "text" || sType == "password" || sType == "checkbox" || 
            sType == "radio" || sType == "file"
        ) {

            // Fire the "click" event on the dialog's default button
            this.defaultHtmlButton.click();
        
        }

    }

};

/**
* Prepares the Dialog's internal FORM object, creating one if one is not currently present.
* @method registerForm
*/
YAHOO.widget.Dialog.prototype.registerForm = function() {
	var form = this.element.getElementsByTagName("form")[0];

	if (! form) {
		var formHTML = "<form name=\"frm_" + this.id + "\" action=\"\"></form>";
		this.body.innerHTML += formHTML;
		form = this.element.getElementsByTagName("form")[0];
	}

	this.firstFormElement = function() {
		for (var f=0;f<form.elements.length;f++ ) {
			var el = form.elements[f];
			if (el.focus && ! el.disabled) {
				if (el.type && el.type != "hidden") {
					return el;
				}
			}
		}
		return null;
	}();

	this.lastFormElement = function() {
		for (var f=form.elements.length-1;f>=0;f-- ) {
			var el = form.elements[f];
			if (el.focus && ! el.disabled) {
				if (el.type && el.type != "hidden") {
					return el;
				}
			}
		}
		return null;
	}();

	this.form = form;

    if(this.form && (this.browser == "ie" || this.browser == "ie7" || this.browser == "gecko")) {

        YAHOO.util.Event.addListener(this.form, "keydown", this._onFormKeyDown, null, this);
    
    }


	if (this.cfg.getProperty("modal") && this.form) {

		var me = this;

		var firstElement = this.firstFormElement || this.firstButton;
		if (firstElement) {
			this.preventBackTab = new YAHOO.util.KeyListener(firstElement, { shift:true, keys:9 }, {fn:me.focusLast, scope:me, correctScope:true} );
			this.showEvent.subscribe(this.preventBackTab.enable, this.preventBackTab, true);
			this.hideEvent.subscribe(this.preventBackTab.disable, this.preventBackTab, true);
		}

		var lastElement = this.lastButton || this.lastFormElement;
		if (lastElement) {
			this.preventTabOut = new YAHOO.util.KeyListener(lastElement, { shift:false, keys:9 }, {fn:me.focusFirst, scope:me, correctScope:true} );
			this.showEvent.subscribe(this.preventTabOut.enable, this.preventTabOut, true);
			this.hideEvent.subscribe(this.preventTabOut.disable, this.preventTabOut, true);
		}
	}
};

// BEGIN BUILT-IN PROPERTY EVENT HANDLERS //

/**
* The default event handler fired when the "close" property is changed. The method controls the appending or hiding of the close icon at the top right of the Dialog.
* @method configClose
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Dialog.prototype.configClose = function(type, args, obj) {
	var val = args[0];

	var doCancel = function(e, obj) {
		obj.cancel();
	};

	if (val) {
		if (! this.close) {
			this.close = document.createElement("div");
			YAHOO.util.Dom.addClass(this.close, "container-close");

			this.close.innerHTML = "&#160;";
			this.innerElement.appendChild(this.close);
			YAHOO.util.Event.addListener(this.close, "click", doCancel, this);
		} else {
			this.close.style.display = "block";
		}
	} else {
		if (this.close) {
			this.close.style.display = "none";
		}
	}
};

/**
* The default event handler for the "buttons" configuration property
* @method configButtons
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Dialog.prototype.configButtons = function(type, args, obj) {
	var buttons = args[0];
	if (buttons != "none") {
		this.buttonSpan = null;
		this.buttonSpan = document.createElement("span");
		this.buttonSpan.className = "button-group";

		for (var b=0;b<buttons.length;b++) {
			var button = buttons[b];

			var htmlButton = document.createElement("button");
			htmlButton.setAttribute("type", "button");

			if (button.isDefault) {
				htmlButton.className = "default";
				this.defaultHtmlButton = htmlButton;
			}

			htmlButton.appendChild(document.createTextNode(button.text));
			YAHOO.util.Event.addListener(htmlButton, "click", button.handler, this, true);

			this.buttonSpan.appendChild(htmlButton);
			button.htmlButton = htmlButton;

			if (b === 0) {
				this.firstButton = button.htmlButton;
			}

			if (b == (buttons.length-1)) {
				this.lastButton = button.htmlButton;
			}

		}

		this.setFooter(this.buttonSpan);

		this.cfg.refireEvent("iframe");
		this.cfg.refireEvent("underlay");
	} else { // Do cleanup
		if (this.buttonSpan) {
			if (this.buttonSpan.parentNode) {
				this.buttonSpan.parentNode.removeChild(this.buttonSpan);
			}

			this.buttonSpan = null;
			this.firstButton = null;
			this.lastButton = null;
			this.defaultHtmlButton = null;
		}
	}
};


/**
* The default event handler used to focus the first field of the form when the Dialog is shown.
* @method focusFirst
*/
YAHOO.widget.Dialog.prototype.focusFirst = function(type,args,obj) {
	if (args) {
		var e = args[1];
		if (e) {
			YAHOO.util.Event.stopEvent(e);
		}
	}

	if (this.firstFormElement) {
		this.firstFormElement.focus();
	} else {
		this.focusDefaultButton();
	}
};

/**
* Sets the focus to the last button in the button or form element in the Dialog
* @method focusLast
*/
YAHOO.widget.Dialog.prototype.focusLast = function(type,args,obj) {
	if (args) {
		var e = args[1];
		if (e) {
			YAHOO.util.Event.stopEvent(e);
		}
	}

	var buttons = this.cfg.getProperty("buttons");
	if (buttons && buttons instanceof Array) {
		this.focusLastButton();
	} else {
		if (this.lastFormElement) {
			this.lastFormElement.focus();
		}
	}
};

/**
* Sets the focus to the button that is designated as the default. By default, his handler is executed when the show event is fired.
* @method focusDefaultButton
*/
YAHOO.widget.Dialog.prototype.focusDefaultButton = function() {
	if (this.defaultHtmlButton) {
		this.defaultHtmlButton.focus();
	}
};

/**
* Blurs all the html buttons
* @method blurButtons
*/
YAHOO.widget.Dialog.prototype.blurButtons = function() {
	var buttons = this.cfg.getProperty("buttons");
	if (buttons && buttons instanceof Array) {
		var html = buttons[0].htmlButton;
		if (html) {
			html.blur();
		}
	}
};

/**
* Sets the focus to the first button in the button list
* @method focusFirstButton
*/
YAHOO.widget.Dialog.prototype.focusFirstButton = function() {
	var buttons = this.cfg.getProperty("buttons");
	if (buttons && buttons instanceof Array) {
		var html = buttons[0].htmlButton;
		if (html) {
			html.focus();
		}
	}
};

/**
* Sets the focus to the first button in the button list
* @method focusLastButton
*/
YAHOO.widget.Dialog.prototype.focusLastButton = function() {
	var buttons = this.cfg.getProperty("buttons");
	if (buttons && buttons instanceof Array) {
		var html = buttons[buttons.length-1].htmlButton;
		if (html) {
			html.focus();
		}
	}
};

/**
* The default event handler for the "postmethod" configuration property
* @method configPostMethod
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Dialog.prototype.configPostMethod = function(type, args, obj) {
	var postmethod = args[0];

	this.registerForm();
	YAHOO.util.Event.addListener(this.form, "submit", function(e) {
														YAHOO.util.Event.stopEvent(e);
														this.submit();
														this.form.blur();
													  }, this, true);
};

// END BUILT-IN PROPERTY EVENT HANDLERS //

/**
* Built-in function hook for writing a validation function that will be checked for a "true" value prior to a submit. This function, as implemented by default, always returns true, so it should be overridden if validation is necessary.
* @method validate
*/
YAHOO.widget.Dialog.prototype.validate = function() {
	return true;
};

/**
* Executes a submit of the Dialog followed by a hide, if validation is successful.
* @method submit
*/
YAHOO.widget.Dialog.prototype.submit = function() {
	if (this.validate()) {
		this.beforeSubmitEvent.fire();
		this.doSubmit();
		this.submitEvent.fire();
		this.hide();
		return true;
	} else {
		return false;
	}
};

/**
* Executes the cancel of the Dialog followed by a hide.
* @method cancel
*/
YAHOO.widget.Dialog.prototype.cancel = function() {
	this.cancelEvent.fire();
	this.hide();
};

/**
* Returns a JSON-compatible data structure representing the data currently contained in the form.
* @method getData
* @return {Object} A JSON object reprsenting the data of the current form.
*/
YAHOO.widget.Dialog.prototype.getData = function() {

    var oForm = this.form;

    if(oForm) {

        var aElements = oForm.elements,
            nTotalElements = aElements.length,
            oData = {},
            sName,
            oElement,
            nElements;

        for(var i=0; i<nTotalElements; i++) {

            sName = aElements[i].name;

            function isFormElement(p_oElement) {
            
                var sTagName = p_oElement.tagName.toUpperCase();
                
                return (
                    (
                        sTagName == "INPUT" || 
                        sTagName == "TEXTAREA" || 
                        sTagName == "SELECT"
                    ) && 
                    p_oElement.name == sName
                );

            }

            /*
                Using "YAHOO.util.Dom.getElementsBy" to safeguard
                user from JS errors that result from giving a form field (or 
                set of fields) the same name as a native method of a form 
                (like "submit") or a DOM collection (such as the "item" method).
                Originally tried accessing fields via the "namedItem" method of 
                the "element" collection, but discovered that it won't return
                a collection of fields in Gecko.
            */

            oElement = YAHOO.util.Dom.getElementsBy(isFormElement, "*", oForm);
            nElements = oElement.length;

            if(nElements > 0) {

                if(nElements == 1) {

                    oElement = oElement[0];

                    var sType = oElement.type,
                        sTagName = oElement.tagName.toUpperCase();

                    switch(sTagName) {

                        case "INPUT":

                            if(sType == "checkbox") {

                                oData[sName] = oElement.checked;

                            }
                            else if(sType != "radio") {

                                oData[sName] = oElement.value;

                            }

                        break;

                        case "TEXTAREA":

                            oData[sName] = oElement.value;

                        break;

                        case "SELECT":

                            var aOptions = oElement.options,
                                nOptions = aOptions.length,
                                aValues = [],
                                oOption,
                                sValue;


                            for(var n=0; n<nOptions; n++) {

                                oOption = aOptions[n];

                                if(oOption.selected) {

                                    sValue = oOption.value;

                                    if(!sValue || sValue === "") {

                                        sValue = oOption.text;

                                    }

                                    aValues[aValues.length] = sValue;

                                }

                            }

                            oData[sName] = aValues;

                        break;

                    }


                }
                else {

                    var sType = oElement[0].type;

                    switch(sType) {

                        case "radio":

                            var oRadio;

                            for(var n=0; n<nElements; n++) {

                                oRadio = oElement[n];

                                if(oRadio.checked) {

                                    oData[sName] = oRadio.value;
                                    break;

                                }

                            }

                        break;

                        case "checkbox":

                            var aValues = [],
                                oCheckbox;

                            for(var n=0; n<nElements; n++) {

                                oCheckbox = oElement[n];

                                if(oCheckbox.checked) {

                                    aValues[aValues.length] = oCheckbox.value;

                                }

                            }

                            oData[sName] = aValues;

                        break;

                    }

                }

            }

        }

    }


    return oData;

};

/**
* Removes the Panel element from the DOM and sets all child elements to null.
* @method destroy
*/
YAHOO.widget.Dialog.prototype.destroy = function() {

    var Event = YAHOO.util.Event,
        oForm = this.form,
        oFooter = this.footer;

    if(oFooter) {

        var aButtons = oFooter.getElementsByTagName("button");

        if(aButtons && aButtons.length > 0) {

            var i = aButtons.length - 1;
            
            do {
            
                Event.purgeElement(aButtons[i], false, "click");
            
            }
            while(i--);
        
        }

    }
    

    if(oForm) {
       
        Event.purgeElement(oForm);

        this.body.removeChild(oForm);
        
        this.form = null;

    }

    YAHOO.widget.Dialog.superclass.destroy.call(this);  

};

/**
* Returns a string representation of the object.
* @method toString
* @return {String}	The string representation of the Dialog
*/
YAHOO.widget.Dialog.prototype.toString = function() {
	return "Dialog " + this.id;
};
/**
* SimpleDialog is a simple implementation of Dialog that can be used to submit a single value. Forms can be processed in 3 ways -- via an asynchronous Connection utility call, a simple form POST or GET, or manually.
* @namespace YAHOO.widget
* @class SimpleDialog
* @extends YAHOO.widget.Dialog
* @constructor
* @param {String}	el	The element ID representing the SimpleDialog <em>OR</em>
* @param {HTMLElement}	el	The element representing the SimpleDialog
* @param {Object}	userConfig	The configuration object literal containing the configuration that should be set for this SimpleDialog. See configuration documentation for more details.
*/
YAHOO.widget.SimpleDialog = function(el, userConfig) {
	YAHOO.widget.SimpleDialog.superclass.constructor.call(this, el, userConfig);
};

YAHOO.extend(YAHOO.widget.SimpleDialog, YAHOO.widget.Dialog);

/**
* Constant for the standard network icon for a blocking action
* @property YAHOO.widget.SimpleDialog.ICON_BLOCK
* @static
* @final
* @type String
*/
YAHOO.widget.SimpleDialog.ICON_BLOCK = "blckicon";

/**
* Constant for the standard network icon for alarm
* @property YAHOO.widget.SimpleDialog.ICON_ALARM
* @static
* @final
* @type String
*/
YAHOO.widget.SimpleDialog.ICON_ALARM = "alrticon";

/**
* Constant for the standard network icon for help
* @property YAHOO.widget.SimpleDialog.ICON_HELP
* @static
* @final
* @type String
*/
YAHOO.widget.SimpleDialog.ICON_HELP  = "hlpicon";

/**
* Constant for the standard network icon for info
* @property YAHOO.widget.SimpleDialog.ICON_INFO
* @static
* @final
* @type String
*/
YAHOO.widget.SimpleDialog.ICON_INFO  = "infoicon";

/**
* Constant for the standard network icon for warn
* @property YAHOO.widget.SimpleDialog.ICON_WARN
* @static
* @final
* @type String
*/
YAHOO.widget.SimpleDialog.ICON_WARN  = "warnicon";

/**
* Constant for the standard network icon for a tip
* @property YAHOO.widget.SimpleDialog.ICON_TIP
* @static
* @final
* @type String
*/
YAHOO.widget.SimpleDialog.ICON_TIP   = "tipicon";

/**
* Constant representing the default CSS class used for a SimpleDialog
* @property YAHOO.widget.SimpleDialog.CSS_SIMPLEDIALOG
* @static
* @final
* @type String
*/
YAHOO.widget.SimpleDialog.CSS_SIMPLEDIALOG = "yui-simple-dialog";

/**
* Constant representing the SimpleDialog's configuration properties
* @property YAHOO.widget.SimpleDialog._DEFAULT_CONFIG
* @private
* @final
* @type Object
*/
YAHOO.widget.SimpleDialog._DEFAULT_CONFIG = {

    "ICON": { 
        key: "icon", 
        value:"none", 
        suppressEvent:true  
    },

    "TEXT": { 
        key: "text", 
        value:"", 
        suppressEvent:true, 
        supercedes:["icon"] 
    }

};

/**
* Initializes the class's configurable properties which can be changed using the SimpleDialog's Config object (cfg).
* @method initDefaultConfig
*/
YAHOO.widget.SimpleDialog.prototype.initDefaultConfig = function() {
	YAHOO.widget.SimpleDialog.superclass.initDefaultConfig.call(this);

	// Add dialog config properties //

    var DEFAULT_CONFIG = YAHOO.widget.SimpleDialog._DEFAULT_CONFIG;

	/**
	* Sets the informational icon for the SimpleDialog
	* @config icon
	* @type String
	* @default "none"
	*/
	this.cfg.addProperty(
                DEFAULT_CONFIG.ICON.key,
                {
                    handler: this.configIcon,
                    value: DEFAULT_CONFIG.ICON.value,
                    suppressEvent: DEFAULT_CONFIG.ICON.suppressEvent
                }
            );

	/**
	* Sets the text for the SimpleDialog
	* @config text
	* @type String
	* @default ""
	*/
    this.cfg.addProperty(
                DEFAULT_CONFIG.TEXT.key,	
                { 
                    handler: this.configText, 
                    value: DEFAULT_CONFIG.TEXT.value, 
                    suppressEvent: DEFAULT_CONFIG.TEXT.suppressEvent, 
                    supercedes: DEFAULT_CONFIG.TEXT.supercedes 
                } 
            );

};


/**
* The SimpleDialog initialization method, which is executed for SimpleDialog and all of its subclasses. This method is automatically called by the constructor, and  sets up all DOM references for pre-existing markup, and creates required markup if it is not already present.
* @method init
* @param {String}	el	The element ID representing the SimpleDialog <em>OR</em>
* @param {HTMLElement}	el	The element representing the SimpleDialog
* @param {Object}	userConfig	The configuration object literal containing the configuration that should be set for this SimpleDialog. See configuration documentation for more details.
*/
YAHOO.widget.SimpleDialog.prototype.init = function(el, userConfig) {
	YAHOO.widget.SimpleDialog.superclass.init.call(this, el/*, userConfig*/);  // Note that we don't pass the user config in here yet because we only want it executed once, at the lowest subclass level

	this.beforeInitEvent.fire(YAHOO.widget.SimpleDialog);

	YAHOO.util.Dom.addClass(this.element, YAHOO.widget.SimpleDialog.CSS_SIMPLEDIALOG);

	this.cfg.queueProperty("postmethod", "manual");

	if (userConfig) {
		this.cfg.applyConfig(userConfig, true);
	}

	this.beforeRenderEvent.subscribe(function() {
		if (! this.body) {
			this.setBody("");
		}
	}, this, true);

	this.initEvent.fire(YAHOO.widget.SimpleDialog);

};
/**
* Prepares the SimpleDialog's internal FORM object, creating one if one is not currently present, and adding the value hidden field.
* @method registerForm
*/
YAHOO.widget.SimpleDialog.prototype.registerForm = function() {
	YAHOO.widget.SimpleDialog.superclass.registerForm.call(this);
	this.form.innerHTML += "<input type=\"hidden\" name=\"" + this.id + "\" value=\"\"/>";
};

// BEGIN BUILT-IN PROPERTY EVENT HANDLERS //

/**
* Fired when the "icon" property is set.
* @method configIcon
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.SimpleDialog.prototype.configIcon = function(type,args,obj) {
	var icon = args[0];
	if (icon && icon != "none") {
		var iconHTML = "";
		if (icon.indexOf(".") == -1) {
			iconHTML = "<span class=\"yui-icon " + icon +"\" >&#160;</span>";
		} else {
			iconHTML = "<img src=\"" + this.imageRoot + icon + "\" class=\"yui-icon\" />";
		}
		this.body.innerHTML = iconHTML + this.body.innerHTML;
	}
};

/**
* Fired when the "text" property is set.
* @method configText
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.SimpleDialog.prototype.configText = function(type,args,obj) {
	var text = args[0];
	if (text) {
		this.setBody(text);
		this.cfg.refireEvent("icon");
	}
};
// END BUILT-IN PROPERTY EVENT HANDLERS //

/**
* Returns a string representation of the object.
* @method toString
* @return {String}	The string representation of the SimpleDialog
*/
YAHOO.widget.SimpleDialog.prototype.toString = function() {
	return "SimpleDialog " + this.id;
};
/**
* ContainerEffect encapsulates animation transitions that are executed when an Overlay is shown or hidden.
* @namespace YAHOO.widget
* @class ContainerEffect
* @constructor
* @param {YAHOO.widget.Overlay}	overlay		The Overlay that the animation should be associated with
* @param {Object}	attrIn		The object literal representing the animation arguments to be used for the animate-in transition. The arguments for this literal are: attributes(object, see YAHOO.util.Anim for description), duration(Number), and method(i.e. YAHOO.util.Easing.easeIn).
* @param {Object}	attrOut		The object literal representing the animation arguments to be used for the animate-out transition. The arguments for this literal are: attributes(object, see YAHOO.util.Anim for description), duration(Number), and method(i.e. YAHOO.util.Easing.easeIn).
* @param {HTMLElement}	targetElement	Optional. The target element that should be animated during the transition. Defaults to overlay.element.
* @param {class}	Optional. The animation class to instantiate. Defaults to YAHOO.util.Anim. Other options include YAHOO.util.Motion.
*/
YAHOO.widget.ContainerEffect = function(overlay, attrIn, attrOut, targetElement, animClass) {
	if (! animClass) {
		animClass = YAHOO.util.Anim;
	}

	/**
	* The overlay to animate
	* @property overlay
	* @type YAHOO.widget.Overlay
	*/
	this.overlay = overlay;
	/**
	* The animation attributes to use when transitioning into view
	* @property attrIn
	* @type Object
	*/
	this.attrIn = attrIn;
	/**
	* The animation attributes to use when transitioning out of view
	* @property attrOut
	* @type Object
	*/
	this.attrOut = attrOut;
	/**
	* The target element to be animated
	* @property targetElement
	* @type HTMLElement
	*/
	this.targetElement = targetElement || overlay.element;
	/**
	* The animation class to use for animating the overlay
	* @property animClass
	* @type class
	*/
	this.animClass = animClass;
};

/**
* Initializes the animation classes and events.
* @method init
*/
YAHOO.widget.ContainerEffect.prototype.init = function() {
	this.beforeAnimateInEvent = new YAHOO.util.CustomEvent("beforeAnimateIn", this);
	this.beforeAnimateOutEvent = new YAHOO.util.CustomEvent("beforeAnimateOut", this);

	this.animateInCompleteEvent = new YAHOO.util.CustomEvent("animateInComplete", this);
	this.animateOutCompleteEvent = new YAHOO.util.CustomEvent("animateOutComplete", this);

	this.animIn = new this.animClass(this.targetElement, this.attrIn.attributes, this.attrIn.duration, this.attrIn.method);
	this.animIn.onStart.subscribe(this.handleStartAnimateIn, this);
	this.animIn.onTween.subscribe(this.handleTweenAnimateIn, this);
	this.animIn.onComplete.subscribe(this.handleCompleteAnimateIn, this);

	this.animOut = new this.animClass(this.targetElement, this.attrOut.attributes, this.attrOut.duration, this.attrOut.method);
	this.animOut.onStart.subscribe(this.handleStartAnimateOut, this);
	this.animOut.onTween.subscribe(this.handleTweenAnimateOut, this);
	this.animOut.onComplete.subscribe(this.handleCompleteAnimateOut, this);
};

/**
* Triggers the in-animation.
* @method animateIn
*/
YAHOO.widget.ContainerEffect.prototype.animateIn = function() {
	this.beforeAnimateInEvent.fire();
	this.animIn.animate();
};

/**
* Triggers the out-animation.
* @method animateOut
*/
YAHOO.widget.ContainerEffect.prototype.animateOut = function() {
	this.beforeAnimateOutEvent.fire();
	this.animOut.animate();
};

/**
* The default onStart handler for the in-animation.
* @method handleStartAnimateIn
* @param {String} type	The CustomEvent type
* @param {Object[]}	args	The CustomEvent arguments
* @param {Object} obj	The scope object
*/
YAHOO.widget.ContainerEffect.prototype.handleStartAnimateIn = function(type, args, obj) { };
/**
* The default onTween handler for the in-animation.
* @method handleTweenAnimateIn
* @param {String} type	The CustomEvent type
* @param {Object[]}	args	The CustomEvent arguments
* @param {Object} obj	The scope object
*/
YAHOO.widget.ContainerEffect.prototype.handleTweenAnimateIn = function(type, args, obj) { };
/**
* The default onComplete handler for the in-animation.
* @method handleCompleteAnimateIn
* @param {String} type	The CustomEvent type
* @param {Object[]}	args	The CustomEvent arguments
* @param {Object} obj	The scope object
*/
YAHOO.widget.ContainerEffect.prototype.handleCompleteAnimateIn = function(type, args, obj) { };

/**
* The default onStart handler for the out-animation.
* @method handleStartAnimateOut
* @param {String} type	The CustomEvent type
* @param {Object[]}	args	The CustomEvent arguments
* @param {Object} obj	The scope object
*/
YAHOO.widget.ContainerEffect.prototype.handleStartAnimateOut = function(type, args, obj) { };
/**
* The default onTween handler for the out-animation.
* @method handleTweenAnimateOut
* @param {String} type	The CustomEvent type
* @param {Object[]}	args	The CustomEvent arguments
* @param {Object} obj	The scope object
*/
YAHOO.widget.ContainerEffect.prototype.handleTweenAnimateOut = function(type, args, obj) { };
/**
* The default onComplete handler for the out-animation.
* @method handleCompleteAnimateOut
* @param {String} type	The CustomEvent type
* @param {Object[]}	args	The CustomEvent arguments
* @param {Object} obj	The scope object
*/
YAHOO.widget.ContainerEffect.prototype.handleCompleteAnimateOut = function(type, args, obj) { };

/**
* Returns a string representation of the object.
* @method toString
* @return {String}	The string representation of the ContainerEffect
*/
YAHOO.widget.ContainerEffect.prototype.toString = function() {
	var output = "ContainerEffect";
	if (this.overlay) {
		output += " [" + this.overlay.toString() + "]";
	}
	return output;
};

/**
* A pre-configured ContainerEffect instance that can be used for fading an overlay in and out.
* @method FADE
* @static
* @param {Overlay}	overlay	The Overlay object to animate
* @param {Number}	dur	The duration of the animation
* @return {ContainerEffect}	The configured ContainerEffect object
*/
YAHOO.widget.ContainerEffect.FADE = function(overlay, dur) {
	var fade = new YAHOO.widget.ContainerEffect(overlay, { attributes:{opacity: {from:0, to:1}}, duration:dur, method:YAHOO.util.Easing.easeIn }, { attributes:{opacity: {to:0}}, duration:dur, method:YAHOO.util.Easing.easeOut}, overlay.element );

	fade.handleStartAnimateIn = function(type,args,obj) {
		YAHOO.util.Dom.addClass(obj.overlay.element, "hide-select");

		if (! obj.overlay.underlay) {
			obj.overlay.cfg.refireEvent("underlay");
		}

		if (obj.overlay.underlay) {
			obj.initialUnderlayOpacity = YAHOO.util.Dom.getStyle(obj.overlay.underlay, "opacity");
			obj.overlay.underlay.style.filter = null;
		}

		YAHOO.util.Dom.setStyle(obj.overlay.element, "visibility", "visible");
		YAHOO.util.Dom.setStyle(obj.overlay.element, "opacity", 0);
	};

	fade.handleCompleteAnimateIn = function(type,args,obj) {
		YAHOO.util.Dom.removeClass(obj.overlay.element, "hide-select");

		if (obj.overlay.element.style.filter) {
			obj.overlay.element.style.filter = null;
		}

		if (obj.overlay.underlay) {
			YAHOO.util.Dom.setStyle(obj.overlay.underlay, "opacity", obj.initialUnderlayOpacity);
		}

		obj.overlay.cfg.refireEvent("iframe");
		obj.animateInCompleteEvent.fire();
	};

	fade.handleStartAnimateOut = function(type, args, obj) {
		YAHOO.util.Dom.addClass(obj.overlay.element, "hide-select");

		if (obj.overlay.underlay) {
			obj.overlay.underlay.style.filter = null;
		}
	};

	fade.handleCompleteAnimateOut =  function(type, args, obj) {
		YAHOO.util.Dom.removeClass(obj.overlay.element, "hide-select");
		if (obj.overlay.element.style.filter) {
			obj.overlay.element.style.filter = null;
		}
		YAHOO.util.Dom.setStyle(obj.overlay.element, "visibility", "hidden");
		YAHOO.util.Dom.setStyle(obj.overlay.element, "opacity", 1);

		obj.overlay.cfg.refireEvent("iframe");

		obj.animateOutCompleteEvent.fire();
	};

	fade.init();
	return fade;
};


/**
* A pre-configured ContainerEffect instance that can be used for sliding an overlay in and out.
* @method SLIDE
* @static
* @param {Overlay}	overlay	The Overlay object to animate
* @param {Number}	dur	The duration of the animation
* @return {ContainerEffect}	The configured ContainerEffect object
*/
YAHOO.widget.ContainerEffect.SLIDE = function(overlay, dur) {
	var x = overlay.cfg.getProperty("x") || YAHOO.util.Dom.getX(overlay.element);
	var y = overlay.cfg.getProperty("y") || YAHOO.util.Dom.getY(overlay.element);

	var clientWidth = YAHOO.util.Dom.getClientWidth();
	var offsetWidth = overlay.element.offsetWidth;

	var slide = new YAHOO.widget.ContainerEffect(overlay, {
															attributes:{ points: { to:[x, y] } },
															duration:dur,
															method:YAHOO.util.Easing.easeIn
														},
														{
															attributes:{ points: { to:[(clientWidth+25), y] } },
															duration:dur,
															method:YAHOO.util.Easing.easeOut
														},
														overlay.element,
														YAHOO.util.Motion);


	slide.handleStartAnimateIn = function(type,args,obj) {
		obj.overlay.element.style.left = (-25-offsetWidth) + "px";
		obj.overlay.element.style.top  = y + "px";
	};

	slide.handleTweenAnimateIn = function(type, args, obj) {


		var pos = YAHOO.util.Dom.getXY(obj.overlay.element);

		var currentX = pos[0];
		var currentY = pos[1];

		if (YAHOO.util.Dom.getStyle(obj.overlay.element, "visibility") == "hidden" && currentX < x) {
			YAHOO.util.Dom.setStyle(obj.overlay.element, "visibility", "visible");
		}

		obj.overlay.cfg.setProperty("xy", [currentX,currentY], true);
		obj.overlay.cfg.refireEvent("iframe");
	};

	slide.handleCompleteAnimateIn = function(type, args, obj) {
		obj.overlay.cfg.setProperty("xy", [x,y], true);
		obj.startX = x;
		obj.startY = y;
		obj.overlay.cfg.refireEvent("iframe");
		obj.animateInCompleteEvent.fire();
	};

	slide.handleStartAnimateOut = function(type, args, obj) {
		var vw = YAHOO.util.Dom.getViewportWidth();

		var pos = YAHOO.util.Dom.getXY(obj.overlay.element);

		var yso = pos[1];

		var currentTo = obj.animOut.attributes.points.to;
		obj.animOut.attributes.points.to = [(vw+25), yso];
	};

	slide.handleTweenAnimateOut = function(type, args, obj) {
		var pos = YAHOO.util.Dom.getXY(obj.overlay.element);

		var xto = pos[0];
		var yto = pos[1];

		obj.overlay.cfg.setProperty("xy", [xto,yto], true);
		obj.overlay.cfg.refireEvent("iframe");
	};

	slide.handleCompleteAnimateOut = function(type, args, obj) {
		YAHOO.util.Dom.setStyle(obj.overlay.element, "visibility", "hidden");

		obj.overlay.cfg.setProperty("xy", [x,y]);
		obj.animateOutCompleteEvent.fire();
	};

	slide.init();
	return slide;
};
YAHOO.register("container", YAHOO.widget.Module, {version: "2.2.2", build: "204"});
