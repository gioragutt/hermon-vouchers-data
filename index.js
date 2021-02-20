const express = require('express');
const fetch = require('node-fetch');
const {readFileSync} = require('fs');

const app = express();

let apiResult = null;
let lastResultTime = 0;
const htmlTemplate = readFileSync('./template.html').toString();

app.get('/', async (req, res) => {
  if (!apiResult || (Date.now() - lastResultTime) > 5000) {
    apiResult = await fetch('https://hermon.pres.global/api/system-vouchers/byDate').then(r => r.json());
    lastResultTime = Date.now();
  }

  console.log(apiResult);

  const {Dates, Vouchers: vouchersData} = apiResult;
  const vouchers = vouchersData.reduce((acc, obj) => {
    acc[obj.SystemVoucherId] = obj;
    return acc;
  }, {});
  let rows = '';
  
  for (const {Date: date, Vouchers} of Dates) {
    for (const {SystemVoucherId, MaximumQuantity, IsSoldOut} of Vouchers) {
      rows += `<tr class="${IsSoldOut ? 'table-danger' : 'table-info'}">
        <td>${date}</td>
        <td>${vouchers[SystemVoucherId].Name}</td>
        <td>${vouchers[SystemVoucherId].Prices[0].Price} ש״ח</td>
        <td>${MaximumQuantity}</td>
      </tr>`
    }
    rows += `<tr class="spacer"><td></td></tr>`
  }
  res.type('html').send(htmlTemplate.replace('{{rows}}', rows)).end();
});

app.listen(3000, () => console.log('Listening on localhost:3000'));