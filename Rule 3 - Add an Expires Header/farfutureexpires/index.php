<html>
<head>
<title>Far Future Expires</title>

<link rel="stylesheet" href="testsm-expiresoff.css" type="text/css">
<script src="testsma-expiresoff.js"></script>
<script src="testsmb-expiresoff.js"></script>
<script src="testsmc-expiresoff.js"></script>
<style>
/* Yahoo! CSS reset ... see developer.yahoo.com/yui for details */
body,div,dl,dt,dd,h1,h2,h3,h4,h5,h6,pre,form,fieldset,input,blockquote,th,td{margin:0;padding:0;}table{border-collapse:collapse;border-spacing:0;}fieldset,img{border:0;}address,caption,cite,code,dfn,em,strong,th,var{font-style:normal;font-weight:normal;}caption,th {text-align:left;}h1,h2,h3,h4,h5,h6{font-size:100%;}q:before,q:after{content:'';}
/* Yahoo! font reset ... see developer.yahoo.com/yui for details */
body {font:13px arial,helvetica,clean,sans-serif;*font-size:small;*font:x-small;}table {font-size:inherit;font:100%;}select, input, textarea {font:99% arial,helvetica,clean,sans-serif;}pre, code {font:115% monospace;*font-size:100%;}body * {line-height:1.22em;}
cite span { float:right; padding:8px; }
cite { border-top:1px solid #00a9a9; display:block; font-size:87%; padding:10px; }

BODY { 
  padding: 0px; 
  margin: 0px; 
  font-family: Arial,Helvetica;
  font-size: 11pt;
}
.header { padding: 10px; background: #00a9a9; color: #FFF; font-family: Times, serif; font-size: 200%; }
.subheader { padding: 4px 10px 4px 10px; background: #FFF; font-size: 1.2em; }
.footer { padding: 0 10px 10px 0px; font-size: 8pt; }
.rulenav { float: right; padding: 8px; padding-top: 20px; valign: bottom;}
.exnav { float: right; padding: 8px; padding-top: 2px; }
.content { 
  padding: 10px;
  background: #FFFFFF;
  text-align: left;
}
.exheader {
  padding: 10px 10px 10px 0;
  font-size: 1.6em;
}
A { color: #550055; }
.ahover, ahover:visited {text-decoration: none; color: #550055; }
.ahover:hover {text-decoration: underline; color: #550055; }
A.example {
  color: #000;
  text-decoration: none;
  padding: 2px;
  font-size: 1em;
}
A.example:visited {
  color: #222;
  text-decoration: none;
  padding: 2px;
}
A.example:hover {
  background: #E6F1FF;
  text-decoration: underline;
}
.pagetitle {
  font-size: 1.8em;
  font-weight: bold;
}
.codesample {
  border: 1px solid #666;
  padding: 10px;
  font-family: Courier;
  background: #EEE;
  margin: 4px 30px 4px 50px;
}
span.takeaway {
  border: 2px solid #00388C;
  padding: 10px;
  font-weight: bold;
  background: #ECF3FF;
}
p.takeaway {
  margin: 30px 0 20px 0;
  text-align: center;
}
p.browsers {
  font-weight: bold;
  margin-bottom: -10px;
}

.navlink {
  font-size: 8pt;
  font-weight: bold;
  font-family: Arial,Helvetica;
  text-decoration: none;
  border: 1px solid #00a9a9;
  color: #FFF;
}
.navlink:visited {
  font-family: Arial,Helvetica;
  text-decoration: none;
}
.navlink:hover {
  font-family: Arial,Helvetica;
  border: 1px solid #705;
}

.navlinksel {
  font-family: Arial,Helvetica;
  font-size: 8pt;
  font-weight: bold;
  text-decoration: none;
  border: 1px solid #705;
  color: #705;
}


.exlink {
  color: #00a9a9;
  font-size: 8pt;
  font-weight: bold;
  text-decoration: none;
  border: 1px solid #FFF; /* transparent didn't work on IE */
}
.exlink:visited {
  text-decoration: none;
}
.exlink:hover {
  border: 1px solid #705;
}

.exlinksel {
  font-size: 8pt;
  font-weight: bold;
  text-decoration: none;
  border: 1px solid;
}

A.noline {
  text-decoration: none;
}
A.noline:visited {
  text-decoration: none;
}
A.noline:hover {
  text-decoration: underline;
}
.rule {
  font-weight: bold;
  border: 1px solid #222;
  background: #EEE;
  padding: 4px;
}
</style>

<script src="utils.js"></script>
<script>
rti_addHandler(window, "load", doOnload);
rti_addHandler(window, "beforeunload", doUnload);

var t_page_start = Number(new Date());
var t_page, t_done;

function doUnload() {
    var start = Number(new Date());

    rt_setCk("RT", "s=" + start + "&r=" + escape(document.location), 0, "/", document.location.hostname);
}


function doOnload() {
    var end = Number(new Date());  // get a timestamp FIRST THING!

    // We can definitely get the time for this page.
    t_page = end - t_page_start;

    // Extract values from the RT cookie and override the default values above.
    if ( "" != rt_getCk("RT") ) {
        ref = rt_getSCk("RT", "r");
	realref = escape(document.referrer);

	if ( ref && realref && ref == realref ) {
	    // Only show the roundtrip response time if the referrer is this page.
            start = Number(rt_getSCk("RT", "s"));
            t_done = end - start;
        }

        // Remove the cookie, so that it doesn't linger around and cause erroneous long response times.
        rt_rmCk("RT", document.location.hostname);
    }

    var div1 = document.getElementById("t_done");
    if ( "undefined" == typeof(t_done) ) {
        div1 = document.getElementById("t_done_msg");
        div1.innerHTML = "<i><a href='?t=" + Number(new Date()) + "'>click here</a> to see the roundtrip response time</i>";
    }
    else {
        div1.innerHTML = "<b>" + t_done + " ms</b>&nbsp;";
        div1 = document.getElementById("t_done_msg");
        div1.innerHTML = "<i><a href='?t=" + Number(new Date()) + "'>try it again</a></i>";
    }

    //div1 = document.getElementById("t_page");
    //div1.innerHTML = "<b>" + t_page + " ms</b>";
}
</script>

</head>

<body>

<div class=header>Rule 3 - Add an Expires Header</div>
<div class=content> <!-- hold all content for the page -->

<p>

<table border=0 cellpadding=2 cellspacing=0>
  <tr>
    <td align=right>Roundtrip response time: </td>
    <td align=right><span id=t_done></span></td>
    <td><span id=t_done_msg style="font-size: 0.9em"></span></td>
  <tr>
<!--
  <tr>
    <td align=right>Page load time: </td>
    <td align=right><span id=t_page></span></td>
    <td></td>
  <tr>
-->
</table>


<p>
This example contains six images, three scripts and one stylesheet that do have a far future Expires header. Load the page several times using the "try it again" link and compare the response time to Example 1 - No Expires. This example is faster because it uses the cache thus avoiding ten additional HTTP requests.


<p style="margin-top: 30px; font-size: .8em;">
<sup>1</sup> Browsers differ in how they handle components with no Expires header.
Download behavior also varies depending on the cache settings chosen in the browser options.
This example uses an Expires date in the past to guarantee that the browser behaves consistently.

<p>
<center>
<img src="images/starfish1a-expiresoff.gif">
<img src="images/starfish1b-expiresoff.gif">
<img src="images/starfish1c-expiresoff.gif">
<img src="images/starfish1d-expiresoff.gif">
<img src="images/starfish1e-expiresoff.gif">
<img src="images/starfish1f-expiresoff.gif">
</center>

</div> <!-- close content div -->

</body>

</html>
