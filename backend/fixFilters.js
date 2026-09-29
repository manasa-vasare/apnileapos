require('dotenv').config();
const axios = require('axios');

async function fixFilters() {
  const auth = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64');
  const filters = {
    10003: "project = SAM1 AND labels = kle-spoke ORDER BY Rank ASC",
    10004: "project = SAM1 AND labels = coep-spoke ORDER BY Rank ASC",
    10005: "project = SAM1 AND labels = mmcoep-spoke ORDER BY Rank ASC",
    10006: "project = SAM1 AND labels = rit-spoke ORDER BY Rank ASC"
  };
  
  try {
    for (let [id, jql] of Object.entries(filters)) {
      const res = await axios.put(`${process.env.JIRA_DOMAIN}/rest/api/2/filter/${id}`, {
        jql,
        name: `Filter for Board ${id}`,
      }, {
        headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' }
      });
      console.log(`Updated filter ${id}`);
    }
  } catch(e) {
    console.error("Error:", e.response?.data || e.message);
  }
}

fixFilters();
