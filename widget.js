/* global requirejs cprequire cpdefine chilipeppr THREE */
// Defining the globals above helps Cloud9 not show warnings for those variables

// ChiliPeppr Widget/Element Javascript

// Constants
var URL_SERVLET = "//chilipeppr-servlet-c9-bastianf.c9users.io/SenschiliServlet/packet";
var TIMEOUT = 20000;


// For handling sending of http request sequentially
// TODO use something more sophisticated
// kue looks promising
// check out this: https://wiredcraft.com/blog/parallel-sequential-job-queue-redis-kue/
var queue = [];
var busy = false;


function postServletRecString(data, sUrl, timeout){
    console.error("URL: " + sUrl);
    var xhr = new XMLHttpRequest();
    xhr.ontimeout = function () {
        console.error("The request for " + sUrl + " timed out.");
    };
    xhr.onload = function (oEvent) {
        console.error("response text");
        console.error(xhr.responseText);
        var jsonResponse = JSON.parse(xhr.responseText);
        console.error("valid");
        console.error(jsonResponse.data.valid);
        if (jsonResponse.data.valid) {
            chilipeppr.publish("/com-chilipeppr-widget-serialport/send", jsonResponse.data.payload);
        }
        if(queue.length) {
            // run the next queued item
            postServletRecString(queue.shift(), URL_SERVLET, TIMEOUT);
        } else {
            busy = false;
        }
    };
    xhr.responseType = "text";
    // Necessary to maintain session credentials using cross domain requests
    xhr.withCredentials = true;
    xhr.open("POST", sUrl, true);
    xhr.timeout = timeout;
    console.error("data to send: " + JSON.stringify(data));
    xhr.send(JSON.stringify(data));
    
}


requirejs.config({
    /*
    Dependencies can be defined here. ChiliPeppr uses require.js so
    please refer to http://requirejs.org/docs/api.html for info.
    
    Most widgets will not need to define Javascript dependencies.
    
    Make sure all URLs are https and http accessible. Try to use URLs
    that start with // rather than http:// or https:// so they simply
    use whatever method the main page uses.
    
    Also, please make sure you are not loading dependencies from different
    URLs that other widgets may already load like jquery, bootstrap,
    three.js, etc.
    
    You may slingshot content through ChiliPeppr's proxy URL if you desire
    to enable SSL for non-SSL URL's. ChiliPeppr's SSL URL is
    https://i2dcui.appspot.com which is the SSL equivalent for
    http://chilipeppr.com
    */
    paths: {
        // Example of how to define the key (you make up the key) and the URL
        // Make sure you DO NOT put the .js at the end of the URL
        // SmoothieCharts: '//smoothiecharts.org/smoothie',
    },
    shim: {
        // See require.js docs for how to define dependencies that
        // should be loaded before your script/widget.
    }
});

cprequire_test(["inline:com-senscape-widget-bootloader"], function(myWidget) {

    // Test this element. This code is auto-removed by the chilipeppr.load()
    // when using this widget in production. So use the cpquire_test to do things
    // you only want to have happen during testing, like loading other widgets or
    // doing unit tests. Don't remove end_test at the end or auto-remove will fail.

    // Please note that if you are working on multiple widgets at the same time
    // you may need to use the ?forcerefresh=true technique in the URL of
    // your test widget to force the underlying chilipeppr.load() statements
    // to referesh the cache. For example, if you are working on an Add-On
    // widget to the Eagle BRD widget, but also working on the Eagle BRD widget
    // at the same time you will have to make ample use of this technique to
    // get changes to load correctly. If you keep wondering why you're not seeing
    // your changes, try ?forcerefresh=true as a get parameter in your URL.

    console.log("test running of " + myWidget.id);

    $('body').prepend('<div id="testDivForFlashMessageWidget"></div>');

    chilipeppr.load(
        "#testDivForFlashMessageWidget",
        "http://fiddle.jshell.net/chilipeppr/90698kax/show/light/",
        function() {
            console.log("mycallback got called after loading flash msg module");
            cprequire(["inline:com-chilipeppr-elem-flashmsg"], function(fm) {
                //console.log("inside require of " + fm.id);
                fm.init();
            });
        }
    );

    // init my widget
    myWidget.init();
    $('#' + myWidget.id).css('margin', '20px');
    $('title').html(myWidget.name);

} /*end_test*/ );

// This is the main definition of your widget. Give it a unique name.
cpdefine("inline:com-senscape-widget-bootloader", ["chilipeppr_ready", /* other dependencies here */ ], function() {
    return {
        /**
         * The ID of the widget. You must define this and make it unique.
         */
        id: "com-senscape-widget-bootloader", // Make the id the same as the cpdefine id
        name: "Widget / Senscape Bootloader", // The descriptive name of your widget.
        desc: "Widget to upload programs to Senscape Boards.", // A description of what your widget does
        url: "(auto fill by runme.js)",       // The final URL of the working widget as a single HTML file with CSS and Javascript inlined. You can let runme.js auto fill this if you are using Cloud9.
        fiddleurl: "(auto fill by runme.js)", // The edit URL. This can be auto-filled by runme.js in Cloud9 if you'd like, or just define it on your own to help people know where they can edit/fork your widget
        githuburl: "(auto fill by runme.js)", // The backing github repo
        testurl: "(auto fill by runme.js)",   // The standalone working widget so can view it working by itself
        /**
         * Define pubsub signals below. These are basically ChiliPeppr's event system.
         * ChiliPeppr uses amplify.js's pubsub system so please refer to docs at
         * http://amplifyjs.com/api/pubsub/
         */
        /**
         * Define the publish signals that this widget/element owns or defines so that
         * other widgets know how to subscribe to them and what they do.
         */
        publish: {
            // Define a key:value pair here as strings to document what signals you publish.
           // '/onExampleGenerate': 'Example: Publish this signal when we go to generate gcode.'
        },
        /**
         * Define the subscribe signals that this widget/element owns or defines so that
         * other widgets know how to subscribe to them and what they do.
         */
        subscribe: {
            // Define a key:value pair here as strings to document what signals you subscribe to
            // so other widgets can publish to this widget to have it do something.
            // '/onExampleConsume': 'Example: This widget subscribe to this signal so other widgets can send to us and we'll do something with it.'
        },
        /**
         * Document the foreign publish signals, i.e. signals owned by other widgets
         * or elements, that this widget/element publishes to.
         */
        foreignPublish: {
            // Define a key:value pair here as strings to document what signals you publish to
            // that are owned by foreign/other widgets.
            // '/jsonSend': 'Example: We send Gcode to the serial port widget to do stuff with the CNC controller.'
        },
        /**
         * Document the foreign subscribe signals, i.e. signals owned by other widgets
         * or elements, that this widget/element subscribes to.
         */
        foreignSubscribe: {
            // Define a key:value pair here as strings to document what signals you subscribe to
            // that are owned by foreign/other widgets.
            // '/com-chilipeppr-elem-dragdrop/ondropped': 'Example: We subscribe to this signal at a higher priority to intercept the signal. We do not let it propagate by returning false.'
                  //       '/com-chilipeppr-widget-serialport/recvline': "(High-level mode) When in high-level mode, i.e. setSinglePortMode(), this is the signal we receive incoming serial data on. This signal sends us data in a per-line format so we do not have to piece the data together like we do in low-level mode.",

        },
        /**
         * All widgets should have an init method. It should be run by the
         * instantiating code like a workspace or a different widget.
         */
        init: function() {
            console.log("I am being initted. Thanks.");

            this.setupUiFromLocalStorage();
            this.btnSetup();
            this.forkSetup();
            this.loadDropTestWidget();
            chilipeppr.subscribe("/com-chilipeppr-widget-serialport/recvline", this, this.onRecvLine);

            console.log("I am done being initted.");
        },
        /**
         * Call this method from init to setup all the buttons when this widget
         * is first loaded. This basically attaches click events to your 
         * buttons. It also turns on all the bootstrap popovers by scanning
         * the entire DOM of the widget.
         */
        btnSetup: function() {

            // Chevron hide/show body
            var that = this;
            $('#' + this.id + ' .hidebody').click(function(evt) {
                console.log("hide/unhide body");
                if ($('#' + that.id + ' .panel-body').hasClass('hidden')) {
                    // it's hidden, unhide
                    that.showBody(evt);
                }
                else {
                    // hide
                    that.hideBody(evt);
                }
            });

            // Ask bootstrap to scan all the buttons in the widget to turn
            // on popover menus
            $('#' + this.id + ' .btn').popover({
                delay: 1000,
                animation: true,
                placement: "auto",
                trigger: "hover",
                container: 'body'
            });
             
            // This buttons tests the connection to the Tomcat server where the servlet is hosted.
            // It returns the status of the server.
            $('#' + this.id + ' .btn-tomcat-test').click(this.onTomcatBtnClick.bind(this));
            
            // Init Hello World 2 button on Tab 1. Notice the use
            // of the slick .bind(this) technique to correctly set "this"
            // when the callback is called
            $('#' + this.id + ' .btn-message-test').click(this.onMessageTestBtnClick.bind(this));
            
            $('#' + this.id + ' .btn-servlet-test').click(this.onServletTestBtnClick.bind(this));

            $('#' + this.id + ' .btn-reprogram').click(this.onReprogramBtnClick.bind(this));

        },
        isAlreadySubscribedToWsRecv: false,
        consoleSubscribeToLowLevelSerial: function() {
            // subscribe to websocket events
            if (this.isAlreadySubscribedToWsRecv) {
                console.warn("already subscribed to /ws/recv in console, so not subscribing again");
            } else {
                this.isAlreadySubscribedToWsRecv = true;
                chilipeppr.subscribe("/com-chilipeppr-widget-serialport/ws/recv", this, function(msg) {
            
                    // make sure the data is for the port we're bound to
            //        if (msg.match(/^\{/)) {
                        // it's json
                        //console.log("it is json");
                        var data = $.parseJSON(msg);
                        if (this.portBoundTo && this.portBoundTo.Name && data.P && data.P == this.portBoundTo.Name) {
                            // this is our serial port data
                            var d = data.D;
                        }
            //        }
                });
            }
        },
        /**
         * onTomcatBtnClick shows status of the Tomcat server in a popup message
         */
        onTomcatBtnClick: function(evt) {
            console.log("saying hello 2 from btn in tab 1");
            var xmlHttp = new XMLHttpRequest();
            console.log("request created");
            xmlHttp.open( "GET", "https://chilipeppr-servlet-c9-bastianf.c9users.io/examples/servlets/servlet/RequestInfoExample", false ); // false for synchronous request
            xmlHttp.send( null );
            var response = xmlHttp.responseText;
            chilipeppr.publish(
                '/com-chilipeppr-elem-flashmsg/flashmsg',
                "Tomcat Server Status",
                //       "Hello Worl from Tab 1 from widget " + this.id,
                response,
                2000 /* show for 2 second */
            );
        },
        /**
         * onMessageTestBtnClick sends a binary test message to the Senscape Board
         */
        onMessageTestBtnClick: function(evt) {
            // chilipeppr.publish("/com-chilipeppr-widget-serialport/send", "test\n");
            chilipeppr.publish("/com-chilipeppr-widget-serialport/send", "C045000A0000FF080123456789ABCDEF7573C0");
            // chilipeppr.publish("/com-chilipeppr-widget-serialport/send", "C045000A000D0A080F1E2D3C4B5A69787B8FC0");
            // chilipeppr.publish("/com-chilipeppr-widget-serialport/send", "C045000A000A0D080F1E2D3C4B5A69783CBAC0");
            // chilipeppr.publish("/com-chilipeppr-widget-serialport/send", "C045000A000A00080F1E2D3C4B5A69780732C0");
            // chilipeppr.publish("/com-chilipeppr-widget-serialport/send", "C045000A000D00080F1E2D3C4B5A6978BA1BC0");
        },
        /**
         * onMessageTestBtnClick sends a binary test message to the Senscape Board
         */
        onReprogramBtnClick: function move(evt) {
            console.error("reprogram");
            var elem = document.getElementById("progbar");
            var width = 10;
            var id = setInterval(frame, 10);
            function frame() {
                if (width >= 100) {
                    clearInterval(id);
                } else {
                    width++;
                    elem.style.width = width + '%';
                    //elem.innerHTML = width * 1 + '%';
                }
            }
        },
    /**
         * onServletTestBtnClick sends a test message to the servlet 
         */
        onServletTestBtnClick: function(evt) {
            console.error("Servlet Test");
            var message = {"data": "test"};
            postServletRecString(message, URL_SERVLET, 20000);
        },
        onRecvLine: function(data) {
            console.error("received!");
            var arrayBuffer = data.dataline;
            arrayBuffer = arrayBuffer.substring(0, arrayBuffer.length - 1);
            console.error("data: " + arrayBuffer);
            if(busy) {
                queue.push(arrayBuffer);
            }
            else {
                busy = true;
                postServletRecString(arrayBuffer, URL_SERVLET, TIMEOUT);
            }
        },
        /**
         * User options are available in this property for reference by your
         * methods. If any change is made on these options, please call
         * saveOptionsLocalStorage()
         */
        options: null,
        /**
         * Call this method on init to setup the UI by reading the user's
         * stored settings from localStorage and then adjust the UI to reflect
         * what the user wants.
         */
        setupUiFromLocalStorage: function() {

            // Read vals from localStorage. Make sure to use a unique
            // key specific to this widget so as not to overwrite other
            // widgets' options. By using this.id as the prefix of the
            // key we're safe that this will be unique.

            // Feel free to add your own keys inside the options 
            // object for your own items

            var options = localStorage.getItem(this.id + '-options');

            if (options) {
                options = $.parseJSON(options);
                console.log("just evaled options: ", options);
            }
            else {
                options = {
                    showBody: true,
                    tabShowing: 1,
                    customParam1: null,
                    customParam2: 1.0
                };
            }

            this.options = options;
            console.log("options:", options);

            // show/hide body
            if (options.showBody) {
                this.showBody();
            }
            else {
                this.hideBody();
            }

        },
        /**
         * When a user changes a value that is stored as an option setting, you
         * should call this method immediately so that on next load the value
         * is correctly set.
         */
        saveOptionsLocalStorage: function() {
            // You can add your own values to this.options to store them
            // along with some of the normal stuff like showBody
            var options = this.options;

            var optionsStr = JSON.stringify(options);
            console.log("saving options:", options, "json.stringify:", optionsStr);
            // store settings to localStorage
            localStorage.setItem(this.id + '-options', optionsStr);
        },
        /**
         * Show the body of the panel.
         * @param {jquery_event} evt - If you pass the event parameter in, we 
         * know it was clicked by the user and thus we store it for the next 
         * load so we can reset the user's preference. If you don't pass this 
         * value in we don't store the preference because it was likely code 
         * that sent in the param.
         */
        showBody: function(evt) {
            $('#' + this.id + ' .panel-body').removeClass('hidden');
            $('#' + this.id + ' .panel-footer').removeClass('hidden');
            $('#' + this.id + ' .hidebody span').addClass('glyphicon-chevron-up');
            $('#' + this.id + ' .hidebody span').removeClass('glyphicon-chevron-down');
            if (!(evt == null)) {
                this.options.showBody = true;
                this.saveOptionsLocalStorage();
            }
            // this will send an artificial event letting other widgets know to resize
            // themselves since this widget is now taking up more room since it's showing
            $(window).trigger("resize");
        },
        /**
         * Hide the body of the panel.
         * @param {jquery_event} evt - If you pass the event parameter in, we 
         * know it was clicked by the user and thus we store it for the next 
         * load so we can reset the user's preference. If you don't pass this 
         * value in we don't store the preference because it was likely code 
         * that sent in the param.
         */
        hideBody: function(evt) {
            $('#' + this.id + ' .panel-body').addClass('hidden');
            $('#' + this.id + ' .panel-footer').addClass('hidden');
            $('#' + this.id + ' .hidebody span').removeClass('glyphicon-chevron-up');
            $('#' + this.id + ' .hidebody span').addClass('glyphicon-chevron-down');
            if (!(evt == null)) {
                this.options.showBody = false;
                this.saveOptionsLocalStorage();
            }
            // this will send an artificial event letting other widgets know to resize
            // themselves since this widget is now taking up less room since it's hiding
            $(window).trigger("resize");
        },
        /**
         * This method loads the pubsubviewer widget which attaches to our 
         * upper right corner triangle menu and generates 3 menu items like
         * Pubsub Viewer, View Standalone, and Fork Widget. It also enables
         * the modal dialog that shows the documentation for this widget.
         * 
         * By using chilipeppr.load() we can ensure that the pubsubviewer widget
         * is only loaded and inlined once into the final ChiliPeppr workspace.
         * We are given back a reference to the instantiated singleton so its
         * not instantiated more than once. Then we call it's attachTo method
         * which creates the full pulldown menu for us and attaches the click
         * events.
         */
        forkSetup: function() {
            var topCssSelector = '#' + this.id;

            $(topCssSelector + ' .panel-title').popover({
                title: this.name,
                content: this.desc,
                html: true,
                delay: 1000,
                animation: true,
                trigger: 'hover',
                placement: 'auto'
            });

            var that = this;
            chilipeppr.load("http://fiddle.jshell.net/chilipeppr/zMbL9/show/light/", function() {
                require(['inline:com-chilipeppr-elem-pubsubviewer'], function(pubsubviewer) {
                    pubsubviewer.attachTo($(topCssSelector + ' .panel-heading .dropdown-menu'), that);
                });
            });

        },
                        /**
         * Load Senscape Bootloader Wedget via chilipeppr.load()
         */
        loadDropTestWidget: function(callback) {
            chilipeppr.load(
                "#drop-test-widget-instance",
                "http://raw.githubusercontent.com/bastian-f/elem-dragdrop/master/auto-generated-widget.html",
                function() {
                // Callback after widget loaded into #myDivElemDragdrop
                // Now use require.js to get reference to instantiated widget
                    cprequire(
                        ["inline:com-chilipeppr-elem-dragdrop"], // the id you gave your widget
                        function(myObjElemDragdrop) {
                            // Callback that is passed reference to the newly loaded widget
                            console.log("Element / Drag Drop just got loaded.", myObjElemDragdrop);
                            myObjElemDragdrop.init();
                        }
                    );
                }
            );
        },

    };
});