import { AllMiddlewareArgs, App, Middleware, SayFn, SlackCommandMiddlewareArgs, StringIndexed } from "@slack/bolt";
import "dotenv/config";
import { Util, error } from "./util";
// import express from "express";

// const app = express();
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    
});

async function listmembers({ payload, client, logger, ack, say }: AllMiddlewareArgs & SlackCommandMiddlewareArgs) {
    logger.setName("Command /listmembers");
    logger.info(`Command: /listmembers ${payload.text}`);

    //TODO what info to show about each user
    //TODO "publish" button
    //TODO "copy" button (?)
    //TODO allow limits on number of users to show
    //TODO allow filtering by user groups and types (e.g. admins, normal users, bots, etc.), status (e.g. active, away, etc.), presence (e.g. online, offline, etc.), etc.
    //TODO actually test this
    let args = Array.from(payload.text.matchAll(/[\w-]+|<([#@])(\w+)(?:\|([ \w-]+))?> ?/));

    let raw = false;
    let requireAll = false;
    let requireUsers = false;
    let list: (['*'] | ['#' | '@', string, string])[] = [];
    for (const a of args) {
        if (a[0] === "raw") {
            if (list.length || raw || requireAll)
                error({ack, logger}, "'raw' must be the first argument");
            else raw = true;
        } else if (a[0] === "all") {
            if (list.length || requireAll)
                error({ack, logger}, "'all' must be the first or second argument");
            else requireAll = true;
        } else if (a[0] === "only") {
            if (list.length || requireAll || requireUsers) 
                await error({ack, logger}, "'only' must be the first, second, or third argument");
            else requireUsers = true;
        } else if (a[0] === "everyone") {
            list.push(['*']);
            break;
        } else if (a[0] === "here") {
            list.push(['#', payload.channel_id, payload.channel_name]);
        } else if (a[1] === '#' || a[1] === '@') {
            list.push(a.slice(1) as ['#' | '@', string, string]);
        } else await error({ack, logger}, `Unknown argument '${a[0]}'`);
    }
    await ack();

    let users: { [id: string]: string } = {};
    let ulCursor: string;
    while (true) {
        let userList = await client.users.list(ulCursor ? { cursor: ulCursor, limit: 999 } : { limit: 999 });
        if (!userList.ok) {
            await error({logger}, `Could not get user list: ${userList.error}`);
            return;
        }
        userList.members.forEach(({ id, name }) => users[id] = name);
        if (!(ulCursor = userList.response_metadata.next_cursor)) break;
    }
    if (list[0][0] === '*') {
        await displayUsersList(say, users, raw);
        return;
    }

    let matched: { [id: string]: string } = {};
    if (list.length === 0) { // Default to here
        let cmCursor: string;
        while (true) {
            let channelMembers = await client.conversations.members(cmCursor ? { channel: payload.channel_id, cursor: cmCursor, limit: 999 } : { channel: payload.channel_id, limit: 999 });
            if (!channelMembers.ok) {
                logger.error(`Could not get channel members for <#${payload.channel_id}|${payload.channel_name}>:`, channelMembers.error);
                return;
            }
            channelMembers.members.forEach(id => matched[id] = users[id]);
            if (!(cmCursor = channelMembers.response_metadata.next_cursor)) break;
        }
    } else if (requireAll && list.length > 1) {
        let allowUsers: Set<string>[] = requireUsers ? [new Set()] : [];
        for (const a of list) {
            if (a[0] === '#') {
                let current = new Set<string>();
                let cmCursor: string;
                while (true) {
                    let channelMembers = await client.conversations.members(cmCursor ? { channel: payload.channel_id, cursor: cmCursor, limit: 999 } : { channel: payload.channel_id, limit: 999 });
                    if (!channelMembers.ok) {
                        logger.error(`Could not get channel members for <#${payload.channel_id}|${payload.channel_name}>:`, channelMembers.error);
                        break;
                    }
                    channelMembers.members.forEach(current.add);
                    if (!(cmCursor = channelMembers.response_metadata.next_cursor)) break;
                }
                allowUsers.push(current);
            } else if (a[0] === '@') {
                if (requireUsers) allowUsers[0].add(a[1]);
                else matched[a[1]] = a[2];
            }
            else logger.error("An unknown error occured");
        }
        allowUsers.reduce((a, b) => a.intersection(b)).forEach(id => matched[id] ??= users[id]);
    } else {
        let allowUsers: Set<string> = new Set();
        for (const a of list) {
            if (a[0] === '#') {
                let cmCursor: string;
                while (true) {
                    let channelMembers = await client.conversations.members(cmCursor ? { channel: payload.channel_id, cursor: cmCursor, limit: 999 } : { channel: payload.channel_id, limit: 999 });
                    if (!channelMembers.ok) {
                        logger.error(`Could not get channel members for <#${payload.channel_id}|${payload.channel_name}>:`, channelMembers.error);
                        break;
                    }
                    if (!(cmCursor = channelMembers.response_metadata.next_cursor)) break;
                }
            } else if (a[0] === '@') {
                if (requireUsers) allowUsers.add(a[1]);
                else matched[a[1]] = a[2];
            } else logger.error("An unknown error occured");
        }
    }
    await displayUsersList(say, matched, raw);
}

async function displayUsersList(say: SayFn, users: {[id: string]: string}, raw: boolean) {
    if (raw) {
        let text = Object.values(users).join("\r\n");
        say({ text });
        //TODO Make raw text only visible to you
        //TODO Make formatted text work at all
    } else {
        say({ blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "# Users"
                }
            }, {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: Object.entries(users).map(([id, name]) => `- <@${id}>: ${name}`).join("\r\n")
                }
            }
        ] });
    }
}

app.use(async ({next, body, context, payload, logger}) => { 
    logger.setName("Middleware");
    logger.info("Recieved request:", body);
    logger.debug("Context:", context, "\nPayload:", payload, "\nBody:", body);
    await next();
});

app.command("/listmembers", listmembers);

app.shortcut("listmembers_menu", async({ack, client, logger}) => {
    logger.setName("Shortcut listmembers_menu");
    logger.info("Shortcut: listmembers_menu");
    ack();

    // IDEA: Make the app able to list users from multiple channels at once, or users in all of a list of channels
    // IDEA: Make the app able to only show specific users who are also in a channel
    await client.views.open({
        interactivity_pointer: "listmembers_menu",
        trigger_id: "listmembers_menu",
        view: {
            type: "modal",
            title: {
                type: "plain_text",
                text: "List Members"
            },
            blocks: [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "List users from:"
                    },
                    "accessory": {
                        "type": "conversations_select",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select conversations",
                            "emoji": true
                        },
                        "action_id": "conversations_select-action"
                    }
                }
            ] 
        }
    })
});

;
(async() => {
    await app.start(process.env.PORT || 3000);
    app.logger.info("Started!");
})();