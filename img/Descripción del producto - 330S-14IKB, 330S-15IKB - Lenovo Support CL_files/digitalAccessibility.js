function getSitekey(){var currentRealm=l.Common.getCurrentRealm();var result="";switch(l.RealmType[currentRealm]){case"Pcg":result="dc66c9b1962b85a3a4cee87a2ef425d7";break;case"Dcg":result="9a7076094aa7cb3fdccc9b175b890b8b";break;case"Mbg":result="ee756ac15e4b863e88053f919874c5a0";break;case"Smart":result="cb7c37d2b65d96d94ef1afbc7c8e6b7c";break;case"All":result="5c26fda5694157de58a7b521c514c0a8";break;default:result="5c26fda5694157de58a7b521c514c0a8";break}return result}window.interdeal={sitekey:getSitekey(),Position:"Left",Menulang:l.CultureUtility.getCurrentLanguage().toUpperCase(),domains:{js:"https://aacdn.nagich.com/",acc:"https://access.nagich.com/"},btnStyle:{vPosition:["80%",null],scale:["0.5","0.5"],color:{main:"#0a7da4",second:""},icon:{type:11,shape:"circle",outline:false}}};(function(doc,head,body){var coreCall=doc.createElement("script");coreCall.src=interdeal.domains.js+"core/4.5.11/accessibility.js";coreCall.defer=true;coreCall.integrity="sha512-ituk7fx8YI2pGzcu9bn3wbur6GvkBObBAGbpaq/9oRHAiODhgNxe7fstsL6nJJ8JmSwn3b6nH9i2Mtfr5tdkVw==";coreCall.crossOrigin="anonymous";coreCall.setAttribute("data-cfasync",true);body?body.appendChild(coreCall):head.appendChild(coreCall)})(document,document.head,document.body);