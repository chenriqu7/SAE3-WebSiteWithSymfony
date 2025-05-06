import {API_BASE_URL, API_CREDENTIALS} from 'config';

const ESP_DEVICES = Object.freeze({
    "ESP-004": { dbname: 'sae34bdk1eq1', location: 'D205' },
    "ESP-008": { dbname: 'sae34bdk1eq2', location: 'D206' },
    "ESP-006": { dbname: 'sae34bdk1eq3', location: 'D207' },
    "ESP-014": { dbname: 'sae34bdk2eq1', location: 'D204' },
    "ESP-012": { dbname: 'sae34bdk2eq2', location: 'D203' },
    "ESP-005": { dbname: 'sae34bdk2eq3', location: 'D303' },
    "ESP-011": { dbname: 'sae34bdl1eq1', location: 'D304' },
    "ESP-007": { dbname: 'sae34bdl1eq2', location: 'C101' },
    "ESP-024": { dbname: 'sae34bdl1eq3', location: 'D109' },
    "ESP-026": { dbname: 'sae34bdl2eq1', location: 'Secrétariat' },
    "ESP-030": { dbname: 'sae34bdl2eq2', location: 'D001' },
    "ESP-028": { dbname: 'sae34bdl2eq3', location: 'D002' },
    "ESP-020": { dbname: 'sae34bdm1eq1', location: 'D004' },
    "ESP-021": { dbname: 'sae34bdm1eq2', location: 'C004' },
    "ESP-022": { dbname: 'sae34bdm1eq3', location: 'C007' },
});

export class ESPDevice {
    constructor(name) {
        this.name = name;
        this.dbname = !ESP_DEVICES[name] ? ESP_DEVICES["ESP-008"].dbname : ESP_DEVICES[name].dbname;
        this.location = !ESP_DEVICES[name] ? null : ESP_DEVICES[name].location;
    }

    async fetchData(endpoint, filter = "") {

        const url = `${API_BASE_URL}${endpoint}?nomsa=${this.name}${filter}`;
        try {
            const response = await fetch(url, {
                headers: {
                    dbname: this.dbname,
                    username: API_CREDENTIALS.username,
                    userpass: API_CREDENTIALS.userpass
                }
            });
            if (!response.ok) {
                console.error(`API error: ${response.statusText}`);
                return null;
            }
            const data = await response.json();
            if (!this.location) this.location = data.length ? data[0].location : data.location || "N/A";
            return data;
        } catch (error) {
            console.error(`Error fetching data for ${this.name}:`, error.message);
            return null;
        }
    }

    async captures(sensorName = null) {
        const filter = sensorName ? `&nom=${sensorName}` : "";
        return await this.fetchData(`/captures`, filter) || {};
    }

    async last_capture(sensorName = null, limit = 1) {
        const filter = sensorName ? `&nom=${sensorName}&limit=${limit}` : `&limit=${limit}`;
        return await this.fetchData(`/captures/last`, filter) || {};
    }

    async interval_capture(start, end, sensorName = null) {
        const data = await this.captures(sensorName);
        return data.filter(d => d["dateCapture"] >= start && d["dateCapture"] <= end);
    }
}