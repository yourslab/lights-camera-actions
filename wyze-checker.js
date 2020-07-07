const INACTIVITY_PERIOD_MS = 30 * 1000;

class WyzeChecker {
	constructor(balenaBLE) {
		this.balenaBLE = balenaBLE;
		this.personTimestamp = null;
		this.updateTimestamp = this.updateTimestamp.bind(this);
		this.requestPoller = this.requestPoller.bind(this);
	}

	updateTimestamp(data) {
		let events = data["data"]["event_list"];
		for (let i = 0; i < events.length; i++) {
			let file_list = events[i]["file_list"];
			for (let j = 0; j < file_list.length; j++) {
				if (file_list[j]["ai_tag_list"][0] == "person") {
					return new Date(events[i]["event_ts"]);
				}
			}
		}
	}

	async requestPoller() {
		let response = await fetch(
			"https://api.wyzecam.com/app/v2/device/get_event_list",
			{
				method: "POST",
				headers: {
					Host: "api.wyzecam.com",
					"User-Agent": "okhttp/3.8.1",
					Connection: "Keep-Alive",
					"Content-Type": "application/json; charset=utf-8",
				},
				body: JSON.stringify({
					access_token:
						"lvtx.te65fnNtHwo8aFD9H0BVdUTtMgShX04lXrUNFmGYL+DFn3GEa5U8QUuVjV1dzPGIZhgtZ+1CdHF+ICJlwxrXQidxptlWNZjblVLCXduXZPddAZc/pOUYtR1nJ6x40JQb4Ozh6pFgzDVTFLAJ3Ivc9GnooVV0Q1y4hxCbfz4fgyirhiXdjCbTVbwTzd2jSWxDg/FxqA==",
					app_name: "com.hualai",
					app_ver: "com.hualai___2.11.40",
					app_version: "2.11.40",
					phone_id: "4c5ccb76-985f-4718-ad13-ea25c39278ae",
					phone_system_type: "2",
					sc: "a626948714654991afd3c0dbd7cdb901",
					sv: "bdcb412e230049c0be0916e75022d3f3",
					ts: 1593984509331,
					device_mac_list: [],
					event_value_list: [],
					event_tag_list: [],
					event_type: "1",
					begin_time: 1593932400330,
					end_time: 1595018799330,
					count: 20,
					order_by: 2,
				}),
			}
		);
		let response_body = await response.json();
		this.personTimestamp = this.updateTimestamp(response_body);
		if (this.balenaBLE.status == null) await this.balenaBLE.readLed();

		let timeFromDetectToSwitch =
			this.personTimestamp.getTime() - balenaBLE.switchedTs.getTime();
		let timeFromCurrentToSwitch =
			new Date().getTime() - balenaBLE.switchedTs.getTime();
		if (
			this.balenaBLE.status &&
			timeFromCurrentToSwitch >= INACTIVITY_PERIOD_MS
		) {
			balenaBLE.writeLed(0);
		} else if (!this.balenaBLE.status && timeFromDetectToSwitch > 0) {
			balenaBLE.writeLed(1);
		}
	}
}
