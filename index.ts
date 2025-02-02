<<<<<<< HEAD
import { App, LogLevel } from "@slack/bolt";
import "dotenv";
// import express from "express";

// const app = express();
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

app.command("/listmembers", async ({command, client, context, logger, ack, say}) => {
    logger.setName("/listmembers");
    logger.info(`Recieved command: "/listmembers ${command.text}"`);
    logger.debug("Context:", context, "Command:", command);
    
    //TODO what info to show about each user
    //TODO "publish" button
    //TODO actually test this

    let args = Array.from(command.text.matchAll(/[\w-]+|<([#@])(\w+)(?:\|([ \w-]+))?> ?/));
    
    let raw = false;
    let requireAll = false;
    let requireUsers = false;
    let list: (['*']|['#'|'@', string, string])[] = [];
    for (const a of args) {
        if (a[0] === "raw") {
            if (list.length || raw || requireAll) {
                ack("Error: 'raw' must be the first argument");
                logger.error("'raw' must be the first argument");
                return;
            } else raw = true;
        } else if (a[0] === "all") {
            if (list.length || requireAll) {
                ack("Error: 'all' must be the first or second argument");
                logger.error("'all' must be the first or second argument");
                return;
            } else requireAll = true;
        } else if (a[0] === "only") {
            if (list.length || requireAll) {
                ack("Error: 'only' must be the first or second argument");
                logger.error("'only' must be the first or second argument");
                return;
            } else {
                requireAll = true;
                requireUsers = true;
            }
        }else if (a[0] === "everyone") {
            list.push(['*']);
            break;
        } else if (a[0] === "here") {
            list.push(['#', command.channel_id, command.channel_name]);
        } else if (a[1] === '#' || a[1] === '@') list.push(a.slice(1) as ['#'|'@', string, string]);
        else {
            ack(`Error: Unknown argument '${a[0]}'`);
            logger.error(`Unknown argument '${a[0]}'`);
            return;
        }
    }
    ack();
    
    let users: {[id: string]: string} = {};
    let ulCursor: string;
    while (true) {
        let userList = await client.users.list(ulCursor ? {cursor: ulCursor, limit: 999} : {limit: 999});
        if (!userList.ok) {
            logger.error(`Could not get user list:`, userList.error);
            return;
        }
        userList.members.forEach(({id, name}) => users[id] = name);
        if (!(ulCursor = userList.response_metadata.next_cursor)) break;
    }
    if (list[0][0] === '*') {
        
    }

    let matched: {[id: string]: string} = {};
    if (list.length === 0) {
        let cmCursor: string;
        while (true) {
            let channelMembers = await client.conversations.members(cmCursor ? {channel: command.channel_id, cursor: cmCursor, limit: 999} : {channel: command.channel_id, limit: 999});
            if (!channelMembers.ok) {
                logger.error(`Could not get channel members for <#${command.channel_id}|${command.channel_name}>:`, channelMembers.error);
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
                    let channelMembers = await client.conversations.members(cmCursor ? {channel: command.channel_id, cursor: cmCursor, limit: 999} : {channel: command.channel_id, limit: 999});
                    if (!channelMembers.ok) {
                        logger.error(`Could not get channel members for <#${command.channel_id}|${command.channel_name}>:`, channelMembers.error);
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
        
    } else for (const a of list) {
        if (a[0] === '#') {
            let cmCursor: string;
            while (true) {
                let channelMembers = await client.conversations.members(cmCursor ? {channel: command.channel_id, cursor: cmCursor, limit: 999} : {channel: command.channel_id, limit: 999});
                if (!channelMembers.ok) {
                    logger.error(`Could not get channel members for <#${command.channel_id}|${command.channel_name}>:`, channelMembers.error);
                    break;
                }
                if (!(cmCursor = channelMembers.response_metadata.next_cursor)) break;
            }
        } else if (a[0] === '@') matched[a[1]] = a[2];
        else logger.error("An unknown error occured");
    }
    if (raw) {
        let text = Object.values(matched).join("\r\n");
        say({text, })
        //TODO Make raw text only visible to you
        //TODO Make formatted text work at all
    }
});

(async() => {
    await app.start(process.env.PORT || 3000);
    app.logger.info("Started!");
=======
import { App, LogLevel } from "@slack/bolt";
import "dotenv";
// import express from "express";

// const app = express();
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

app.command("/listmembers", async ({command, client, context, logger, ack, say}) => {
    logger.setName("/listmembers");
    logger.info(`Recieved command: "/listmembers ${command.text}"`);
    logger.debug("Context:", context, "Command:", command);
    
    //TODO what info to show about each user
    //TODO "publish" button
    //TODO actually test this

    let args = Array.from(command.text.matchAll(/[\w-]+|<([#@])(\w+)(?:\|([ \w-]+))?> ?/));
    
    let raw = false;
    let requireAll = false;
    let requireUsers = false;
    let list: (['*']|['#'|'@', string, string])[] = [];
    for (const a of args) {
        if (a[0] === "raw") {
            if (list.length || raw || requireAll) {
                ack("Error: 'raw' must be the first argument");
                logger.error("'raw' must be the first argument");
                return;
            } else raw = true;
        } else if (a[0] === "all") {
            if (list.length || requireAll) {
                ack("Error: 'all' must be the first or second argument");
                logger.error("'all' must be the first or second argument");
                return;
            } else requireAll = true;
        } else if (a[0] === "only") {
            if (list.length || requireAll) {
                ack("Error: 'only' must be the first or second argument");
                logger.error("'only' must be the first or second argument");
                return;
            } else {
                requireAll = true;
                requireUsers = true;
            }
        }else if (a[0] === "everyone") {
            list.push(['*']);
            break;
        } else if (a[0] === "here") {
            list.push(['#', command.channel_id, command.channel_name]);
        } else if (a[1] === '#' || a[1] === '@') list.push(a.slice(1) as ['#'|'@', string, string]);
        else {
            ack(`Error: Unknown argument '${a[0]}'`);
            logger.error(`Unknown argument '${a[0]}'`);
            return;
        }
    }
    ack();
    
    let users: {[id: string]: string} = {};
    let ulCursor: string;
    while (true) {
        let userList = await client.users.list(ulCursor ? {cursor: ulCursor, limit: 999} : {limit: 999});
        if (!userList.ok) {
            logger.error(`Could not get user list:`, userList.error);
            return;
        }
        userList.members.forEach(({id, name}) => users[id] = name);
        if (!(ulCursor = userList.response_metadata.next_cursor)) break;
    }
    if (list[0][0] === '*') {
        
    }

    let matched: {[id: string]: string} = {};
    if (list.length === 0) {
        let cmCursor: string;
        while (true) {
            let channelMembers = await client.conversations.members(cmCursor ? {channel: command.channel_id, cursor: cmCursor, limit: 999} : {channel: command.channel_id, limit: 999});
            if (!channelMembers.ok) {
                logger.error(`Could not get channel members for <#${command.channel_id}|${command.channel_name}>:`, channelMembers.error);
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
                    let channelMembers = await client.conversations.members(cmCursor ? {channel: command.channel_id, cursor: cmCursor, limit: 999} : {channel: command.channel_id, limit: 999});
                    if (!channelMembers.ok) {
                        logger.error(`Could not get channel members for <#${command.channel_id}|${command.channel_name}>:`, channelMembers.error);
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
        
    } else for (const a of list) {
        if (a[0] === '#') {
            let cmCursor: string;
            while (true) {
                let channelMembers = await client.conversations.members(cmCursor ? {channel: command.channel_id, cursor: cmCursor, limit: 999} : {channel: command.channel_id, limit: 999});
                if (!channelMembers.ok) {
                    logger.error(`Could not get channel members for <#${command.channel_id}|${command.channel_name}>:`, channelMembers.error);
                    break;
                }
                if (!(cmCursor = channelMembers.response_metadata.next_cursor)) break;
            }
        } else if (a[0] === '@') matched[a[1]] = a[2];
        else logger.error("An unknown error occured");
    }
    if (raw) {
        let text = Object.values(matched).join("\r\n");
        say({text, })
        //TODO Make raw text only visible to you
        //TODO Make formatted text work at all
    }
});

(async() => {
    await app.start(process.env.PORT || 3000);
    app.logger.info("Started!");
>>>>>>> 7485003502804a8b4b3d7a0e9075b52980d970d8
})();