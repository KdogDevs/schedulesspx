import{c as e,j as t,m as n,d as s,l as r}from"./index-BKLr2_me.js";import{R as i,f as a,b as o,L as l}from"./vendor-B9h2YEfa.js";function c(){return c=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var s in n)({}).hasOwnProperty.call(n,s)&&(e[s]=n[s])}return e},c.apply(null,arguments)}function d(e,t){if(null==e)return{};var n={};for(var s in e)if({}.hasOwnProperty.call(e,s)){if(-1!==t.indexOf(s))continue;n[s]=e[s]}return n}function u(e,t){return u=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(e,t){return e.__proto__=t,e},u(e,t)}function p(e,t){e.prototype=Object.create(t.prototype),e.prototype.constructor=e,u(e,t)}function m(e,t){return e.replace(new RegExp("(^|\\s)"+t+"(?:\\s|$)","g"),"$1").replace(/\s+/g," ").replace(/^\s*|\s*$/g,"")}const h=!1,x=i.createContext(null);var f=function(e){return e.scrollTop},v="unmounted",b="exited",g="entering",E="entered",N="exiting",y=function(e){function t(t,n){var s;s=e.call(this,t,n)||this;var r,i=n&&!n.isMounting?t.enter:t.appear;return s.appearStatus=null,t.in?i?(r=b,s.appearStatus=g):r=E:r=t.unmountOnExit||t.mountOnEnter?v:b,s.state={status:r},s.nextCallback=null,s}p(t,e),t.getDerivedStateFromProps=function(e,t){return e.in&&t.status===v?{status:b}:null};var n=t.prototype;return n.componentDidMount=function(){this.updateStatus(!0,this.appearStatus)},n.componentDidUpdate=function(e){var t=null;if(e!==this.props){var n=this.state.status;this.props.in?n!==g&&n!==E&&(t=g):n!==g&&n!==E||(t=N)}this.updateStatus(!1,t)},n.componentWillUnmount=function(){this.cancelNextCallback()},n.getTimeouts=function(){var e,t,n,s=this.props.timeout;return e=t=n=s,null!=s&&"number"!=typeof s&&(e=s.exit,t=s.enter,n=void 0!==s.appear?s.appear:t),{exit:e,enter:t,appear:n}},n.updateStatus=function(e,t){if(void 0===e&&(e=!1),null!==t)if(this.cancelNextCallback(),t===g){if(this.props.unmountOnExit||this.props.mountOnEnter){var n=this.props.nodeRef?this.props.nodeRef.current:a.findDOMNode(this);n&&f(n)}this.performEnter(e)}else this.performExit();else this.props.unmountOnExit&&this.state.status===b&&this.setState({status:v})},n.performEnter=function(e){var t=this,n=this.props.enter,s=this.context?this.context.isMounting:e,r=this.props.nodeRef?[s]:[a.findDOMNode(this),s],i=r[0],o=r[1],l=this.getTimeouts(),c=s?l.appear:l.enter;!e&&!n||h?this.safeSetState({status:E},(function(){t.props.onEntered(i)})):(this.props.onEnter(i,o),this.safeSetState({status:g},(function(){t.props.onEntering(i,o),t.onTransitionEnd(c,(function(){t.safeSetState({status:E},(function(){t.props.onEntered(i,o)}))}))})))},n.performExit=function(){var e=this,t=this.props.exit,n=this.getTimeouts(),s=this.props.nodeRef?void 0:a.findDOMNode(this);t&&!h?(this.props.onExit(s),this.safeSetState({status:N},(function(){e.props.onExiting(s),e.onTransitionEnd(n.exit,(function(){e.safeSetState({status:b},(function(){e.props.onExited(s)}))}))}))):this.safeSetState({status:b},(function(){e.props.onExited(s)}))},n.cancelNextCallback=function(){null!==this.nextCallback&&(this.nextCallback.cancel(),this.nextCallback=null)},n.safeSetState=function(e,t){t=this.setNextCallback(t),this.setState(e,t)},n.setNextCallback=function(e){var t=this,n=!0;return this.nextCallback=function(s){n&&(n=!1,t.nextCallback=null,e(s))},this.nextCallback.cancel=function(){n=!1},this.nextCallback},n.onTransitionEnd=function(e,t){this.setNextCallback(t);var n=this.props.nodeRef?this.props.nodeRef.current:a.findDOMNode(this),s=null==e&&!this.props.addEndListener;if(n&&!s){if(this.props.addEndListener){var r=this.props.nodeRef?[this.nextCallback]:[n,this.nextCallback],i=r[0],o=r[1];this.props.addEndListener(i,o)}null!=e&&setTimeout(this.nextCallback,e)}else setTimeout(this.nextCallback,0)},n.render=function(){var e=this.state.status;if(e===v)return null;var t=this.props,n=t.children;t.in,t.mountOnEnter,t.unmountOnExit,t.appear,t.enter,t.exit,t.timeout,t.addEndListener,t.onEnter,t.onEntering,t.onEntered,t.onExit,t.onExiting,t.onExited,t.nodeRef;var s=d(t,["children","in","mountOnEnter","unmountOnExit","appear","enter","exit","timeout","addEndListener","onEnter","onEntering","onEntered","onExit","onExiting","onExited","nodeRef"]);return i.createElement(x.Provider,{value:null},"function"==typeof n?n(e,s):i.cloneElement(i.Children.only(n),s))},t}(i.Component);function j(){}y.contextType=x,y.propTypes={},y.defaultProps={in:!1,mountOnEnter:!1,unmountOnExit:!1,appear:!1,enter:!0,exit:!0,onEnter:j,onEntering:j,onEntered:j,onExit:j,onExiting:j,onExited:j},y.UNMOUNTED=v,y.EXITED=b,y.ENTERING=g,y.ENTERED=E,y.EXITING=N;var C=function(e,t){return e&&t&&t.split(" ").forEach((function(t){return s=t,void((n=e).classList?n.classList.remove(s):"string"==typeof n.className?n.className=m(n.className,s):n.setAttribute("class",m(n.className&&n.className.baseVal||"",s)));var n,s}))},w=function(e){function t(){for(var t,n=arguments.length,s=new Array(n),r=0;r<n;r++)s[r]=arguments[r];return(t=e.call.apply(e,[this].concat(s))||this).appliedClasses={appear:{},enter:{},exit:{}},t.onEnter=function(e,n){var s=t.resolveArguments(e,n),r=s[0],i=s[1];t.removeClasses(r,"exit"),t.addClass(r,i?"appear":"enter","base"),t.props.onEnter&&t.props.onEnter(e,n)},t.onEntering=function(e,n){var s=t.resolveArguments(e,n),r=s[0],i=s[1]?"appear":"enter";t.addClass(r,i,"active"),t.props.onEntering&&t.props.onEntering(e,n)},t.onEntered=function(e,n){var s=t.resolveArguments(e,n),r=s[0],i=s[1]?"appear":"enter";t.removeClasses(r,i),t.addClass(r,i,"done"),t.props.onEntered&&t.props.onEntered(e,n)},t.onExit=function(e){var n=t.resolveArguments(e)[0];t.removeClasses(n,"appear"),t.removeClasses(n,"enter"),t.addClass(n,"exit","base"),t.props.onExit&&t.props.onExit(e)},t.onExiting=function(e){var n=t.resolveArguments(e)[0];t.addClass(n,"exit","active"),t.props.onExiting&&t.props.onExiting(e)},t.onExited=function(e){var n=t.resolveArguments(e)[0];t.removeClasses(n,"exit"),t.addClass(n,"exit","done"),t.props.onExited&&t.props.onExited(e)},t.resolveArguments=function(e,n){return t.props.nodeRef?[t.props.nodeRef.current,e]:[e,n]},t.getClassNames=function(e){var n=t.props.classNames,s="string"==typeof n,r=s?""+(s&&n?n+"-":"")+e:n[e];return{baseClassName:r,activeClassName:s?r+"-active":n[e+"Active"],doneClassName:s?r+"-done":n[e+"Done"]}},t}p(t,e);var n=t.prototype;return n.addClass=function(e,t,n){var s=this.getClassNames(t)[n+"ClassName"],r=this.getClassNames("enter").doneClassName;"appear"===t&&"done"===n&&r&&(s+=" "+r),"active"===n&&e&&f(e),s&&(this.appliedClasses[t][n]=s,function(e,t){e&&t&&t.split(" ").forEach((function(t){return s=t,void((n=e).classList?n.classList.add(s):function(e,t){return e.classList?!!t&&e.classList.contains(t):-1!==(" "+(e.className.baseVal||e.className)+" ").indexOf(" "+t+" ")}(n,s)||("string"==typeof n.className?n.className=n.className+" "+s:n.setAttribute("class",(n.className&&n.className.baseVal||"")+" "+s)));var n,s}))}(e,s))},n.removeClasses=function(e,t){var n=this.appliedClasses[t],s=n.base,r=n.active,i=n.done;this.appliedClasses[t]={},s&&C(e,s),r&&C(e,r),i&&C(e,i)},n.render=function(){var e=this.props;e.classNames;var t=d(e,["classNames"]);return i.createElement(y,c({},t,{onEnter:this.onEnter,onEntered:this.onEntered,onEntering:this.onEntering,onExit:this.onExit,onExiting:this.onExiting,onExited:this.onExited}))},t}(i.Component);function S(e,t){var n=Object.create(null);return e&&o.Children.map(e,(function(e){return e})).forEach((function(e){n[e.key]=function(e){return t&&o.isValidElement(e)?t(e):e}(e)})),n}function k(e,t,n){return null!=n[t]?n[t]:e.props[t]}function T(e,t,n){var s=S(e.children),r=function(e,t){function n(n){return n in t?t[n]:e[n]}e=e||{},t=t||{};var s,r=Object.create(null),i=[];for(var a in e)a in t?i.length&&(r[a]=i,i=[]):i.push(a);var o={};for(var l in t){if(r[l])for(s=0;s<r[l].length;s++){var c=r[l][s];o[r[l][s]]=n(c)}o[l]=n(l)}for(s=0;s<i.length;s++)o[i[s]]=n(i[s]);return o}(t,s);return Object.keys(r).forEach((function(i){var a=r[i];if(o.isValidElement(a)){var l=i in t,c=i in s,d=t[i],u=o.isValidElement(d)&&!d.props.in;!c||l&&!u?c||!l||u?c&&l&&o.isValidElement(d)&&(r[i]=o.cloneElement(a,{onExited:n.bind(null,a),in:d.props.in,exit:k(a,"exit",e),enter:k(a,"enter",e)})):r[i]=o.cloneElement(a,{in:!1}):r[i]=o.cloneElement(a,{onExited:n.bind(null,a),in:!0,exit:k(a,"exit",e),enter:k(a,"enter",e)})}})),r}w.defaultProps={classNames:""},w.propTypes={};var $=Object.values||function(e){return Object.keys(e).map((function(t){return e[t]}))},P=function(e){function t(t,n){var s,r=(s=e.call(this,t,n)||this).handleExited.bind(function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(s));return s.state={contextValue:{isMounting:!0},handleExited:r,firstRender:!0},s}p(t,e);var n=t.prototype;return n.componentDidMount=function(){this.mounted=!0,this.setState({contextValue:{isMounting:!1}})},n.componentWillUnmount=function(){this.mounted=!1},t.getDerivedStateFromProps=function(e,t){var n,s,r=t.children,i=t.handleExited;return{children:t.firstRender?(n=e,s=i,S(n.children,(function(e){return o.cloneElement(e,{onExited:s.bind(null,e),in:!0,appear:k(e,"appear",n),enter:k(e,"enter",n),exit:k(e,"exit",n)})}))):T(e,r,i),firstRender:!1}},n.handleExited=function(e,t){var n=S(this.props.children);e.key in n||(e.props.onExited&&e.props.onExited(t),this.mounted&&this.setState((function(t){var n=c({},t.children);return delete n[e.key],{children:n}})))},n.render=function(){var e=this.props,t=e.component,n=e.childFactory,s=d(e,["component","childFactory"]),r=this.state.contextValue,a=$(this.state.children).map(n);return delete s.appear,delete s.enter,delete s.exit,null===t?i.createElement(x.Provider,{value:r},a):i.createElement(x.Provider,{value:r},i.createElement(t,s,a))},t}(i.Component);P.propTypes={},P.defaultProps={component:"div",childFactory:function(e){return e}};const O=({initialPeriods:s,handleSave:r})=>{const{currentTheme:i}=e(),[a,l]=o.useState(s||{}),[c,d]=o.useState(!1),[u,p]=o.useState("");o.useEffect((()=>{s&&l(s)}),[s]);return t.jsxs(n.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},className:`\n        rounded-xl p-6 \n        ${i.accent} bg-opacity-10\n        border-2 ${i.border}\n        relative overflow-hidden\n      `,children:[t.jsx("div",{className:"absolute inset-0",style:{background:`\n            linear-gradient(\n              45deg,\n              transparent 25%,\n              ${i.accent}15 45%,\n              ${i.accent}30 50%,\n              ${i.accent}15 55%,\n              transparent 75%\n            )\n          `,backgroundSize:"200% 200%",animation:"shine 8s linear infinite"}}),t.jsxs("div",{className:"relative z-10",children:[t.jsxs("div",{className:"flex justify-between items-center mb-6",children:[t.jsx("h2",{className:`text-2xl font-bold ${i.text}`,children:"Customize Period Names"}),t.jsxs("div",{className:"flex space-x-3",children:[t.jsx(n.button,{whileHover:{scale:1.05},whileTap:{scale:.95},onClick:()=>d(!c),className:`\n                px-4 py-2 rounded-lg\n                ${i.accent} ${i.text}\n                hover:opacity-80 transition-opacity\n              `,children:c?"Cancel":"Edit"}),c&&t.jsx(n.button,{whileHover:{scale:1.05},whileTap:{scale:.95},onClick:()=>{l({period1:"Period 1",period2:"Period 2",period3:"Period 3",period4:"Period 4",period5:"Period 5",period6:"Period 6",period7:"Period 7",period8:"Period 8"})},className:"\n                  px-4 py-2 rounded-lg\n                  bg-red-500 text-white\n                  hover:opacity-80 transition-opacity\n                ",children:"Reset"})]})]}),t.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",children:Object.entries(a).map((([e,n])=>t.jsxs("div",{className:"relative",children:[t.jsx("label",{className:`block text-sm font-medium mb-1 ${i.text}`,htmlFor:e,children:e.charAt(0).toUpperCase()+e.slice(1)}),t.jsx("input",{type:"text",id:e,value:n,onChange:t=>((e,t)=>{l((n=>({...n,[e]:t})))})(e,t.target.value),disabled:!c,placeholder:`Enter ${e} name`,className:`\n                  w-full px-3 py-2 rounded-lg\n                  ${i.main} ${i.text}\n                  border ${i.border}\n                  focus:ring-2 focus:ring-opacity-50 focus:ring-blue-500\n                  disabled:opacity-50 disabled:cursor-not-allowed\n                  transition-all duration-200\n                `,maxLength:20})]},e)))}),c&&t.jsx(n.div,{initial:{opacity:0},animate:{opacity:1},className:"mt-6 flex justify-end",children:t.jsxs(n.button,{whileHover:{scale:1.05},whileTap:{scale:.95},onClick:()=>{try{p("saving"),r(a),p("saved"),d(!1),setTimeout((()=>{p("")}),3e3)}catch(e){p("error")}},className:"\n                px-6 py-2 rounded-lg\n                bg-green-500 text-white\n                hover:opacity-80 transition-opacity\n                flex items-center space-x-2\n              ",children:[t.jsx("span",{children:"Save Changes"}),"saving"===u&&t.jsxs("svg",{className:"animate-spin h-5 w-5",viewBox:"0 0 24 24",children:[t.jsx("circle",{className:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"4",fill:"none"}),t.jsx("path",{className:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"})]})]})}),u&&t.jsx(n.div,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},className:`\n              mt-4 p-3 rounded-lg text-center\n              ${"saved"===u?"bg-green-500":"bg-red-500"}\n              text-white\n            `,children:"saved"===u?"Changes saved successfully!":"Error saving changes"})]}),t.jsx("style",{jsx:!0,children:"\n        @keyframes shine {\n          0% { background-position: 200% 0; }\n          100% { background-position: -200% 0; }\n        }\n      "})]})},L=()=>{const{currentTheme:n}=e(),[s,r]=o.useState({period1:"Period 1",period2:"Period 2",period3:"Period 3",period4:"Period 4",period5:"Period 5",period6:"Period 6",period7:"Period 7",period8:"Period 8"});o.useEffect((()=>{const e=localStorage.getItem("customPeriodNames");e&&r(JSON.parse(e))}),[]);return t.jsx("div",{className:`p-6 rounded-lg border-2 ${n.border} ${n.main}`,children:t.jsx(O,{initialPeriods:s,handleSave:e=>{r(e),localStorage.setItem("customPeriodNames",JSON.stringify(e))}})})},A=({weekSchedule:n})=>{const{currentTheme:i,changeTheme:a,themes:c}=e(),{user:d,isLoggedIn:u,reminderPreference:p,updateReminderPreference:m}=s(),[h,x]=o.useState("Featured Themes"),[f,v]=o.useState(p);r.debug("Account - Component initialized",{isLoggedIn:u()});const b={"Featured Themes":["Default","Dark","Light","ValentinesDay"],"General Themes":["Forest","Ocean","Sunset","Lavender","Mint","Cherry","Coffee","Retro"],"Holiday Themes":["candycane","Halloween","ValentinesDay","StPatricksDay","Easter","IndependenceDay","Thanksgiving"],"People Themes":["legoat","ashleytwiner","mary brewster","StJoseph","StPeter","StMichael","StTherese","StFrancisAssisi","StMary","StAugustine","StBenedict","StJohn","StClare","StIgnatius","StThereseAvila","StSimon","StVincent","StLucy","StPatrick","StAnthony","StJames"],"Sports Themes":["bills","braves","uga","gatech"]};o.useEffect((()=>{x("Featured Themes")}),[]);const g=e=>{x(e)},E=({themeName:e,theme:n})=>{if(!n)return r.error(new Error("Attempted to render undefined theme"),{themeName:e}),null;const s=i.name.toLowerCase().replace(/\s+/g,"")===e.toLowerCase();return t.jsxs("div",{className:`w-full h-24 rounded-lg overflow-hidden shadow-md border-2 ${n.accent} cursor-pointer transition-transform duration-200 hover:scale-105 relative flex items-center justify-center`,onClick:()=>(e=>{c[e.toLowerCase()]?a(e.toLowerCase()):(r.error(new Error(`Theme not found: ${e}`),{availableThemes:Object.keys(c)}),a("Default"))})(e),children:[t.jsx("div",{className:`absolute inset-x-0 top-0 h-1/2 ${n.main}`}),t.jsxs("div",{className:"absolute inset-x-0 bottom-0 h-1/2 flex",children:[t.jsx("div",{className:`w-1/2 ${n.accent}`}),t.jsx("div",{className:`w-1/2 ${n.main}`})]}),t.jsx("div",{className:`absolute px-2 py-1 text-center font-bold bg-opacity-70 rounded ${s?"bg-green-500":"bg-black"} text-white`,children:n.name})]})};return u()?t.jsx("div",{className:`min-h-screen ${i.main} ${i.text} p-4`,style:{overflowY:"auto",height:"calc(100vh - 64px)"},children:t.jsxs("div",{className:"max-w-4xl mx-auto pb-16",children:[t.jsxs("div",{className:`${i.main} border ${i.border} rounded-lg shadow-lg p-6 mb-8`,children:[t.jsx("h1",{className:"text-2xl font-bold mb-6 text-center drop-shadow-md",children:"Account Information"}),t.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[t.jsxs("div",{className:"mb-4",children:[t.jsx("label",{className:"block text-sm font-bold mb-2",children:"Name"}),t.jsx("p",{className:`p-2 rounded ${i.main}`,children:d.name})]}),t.jsxs("div",{className:"mb-4",children:[t.jsx("label",{className:"block text-sm font-bold mb-2",children:"Email"}),t.jsx("p",{className:`p-2 rounded ${i.main}`,children:d.email})]}),(d.isTeacher||d.isAdmin)&&t.jsxs("div",{className:"mb-4",children:[t.jsx("label",{className:"block text-sm font-bold mb-2",children:"Attendance Reminder"}),t.jsxs("div",{className:"flex items-center",children:[t.jsx("input",{type:"checkbox",checked:f,onChange:()=>{const e=!f;v(e),m(e)},className:"mr-2"}),t.jsx("span",{children:f?"Enabled":"Disabled"})]})]})]})]}),t.jsx("div",{className:"mb-8",children:t.jsx(L,{})}),t.jsxs("div",{className:`${i.main} border ${i.border} rounded-lg shadow-lg p-6 mb-8`,children:[t.jsx("h2",{className:"text-xl font-bold mb-4 text-center",children:"Theme Customization"}),t.jsxs("div",{className:"flex flex-wrap justify-center mb-4 gap-2",children:[t.jsx("button",{className:`${i.accent} text-white font-bold py-2 px-4 rounded`,onClick:()=>g("Featured Themes"),children:"Featured Themes"}),t.jsx("button",{className:`${i.accent} text-white font-bold py-2 px-4 rounded`,onClick:()=>g("General Themes"),children:"General Themes"}),t.jsx("button",{className:`${i.accent} text-white font-bold py-2 px-4 rounded`,onClick:()=>g("Holiday Themes"),children:"Holiday Themes"}),t.jsx("button",{className:`${i.accent} text-white font-bold py-2 px-4 rounded`,onClick:()=>g("People Themes"),children:"People Themes"}),t.jsx("button",{className:`${i.accent} text-white font-bold py-2 px-4 rounded`,onClick:()=>g("Sports Themes"),children:"Sports Themes"}),t.jsx("button",{className:`${i.accent} text-white font-bold py-2 px-4 rounded`,onClick:()=>g("Show All"),children:"Show All"}),"        "]}),t.jsx(P,{className:"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",children:("Show All"===h?Object.keys(c):b[h]||[]).map((e=>{const n=c[e.toLowerCase()];return n?t.jsx(w,{timeout:500,classNames:"fade",children:t.jsx(E,{themeName:e,theme:n},e)},e):(r.error(new Error(`Theme not found: ${e}`),{availableThemes:Object.keys(c)}),null)}))})]}),t.jsxs("div",{className:`${i.main} border ${i.border} rounded-lg shadow-lg p-6 mb-8`,children:[t.jsx("h2",{className:"text-xl font-bold mb-4 text-center",children:"Legal Information"}),t.jsxs("div",{className:"flex flex-col sm:flex-row justify-between items-center",children:[t.jsx(l,{to:"/privacy",className:`${i.accent} text-white font-bold py-2 px-4 rounded mb-2 sm:mb-0 w-full sm:w-auto text-center hover:opacity-80 transition-opacity duration-200`,children:"Privacy Policy"}),t.jsx(l,{to:"/terms",className:`${i.accent} text-white font-bold py-2 px-4 rounded w-full sm:w-auto text-center hover:opacity-80 transition-opacity duration-200`,children:"Terms of Service"})]})]}),t.jsxs("div",{className:`${i.main} border ${i.border} rounded-lg shadow-lg p-6`,children:[t.jsx("h2",{className:"text-xl font-bold mb-4 text-center",children:"Change Log"}),t.jsx("div",{className:"flex flex-col sm:flex-row justify-between items-center",children:t.jsx(l,{to:"/changelog",className:`${i.accent} text-white font-bold py-2 px-4 rounded w-full sm:w-auto text-center hover:opacity-80 transition-opacity duration-200`,children:"View Change Log"})})]})]})}):t.jsx("div",{className:`container mx-auto mt-8 p-4 ${i.main} ${i.text}`,children:t.jsx("p",{className:"text-center text-xl drop-shadow-md",children:"Please log in to view your account information."})})};export{A as default};
