
> @weekday/dev-kit@0.1.13 jsdoc2md /Users/johannesduplessis/Work/weekday/dev-kit
> jsdoc2md "./lib/index.js"

## Functions

<dl>
<dt><a href="#postAppMessage">postAppMessage(message)</a></dt>
<dd><p>Sends a message to the parent window</p>
</dd>
<dt><a href="#initDevKit">initDevKit(token, dev)</a></dt>
<dd><p>Stores the token on the window object</p>
</dd>
<dt><a href="#getUserId">getUserId()</a></dt>
<dd><p>Retreives the userId from the URL
This URL will always be available in a sandboxed environment</p>
</dd>
<dt><a href="#getToken">getToken()</a></dt>
<dd><p>Retreives the token on the window object</p>
</dd>
<dt><a href="#syncMessageHeight">syncMessageHeight(resizeId)</a></dt>
<dd><p>Polls the document scrollHeight and sends a message to Weekday
to adjust the containing iframe</p>
</dd>
<dt><a href="#closeAppModal">closeAppModal()</a></dt>
<dd><p>Closes an app modal</p>
<ul>
<li>Don&#39;t use a channel token here - it&#39;s a simple action</li>
</ul>
</dd>
<dt><a href="#closeAppPanel">closeAppPanel()</a></dt>
<dd><p>Closes an app panel
Don&#39;t use a channel token here - it&#39;s a simple action</p>
</dd>
<dt><a href="#openAppPanel">openAppPanel(name, url, token)</a></dt>
<dd><p>Opens an app panel with an action</p>
</dd>
<dt><a href="#openAppModal">openAppModal(name, url, height, width, token)</a></dt>
<dd><p>Opens an app modal with an action</p>
</dd>
<dt><a href="#createChannelMessage">createChannelMessage(token, body, attachments, resourceId, userId)</a></dt>
<dd><p>Creates a channel message using app channel webhook</p>
</dd>
<dt><a href="#deleteChannelMessage">deleteChannelMessage(token, resourceId)</a></dt>
<dd><p>Creates a channel message using app channel webhook</p>
</dd>
<dt><a href="#updateChannelMessage">updateChannelMessage(token, body, attachments, currentResourceId, resourceId)</a></dt>
<dd><p>Creates a channel message using app channel webhook</p>
</dd>
</dl>

<a name="postAppMessage"></a>

## postAppMessage(message)
Sends a message to the parent window

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>IMessage</code> | Message object |

<a name="initDevKit"></a>

## initDevKit(token, dev)
Stores the token on the window object

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>string</code> | App token |
| dev | <code>boolean</code> | sets the correct URL to use |

<a name="getUserId"></a>

## getUserId()
Retreives the userId from the URL
This URL will always be available in a sandboxed environment

**Kind**: global function  
<a name="getToken"></a>

## getToken()
Retreives the token on the window object

**Kind**: global function  
<a name="syncMessageHeight"></a>

## syncMessageHeight(resizeId)
Polls the document scrollHeight and sends a message to Weekday
to adjust the containing iframe

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| resizeId | <code>string</code> | A UUID identifying a single message iframe |

<a name="closeAppModal"></a>

## closeAppModal()
Closes an app modal
* Don't use a channel token here - it's a simple action

**Kind**: global function  
<a name="closeAppPanel"></a>

## closeAppPanel()
Closes an app panel
Don't use a channel token here - it's a simple action

**Kind**: global function  
<a name="openAppPanel"></a>

## openAppPanel(name, url, token)
Opens an app panel with an action

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Panel title |
| url | <code>string</code> | Panel iframe URL |
| token | <code>string</code> | Channel app token (generated when an app is installed on a channel) |

<a name="openAppModal"></a>

## openAppModal(name, url, height, width, token)
Opens an app modal with an action

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Modal title |
| url | <code>string</code> | Modal URL |
| height | <code>string</code> | Modal height, can be % or px |
| width | <code>string</code> | Modal width, can be % or px |
| token | <code>string</code> | Channel app token |

<a name="createChannelMessage"></a>

## createChannelMessage(token, body, attachments, resourceId, userId)
Creates a channel message using app channel webhook

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>string</code> | temp channel intsall token |
| body | <code>string</code> | text message for the channel message |
| attachments | <code>Array.&lt;IAttachment&gt;</code> | list of attachments to include |
| resourceId | <code>string</code> | string identifying the remote resource |
| userId | <code>string</code> | a userId for the user (passed as a query string parameter) |

<a name="deleteChannelMessage"></a>

## deleteChannelMessage(token, resourceId)
Creates a channel message using app channel webhook

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>string</code> | temp channel intsall token |
| resourceId | <code>string</code> | string identifying the remote resource |

<a name="updateChannelMessage"></a>

## updateChannelMessage(token, body, attachments, currentResourceId, resourceId)
Creates a channel message using app channel webhook

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>string</code> | temp channel intsall token |
| body | <code>string</code> | text message for the channel message |
| attachments | <code>Array.&lt;IAttachment&gt;</code> | list of attachments to include |
| currentResourceId | <code>string</code> | old string identifying the remote resource |
| resourceId | <code>string</code> | new string identifying the remote resource |

