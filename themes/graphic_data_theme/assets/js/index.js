'use strict';

async function getInstanceInfo() {
	const protocol = window.location.protocol;
	const host = window.location.host;
	const fetchURL =
		protocol + '//' + host + '/wp-json/wp/v2/instance?&order=asc';

	try {
		const response = await fetch(fetchURL);
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching data:', error);
		throw error;
	}
}

let testDataIndex;
(async () => {
	try {
		testDataIndex = await getInstanceInfo();

		const list = document.createElement('div');
		list.classList.add('row');
		for (const idx in testDataIndex) {
			const child = testDataIndex[idx];
			// might wanna delete/comment this bottom stuff out
			// if (child.instance_status == "Draft" && !is_logged_in){
			//     continue;
			// }

			const col = document.createElement('div');
			col.classList.add('col-xs-12', 'col-sm-6', 'col-md-4');
			const card = document.createElement('div');
			card.className = 'card';
			// card.style.width = '16rem';
			card.style.margin = '10px';

			const cardImg = document.createElement('img');
			cardImg.className = 'card-img-top';
			cardImg.setAttribute('src', child.instance_tile);
			cardImg.setAttribute('alt', child.instance_short_title);

			const cardBody = document.createElement('div');
			cardBody.className = 'card-body';

			// let cardText = document.createElement('p');
			// cardText.className = 'card-text';
			// cardText.innerText = child.title.rendered;

			const link = document.createElement('a');
			// link.setAttribute('href', )
			// ?post_type=scene&p=10
			const protocol = window.location.protocol;
			const host = window.location.host;
			const postType = 'scene';
			const postId = child.instance_overview_scene;
			let url;
			// if (child.instance_status == "Draft" && !is_logged_in && legacy_urls[child.id]){
			if (legacy_urls[child.id]) {
				url = legacy_urls[child.id];
			} else {
				url = `${protocol}//${host}/?post_type=${postType}&p=${postId}`;
			}

			link.setAttribute('href', url);
			// link.setAttribute('href', child.link)
			link.setAttribute('id', child.instance_slug);
			link.className = 'btn ';
			// link.innerText = child.instance_short_title;
			link.innerText = child.title.rendered;
			link.setAttribute(
				'style',
				'display: flex; justify-content: center; align-items: center; color: white !important; background-color: #00467F !important'
			);

			// cardBody.appendChild(cardText);
			cardBody.appendChild(link);

			card.appendChild(cardImg);
			card.appendChild(cardBody);

			col.appendChild(card);
			list.appendChild(col);
		}
		elem.appendChild(list);
	} catch (error) {
		//   console.error('Error:', error);
	}
})();
