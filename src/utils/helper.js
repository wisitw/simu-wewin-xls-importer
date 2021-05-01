import moment from 'moment-timezone';
import React, { useState, useEffect } from 'react'
import {message, Tag} from 'antd'

export const roles = [
  {value:'admin', text:"แอดมิน", color:"blue"},
  {value:'customer', text:"สมาชิก", color:"volcano"},
  {value:'staff', text:"เจ้าหน้าที่", color:"green"}
];
export const alphaSort = (a,b, key) => {
  return (a[key]+"").localeCompare(b[key])
}
export const revDateSort = (a,b, key) => {
  var d1 = a[key].split("-");
  var d2 = b[key].split("-");
  return ([d1[2],d1[1],d1[0]].join("")+"").localeCompare([d2[2],d2[1],d2[0]].join("")+"")
}
export const toNum = (text) => {
  return parseFloat(text.replace(/[^0-9-.]/gi, ''));
}
export const getRoleName = (role, mode = "text") => { 
  var match = roles.find(e => e.value === role);
  if(match) {
      return mode==="obj" ? <Tag className="roleTag" color={match.color || "grey"}>{match.text || " - N/A - "}</Tag> : match.text || " - N/A - ";
  } else {
      return mode==="obj" ? <Tag className="roleTag">ใครอ๊ะ!</Tag> : "ใครอ๊ะ";
  }
};

let authenurl = 'https://thmerchant.gojek.com/api/admin-auth';
let baseurl = 'https://thmerchant.gojek.com/api';

if(process.env.NODE_ENV === 'development') {
  console.clear()
  console.log('%cGIPSIC %cDevelopment Mode! ', 'font-size:28px; color: #09F', 'font-size:22px; color: #C00');
  // authenurl = 'http://localhost:9000/api/admin-auth';
}

export const apiurl = {
    'authen': authenurl,
    'user': baseurl+'/api/GetTBUserManual/',
};
export const postData = async (service, url = '', jwt, data = {}, method = "POST") => {
  var prefix = apiurl[service]; 
  var heads = {
    'Content-Type': 'application/json',
    // 'Content-Type': 'application/x-www-form-urlencoded',
  }
  if(jwt) {
    heads['Authorization'] = 'Bearer '+jwt
  }
  const response = await fetch(prefix+url, {
    method: method,
    cache: 'no-cache',
    headers: heads,
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // no-referrer, *client
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  }).catch( err => {
    return {errors:err, message:""};
  });

  if(!response) {
    return {error:"Error Status "+response.status};
  } else if(response.errors) {
    return {error:"Can not connect to server !"};
  } else if(response.status === 401) {
    message.error("ท่านไม่มีสิทธิ์เข้าถึงข้อมูลดังกล่าว !")
    window.localStorage.clear();
    return window.location = "/login?401";
  }
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return await response.json(); // parses JSON response into native JavaScript objects
  } else {
    const ctn = await response.text();
    return {error:"Error Status "+response.status, status:response.status, content: ctn}; 
  }
}
export const getData = async (service, url = '', jwt) => {
  var prefix = apiurl[service]; 
  const response = await fetch(prefix+url, {
    method: 'GET',
    cache: 'no-cache',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+jwt
    },
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // no-referrer, *client
  }).catch( err => {
    // console.log("Error", err);
    return {errors:err, message:""};
  });

  if(!response) {
    return {error:"Can not get response"};
  } else if(response.errors) {
    return {error:"Can not connect to server !"};
  } else if(response.status === 401) {
    message.error("ท่านไม่มีสิทธิ์เข้าถึงข้อมูลดังกล่าว !")
    window.localStorage.clear();
    return window.location = "/login?401";
  }
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return await response.json(); // parses JSON response into native JavaScript objects
  } else {
      const ctn = await response.text();
      return {error:"Error Status "+response.status, status:response.status, content: ctn}; 
  }
}

export const getADUsername = (username) => {
  let t = username.split("\\");
  return t[t.length-1];
}

export const checkSSO = async () => {
  return await fetch(apiurl.authen, {
      cache: 'no-cache',
      redirect: 'follow', // manual, *follow, error
      credentials: 'include',
  }).then(async (res) => {
      if(res.status === 401) {
          // console.log("Not SSO", res)
          return null;
      } else {
          const data = await res.json();
          // console.log("SSO 200", data);
          return data;
      }
  }).catch( err => {
      // console.log("Error", err);
      return null;
  });
}

export const basicAuth = async (username, password) => {
  let base64data = btoa(username+":"+password);
  return await fetch(apiurl.authen, {
      cache: 'no-cache',
      redirect: 'follow', // manual, *follow, error
      // credentials: 'include',
      headers: {
          'Authorization': 'Basic '+base64data
      },
  }).then(async (res) => {
      if(res.status === 401) {
          // console.log("Login Invalid", res)
          return null;
      } else {
          const data = await res.json();
          // console.log("Login Success", data);
          return data;
      }
  }).catch( err => {
      // console.log("Error", err);
      return null;
  });
}

export const downloadData = async (service, url = '', jwt) => {
  var prefix = apiurl[service]; 
  const response = await fetch(prefix+url, {
      method: 'GET',
      cache: 'no-cache',
      headers: {
          'Authorization': 'Bearer '+jwt
      },
      redirect: 'follow', // manual, *follow, error
      referrer: 'no-referrer', // no-referrer, *client
  }).catch( err => {
  // console.log("Error", err);
  return {errors:err, message:""};
  });
  if(!response) {
    return {error:"Error Status "+response.status};
  } else if(response.status === 401) {
    window.localStorage.clear();
    return window.location = "/login?401";
  }
  return await response.blob(); // parses JSON response into native JavaScript objects
}

export const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};
  
export const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};


export const getLocationName = (lid, dict) => {
    var k = dict.find(a => a._id === lid);
    return (k) ? k.name : "Unknown";
}

export const dateFromObjectId = function (objectId) {
    objectId = ""+objectId;
	return moment.utc(parseInt(objectId.substr(0, 8), 16) * 1000);
};

export const totalTableWidth = (columns) => {
    return columns.reduce( (sum, c) => { return sum + (c.width || 130)}, 0)
}

export const phoneFormat = (no) => {
    if(!no) return no;
    no = no.replace(/-/g,"");
    if(no.length === 9) no = "0"+no;
    var k = "0"+no.slice(1,3)+"."+no.slice(3,6)+"."+no.slice(6,10);
    return k;
}

export const useScript = function(src) {
  // Keep track of script status ("idle", "loading", "ready", "error")
  const [status, setStatus] = useState(src ? "loading" : "idle");

  useEffect(
    () => {
      // Allow falsy src value if waiting on other data needed for
      // constructing the script URL passed to this hook.
      if (!src) {
        setStatus("idle");
        return;
      }

      // Fetch existing script element by src
      // It may have been added by another intance of this hook
      let script = document.querySelector(`script[src="${src}"]`);

      if (!script) {
        // Create script
        script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.setAttribute("data-status", "loading");
        // Add script to document body
        document.body.appendChild(script);

        // Store status in attribute on script
        // This can be read by other instances of this hook
        const setAttributeFromEvent = (event) => {
          script.setAttribute(
            "data-status",
            event.type === "load" ? "ready" : "error"
          );
        };

        script.addEventListener("load", setAttributeFromEvent);
        script.addEventListener("error", setAttributeFromEvent);
      } else {
        // Grab existing script status from attribute and set to state.
        setStatus(script.getAttribute("data-status"));
      }

      // Script event handler to update status in state
      // Note: Even if the script already exists we still need to add
      // event handlers to update the state for *this* hook instance.
      const setStateFromEvent = (event) => {
        setStatus(event.type === "load" ? "ready" : "error");
      };

      // Add event listeners
      script.addEventListener("load", setStateFromEvent);
      script.addEventListener("error", setStateFromEvent);

      // Remove event listeners on cleanup
      return () => {
        if (script) {
          script.removeEventListener("load", setStateFromEvent);
          script.removeEventListener("error", setStateFromEvent);
        }
      };
    },
    [src] // Only re-run effect if script src changes
  );

  return status;
}

export const findCenter = (w,h) => {
  const dualScreenLeft = window.screenLeft !==  undefined ? window.screenLeft : window.screenX;
  const dualScreenTop = window.screenTop !==  undefined   ? window.screenTop  : window.screenY;

  const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : window.screen.width;
  const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : window.screen.height;

  const systemZoom = width / window.screen.availWidth;
  const left = (width - w) / 2 / systemZoom + dualScreenLeft
  const top = (height - h) / 2 / systemZoom + dualScreenTop
  return { left, top };
}
