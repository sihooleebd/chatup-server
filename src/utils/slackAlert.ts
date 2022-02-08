import axios from "axios";

export function slackAlerter(message : string, hookURL? : string) {
  if(hookURL!==undefined) {
    axios.post(hookURL, {text: message});
  } else {
    axios.post(`https://hooks.slack.com/services/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`, {text: message});
  }
}