// These functions only fire on the Figure admin columns screen

// change contents of Scenes dropdown filter based on instance
function figure_instance_change() {
	const figure_instance_value =
		document.getElementById('figure_instance').value;
	const figure_scene = document.getElementById('figure_scene');
	figure_scene.innerHTML = null;
	const figure_scene_first_option = document.createElement('option');
	figure_scene_first_option.value = '';
	figure_scene_first_option.text = 'All Scenes';
	figure_scene.appendChild(figure_scene_first_option);

	if (figure_instance_value !== '') {
		const protocol = window.location.protocol;
		const host = window.location.host;
		const restURL =
			protocol +
			'//' +
			host +
			'/wp-json/wp/v2/scene?_fields=id,title&scene_location=' +
			figure_instance_value;
		fetch(restURL)
			.then((response) => response.json())
			.then((data) => {
				data.forEach((targetRow) => {
					const optionScene = document.createElement('option');
					optionScene.value = targetRow.id;
					optionScene.text = targetRow.title.rendered;
					figure_scene.appendChild(optionScene);
				});
			})
			.catch((err) => {
				console.error(err);
			});
	}
	figure_scene_change();
}

// change contents of Icons dropdown filter based on scene
function figure_scene_change() {
	const figure_scene_value = document.getElementById('figure_scene').value;
	const figure_icon = document.getElementById('figure_icon');
	figure_icon.innerHTML = null;
	const figure_icon_first_option = document.createElement('option');
	figure_icon_first_option.value = '';
	figure_icon_first_option.text = 'All Icons';
	figure_icon.appendChild(figure_icon_first_option);

	if (figure_scene_value !== '') {
		const protocol = window.location.protocol;
		const host = window.location.host;
		const restURL =
			protocol +
			'//' +
			host +
			'/wp-json/wp/v2/modal?_fields=id,title&icon_function=Modal&modal_scene=' +
			figure_scene_value;
		fetch(restURL)
			.then((response) => response.json())
			.then((data) => {
				data.forEach((targetRow) => {
					const optionIcon = document.createElement('option');
					optionIcon.value = targetRow.id;

					optionIcon.text = targetRow.title.rendered;
					figure_icon.appendChild(optionIcon);
				});
			})
			.catch((err) => {
				console.error(err);
			});
	}
}

document.addEventListener('DOMContentLoaded', function () {
	document
		.getElementById('figure_instance')
		.addEventListener('change', figure_instance_change);
	document
		.getElementById('figure_scene')
		.addEventListener('change', figure_scene_change);
});
