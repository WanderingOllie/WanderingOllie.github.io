const JSONFILES = [
    'bta-dupont.json',
    'bta-rosslyn.json',
    'capitol-campus-shuttle.json',
    'lombardi-dupont.json',
    'lombardi-rosslyn.json',
    'union-station-loop-daytime.json',
    'wisconsin-ave-shuttle.json',
];

/**
 * Fetches and parses a JSON file.
 * Throws if the request fails.
 */
async function fetchJson(path) {
    const res = await fetch(path);
    if (!res.ok) {
        throw new Error(
            `Request to ${path} failed with status ${res.status}`
        );
    }
    return res.json();
}

/**
 * Removes all existing content from a table with the given id.
 */
function clearTable(tableId) {
    const table = document.getElementById(tableId);
    table.replaceChildren();
}

/**
 * Creates an empty header and body row inside a table with
 * the passed id.
 * Returns header and body row ids.
 */
function genInnerTable(id) {
    const outerTable = document.getElementById(id);

    const headerRow = document.createElement('tr');
    headerRow.id = `${id}-header`;

    const bodyRow = document.createElement('tr');
    bodyRow.id = `${id}-body`;

    outerTable.appendChild(headerRow);
    outerTable.appendChild(bodyRow);

    return [headerRow.id, bodyRow.id];
}

/**
 * Converts a "HH:MM:SS" string into a Date object set to today.
 */
function timeStringToDate(timeString) {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, seconds);
    return date;
}

/**
 * Finds the next departure (today) after 'now'.
 * Returns null if every listed time has passed.
 */
function getNextDeparture(times, now) {
    const departures = times.map(timeStringToDate);
    return departures.find(departure => departure >= now) ?? null;
}

/**
 * Populates table with one column per location.
 */
function populateTable(headerId, bodyId, dataObj) {
    const headerRow = document.getElementById(headerId);
    const bodyRow = document.getElementById(bodyId);
    const now = new Date();

    const locations = dataObj.data;
    if (!Array.isArray(locations)) {
        console.error('Expected dataObj.data to be an array, got:', dataObj);
        return;
    }

    for (const location of locations) {
        const headerCell = document.createElement('th');
        headerCell.textContent = location.title;

        const nextDeparture = getNextDeparture(location.times, now);

        const timeCell = document.createElement('td');
        timeCell.textContent = nextDeparture
            ? nextDeparture.toLocaleTimeString('en-US', { timeStyle: 'short' })
            : 'Tomorrow';

        headerRow.appendChild(headerCell);
        bodyRow.appendChild(timeCell);
    }
}

async function main() {
    for (const path of JSONFILES) {
        const fullPath = `/data/guts/${path}`;

        try {
            const loadedData = await fetchJson(fullPath);
            const tableId = loadedData.meta.id;

            clearTable(tableId);
            const [headerId, bodyId] = genInnerTable(tableId);
            populateTable(headerId, bodyId, loadedData);
        } catch (err) {
            console.error(`Failed to process ${path}:`, err);
        }
    }
}

main();

/**
 * Handle refresh button.
 */
document.getElementById("refresh-button").addEventListener("click", main);
