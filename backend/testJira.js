require('dotenv').config();
const axios = require('axios');
async function test() {
  const auth = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64');
  try {
    const res = await axios.post(`${process.env.JIRA_DOMAIN}/rest/api/3/search/jql`, {
      jql: "project=SAM1", maxResults: 10
    }, {
      headers: { Authorization: `Basic ${auth}`, Accept: 'application/json', 'Content-Type': 'application/json' }
    });
    console.log("Response:", Object.keys(res.data));
  } catch(e) {
    console.error(e.response?.data || e.message);
  }
}
test();
