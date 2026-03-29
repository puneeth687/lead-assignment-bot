const express = require("express");
const axios = require("axios");
const qs = require("qs");
const jwt = require("jsonwebtoken");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const SF_BASE_URL = "https://ka1727761468637.my.salesforce.com";
const CONSUMER_KEY = "3MVG9VTfpJmxg1yjl829M_mPjACSCXX0bta2zOKi6PcnM7Yx2xAxTkAqv1yMxipjIU2WLRT6NqDHDDiIZ44T8";
const USERNAME = "puneeth.r@kasmodigital.com";
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDdJmXyUNlzaH7I
Exv8ED8R2/0182c5bemrXmnlmKUDEXGJDs+CWE1fLg3xT+1ML7tccf8keYLpAZ4T
IJz3s9psr4iYA0olUcawNW/HvknSzuaSnubXG5PS81F6j3KtlwMH1N1UF47BOmM/
JEpF2oW+GnlYKqxvBgTyBvfkqLCMi/pTuE/uCoIZzoOqVhlfYrO2I0ImJutmwBph
qNgD2Hf4BawE2i3PC6qyhQ1asW3Ve6JVeIoYFpnM2slbtVG3jrA51bOeTEwDrXiW
C2w52AK0NFIah/Eb48uchK2tH2VRRTzFkAMKZfx5+uGNHcpmQfc6qWUhieJdEy4s
pBjngs83AgMBAAECggEAaVAE0kzwEIZdgZegBvwRnMafIVcE/BM8aHAwi7aSNhDT
eUpFRTQZvE6pMxY10ccVOSPMNalrztwHU+J+/XJ3fLRmnsVKRNVZgcYgsgULEMmY
gZAMK7mlPprCXVP8b2/vcIZM0+PYBmpworv8ZqF2eR4QVQ0VSlWae0sYN5qhYHvR
ikYKTpNYGF/+I7SWBhVB30Es3kMyADVcyDZlvJo6OWGF0iB98E1dtdoMoadA8gal
gGOa0+hwwj6zhRxLOrwm2glTsC3O/jzC/tispE0uuEBAqNQ4n0zRw8+ysAdSsz9P
cTWlSPebXf9l9MKpDEC7mJ2MoftlgUdJtRvCvHvrWQKBgQD0TrW+tiyWEycouCWc
+wxPUdu0RZYAockya8LDKFutEfmh20syebvqdLSvi6QlJkGXLxR+dR9zBJ9WYs+L
A0N7RHxesSc18x3eqe9ro2L0UaBQXJswaHUHfOhDOny3UTfxAbS7yVdBdXn7pW2N
vnHaNeKuSN89N+aO/rMIt9aDLQKBgQDnu/WtC4706XFmxuOnIYxbxk1YJ1r7U9Q5
ksRT2KyZhW3ECBa0QgyHef/jp9wrSJKQPU72a4dqjDmpr6xL8QYeTxw9ZYyUOyKi
RImxnrPU7esvvghNV1hIJEp9oMrVnWfKl4cyKwJoQUWAkzP/3ZV3AAaQAH2h7rF5
TdaeaXKqcwKBgH+c8bB5xlZqEMVjUzpppGd2cdX7lzwjRk5RHb4FQcXoosXaH7Bx
CCiS56LexVImZpKLJCBeG5xf6L8eBB0wCjrEblakIMA8ivi5OXe3M8Q9MwlnJiUm
GyNbKpObZHP5N8hrRLXmmO53Z817/vrQZPY/uXWiWQHIRmWhQ3GlXabNAoGBAM+v
tU+RvF3jmq7yMbXoa1MVNtx66R+20c2HrE05M/ejjezTEwYa6/+/Z4cxOjHQqQp8
5/gSBxuG8WcS+uhU65becADWsldnaHLl2kJGagW79bykI+ytC4IchGZzZVZt7Ee1
5oUf5thpJ1FEnKYEgaBVdYw55F7s/kIpcOAowYvhAoGAP2eZBQrnqYpCwQlXpsl5
/ZMoVSzgMq31riKzRAgKiGa4PgnlU0usuktV3ROY5S2WQJmvSA1FXTankPCjA5Uz
9XUUyS9BYcPG8Hr0KRuHP9GMYvfoDATlKYJfGa8FbHi3ZH3d+El2/63AQKDbE2G5
I6vfZazKtH01KvyXQ7N1OHA=
-----END PRIVATE KEY-----`;

// ─────────────────────────────────────────
// SLACK ↔ SALESFORCE USER MAPPING
// ─────────────────────────────────────────
const USER_MAP = {
    // Slack ID → Salesforce details
    "U0AJ23JHGJH": { sfId: "005Hu00000U59P6IAJ", name: "Puneeth Kumar R",  email: "puneeth.r@kasmodigital.com"    },
    "U0AK8GSLJ8Y": { sfId: "005Hu00000Uwy52IAB", name: "Sreekar Y",        email: "sreekar.y@kasmodigital.com"    },
    "U0AK8T6PRU7": { sfId: "005Hu00000Ux2n0IAB", name: "Sumanth H",        email: "sumanth.h@kasmodigital.com"    },
    "U0AN8EJNMRD": { sfId: "005Hu00000UxCrxIAF", name: "Harshitha C",      email: "harshita.c@kasmodigital.com"   },
    "U0ANJBVH1B6": { sfId: "005Hu00000UxFpvIAF", name: "Abhishek MV",      email: "abhishek.mv@kasmodigital.com"  },
    "U0ANUEG6BQR": { sfId: "005Hu00000UxFq0IAF", name: "Chennakeshav V",   email: "channakeshava.v@kasmodigital.com" },
    "U0AJC4PBHL6": { sfId: "005Hu00000SlmzPIAR ", name: "Yashaswini BR",   email: "yashaswini.br@kasmodigital.com" }
};

// Reverse map: SF ID → Slack ID
const SF_TO_SLACK = Object.fromEntries(
    Object.entries(USER_MAP).map(([slackId, u]) => [u.sfId, slackId])
);


// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────
async function getAccessToken() {
    const payload = {
        iss: CONSUMER_KEY,
        sub: USERNAME,
        aud: "https://login.salesforce.com",
        exp: Math.floor(Date.now() / 1000) + 300,
    };
    const token = jwt.sign(payload, PRIVATE_KEY, { algorithm: "RS256" });
    const response = await axios.post(
        "https://login.salesforce.com/services/oauth2/token",
        qs.stringify({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: token,
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    return response.data.access_token;
}

// ─────────────────────────────────────────
// SALESFORCE HELPERS
// ─────────────────────────────────────────
async function getTeamWorkload(token) {
    const headers = { Authorization: `Bearer ${token}` };
    const base = SF_BASE_URL + "/services/data/v59.0";

    const sfIds = Object.values(USER_MAP).map(u => `'${u.sfId}'`).join(",");
    const query = `SELECT OwnerId, COUNT(Id) leadCount FROM Lead WHERE OwnerId IN (${sfIds}) AND IsConverted = false GROUP BY OwnerId`;

    const res = await axios.get(
        `${base}/query?q=${encodeURIComponent(query)}`,
        { headers }
    );

    // Build workload map
    const workloadMap = {};
    for (const r of res.data.records) {
        workloadMap[r.OwnerId] = r.leadCount;
    }

    // Build full team list
    const team = Object.entries(USER_MAP).map(([slackId, user]) => ({
        slackId,
        sfId: user.sfId,
        name: user.name,
        leadCount: workloadMap[user.sfId] || 0,
    }));

    // Sort by lead count
    return team.sort((a, b) => a.leadCount - b.leadCount);
}

async function searchLeads(searchText, token) {
    const headers = { Authorization: `Bearer ${token}` };
    const base = SF_BASE_URL + "/services/data/v59.0";
    const query = `SELECT Id, Name, Company, LeadSource, Industry, 
                   SDO_Sales_Product_Interest__c, SDO_PRM_Region__c, OwnerId
                   FROM Lead 
                   WHERE Name LIKE '%${searchText}%' 
                   AND IsConverted = false 
                   LIMIT 10`;
    const res = await axios.get(
        `${base}/query?q=${encodeURIComponent(query)}`,
        { headers }
    );
    return res.data.records;
}

async function assignLead(leadId, sfUserId, token) {
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    const base = SF_BASE_URL + "/services/data/v59.0";
    await axios.patch(
        `${base}/sobjects/Lead/${leadId}`,
        { OwnerId: sfUserId },
        { headers }
    );
}

// ─────────────────────────────────────────
// WORKLOAD STATUS HELPERS
// ─────────────────────────────────────────
function getStatusEmoji(count) {
    if (count <= 4) return "🟢";
    if (count <= 8) return "🟡";
    if (count <= 10) return "🔴";
    return "⛔";
}

function getStatusLabel(count) {
    if (count <= 4) return "Available";
    if (count <= 8) return "Busy";
    if (count <= 10) return "Overloaded";
    return "Overloaded";
}

function getProgressBar(count) {
    const max = 10;
    const filled = Math.min(count, max);
    const empty = max - filled;
    return "█".repeat(filled) + "░".repeat(empty);
}

// ─────────────────────────────────────────
// SLACK HELPERS
// ─────────────────────────────────────────
async function sendToSlack(responseUrl, message) {
    await axios.post(responseUrl, message, {
        headers: { "Content-Type": "application/json" },
    });
}

async function sendDM(slackUserId, message, botToken) {
    // Open DM channel
    const dmRes = await axios.post(
        "https://slack.com/api/conversations.open",
        { users: slackUserId },
        { headers: { Authorization: `Bearer ${botToken}`, "Content-Type": "application/json" } }
    );
    const channelId = dmRes.data.channel.id;

    // Send message
    await axios.post(
        "https://slack.com/api/chat.postMessage",
        { channel: channelId, ...message },
        { headers: { Authorization: `Bearer ${botToken}`, "Content-Type": "application/json" } }
    );
}

function buildWorkloadMessage(team) {
    const lines = team.map(member => {
        const emoji = getStatusEmoji(member.leadCount);
        const bar = getProgressBar(member.leadCount);
        const label = getStatusLabel(member.leadCount);
        return `${emoji} *${member.name}*\n   ${bar} ${member.leadCount}/10 leads — _${label}_`;
    }).join("\n\n");

    return {
        response_type: "in_channel",
        text: "📊 *Team Lead Workload*",
        attachments: [{
            color: "#36a64f",
            text: lines,
            footer: "🟢 Available (0-4)  |  🟡 Busy (5-8)  |  🔴 Overloaded (9-10)"
        }]
    };
}

function buildLeadConfirmMessage(lead, assignee) {
    return {
        response_type: "ephemeral",
        text: `⚠️ Assign this lead to *${assignee.name}*?`,
        attachments: [{
            color: "#0066CC",
            fields: [
                { title: "Lead Name", value: lead.Name || "N/A", short: true },
                { title: "Company", value: lead.Company || "N/A", short: true },
                { title: "Industry", value: lead.Industry || "N/A", short: true },
                { title: "Lead Source", value: lead.LeadSource || "N/A", short: true },
                { title: "Product Interest", value: lead.SDO_Sales_Product_Interest__c || "N/A", short: true },
                { title: "Region", value: lead.SDO_PRM_Region__c || "N/A", short: true },
                { title: "Assigning To", value: `${getStatusEmoji(0)} ${assignee.name}`, short: true },
            ],
            actions: [
                {
                    type: "button", text: "✅ Yes, Assign", style: "primary",
                    name: "action",
                    value: `assign|${lead.Id}|${lead.Name}|${assignee.sfId}|${assignee.slackId}|${assignee.name}`
                },
                {
                    type: "button", text: "❌ Cancel",
                    name: "action",
                    value: `cancel|${lead.Id}|${lead.Name}|${assignee.sfId}|${assignee.slackId}|${assignee.name}`
                }
            ],
            callback_id: "assign_lead"
        }]
    };
}

function buildMultipleLeadsMessage(leads, assigneeSfId, assigneeSlackId, assigneeName) {
    return {
        response_type: "ephemeral",
        text: ":mag: Multiple leads found! Choose one to assign:",
        attachments: leads.map(lead => ({
            color: "#0066CC",
            fields: [
                { title: "Name", value: lead.Name || "N/A", short: true },
                { title: "Company", value: lead.Company || "N/A", short: true },
                { title: "Region", value: lead.SDO_PRM_Region__c || "N/A", short: true },
            ],
            actions: [
                {
                    type: "button", text: `✅ Assign ${lead.Name}`, style: "primary",
                    name: "action",
                    value: `assign|${lead.Id}|${lead.Name}|${assigneeSfId}|${assigneeSlackId}|${assigneeName}`
                },
                {
                    type: "button", text: "❌ Skip",
                    name: "action",
                    value: `cancel|${lead.Id}|${lead.Name}|${assigneeSfId}|${assigneeSlackId}|${assigneeName}`
                }
            ],
            callback_id: "assign_lead"
        }))
    };
}

// ─────────────────────────────────────────
// NATURAL LANGUAGE PARSER
// ─────────────────────────────────────────
function parseIntent(text) {
    const lower = text.toLowerCase();

    // Check workload intent
    if (
        lower.includes("workload") ||
        lower.includes("capacity") ||
        lower.includes("who can i assign") ||
        lower.includes("who is available") ||
        lower.includes("who has less") ||
        lower.includes("team status") ||
        lower.includes("show me team") ||
        lower.includes("available")
    ) {
        return { intent: "workload" };
    }

    // Check assign intent
    // Patterns: "assign John Smith to Puneeth" or "assign lead John Smith to @Puneeth"
    const assignPattern = /assign\s+(?:lead\s+)?(.+?)\s+to\s+[@]?(\w+)/i;
    const match = text.match(assignPattern);
    if (match) {
        return {
            intent: "assign",
            leadName: match[1].trim(),
            assigneeName: match[2].trim()
        };
    }

    return { intent: "unknown" };
}

function findUserByName(name) {
    const lower = name.toLowerCase();
    return Object.entries(USER_MAP).find(([slackId, user]) =>
        user.name.toLowerCase().includes(lower)
    );
}

// ─────────────────────────────────────────
// SLASH COMMANDS
// ─────────────────────────────────────────

// /lead-capacity — show team workload
app.post("/slack/lead-capacity", async (req, res) => {
    res.json({ response_type: "ephemeral", text: ":hourglass_flowing_sand: Fetching team workload..." });

    try {
        const token = await getAccessToken();
        const team = await getTeamWorkload(token);
        await sendToSlack(req.body.response_url, buildWorkloadMessage(team));
    } catch (err) {
        console.error("Workload error:", err.message);
        try { await sendToSlack(req.body.response_url, { response_type: "ephemeral", text: `:x: Error: ${err.message}` }); } catch(e) {}
    }
});

// /assign-lead — assign lead to user
app.post("/slack/assign-lead", async (req, res) => {
    const { text, response_url } = req.body;
    res.json({ response_type: "ephemeral", text: ":hourglass_flowing_sand: Processing..." });

    try {
        if (!text || !text.trim()) {
            await sendToSlack(response_url, {
                response_type: "ephemeral",
                text: ":warning: Usage: `/assign-lead John Smith to Puneeth`"
            });
            return;
        }

        // Parse: "John Smith to Puneeth"
        const parts = text.split(" to ");
        if (parts.length < 2) {
            await sendToSlack(response_url, {
                response_type: "ephemeral",
                text: ":warning: Usage: `/assign-lead John Smith to Puneeth`"
            });
            return;
        }

        const leadName = parts[0].trim();
        const assigneeName = parts[1].replace("@", "").trim();

        const token = await getAccessToken();

        // Find assignee
        const userEntry = findUserByName(assigneeName);
        if (!userEntry) {
            await sendToSlack(response_url, {
                response_type: "ephemeral",
                text: `:x: Could not find team member: *${assigneeName}*`
            });
            return;
        }

        const [assigneeSlackId, assigneeData] = userEntry;

        // Get their current workload
        const team = await getTeamWorkload(token);
        const assigneeMember = team.find(m => m.sfId === assigneeData.sfId);
        const currentLoad = assigneeMember?.leadCount || 0;

        // Warn if overloaded
        if (currentLoad > 10) {
            await sendToSlack(response_url, {
                response_type: "ephemeral",
                text: `:warning: *${assigneeData.name}* is already overloaded with *${currentLoad} leads*! Consider assigning to someone else.\n\nUse \`/lead-capacity\` to see who is available.`
            });
            return;
        }

        // Search for lead
        const leads = await searchLeads(leadName, token);
        if (!leads || leads.length === 0) {
            await sendToSlack(response_url, {
                response_type: "ephemeral",
                text: `:x: No lead found with name: *${leadName}*`
            });
            return;
        }

        const assignee = {
            sfId: assigneeData.sfId,
            slackId: assigneeSlackId,
            name: assigneeData.name,
        };

        const msg = leads.length > 1
            ? buildMultipleLeadsMessage(leads, assignee.sfId, assignee.slackId, assignee.name)
            : buildLeadConfirmMessage(leads[0], assignee);

        await sendToSlack(response_url, msg);

    } catch (err) {
        console.error("Assign error:", err.message);
        try { await sendToSlack(req.body.response_url, { response_type: "ephemeral", text: `:x: Error: ${err.message}` }); } catch(e) {}
    }
});

// ─────────────────────────────────────────
// APP MENTION — Natural Language
// ─────────────────────────────────────────
app.post("/slack/mention", async (req, res) => {
    const payload = req.body;

    // Slack URL verification
    if (payload.type === "url_verification") {
        return res.json({ challenge: payload.challenge });
    }

    res.json({ ok: true });

    if (payload.event?.type !== "app_mention") return;

    const text = payload.event.text.replace(/<@[^>]+>/g, "").trim();
    const channelId = payload.event.channel;
    const botToken = process.env.SLACK_BOT_TOKEN;

    async function replyToChannel(message) {
        await axios.post(
            "https://slack.com/api/chat.postMessage",
            { channel: channelId, ...message },
            { headers: { Authorization: `Bearer ${botToken}`, "Content-Type": "application/json" } }
        );
    }

    try {
        const { intent, leadName, assigneeName } = parseIntent(text);

        if (intent === "workload") {
            await replyToChannel({ text: ":hourglass_flowing_sand: Fetching team workload..." });
            const token = await getAccessToken();
            const team = await getTeamWorkload(token);
            await replyToChannel(buildWorkloadMessage(team));
            return;
        }

        if (intent === "assign") {
            const token = await getAccessToken();

            // Find assignee
            const userEntry = findUserByName(assigneeName);
            if (!userEntry) {
                await replyToChannel({ text: `:x: Could not find team member: *${assigneeName}*` });
                return;
            }

            const [assigneeSlackId, assigneeData] = userEntry;

            // Check workload
            const team = await getTeamWorkload(token);
            const assigneeMember = team.find(m => m.sfId === assigneeData.sfId);
            const currentLoad = assigneeMember?.leadCount || 0;

            if (currentLoad > 10) {
                await replyToChannel({
                    text: `:warning: *${assigneeData.name}* is overloaded with *${currentLoad} leads*! Try someone else.`
                });
                return;
            }

            // Search lead
            const leads = await searchLeads(leadName, token);
            if (!leads || leads.length === 0) {
                await replyToChannel({ text: `:x: No lead found: *${leadName}*` });
                return;
            }

            const assignee = { sfId: assigneeData.sfId, slackId: assigneeSlackId, name: assigneeData.name };
            const msg = leads.length > 1
                ? buildMultipleLeadsMessage(leads, assignee.sfId, assignee.slackId, assignee.name)
                : buildLeadConfirmMessage(leads[0], assignee);

            await replyToChannel(msg);
            return;
        }

        // Unknown intent
        await replyToChannel({
            text: `:wave: Hi! Here's what I can do:\n\n• *Show team workload:* "who can I assign a lead to?" or "show me team workload"\n• *Assign a lead:* "assign John Smith to Puneeth"`
        });

    } catch (err) {
        console.error("Mention error:", err.message);
        try { await replyToChannel({ text: `:x: Error: ${err.message}` }); } catch(e) {}
    }
});

// ─────────────────────────────────────────
// INTERACTIVE BUTTON HANDLER
// ─────────────────────────────────────────
app.post("/slack/interact-lead", async (req, res) => {
    const payload = JSON.parse(req.body.payload);
    const action = payload.actions[0].value;
    const responseUrl = payload.response_url;
    const parts = action.split("|");
    const actionType = parts[0];
    const leadId = parts[1];
    const leadName = parts[2];
    const assigneeSfId = parts[3];
    const assigneeSlackId = parts[4];
    const assigneeName = parts[5];
    const managerSlackId = payload.user.id;
    const botToken = process.env.SLACK_BOT_TOKEN;

    if (actionType === "cancel") {
        res.json({
            response_type: "ephemeral",
            replace_original: true,
            text: `:x: Assignment cancelled.`
        });
        return;
    }

    res.json({
        response_type: "ephemeral",
        replace_original: true,
        text: `:hourglass_flowing_sand: Assigning *${leadName}* to *${assigneeName}*...`
    });

    try {
        const token = await getAccessToken();
        await assignLead(leadId, assigneeSfId, token);

        // Get updated workload
        const team = await getTeamWorkload(token);
        const assigneeMember = team.find(m => m.sfId === assigneeSfId);
        const newLoad = assigneeMember?.leadCount || 0;

        // Success message in channel
        await sendToSlack(responseUrl, {
            response_type: "in_channel",
            replace_original: false,
            text: `:white_check_mark: *${leadName}* has been assigned to *${assigneeName}* by <@${managerSlackId}>\n📊 ${assigneeName} now has *${newLoad} leads* ${getStatusEmoji(newLoad)}`
        });

        // DM the assignee
        await sendDM(assigneeSlackId, {
            text: `:tada: You have been assigned a new lead!`,
            attachments: [{
                color: "#36a64f",
                fields: [
                    { title: "Lead Name", value: leadName, short: true },
                    { title: "Assigned By", value: `<@${managerSlackId}>`, short: true },
                ],
                footer: `You now have ${newLoad} open leads ${getStatusEmoji(newLoad)}`
            }]
        }, botToken);

    } catch (err) {
        console.error("Assign error:", err.response?.data || err.message);
        try {
            await sendToSlack(responseUrl, {
                response_type: "ephemeral",
                text: `:x: Could not assign lead. Error: ${err.message}`
            });
        } catch(e) {}
    }
});

app.listen(process.env.PORT || 3000, () => console.log("🚀 Lead Assignment Bot running on port 3000"));
