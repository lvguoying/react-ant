import HttpClient from '../api/HttpClient'

export function saveFeedback(remarks,mail,callback) {
    HttpClient.AjaxPost('/feedback/save', {mail:mail,remarks:remarks}, list => {
          callback(list);
    })
}