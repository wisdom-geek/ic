// Import necessary modules and libraries
import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt, Variant, text } from 'azle';
import { v4 as uuidv4 } from 'uuid';

/**
 * This type represents a message that can be listed on a board.
 */
type Message = Record<{
    id: string; // Unique identifier for the message
    title: string; // Title of the message
    body: string; // Body content of the message
    attachmentURL: string; // URL for message attachments
    createdAt: nat64; // Timestamp of message creation
    updatedAt: Opt<nat64>; // Optional timestamp of message update
}>

type MessagePayload = Record<{
    title: string; // Title of the message payload
    body: string; // Body content of the message payload
    attachmentURL: string; // URL for message payload attachments
}>

// Create a stable B-tree map to store messages
const messageStorage = new StableBTreeMap<string, Message>(0, 44, 1024);

const Errors = Variant({
    HousingMessageDoesNotExist: text
});

function createHousingMessage(payload: MessagePayload): HousingMessage {
    return {
        id: uuidv4(),
        createdAt: ic.time(),
        updatedAt: Opt.None,
        blockchainFeatures: [],
        ...payload
    };
}

// Define the new housing-related message structure
type HousingMessage = Record<{
    id: string; // Unique identifier for the housing message
    title: string; // Title of the housing message
    body: string; // Body content of the housing message
    attachmentURL: string; // URL for housing message attachments
    createdAt: nat64; // Timestamp of housing message creation
    updatedAt: Opt<nat64>; // Optional timestamp of housing message update
    blockchainFeatures: string[]; // Additional features related to Nyumba Blockchain
}>

// Modify the functions to work with the new HousingMessage structure

// Query function to get all housing messages
$query;
export function getHousingMessages(): Result(Vec<HousingMessage>, Errors) {
    return Result.Ok(messageStorage.values());
}

// Query function to get a specific housing message by ID
$query;
export function getHousingMessage(id: string): Result(HousingMessage, Errors) {
    return match(messageStorage.get(id), {
        Some: (message) => Result.Ok<HousingMessage, string>({ ...message, blockchainFeatures: [] }),
        None: () => Result.Err({HousingMessageDoesNotExist: `A message with id=${id} not found`})
    });
}

// Update function to add a new housing message
$update;
export function addHousingMessage(payload: MessagePayload): Result<HousingMessage, string> {
    const message = createHousingMessage(payload);
    messageStorage.insert(message.id, message); // Insert the housing message into the storage
    return Result.Ok(message); // Return a successful result with the created housing message
}

// Update function to modify an existing housing message
$update;
export function updateHousingMessage(id: string, payload: MessagePayload): Result(HousingMessage, Errors) {
    return match(messageStorage.get(id), {
        Some: (message) => {
            const updatedMessage: HousingMessage = createHousingMessage({ ...message, ...payload, updatedAt: Opt.Some(ic.time()) });
            messageStorage.insert(message.id, updatedMessage);
            return Result.Ok<HousingMessage, string>(updatedMessage);
        },
        None: () => Result.Err({HousingMessageDoesNotExist: `Couldn't update a message with id=${id}. Message not found`})
    });
}

// Update function to delete a housing message
$update;
export function deleteHousingMessage(id: string): Result(HousingMessage, Errors) {
    return match(messageStorage.remove(id), {
        Some: (deletedMessage) => Result.Ok<HousingMessage, string>(deletedMessage),
        None: () => Result.Err({HousingMessageDoesNotExist: `Couldn't delete a message with id=${id}. Message not found.`})
    });
}

// A workaround to make the uuid package work with Azle
globalThis.crypto = {
    // @ts-ignore
    getRandomValues: () => {
        let array = new Uint8Array(32)

        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256)
        }

        return array
    }
}

// Feedback statement addressing housing challenges and introducing "Nyumba Blockchain"
const feedbackStatement = `
Addressing challenges in housing: funding, transparency, and centralized processes. "Nyumba Blockchain" introduces tokenization for fractional ownership, automates tasks via smart contracts, and fosters a decentralized and transparent real estate system.
`;
