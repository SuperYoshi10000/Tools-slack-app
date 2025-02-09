import { AckFn, Logger, RespondArguments } from "@slack/bolt";

export namespace Util {
    export async function error({ack, logger}: {ack?: AckFn<string | RespondArguments>, logger: Logger}, error?: string) {
        await ack?.("Error: " + (error || "An unknown error occurred"));
        logger.error(error || "An unknown error occurred");
    }

}

export const error = Util.error;