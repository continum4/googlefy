const myCSS =  `.googlefy-yellow { background-color: #FEFF99; }
                .googlefy-orange { background-color: #FB9407; }
                .googlefy-float-box { z-index: 200000; position: fixed; top: 100px; right: 50px; padding: 10px; text-align: center; font-size: 16px; font-family: arial; max-width: 300px; word-wrap: break-word; }
                .googlefy-position { background-color: black; color: white; padding: 5px; text-align: center; float: right; }
                .googlefy-float-box_inner { }
                .googlefy-float-box_inner .googlefy-first { background-color: #fff; border: 1px solid #000; color: #000; text-align: left; padding: 10px; }
                .googlefy-float-box_inner .googlefy-second { background-color: #F50F43; padding: 10px; }
                .googlefy-btn { cursor: pointer; font-weight: bold; }
                .googlefy-333 { color: #333; }
                .googlefy-000 { color: #000; }
                .googlefy-bluec { color: #007FFF; }
                .googlefy-f20 { font-size: 20px; }
                .googlefy-nts {  }
                `;

function listenForClicks() {
  document.getElementById('googlefy').addEventListener("click", (e) => {
    
    function googlefy(tabs) {
      browser.tabs.insertCSS({code: myCSS}).then(() => {
        if (tabs[0].url.indexOf('www.google.com') != -1) {
          let url = document.getElementById('url').value;
          if (url) {
            browser.tabs.sendMessage(tabs[0].id, {
              command: "googlefy",
              URL: url,
            });
          }
        } else {
          reportExecuteScriptError();
        }
      });      
    }

    function reportError(error) {
      console.error(`Could not googlefy: ${error}`);
    }

    browser.tabs.query({active: true, currentWindow: true})
      .then(googlefy)
      .catch(reportError);
  });
}

function reportExecuteScriptError(error) {
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  console.error(`Failed to execute googlefy content script: ${error.message}`);
}

browser.tabs.executeScript({file: "/content_scripts/googlefy.js"})
.then(listenForClicks)
.catch(reportExecuteScriptError);